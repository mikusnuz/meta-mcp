import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { MetaClient } from "../../services/meta-client.js";

const pageRequirements =
  "Posts as the Facebook Page in INSTAGRAM_PAGE_ID. Requires pages_show_list and pages_manage_posts.";

export function registerFbPublishingTools(server: McpServer, client: MetaClient): void {
  // ─── fb_publish_page_post ────────────────────────────────────
  server.tool(
    "fb_publish_page_post",
    `Publish a text post, optionally with a link, to the Facebook Page. ${pageRequirements}`,
    {
      message: z.string().min(1).describe("Post text"),
      link: z.string().url().optional().describe("URL to attach to the post"),
    },
    async ({ message, link }) => {
      try {
        const params: Record<string, unknown> = { message };
        if (link) params.link = link;
        const { data, rateLimit } = await client.page("POST", `/${client.instagramPageId}/feed`, params);
        return { content: [{ type: "text", text: JSON.stringify({ ...data as object, _rateLimit: rateLimit }, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Publish page post failed: ${error instanceof Error ? error.message : String(error)}` }], isError: true };
      }
    }
  );

  // ─── fb_publish_page_video ───────────────────────────────────
  server.tool(
    "fb_publish_page_video",
    `Publish a video to the Facebook Page from a public URL. ${pageRequirements}`,
    {
      file_url: z.string().url().describe("Public HTTPS URL of the video file"),
      description: z.string().optional().describe("Video description"),
    },
    async ({ file_url, description }) => {
      try {
        const params: Record<string, unknown> = { file_url };
        if (description) params.description = description;
        const { data, rateLimit } = await client.page("POST", `/${client.instagramPageId}/videos`, params);
        return { content: [{ type: "text", text: JSON.stringify({ ...data as object, _rateLimit: rateLimit }, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Publish page video failed: ${error instanceof Error ? error.message : String(error)}` }], isError: true };
      }
    }
  );

  // ─── fb_publish_page_photo ───────────────────────────────────
  server.tool(
    "fb_publish_page_photo",
    `Publish a photo to the Facebook Page from a public URL. ${pageRequirements}`,
    {
      url: z.string().url().describe("Public HTTPS URL of the image"),
      caption: z.string().optional().describe("Photo caption"),
    },
    async ({ url, caption }) => {
      try {
        const params: Record<string, unknown> = { url };
        if (caption) params.caption = caption;
        const { data, rateLimit } = await client.page("POST", `/${client.instagramPageId}/photos`, params);
        return { content: [{ type: "text", text: JSON.stringify({ ...data as object, _rateLimit: rateLimit }, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Publish page photo failed: ${error instanceof Error ? error.message : String(error)}` }], isError: true };
      }
    }
  );
}
