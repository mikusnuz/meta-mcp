import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { MetaClient } from "../../services/meta-client.js";

export function registerThreadsInsightTools(server: McpServer, client: MetaClient): void {
  // ─── threads_get_post_insights ───────────────────────────────
  server.tool(
    "threads_get_post_insights",
    "Get insights/analytics for a specific Threads post (views, likes, replies, reposts, quotes).",
    {
      post_id: z.string().describe("Threads post ID"),
      metric: z.string().optional().describe("Comma-separated metrics (default: views,likes,replies,reposts,quotes)"),
    },
    async ({ post_id, metric }) => {
      try {
        const m = metric || "views,likes,replies,reposts,quotes";
        const { data, rateLimit } = await client.threads("GET", `/${post_id}/insights`, { metric: m });
        return { content: [{ type: "text", text: JSON.stringify({ ...data as object, _rateLimit: rateLimit }, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Get post insights failed: ${error instanceof Error ? error.message : String(error)}` }], isError: true };
      }
    }
  );

  // ─── threads_get_user_insights ───────────────────────────────
  server.tool(
    "threads_get_user_insights",
    "Get account-level Threads insights (views, likes, replies, reposts, quotes, followers, follower demographics).",
    {
      metric: z.string().describe("Comma-separated metrics: views,likes,replies,reposts,quotes,followers_count,follower_demographics"),
      since: z.string().optional().describe("Start date (Unix timestamp)"),
      until: z.string().optional().describe("End date (Unix timestamp)"),
    },
    async ({ metric, since, until }) => {
      try {
        const params: Record<string, unknown> = { metric };
        if (since) params.since = since;
        if (until) params.until = until;
        const { data, rateLimit } = await client.threads("GET", `/${client.threadsUserId}/threads_insights`, params);
        return { content: [{ type: "text", text: JSON.stringify({ ...data as object, _rateLimit: rateLimit }, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Get user insights failed: ${error instanceof Error ? error.message : String(error)}` }], isError: true };
      }
    }
  );
}
