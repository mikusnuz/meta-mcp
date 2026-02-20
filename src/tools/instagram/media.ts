import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { MetaClient } from "../../services/meta-client.js";

export function registerIgMediaTools(server: McpServer, client: MetaClient): void {
  // ─── ig_get_media_list ───────────────────────────────────────
  server.tool(
    "ig_get_media_list",
    "Get list of media published on the Instagram account.",
    {
      limit: z.number().optional().describe("Number of results (max 100, default 25)"),
      after: z.string().optional().describe("Pagination cursor for next page"),
      before: z.string().optional().describe("Pagination cursor for previous page"),
    },
    async ({ limit, after, before }) => {
      try {
        const params: Record<string, unknown> = {
          fields: "id,caption,media_type,media_url,permalink,thumbnail_url,timestamp,like_count,comments_count",
        };
        if (limit) params.limit = limit;
        if (after) params.after = after;
        if (before) params.before = before;
        const { data, rateLimit } = await client.ig("GET", `/${client.igUserId}/media`, params);
        return { content: [{ type: "text", text: JSON.stringify({ ...data as object, _rateLimit: rateLimit }, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Get media list failed: ${error instanceof Error ? error.message : String(error)}` }], isError: true };
      }
    }
  );

  // ─── ig_get_media ────────────────────────────────────────────
  server.tool(
    "ig_get_media",
    "Get details of a specific Instagram media post.",
    {
      media_id: z.string().describe("Media ID"),
      fields: z.string().optional().describe("Comma-separated fields (default: id,caption,media_type,media_url,permalink,timestamp,like_count,comments_count)"),
    },
    async ({ media_id, fields }) => {
      try {
        const f = fields || "id,caption,media_type,media_url,permalink,thumbnail_url,timestamp,like_count,comments_count";
        const { data, rateLimit } = await client.ig("GET", `/${media_id}`, { fields: f });
        return { content: [{ type: "text", text: JSON.stringify({ ...data as object, _rateLimit: rateLimit }, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Get media failed: ${error instanceof Error ? error.message : String(error)}` }], isError: true };
      }
    }
  );

  // ─── ig_delete_media ─────────────────────────────────────────
  server.tool(
    "ig_delete_media",
    "Delete an Instagram media post. This action is irreversible.",
    {
      media_id: z.string().describe("Media ID to delete"),
    },
    async ({ media_id }) => {
      try {
        const { data, rateLimit } = await client.ig("DELETE", `/${media_id}`);
        return { content: [{ type: "text", text: JSON.stringify({ success: true, ...data as object, _rateLimit: rateLimit }, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Delete media failed: ${error instanceof Error ? error.message : String(error)}` }], isError: true };
      }
    }
  );

  // ─── ig_get_media_insights ───────────────────────────────────
  server.tool(
    "ig_get_media_insights",
    "Get insights/analytics for a specific media post (impressions, reach, engagement, etc.).",
    {
      media_id: z.string().describe("Media ID"),
      metric: z.string().optional().describe("Comma-separated metrics (default: impressions,reach,engagement,saved). For VIDEO/REEL add: video_views,plays"),
    },
    async ({ media_id, metric }) => {
      try {
        const m = metric || "impressions,reach,engagement,saved";
        const { data, rateLimit } = await client.ig("GET", `/${media_id}/insights`, { metric: m });
        return { content: [{ type: "text", text: JSON.stringify({ ...data as object, _rateLimit: rateLimit }, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Get media insights failed: ${error instanceof Error ? error.message : String(error)}` }], isError: true };
      }
    }
  );

  // ─── ig_toggle_comments ──────────────────────────────────────
  server.tool(
    "ig_toggle_comments",
    "Enable or disable comments on an Instagram media post.",
    {
      media_id: z.string().describe("Media ID"),
      enabled: z.boolean().describe("true to enable comments, false to disable"),
    },
    async ({ media_id, enabled }) => {
      try {
        const { data, rateLimit } = await client.ig("POST", `/${media_id}`, {
          comment_enabled: enabled,
        });
        return { content: [{ type: "text", text: JSON.stringify({ success: true, comment_enabled: enabled, ...data as object, _rateLimit: rateLimit }, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Toggle comments failed: ${error instanceof Error ? error.message : String(error)}` }], isError: true };
      }
    }
  );
}
