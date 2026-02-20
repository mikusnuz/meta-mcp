import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { MetaClient } from "../../services/meta-client.js";

export function registerIgProfileTools(server: McpServer, client: MetaClient): void {
  // ─── ig_get_profile ──────────────────────────────────────────
  server.tool(
    "ig_get_profile",
    "Get Instagram Business/Creator account profile information.",
    {},
    async () => {
      try {
        const { data, rateLimit } = await client.ig("GET", `/${client.igUserId}`, {
          fields: "id,name,username,biography,followers_count,follows_count,media_count,profile_picture_url,website",
        });
        return { content: [{ type: "text", text: JSON.stringify({ ...data as object, _rateLimit: rateLimit }, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Get profile failed: ${error instanceof Error ? error.message : String(error)}` }], isError: true };
      }
    }
  );

  // ─── ig_get_account_insights ─────────────────────────────────
  server.tool(
    "ig_get_account_insights",
    "Get Instagram account insights (impressions, reach, follower demographics, etc.). Requires Business/Creator account.",
    {
      metric: z.string().describe("Comma-separated metrics: impressions,reach,follower_count,email_contacts,phone_call_clicks,text_message_clicks,get_directions_clicks,website_clicks,profile_views"),
      period: z.enum(["day", "week", "days_28", "month", "lifetime"]).describe("Aggregation period"),
      since: z.string().optional().describe("Start date (Unix timestamp or ISO 8601)"),
      until: z.string().optional().describe("End date (Unix timestamp or ISO 8601)"),
    },
    async ({ metric, period, since, until }) => {
      try {
        const params: Record<string, unknown> = { metric, period };
        if (since) params.since = since;
        if (until) params.until = until;
        const { data, rateLimit } = await client.ig("GET", `/${client.igUserId}/insights`, params);
        return { content: [{ type: "text", text: JSON.stringify({ ...data as object, _rateLimit: rateLimit }, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Get account insights failed: ${error instanceof Error ? error.message : String(error)}` }], isError: true };
      }
    }
  );

  // ─── ig_business_discovery ───────────────────────────────────
  server.tool(
    "ig_business_discovery",
    "Look up another Instagram Business/Creator account's public info by username.",
    {
      username: z.string().describe("Instagram username to look up (without @)"),
      fields: z.string().optional().describe("Fields to retrieve (default: id,username,name,biography,followers_count,follows_count,media_count)"),
    },
    async ({ username, fields }) => {
      try {
        const f = fields || "id,username,name,biography,followers_count,follows_count,media_count";
        const { data, rateLimit } = await client.ig("GET", `/${client.igUserId}`, {
          fields: `business_discovery.fields(${f}){username=${username}}`,
        });
        return { content: [{ type: "text", text: JSON.stringify({ ...data as object, _rateLimit: rateLimit }, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Business discovery failed: ${error instanceof Error ? error.message : String(error)}` }], isError: true };
      }
    }
  );
}
