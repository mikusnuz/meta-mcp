import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { MetaClient } from "../../services/meta-client.js";

export function registerIgHashtagTools(server: McpServer, client: MetaClient): void {
  // ─── ig_search_hashtag ───────────────────────────────────────
  server.tool(
    "ig_search_hashtag",
    "Search for a hashtag ID by name. Required before querying hashtag media. Limited to 30 unique hashtags per 7-day rolling window.",
    {
      q: z.string().describe("Hashtag name to search (without #)"),
    },
    async ({ q }) => {
      try {
        const { data, rateLimit } = await client.ig("GET", "/ig_hashtag_search", {
          q,
          user_id: client.igUserId,
        });
        return { content: [{ type: "text", text: JSON.stringify({ ...data as object, _rateLimit: rateLimit }, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Hashtag search failed: ${error instanceof Error ? error.message : String(error)}` }], isError: true };
      }
    }
  );

  // ─── ig_get_hashtag ──────────────────────────────────────────
  server.tool(
    "ig_get_hashtag",
    "Get hashtag information by ID.",
    {
      hashtag_id: z.string().describe("Hashtag ID (from ig_search_hashtag)"),
    },
    async ({ hashtag_id }) => {
      try {
        const { data, rateLimit } = await client.ig("GET", `/${hashtag_id}`, {
          fields: "id,name,media_count",
        });
        return { content: [{ type: "text", text: JSON.stringify({ ...data as object, _rateLimit: rateLimit }, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Get hashtag failed: ${error instanceof Error ? error.message : String(error)}` }], isError: true };
      }
    }
  );

  // ─── ig_get_hashtag_recent ───────────────────────────────────
  server.tool(
    "ig_get_hashtag_recent",
    "Get recent media tagged with a specific hashtag.",
    {
      hashtag_id: z.string().describe("Hashtag ID"),
      limit: z.number().optional().describe("Number of results"),
      after: z.string().optional().describe("Pagination cursor"),
    },
    async ({ hashtag_id, limit, after }) => {
      try {
        const params: Record<string, unknown> = {
          user_id: client.igUserId,
          fields: "id,caption,media_type,media_url,permalink,timestamp,like_count,comments_count",
        };
        if (limit) params.limit = limit;
        if (after) params.after = after;
        const { data, rateLimit } = await client.ig("GET", `/${hashtag_id}/recent_media`, params);
        return { content: [{ type: "text", text: JSON.stringify({ ...data as object, _rateLimit: rateLimit }, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Get hashtag recent failed: ${error instanceof Error ? error.message : String(error)}` }], isError: true };
      }
    }
  );

  // ─── ig_get_hashtag_top ──────────────────────────────────────
  server.tool(
    "ig_get_hashtag_top",
    "Get top (most popular) media tagged with a specific hashtag.",
    {
      hashtag_id: z.string().describe("Hashtag ID"),
      limit: z.number().optional().describe("Number of results"),
      after: z.string().optional().describe("Pagination cursor"),
    },
    async ({ hashtag_id, limit, after }) => {
      try {
        const params: Record<string, unknown> = {
          user_id: client.igUserId,
          fields: "id,caption,media_type,media_url,permalink,timestamp,like_count,comments_count",
        };
        if (limit) params.limit = limit;
        if (after) params.after = after;
        const { data, rateLimit } = await client.ig("GET", `/${hashtag_id}/top_media`, params);
        return { content: [{ type: "text", text: JSON.stringify({ ...data as object, _rateLimit: rateLimit }, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Get hashtag top failed: ${error instanceof Error ? error.message : String(error)}` }], isError: true };
      }
    }
  );
}
