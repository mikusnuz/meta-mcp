import test from "node:test";
import assert from "node:assert/strict";
import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { MetaClient } from "../src/services/meta-client.js";
import { registerIgProfileTools } from "../src/tools/instagram/profile.js";
import { registerIgPublishingTools } from "../src/tools/instagram/publishing.js";

function capture() {
  const tools = new Map<string, { schema: z.ZodRawShape; handler: (args: any) => Promise<any> }>();
  const calls: Array<{ method: string; path: string; params?: Record<string, unknown> }> = [];
  const server = { tool(name: string, _description: string, schema: z.ZodRawShape, handler: (args: any) => Promise<any>) {
    tools.set(name, { schema, handler });
  } } as unknown as McpServer;
  const client = {
    igUserId: "account",
    async ig(method: string, path: string, params?: Record<string, unknown>) {
      calls.push({ method, path, params });
      return { data: method === "GET" ? { status_code: "FINISHED" } : { id: `container-${calls.length}` } };
    },
  } as unknown as MetaClient;
  registerIgProfileTools(server, client);
  registerIgPublishingTools(server, client);
  return { calls, async run(name: string, args: Record<string, unknown>) {
    const tool = tools.get(name)!;
    return tool.handler(z.object(tool.schema).parse(args));
  } };
}

test("business discovery uses username field expansion and rejects invalid usernames", async () => {
  const { run, calls } = capture();
  await run("ig_business_discovery", { username: "bluebottle", fields: "id,media{like_count}" });
  assert.deepEqual(calls[0].params, { fields: "business_discovery.username(bluebottle){id,media{like_count}}" });
  await assert.rejects(run("ig_business_discovery", { username: "bad){id}" }));
  assert.equal(calls.length, 1);
});

test("collaboration responses send media_id and accept with compatible legacy aliases", async () => {
  const { run, calls } = capture();
  await run("ig_respond_collaboration_invite", { media_id: "media", accept: false });
  await run("ig_respond_collaboration_invite", { invite_id: "legacy", action: "accept" });
  assert.deepEqual(calls.map((call) => call.params), [
    { media_id: "media", accept: false }, { media_id: "legacy", accept: true },
  ]);
  const invalid = await run("ig_respond_collaboration_invite", { media_id: "media", accept: false, action: "accept" });
  assert.equal(invalid.isError, true);
  assert.equal(calls.length, 2);
  assert.equal((await run("ig_respond_collaboration_invite", {})).isError, true);
});

test("account insights infer total_value and forward demographic parameters", async () => {
  const { run, calls } = capture();
  await run("ig_get_account_insights", { metric: "views,reposts", period: "day", since: "100" });
  assert.deepEqual(calls[0].params, { metric: "views,reposts", period: "day", metric_type: "total_value", since: "100" });
  await run("ig_get_account_insights", { metric: "follower_demographics", period: "lifetime", timeframe: "this_month", breakdown: "country" });
  assert.deepEqual(calls[1].params, { metric: "follower_demographics", period: "lifetime", metric_type: "total_value", timeframe: "this_month", breakdown: "country" });
  assert.equal((await run("ig_get_account_insights", { metric: "views", period: "day", metric_type: "time_series" })).isError, true);
  assert.equal((await run("ig_get_account_insights", { metric: "follower_demographics", period: "day" })).isError, true);
  assert.equal(calls.length, 2);
});

test("a reach breakdown selects total_value while plain reach preserves time-series behavior", async () => {
  const { run, calls } = capture();
  await run("ig_get_account_insights", { metric: "reach", period: "day", breakdown: "media_product_type" });
  await run("ig_get_account_insights", { metric: "reach", period: "day", metric_type: "time_series" });
  assert.equal(calls[0].params?.metric_type, "total_value");
  assert.equal(calls[1].params?.metric_type, "time_series");
});

