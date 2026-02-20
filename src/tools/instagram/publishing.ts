import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { MetaClient } from "../../services/meta-client.js";

/** Poll container status until FINISHED or error (video upload) */
async function waitForContainer(client: MetaClient, containerId: string, maxWait = 30): Promise<void> {
  const interval = 2000;
  const maxAttempts = Math.ceil((maxWait * 1000) / interval);
  for (let i = 0; i < maxAttempts; i++) {
    const { data } = await client.ig("GET", `/${containerId}`, { fields: "status_code" });
    const status = (data as { status_code?: string }).status_code;
    if (status === "FINISHED") return;
    if (status === "ERROR") throw new Error("Container processing failed (ERROR status)");
    await new Promise((r) => setTimeout(r, interval));
  }
  throw new Error(`Container processing timed out after ${maxWait}s`);
}

export function registerIgPublishingTools(server: McpServer, client: MetaClient): void {
  // ─── ig_publish_photo ────────────────────────────────────────
  server.tool(
    "ig_publish_photo",
    "Publish a photo to Instagram. Two-step process: creates container then publishes. Requires image_url (publicly accessible HTTPS URL).",
    {
      image_url: z.string().url().describe("Public HTTPS URL of the image"),
      caption: z.string().optional().describe("Post caption (max 2200 chars)"),
      location_id: z.string().optional().describe("Facebook Page location ID"),
      user_tags: z.string().optional().describe("JSON array of user tags: [{username, x, y}]"),
    },
    async ({ image_url, caption, location_id, user_tags }) => {
      try {
        const params: Record<string, unknown> = { image_url };
        if (caption) params.caption = caption;
        if (location_id) params.location_id = location_id;
        if (user_tags) params.user_tags = user_tags;
        // Step 1: Create container
        const { data: container } = await client.ig("POST", `/${client.igUserId}/media`, params);
        const containerId = (container as { id: string }).id;
        // Step 2: Publish
        const { data, rateLimit } = await client.ig("POST", `/${client.igUserId}/media_publish`, {
          creation_id: containerId,
        });
        return { content: [{ type: "text", text: JSON.stringify({ ...data as object, _rateLimit: rateLimit }, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Publish photo failed: ${error instanceof Error ? error.message : String(error)}` }], isError: true };
      }
    }
  );

  // ─── ig_publish_video ────────────────────────────────────────
  server.tool(
    "ig_publish_video",
    "Publish a video to Instagram feed. Waits for video processing before publishing.",
    {
      video_url: z.string().url().describe("Public HTTPS URL of the video"),
      caption: z.string().optional().describe("Post caption"),
      thumb_offset: z.number().optional().describe("Thumbnail offset in ms"),
      location_id: z.string().optional().describe("Facebook Page location ID"),
    },
    async ({ video_url, caption, thumb_offset, location_id }) => {
      try {
        const params: Record<string, unknown> = { video_url, media_type: "VIDEO" };
        if (caption) params.caption = caption;
        if (thumb_offset) params.thumb_offset = thumb_offset;
        if (location_id) params.location_id = location_id;
        const { data: container } = await client.ig("POST", `/${client.igUserId}/media`, params);
        const containerId = (container as { id: string }).id;
        await waitForContainer(client, containerId);
        const { data, rateLimit } = await client.ig("POST", `/${client.igUserId}/media_publish`, {
          creation_id: containerId,
        });
        return { content: [{ type: "text", text: JSON.stringify({ ...data as object, _rateLimit: rateLimit }, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Publish video failed: ${error instanceof Error ? error.message : String(error)}` }], isError: true };
      }
    }
  );

  // ─── ig_publish_carousel ─────────────────────────────────────
  server.tool(
    "ig_publish_carousel",
    "Publish a carousel (album) post with 2-10 images/videos. Each item needs an image_url or video_url.",
    {
      items: z.array(z.object({
        type: z.enum(["IMAGE", "VIDEO"]).describe("Media type"),
        url: z.string().url().describe("Public HTTPS URL of the media"),
      })).min(2).max(10).describe("Array of media items"),
      caption: z.string().optional().describe("Post caption"),
      location_id: z.string().optional().describe("Facebook Page location ID"),
    },
    async ({ items, caption, location_id }) => {
      try {
        // Step 1: Create child containers
        const childIds: string[] = [];
        for (const item of items) {
          const params: Record<string, unknown> = { is_carousel_item: true };
          if (item.type === "IMAGE") {
            params.image_url = item.url;
          } else {
            params.video_url = item.url;
            params.media_type = "VIDEO";
          }
          const { data: child } = await client.ig("POST", `/${client.igUserId}/media`, params);
          const childId = (child as { id: string }).id;
          if (item.type === "VIDEO") {
            await waitForContainer(client, childId);
          }
          childIds.push(childId);
        }
        // Step 2: Create carousel container
        const carouselParams: Record<string, unknown> = {
          media_type: "CAROUSEL",
          children: childIds.join(","),
        };
        if (caption) carouselParams.caption = caption;
        if (location_id) carouselParams.location_id = location_id;
        const { data: carousel } = await client.ig("POST", `/${client.igUserId}/media`, carouselParams);
        const carouselId = (carousel as { id: string }).id;
        // Step 3: Publish
        const { data, rateLimit } = await client.ig("POST", `/${client.igUserId}/media_publish`, {
          creation_id: carouselId,
        });
        return { content: [{ type: "text", text: JSON.stringify({ ...data as object, _rateLimit: rateLimit }, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Publish carousel failed: ${error instanceof Error ? error.message : String(error)}` }], isError: true };
      }
    }
  );

  // ─── ig_publish_reel ─────────────────────────────────────────
  server.tool(
    "ig_publish_reel",
    "Publish a Reel (short video). Waits for video processing.",
    {
      video_url: z.string().url().describe("Public HTTPS URL of the video"),
      caption: z.string().optional().describe("Reel caption"),
      cover_url: z.string().optional().describe("Custom cover image URL"),
      share_to_feed: z.boolean().optional().describe("Also share to feed (default true)"),
      thumb_offset: z.number().optional().describe("Thumbnail offset in ms"),
    },
    async ({ video_url, caption, cover_url, share_to_feed, thumb_offset }) => {
      try {
        const params: Record<string, unknown> = { video_url, media_type: "REELS" };
        if (caption) params.caption = caption;
        if (cover_url) params.cover_url = cover_url;
        if (share_to_feed !== undefined) params.share_to_feed = share_to_feed;
        if (thumb_offset) params.thumb_offset = thumb_offset;
        const { data: container } = await client.ig("POST", `/${client.igUserId}/media`, params);
        const containerId = (container as { id: string }).id;
        await waitForContainer(client, containerId);
        const { data, rateLimit } = await client.ig("POST", `/${client.igUserId}/media_publish`, {
          creation_id: containerId,
        });
        return { content: [{ type: "text", text: JSON.stringify({ ...data as object, _rateLimit: rateLimit }, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Publish reel failed: ${error instanceof Error ? error.message : String(error)}` }], isError: true };
      }
    }
  );

  // ─── ig_publish_story ────────────────────────────────────────
  server.tool(
    "ig_publish_story",
    "Publish a Story (image or video). Stories disappear after 24 hours.",
    {
      media_type: z.enum(["IMAGE", "VIDEO"]).describe("Story media type"),
      media_url: z.string().url().describe("Public HTTPS URL of the media"),
    },
    async ({ media_type, media_url }) => {
      try {
        const params: Record<string, unknown> = {};
        if (media_type === "IMAGE") {
          params.image_url = media_url;
        } else {
          params.video_url = media_url;
          params.media_type = "VIDEO";
        }
        const { data: container } = await client.ig("POST", `/${client.igUserId}/media`, params);
        const containerId = (container as { id: string }).id;
        if (media_type === "VIDEO") {
          await waitForContainer(client, containerId);
        }
        const { data, rateLimit } = await client.ig("POST", `/${client.igUserId}/media_publish`, {
          creation_id: containerId,
        });
        return { content: [{ type: "text", text: JSON.stringify({ ...data as object, _rateLimit: rateLimit }, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Publish story failed: ${error instanceof Error ? error.message : String(error)}` }], isError: true };
      }
    }
  );

  // ─── ig_get_container_status ─────────────────────────────────
  server.tool(
    "ig_get_container_status",
    "Check the processing status of a media container (useful for videos).",
    {
      container_id: z.string().describe("Container ID to check"),
    },
    async ({ container_id }) => {
      try {
        const { data, rateLimit } = await client.ig("GET", `/${container_id}`, {
          fields: "id,status,status_code",
        });
        return { content: [{ type: "text", text: JSON.stringify({ ...data as object, _rateLimit: rateLimit }, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Get container status failed: ${error instanceof Error ? error.message : String(error)}` }], isError: true };
      }
    }
  );
}
