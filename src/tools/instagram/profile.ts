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
    "Get Instagram account insights. Note: 'impressions', 'email_contacts', 'phone_call_clicks', 'text_message_clicks', 'get_directions_clicks', 'website_clicks', 'profile_views' were deprecated in v22.0. Use 'views', 'reach', 'follower_count', 'reposts' instead.",
    {
      metric: z.string().describe("Comma-separated metrics: views,reach,follower_count,reposts,accounts_engaged,total_interactions"),
      period: z.enum(["day", "week", "days_28", "month", "lifetime"]).describe("Aggregation period"),
      metric_type: z.enum(["time_series", "total_value"]).optional().describe("Aggregation type. Defaults to total_value for metrics that require it, such as views and reposts."),
      breakdown: z.string().optional().describe("Comma-separated breakdowns supported by the metric, e.g. media_product_type, follow_type, age, country"),
      timeframe: z.enum(["last_14_days", "last_30_days", "last_90_days", "prev_month", "this_month", "this_week"]).optional().describe("Required for demographics metrics; do not combine with since or until. Engaged/reached audience demographics only support this_week and this_month; follower demographics support all listed values."),
      since: z.string().optional().describe("Start date (Unix timestamp or ISO 8601)"),
      until: z.string().optional().describe("End date (Unix timestamp or ISO 8601)"),
    },
    async ({ metric, period, metric_type, breakdown, timeframe, since, until }) => {
      try {
        const params: Record<string, unknown> = { metric, period };
        const metrics = metric.split(",").map((value) => value.trim());
        const totalValueMetrics = new Set(["views", "reposts", "accounts_engaged", "total_interactions", "comments", "likes", "profile_links_taps", "replies", "saves", "shares", "follows_and_unfollows"]);
        const demographics = metrics.some((value) => value.endsWith("_demographics"));
        const needsTotalValue = demographics || Boolean(breakdown) || metrics.some((value) => totalValueMetrics.has(value));
        if (needsTotalValue && metric_type === "time_series") {
          throw new Error("The requested metrics require metric_type=total_value. Query time-series metrics separately.");
        }
        if (demographics && (!timeframe || !breakdown || period !== "lifetime" || since || until)) {
          throw new Error("Demographics require period=lifetime, timeframe, and breakdown, without since or until.");
        }
        if (timeframe && !["this_week", "this_month"].includes(timeframe) && metrics.some((value) => value === "engaged_audience_demographics" || value === "reached_audience_demographics")) {
          throw new Error("Engaged and reached audience demographics only support timeframe=this_week or this_month since Graph API v20. Query follower demographics separately for older timeframes.");
        }
        if (metric_type || needsTotalValue) params.metric_type = metric_type || "total_value";
        if (breakdown) params.breakdown = breakdown;
        if (timeframe) params.timeframe = timeframe;
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
      username: z.string().regex(/^[A-Za-z0-9._]+$/).describe("Instagram username to look up (without @)"),
      fields: z.string().optional().describe("Fields to retrieve (default: id,username,name,biography,followers_count,follows_count,media_count)"),
    },
    async ({ username, fields }) => {
      try {
        const f = fields || "id,username,name,biography,followers_count,follows_count,media_count";
        const { data, rateLimit } = await client.ig("GET", `/${client.igUserId}`, {
          fields: `business_discovery.username(${username}){${f}}`,
        });
        return { content: [{ type: "text", text: JSON.stringify({ ...data as object, _rateLimit: rateLimit }, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Business discovery failed: ${error instanceof Error ? error.message : String(error)}` }], isError: true };
      }
    }
  );

  // ─── ig_get_collaboration_invites ────────────────────────────
  server.tool(
    "ig_get_collaboration_invites",
    "Get pending collaboration invites for the Instagram account. Added in December 2025.",
    {
      limit: z.number().optional().describe("Number of results"),
      after: z.string().optional().describe("Pagination cursor"),
    },
    async ({ limit, after }) => {
      try {
        const params: Record<string, unknown> = {};
        if (limit) params.limit = limit;
        if (after) params.after = after;
        const { data, rateLimit } = await client.ig("GET", `/${client.igUserId}/collaboration_invites`, params);
        return { content: [{ type: "text", text: JSON.stringify({ ...data as object, _rateLimit: rateLimit }, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Get collaboration invites failed: ${error instanceof Error ? error.message : String(error)}` }], isError: true };
      }
    }
  );

  // ─── ig_respond_collaboration_invite ─────────────────────────
  server.tool(
    "ig_respond_collaboration_invite",
    "Accept or decline a collaboration invite. Added in December 2025.",
    {
      media_id: z.string().optional().describe("Invited media_id returned by ig_get_collaboration_invites"),
      accept: z.boolean().optional().describe("true to accept, false to decline"),
      invite_id: z.string().optional().describe("Legacy alias for media_id"),
      action: z.enum(["accept", "decline"]).optional().describe("Legacy alternative to accept"),
    },
    async ({ media_id, accept, invite_id, action }) => {
      try {
        if (!media_id && !invite_id) throw new Error("media_id is required.");
        if (media_id && invite_id && media_id !== invite_id) throw new Error("media_id and invite_id must match when both are provided.");
        if (accept === undefined && action === undefined) throw new Error("accept or action is required.");
        if (accept !== undefined && action !== undefined && accept !== (action === "accept")) throw new Error("accept and action must agree.");
        const { data, rateLimit } = await client.ig("POST", `/${client.igUserId}/collaboration_invites`, {
          media_id: media_id || invite_id,
          accept: accept ?? action === "accept",
        });
        return { content: [{ type: "text", text: JSON.stringify({ ...data as object, _rateLimit: rateLimit }, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Respond to collaboration invite failed: ${error instanceof Error ? error.message : String(error)}` }], isError: true };
      }
    }
  );
}