test("follower demographics retain all timeframes while engaged and reached demographics enforce v20 limits", async () => {
  const { run, calls } = capture();
  for (const timeframe of ["last_14_days", "last_30_days", "last_90_days", "prev_month", "this_month", "this_week"]) {
    const result = await run("ig_get_account_insights", { metric: "follower_demographics", period: "lifetime", breakdown: "age", timeframe });
    assert.notEqual(result.isError, true);
    assert.equal(calls.at(-1)?.params?.timeframe, timeframe);
  }
  assert.equal(calls.length, 6);
  for (const metric of ["engaged_audience_demographics", "reached_audience_demographics", "follower_demographics,engaged_audience_demographics"]) {
    const result = await run("ig_get_account_insights", { metric, period: "lifetime", breakdown: "country", timeframe: "last_30_days" });
    assert.equal(result.isError, true);
  }
  assert.equal(calls.length, 6);
  await run("ig_get_account_insights", { metric: "engaged_audience_demographics", period: "lifetime", breakdown: "country", timeframe: "this_month" });
  assert.equal(calls.length, 7);
});

test("standalone video publishes a Reel after processing and retains a zero thumbnail offset", async () => {
  const { run, calls } = capture();
  await run("ig_publish_video", { video_url: "https://example.com/video.mp4", thumb_offset: 0 });
  assert.deepEqual(calls[0].params, { video_url: "https://example.com/video.mp4", media_type: "REELS", share_to_feed: true, thumb_offset: 0 });
  assert.equal(calls[1].params?.fields, "status_code");
  assert.equal(calls[2].path, "/account/media_publish");
});

test("carousel disclosures apply to parent and video children keep VIDEO type", async () => {
  const { run, calls } = capture();
  await run("ig_publish_carousel", {
    items: [{ type: "VIDEO", url: "https://example.com/v.mp4" }, { type: "IMAGE", url: "https://example.com/i.jpg" }],
    is_ai_generated: true, is_paid_partnership: false, branded_content_sponsor_ids: ["brand"],
  });
  assert.deepEqual(calls[0].params, { is_carousel_item: true, video_url: "https://example.com/v.mp4", media_type: "VIDEO" });
  const parent = calls.find((call) => call.params?.media_type === "CAROUSEL")!;
  assert.equal(parent.params?.is_ai_generated, true);
  assert.equal(parent.params?.is_paid_partnership, false);
  assert.deepEqual(parent.params?.branded_content_sponsor_ids, ["brand"]);
});

test("Trial Reel options and explicit false values reach media creation", async () => {
  const { run, calls } = capture();
  await run("ig_publish_reel", {
    video_url: "https://example.com/v.mp4", share_to_feed: false, is_ai_generated: false,
    trial_params: { graduation_strategy: "MANUAL" },
  });
  assert.deepEqual(calls[0].params, {
    video_url: "https://example.com/v.mp4", media_type: "REELS", share_to_feed: false,
    is_ai_generated: false, trial_params: { graduation_strategy: "MANUAL" },
  });
});

test("public Threads oEmbed does not require or send a token", async () => {
  const previousFetch = globalThis.fetch;
  let requestedUrl = "";
  globalThis.fetch = async (input) => {
    requestedUrl = String(input);
    return new Response(JSON.stringify({ html: "<blockquote></blockquote>" }), { headers: { "content-type": "application/json" } });
  };
  try {
    const client = new MetaClient({ appId: "", appSecret: "", instagramAccessToken: "", instagramUserId: "", instagramMessagingAccessToken: "", instagramPageId: "", threadsAccessToken: "", threadsUserId: "" });
    await client.threadsOembed({ url: "https://www.threads.com/@user/post/id" });
    const url = new URL(requestedUrl);
    assert.equal(url.pathname, "/v1.0/oembed");
    assert.equal(url.searchParams.has("access_token"), false);
  } finally {
    globalThis.fetch = previousFetch;
  }
});
