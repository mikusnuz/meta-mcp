import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { MetaClient } from "../../services/meta-client.js";

export function registerThreadsMediaTools(server: McpServer, client: MetaClient): void {
  // ─── threads_get_posts ───────────────────────────────────────
  server.tool(
    "threads_get_posts",
    "Get a list of published Threads posts.",
    {
      limit: z.number().optional().describe("Number of results (default 25)"),
      since: z.string().optional().describe("Start date (ISO 8601 or Unix timestamp)"),
      until: z.string().optional().describe("End date (ISO 8601 or Unix timestamp)"),
      after: z.string().optional().describe("Pagination cursor"),
      before: z.string().optional().describe("Pagination cursor"),
    },
    async ({ limit, since, until, after, before }) => {
      try {
        const params: Record<string, unknown> = {
          fields: "id,media_product_type,media_type,media_url,permalink,text,timestamp,shortcode,is_quote_post,has_replies,reply_audience",
        };
        if (limit) params.limit = limit;
        if (since) params.since = since;
        if (until) params.until = until;
        if (after) params.after = after;
        if (before) params.before = before;
        const { data, rateLimit } = await client.threads("GET", `/${client.threadsUserId}/threads`, params);
        return { content: [{ type: "text", text: JSON.stringify({ ...data as object, _rateLimit: rateLimit }, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Get posts failed: ${error instanceof Error ? error.message : String(error)}` }], isError: true };
      }
    }
  );

  // ─── threads_get_post ────────────────────────────────────────
  server.tool(
    "threads_get_post",
    "Get details of a specific Threads post.",
    {
      post_id: z.string().describe("Threads post ID"),
      fields: z.string().optional().describe("Comma-separated fields"),
    },
    async ({ post_id, fields }) => {
      try {
        const f = fields || "id,media_product_type,media_type,media_url,permalink,text,timestamp,shortcode,is_quote_post,has_replies,reply_audience";
        const { data, rateLimit } = await client.threads("GET", `/${post_id}`, { fields: f });
        return { content: [{ type: "text", text: JSON.stringify({ ...data as object, _rateLimit: rateLimit }, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Get post failed: ${error instanceof Error ? error.message : String(error)}` }], isError: true };
      }
    }
  );
}
