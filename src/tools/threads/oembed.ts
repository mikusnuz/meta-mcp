import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { MetaClient } from "../../services/meta-client.js";

export function registerThreadsOembedTools(server: McpServer, client: MetaClient): void {
  // ─── threads_get_oembed ──────────────────────────────────────
  server.tool(
    "threads_get_oembed",
    "Get the embed HTML and metadata for a public Threads post, for rendering a rich preview on an external site. No access token required.",
    {
      url: z.string().url().describe("Permalink of the post, e.g. https://www.threads.com/@user/post/{shortcode} or https://www.threads.com/t/{shortcode}"),
      maxwidth: z.number().min(320).max(658).optional().describe("Maximum width of the returned embed in pixels (320-658)"),
    },
    async ({ url, maxwidth }) => {
      try {
        const params: Record<string, unknown> = { url };
        if (maxwidth) params.maxwidth = maxwidth;
        const { data, rateLimit } = await client.threadsOembed(params);
        return { content: [{ type: "text", text: JSON.stringify({ ...data as object, _rateLimit: rateLimit }, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Get oEmbed failed: ${error instanceof Error ? error.message : String(error)}` }], isError: true };
      }
    }
  );
}
