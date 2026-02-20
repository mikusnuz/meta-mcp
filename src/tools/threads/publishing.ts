import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { MetaClient } from "../../services/meta-client.js";

async function waitForThreadsContainer(client: MetaClient, containerId: string, maxWait = 30): Promise<void> {
  const interval = 2000;
  const maxAttempts = Math.ceil((maxWait * 1000) / interval);
  for (let i = 0; i < maxAttempts; i++) {
    const { data } = await client.threads("GET", `/${containerId}`, { fields: "status" });
    const status = (data as { status?: string }).status;
    if (status === "FINISHED") return;
    if (status === "ERROR") throw new Error("Threads container processing failed (ERROR status)");
    await new Promise((r) => setTimeout(r, interval));
  }
  throw new Error(`Threads container processing timed out after ${maxWait}s`);
}

export function registerThreadsPublishingTools(server: McpServer, client: MetaClient): void {
  // ─── threads_publish_text ────────────────────────────────────
  server.tool(
    "threads_publish_text",
    "Publish a text-only post on Threads.",
    {
      text: z.string().max(500).describe("Post text (max 500 chars)"),
      reply_control: z.enum(["everyone", "accounts_you_follow", "mentioned_only"]).optional().describe("Who can reply"),
    },
    async ({ text, reply_control }) => {
      try {
        const params: Record<string, unknown> = { media_type: "TEXT", text };
        if (reply_control) params.reply_control = reply_control;
        const { data: container } = await client.threads("POST", `/${client.threadsUserId}/threads`, params);
        const containerId = (container as { id: string }).id;
        const { data, rateLimit } = await client.threads("POST", `/${client.threadsUserId}/threads_publish`, {
          creation_id: containerId,
        });
        return { content: [{ type: "text", text: JSON.stringify({ ...data as object, _rateLimit: rateLimit }, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Publish text failed: ${error instanceof Error ? error.message : String(error)}` }], isError: true };
      }
    }
  );

  // ─── threads_publish_image ───────────────────────────────────
  server.tool(
    "threads_publish_image",
    "Publish an image post on Threads.",
    {
      image_url: z.string().url().describe("Public HTTPS URL of the image"),
      text: z.string().max(500).optional().describe("Caption text"),
      reply_control: z.enum(["everyone", "accounts_you_follow", "mentioned_only"]).optional().describe("Who can reply"),
    },
    async ({ image_url, text, reply_control }) => {
      try {
        const params: Record<string, unknown> = { media_type: "IMAGE", image_url };
        if (text) params.text = text;
        if (reply_control) params.reply_control = reply_control;
        const { data: container } = await client.threads("POST", `/${client.threadsUserId}/threads`, params);
        const containerId = (container as { id: string }).id;
        const { data, rateLimit } = await client.threads("POST", `/${client.threadsUserId}/threads_publish`, {
          creation_id: containerId,
        });
        return { content: [{ type: "text", text: JSON.stringify({ ...data as object, _rateLimit: rateLimit }, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Publish image failed: ${error instanceof Error ? error.message : String(error)}` }], isError: true };
      }
    }
  );

  // ─── threads_publish_video ───────────────────────────────────
  server.tool(
    "threads_publish_video",
    "Publish a video post on Threads. Waits for video processing.",
    {
      video_url: z.string().url().describe("Public HTTPS URL of the video"),
      text: z.string().max(500).optional().describe("Caption text"),
      reply_control: z.enum(["everyone", "accounts_you_follow", "mentioned_only"]).optional().describe("Who can reply"),
    },
    async ({ video_url, text, reply_control }) => {
      try {
        const params: Record<string, unknown> = { media_type: "VIDEO", video_url };
        if (text) params.text = text;
        if (reply_control) params.reply_control = reply_control;
        const { data: container } = await client.threads("POST", `/${client.threadsUserId}/threads`, params);
        const containerId = (container as { id: string }).id;
        await waitForThreadsContainer(client, containerId);
        const { data, rateLimit } = await client.threads("POST", `/${client.threadsUserId}/threads_publish`, {
          creation_id: containerId,
        });
        return { content: [{ type: "text", text: JSON.stringify({ ...data as object, _rateLimit: rateLimit }, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Publish video failed: ${error instanceof Error ? error.message : String(error)}` }], isError: true };
      }
    }
  );

  // ─── threads_publish_carousel ────────────────────────────────
  server.tool(
    "threads_publish_carousel",
    "Publish a carousel post on Threads with 2-20 images/videos.",
    {
      items: z.array(z.object({
        type: z.enum(["IMAGE", "VIDEO"]).describe("Media type"),
        url: z.string().url().describe("Public HTTPS URL"),
      })).min(2).max(20).describe("Array of media items"),
      text: z.string().max(500).optional().describe("Caption text"),
      reply_control: z.enum(["everyone", "accounts_you_follow", "mentioned_only"]).optional().describe("Who can reply"),
    },
    async ({ items, text, reply_control }) => {
      try {
        const childIds: string[] = [];
        for (const item of items) {
          const params: Record<string, unknown> = { media_type: item.type, is_carousel_item: true };
          if (item.type === "IMAGE") {
            params.image_url = item.url;
          } else {
            params.video_url = item.url;
          }
          const { data: child } = await client.threads("POST", `/${client.threadsUserId}/threads`, params);
          const childId = (child as { id: string }).id;
          if (item.type === "VIDEO") {
            await waitForThreadsContainer(client, childId);
          }
          childIds.push(childId);
        }
        const carouselParams: Record<string, unknown> = {
          media_type: "CAROUSEL",
          children: childIds.join(","),
        };
        if (text) carouselParams.text = text;
        if (reply_control) carouselParams.reply_control = reply_control;
        const { data: carousel } = await client.threads("POST", `/${client.threadsUserId}/threads`, carouselParams);
        const carouselId = (carousel as { id: string }).id;
        const { data, rateLimit } = await client.threads("POST", `/${client.threadsUserId}/threads_publish`, {
          creation_id: carouselId,
        });
        return { content: [{ type: "text", text: JSON.stringify({ ...data as object, _rateLimit: rateLimit }, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Publish carousel failed: ${error instanceof Error ? error.message : String(error)}` }], isError: true };
      }
    }
  );

  // ─── threads_get_container_status ────────────────────────────
  server.tool(
    "threads_get_container_status",
    "Check the processing status of a Threads media container.",
    {
      container_id: z.string().describe("Container ID to check"),
    },
    async ({ container_id }) => {
      try {
        const { data, rateLimit } = await client.threads("GET", `/${container_id}`, {
          fields: "id,status,error_message",
        });
        return { content: [{ type: "text", text: JSON.stringify({ ...data as object, _rateLimit: rateLimit }, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Get container status failed: ${error instanceof Error ? error.message : String(error)}` }], isError: true };
      }
    }
  );
}
