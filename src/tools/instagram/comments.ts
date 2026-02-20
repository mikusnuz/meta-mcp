import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { MetaClient } from "../../services/meta-client.js";

export function registerIgCommentTools(server: McpServer, client: MetaClient): void {
  // ─── ig_get_comments ─────────────────────────────────────────
  server.tool(
    "ig_get_comments",
    "Get comments on a specific Instagram media post.",
    {
      media_id: z.string().describe("Media ID"),
      limit: z.number().optional().describe("Number of comments to return"),
      after: z.string().optional().describe("Pagination cursor"),
    },
    async ({ media_id, limit, after }) => {
      try {
        const params: Record<string, unknown> = {
          fields: "id,text,username,timestamp,like_count,replies{id,text,username,timestamp}",
        };
        if (limit) params.limit = limit;
        if (after) params.after = after;
        const { data, rateLimit } = await client.ig("GET", `/${media_id}/comments`, params);
        return { content: [{ type: "text", text: JSON.stringify({ ...data as object, _rateLimit: rateLimit }, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Get comments failed: ${error instanceof Error ? error.message : String(error)}` }], isError: true };
      }
    }
  );

  // ─── ig_get_comment ──────────────────────────────────────────
  server.tool(
    "ig_get_comment",
    "Get details of a specific comment.",
    {
      comment_id: z.string().describe("Comment ID"),
    },
    async ({ comment_id }) => {
      try {
        const { data, rateLimit } = await client.ig("GET", `/${comment_id}`, {
          fields: "id,text,username,timestamp,like_count,parent_id,media",
        });
        return { content: [{ type: "text", text: JSON.stringify({ ...data as object, _rateLimit: rateLimit }, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Get comment failed: ${error instanceof Error ? error.message : String(error)}` }], isError: true };
      }
    }
  );

  // ─── ig_post_comment ─────────────────────────────────────────
  server.tool(
    "ig_post_comment",
    "Post a top-level comment on a media post.",
    {
      media_id: z.string().describe("Media ID to comment on"),
      message: z.string().describe("Comment text"),
    },
    async ({ media_id, message }) => {
      try {
        const { data, rateLimit } = await client.ig("POST", `/${media_id}/comments`, { message });
        return { content: [{ type: "text", text: JSON.stringify({ ...data as object, _rateLimit: rateLimit }, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Post comment failed: ${error instanceof Error ? error.message : String(error)}` }], isError: true };
      }
    }
  );

  // ─── ig_get_replies ──────────────────────────────────────────
  server.tool(
    "ig_get_replies",
    "Get replies to a specific comment.",
    {
      comment_id: z.string().describe("Comment ID to get replies for"),
      limit: z.number().optional().describe("Number of replies to return"),
      after: z.string().optional().describe("Pagination cursor"),
    },
    async ({ comment_id, limit, after }) => {
      try {
        const params: Record<string, unknown> = {
          fields: "id,text,username,timestamp,like_count",
        };
        if (limit) params.limit = limit;
        if (after) params.after = after;
        const { data, rateLimit } = await client.ig("GET", `/${comment_id}/replies`, params);
        return { content: [{ type: "text", text: JSON.stringify({ ...data as object, _rateLimit: rateLimit }, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Get replies failed: ${error instanceof Error ? error.message : String(error)}` }], isError: true };
      }
    }
  );

  // ─── ig_reply_to_comment ─────────────────────────────────────
  server.tool(
    "ig_reply_to_comment",
    "Reply to a specific comment.",
    {
      comment_id: z.string().describe("Comment ID to reply to"),
      message: z.string().describe("Reply text"),
    },
    async ({ comment_id, message }) => {
      try {
        const { data, rateLimit } = await client.ig("POST", `/${comment_id}/replies`, { message });
        return { content: [{ type: "text", text: JSON.stringify({ ...data as object, _rateLimit: rateLimit }, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Reply failed: ${error instanceof Error ? error.message : String(error)}` }], isError: true };
      }
    }
  );

  // ─── ig_hide_comment ─────────────────────────────────────────
  server.tool(
    "ig_hide_comment",
    "Hide or unhide a comment on your post.",
    {
      comment_id: z.string().describe("Comment ID"),
      hide: z.boolean().describe("true to hide, false to unhide"),
    },
    async ({ comment_id, hide }) => {
      try {
        const { data, rateLimit } = await client.ig("POST", `/${comment_id}`, { hide });
        return { content: [{ type: "text", text: JSON.stringify({ success: true, hidden: hide, ...data as object, _rateLimit: rateLimit }, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Hide comment failed: ${error instanceof Error ? error.message : String(error)}` }], isError: true };
      }
    }
  );

  // ─── ig_delete_comment ───────────────────────────────────────
  server.tool(
    "ig_delete_comment",
    "Delete a comment from your media post. This action is irreversible.",
    {
      comment_id: z.string().describe("Comment ID to delete"),
    },
    async ({ comment_id }) => {
      try {
        const { data, rateLimit } = await client.ig("DELETE", `/${comment_id}`);
        return { content: [{ type: "text", text: JSON.stringify({ success: true, ...data as object, _rateLimit: rateLimit }, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Delete comment failed: ${error instanceof Error ? error.message : String(error)}` }], isError: true };
      }
    }
  );
}
