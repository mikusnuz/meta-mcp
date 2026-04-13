import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { MetaClient } from "../../services/meta-client.js";

export function registerThreadsReplyTools(server: McpServer, client: MetaClient): void {
  // ─── threads_get_replies ─────────────────────────────────────
  server.tool(
    "threads_get_replies",
    "Get replies (conversation) for a specific Threads post.",
    {
      post_id: z.string().describe("Threads post ID to get replies for"),
      reverse: z.boolean().optional().describe("Reverse chronological order"),
      limit: z.number().optional().describe("Number of replies"),
      after: z.string().optional().describe("Pagination cursor"),
    },
    async ({ post_id, reverse, limit, after }) => {
      try {
        const params: Record<string, unknown> = {
          fields: "id,text,username,permalink,timestamp,media_type,media_url,has_replies,hide_status",
        };
        if (reverse !== undefined) params.reverse = reverse;
        if (limit) params.limit = limit;
        if (after) params.after = after;
        const { data, rateLimit } = await client.threads("GET", `/${post_id}/replies`, params);
        return { content: [{ type: "text", text: JSON.stringify({ ...data as object, _rateLimit: rateLimit }, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Get replies failed: ${error instanceof Error ? error.message : String(error)}` }], isError: true };
      }
    }
  );

  // ─── threads_reply ───────────────────────────────────────────
  server.tool(
    "threads_reply",
    "Reply to a Threads post or another reply.",
    {
      reply_to_id: z.string().describe("Post ID to reply to"),
      text: z.string().max(500).describe("Reply text"),
      image_url: z.string().url().optional().describe("Optional image URL to attach"),
      video_url: z.string().url().optional().describe("Optional video URL to attach"),
    },
    async ({ reply_to_id, text, image_url, video_url }) => {
      try {
        let mediaType = "TEXT";
        if (image_url) mediaType = "IMAGE";
        if (video_url) mediaType = "VIDEO";
        const params: Record<string, unknown> = {
          media_type: mediaType,
          text,
          reply_to_id,
        };
        if (image_url) params.image_url = image_url;
        if (video_url) params.video_url = video_url;
        const { data: container } = await client.threads("POST", `/${client.threadsUserId}/threads`, params);
        const containerId = (container as { id: string }).id;
        if (video_url) {
          // Wait for video processing
          const interval = 2000;
          const maxAttempts = 15;
          for (let i = 0; i < maxAttempts; i++) {
            const { data: status } = await client.threads("GET", `/${containerId}`, { fields: "status" });
            const s = (status as { status?: string }).status;
            if (s === "FINISHED") break;
            if (s === "ERROR") throw new Error("Video processing failed");
            await new Promise((r) => setTimeout(r, interval));
          }
        }
        const { data, rateLimit } = await client.threads("POST", `/${client.threadsUserId}/threads_publish`, {
          creation_id: containerId,
        });
        return { content: [{ type: "text", text: JSON.stringify({ ...data as object, _rateLimit: rateLimit }, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Reply failed: ${error instanceof Error ? error.message : String(error)}` }], isError: true };
      }
    }
  );

  // ─── threads_hide_reply ──────────────────────────────────────
  server.tool(
    "threads_hide_reply",
    "Hide a reply on your Threads post. Hidden replies are still visible if directly accessed.",
    {
      reply_id: z.string().describe("Reply ID to hide"),
    },
    async ({ reply_id }) => {
      try {
        const { data, rateLimit } = await client.threads("POST", `/${reply_id}/manage_reply`, { hide: true });
        return { content: [{ type: "text", text: JSON.stringify({ success: true, hidden: true, ...data as object, _rateLimit: rateLimit }, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Hide reply failed: ${error instanceof Error ? error.message : String(error)}` }], isError: true };
      }
    }
  );

  // ─── threads_unhide_reply ────────────────────────────────────
  server.tool(
    "threads_unhide_reply",
    "Unhide a previously hidden reply on your Threads post.",
    {
      reply_id: z.string().describe("Reply ID to unhide"),
    },
    async ({ reply_id }) => {
      try {
        const { data, rateLimit } = await client.threads("POST", `/${reply_id}/manage_reply`, { hide: false });
        return { content: [{ type: "text", text: JSON.stringify({ success: true, hidden: false, ...data as object, _rateLimit: rateLimit }, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Unhide reply failed: ${error instanceof Error ? error.message : String(error)}` }], isError: true };
      }
    }
  );
}
