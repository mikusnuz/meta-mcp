import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { MetaClient } from "../../services/meta-client.js";

export function registerThreadsProfileTools(server: McpServer, client: MetaClient): void {
  // ─── threads_get_profile ─────────────────────────────────────
  server.tool(
    "threads_get_profile",
    "Get Threads user profile information.",
    {},
    async () => {
      try {
        const { data, rateLimit } = await client.threads("GET", `/${client.threadsUserId}`, {
          fields: "id,username,name,threads_profile_picture_url,threads_biography",
        });
        return { content: [{ type: "text", text: JSON.stringify({ ...data as object, _rateLimit: rateLimit }, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Get profile failed: ${error instanceof Error ? error.message : String(error)}` }], isError: true };
      }
    }
  );

  // ─── threads_get_user_threads ────────────────────────────────
  server.tool(
    "threads_get_user_threads",
    "Get all threads published by the user (alias for threads_get_posts with user context).",
    {
      limit: z.number().optional().describe("Number of results"),
      since: z.string().optional().describe("Start date (ISO 8601 or Unix timestamp)"),
      until: z.string().optional().describe("End date (ISO 8601 or Unix timestamp)"),
      after: z.string().optional().describe("Pagination cursor"),
    },
    async ({ limit, since, until, after }) => {
      try {
        const params: Record<string, unknown> = {
          fields: "id,media_product_type,media_type,text,permalink,timestamp,shortcode,is_quote_post",
        };
        if (limit) params.limit = limit;
        if (since) params.since = since;
        if (until) params.until = until;
        if (after) params.after = after;
        const { data, rateLimit } = await client.threads("GET", `/${client.threadsUserId}/threads`, params);
        return { content: [{ type: "text", text: JSON.stringify({ ...data as object, _rateLimit: rateLimit }, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Get user threads failed: ${error instanceof Error ? error.message : String(error)}` }], isError: true };
      }
    }
  );
}
