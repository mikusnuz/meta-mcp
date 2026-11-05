import test from "node:test";
import assert from "node:assert/strict";
import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { MetaClient, stripPagingTokens } from "../src/services/meta-client.js";
import { registerFbPublishingTools } from "../src/tools/facebook/publishing.js";

const USER_TOKEN = "user-token";
const PAGE_TOKEN = "page-token-secret";
const config = {
  appId: "", appSecret: "", instagramAccessToken: USER_TOKEN, instagramUserId: "ig",
  instagramMessagingAccessToken: "", instagramPageId: "page", threadsAccessToken: "", threadsUserId: "",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
}

async function withFetch<T>(
  respond: (url: URL, body: Record<string, unknown> | undefined) => Response,
  fn: (requests: Array<{ method: string; url: URL; body?: Record<string, unknown> }>) => Promise<T>
) {
  const previousFetch = globalThis.fetch;
  const requests: Array<{ method: string; url: URL; body?: Record<string, unknown> }> = [];
  globalThis.fetch = async (input, init) => {
    const url = new URL(String(input));
    const body = init?.body ? JSON.parse(String(init.body)) : undefined;
    requests.push({ method: init?.method ?? "GET", url, body });
    return respond(url, body);
  };
  try {
    return await fn(requests);
  } finally {
    globalThis.fetch = previousFetch;
  }
}

function capture(overrides: Partial<typeof config> = {}) {
  const tools = new Map<string, { schema: z.ZodRawShape; handler: (args: any) => Promise<any> }>();
  const server = { tool(name: string, _description: string, schema: z.ZodRawShape, handler: (args: any) => Promise<any>) {
    tools.set(name, { schema, handler });
  } } as unknown as McpServer;
  registerFbPublishingTools(server, new MetaClient({ ...config, ...overrides }));
  return { tools, async run(name: string, args: Record<string, unknown>) {
    const tool = tools.get(name)!;
    return tool.handler(z.object(tool.schema).parse(args));
  } };
}

const graph = (url: URL, body?: Record<string, unknown>) =>
  url.pathname.endsWith("/me/accounts")
    ? json({ data: [{ id: "other", access_token: "other-token" }, { id: "page", access_token: PAGE_TOKEN }] })
    : json({ id: "post-1" });

test("pagination URLs lose access_token at any depth while cursors stay", () => {
  const next = "https://graph.facebook.com/v26.0/1/media?access_token=secret&after=abc&limit=25";
  const stripped = stripPagingTokens({
    data: [{ id: "1", children: { paging: { next } } }],
    paging: { cursors: { after: "abc" }, next, previous: next.replace("after", "before") },
  });
  const urls = [stripped.paging.next, stripped.paging.previous, stripped.data[0].children.paging.next];
  for (const url of urls) {
    assert.equal(new URL(url).searchParams.has("access_token"), false);
    assert.equal(new URL(url).searchParams.get("limit"), "25");
  }
  assert.equal(new URL(stripped.paging.next).searchParams.get("after"), "abc");
  assert.equal(stripped.paging.cursors.after, "abc");
  assert.equal(JSON.stringify(stripped).includes("secret"), false);
});

test("client responses never include the access_token of paging URLs", async () => {
  await withFetch(
    () => json({ data: [], paging: { next: "https://graph.facebook.com/v26.0/1/media?access_token=secret&after=abc" } }),
    async () => {
      const { data } = await new MetaClient(config).ig("GET", "/1/media");
      assert.equal(JSON.stringify(data).includes("secret"), false);
      assert.match(JSON.stringify(data), /after=abc/);
    }
  );
});

test("page post sends message and link with the cached page token", async () => {
  const { run } = capture();
  await withFetch(graph, async (requests) => {
    const result = await run("fb_publish_page_post", { message: "hello", link: "https://example.com" });
    assert.notEqual(result.isError, true);
    await run("fb_publish_page_post", { message: "again" });
    const accounts = requests.filter(({ url }) => url.pathname.endsWith("/me/accounts"));
    assert.equal(accounts.length, 1);
    assert.equal(accounts[0].url.searchParams.get("access_token"), USER_TOKEN);
    assert.equal(accounts[0].url.searchParams.get("fields"), "id,access_token");
    const posts = requests.filter(({ method }) => method === "POST");
    assert.equal(posts[0].url.pathname.endsWith("/page/feed"), true);
    assert.deepEqual(posts[0].body, { access_token: PAGE_TOKEN, message: "hello", link: "https://example.com" });
    assert.deepEqual(posts[1].body, { access_token: PAGE_TOKEN, message: "again" });
    assert.equal(JSON.stringify(result).includes(PAGE_TOKEN), false);
  });
});

test("page video and photo use the documented endpoints and fields", async () => {
  const { run } = capture();
  await withFetch(graph, async (requests) => {
    await run("fb_publish_page_video", { file_url: "https://example.com/v.mp4", description: "desc" });
    await run("fb_publish_page_photo", { url: "https://example.com/p.jpg", caption: "cap" });
    const [video, photo] = requests.filter(({ method }) => method === "POST");
    assert.equal(video.url.pathname.endsWith("/page/videos"), true);
    assert.deepEqual(video.body, { access_token: PAGE_TOKEN, file_url: "https://example.com/v.mp4", description: "desc" });
    assert.equal(photo.url.pathname.endsWith("/page/photos"), true);
    assert.deepEqual(photo.body, { access_token: PAGE_TOKEN, url: "https://example.com/p.jpg", caption: "cap" });
  });
});

test("a page missing from /me/accounts returns a clear error without publishing", async () => {
  const { run } = capture({ instagramPageId: "missing" });
  await withFetch(graph, async (requests) => {
    const result = await run("fb_publish_page_post", { message: "hello" });
    assert.equal(result.isError, true);
    assert.match(result.content[0].text, /Facebook Page missing was not found/);
    assert.equal(requests.some(({ method }) => method === "POST"), false);
  });
});

test("a missing INSTAGRAM_PAGE_ID is reported", async () => {
  const { run } = capture({ instagramPageId: "" });
  const result = await run("fb_publish_page_post", { message: "hello" });
  assert.equal(result.isError, true);
  assert.match(result.content[0].text, /INSTAGRAM_PAGE_ID/);
});

test("a permission error names pages_manage_posts and never echoes the page token", async () => {
  const { run } = capture();
  await withFetch(
    (url, body) => url.pathname.endsWith("/me/accounts")
      ? graph(url)
      : json({ error: { message: `(#200) requires permission (token ${PAGE_TOKEN})`, code: 200 } }, 403),
    async () => {
      const result = await run("fb_publish_page_post", { message: "hello" });
      assert.equal(result.isError, true);
      assert.match(result.content[0].text, /pages_manage_posts/);
      assert.equal(result.content[0].text.includes(PAGE_TOKEN), false);
    }
  );
});
