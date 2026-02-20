import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { MetaClient } from "../../services/meta-client.js";

export function registerIgMentionTools(server: McpServer, client: MetaClient): void {
  // ─── ig_get_mentioned_comments ───────────────────────────────
  server.tool(
    "ig_get_mentioned_comments",
    "Get comments where the account was @mentioned. Returns the media and comment details.",
    {
      comment_id: z.string().describe("Comment ID from a mention notification"),
      fields: z.string().optional().describe("Fields to return (default: id,text,timestamp,username,media)"),
    },
    async ({ comment_id, fields }) => {
      try {
        const f = fields || "id,text,timestamp,username,media{id,media_url,media_type}";
        const { data, rateLimit } = await client.ig("GET", `/${client.igUserId}/mentioned_comment`, {
          comment_id,
          fields: f,
        });
        return { content: [{ type: "text", text: JSON.stringify({ ...data as object, _rateLimit: rateLimit }, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Get mentioned comments failed: ${error instanceof Error ? error.message : String(error)}` }], isError: true };
      }
    }
  );

  // ─── ig_get_tagged_media ─────────────────────────────────────
  server.tool(
    "ig_get_tagged_media",
    "Get media where the account is tagged (photo tags, not @mentions).",
    {
      limit: z.number().optional().describe("Number of results"),
      after: z.string().optional().describe("Pagination cursor"),
    },
    async ({ limit, after }) => {
      try {
        const params: Record<string, unknown> = {
          fields: "id,caption,media_type,media_url,permalink,timestamp,username",
        };
        if (limit) params.limit = limit;
        if (after) params.after = after;
        const { data, rateLimit } = await client.ig("GET", `/${client.igUserId}/tags`, params);
        return { content: [{ type: "text", text: JSON.stringify({ ...data as object, _rateLimit: rateLimit }, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Get tagged media failed: ${error instanceof Error ? error.message : String(error)}` }], isError: true };
      }
    }
  );
}
