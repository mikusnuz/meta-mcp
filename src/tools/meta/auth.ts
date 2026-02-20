import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { MetaClient } from "../../services/meta-client.js";

export function registerMetaAuthTools(server: McpServer, client: MetaClient): void {
  // ─── meta_exchange_token ─────────────────────────────────────
  server.tool(
    "meta_exchange_token",
    "Exchange a short-lived token for a long-lived token (valid ~60 days). Requires META_APP_ID and META_APP_SECRET.",
    {
      short_lived_token: z.string().describe("Short-lived access token to exchange"),
    },
    async ({ short_lived_token }) => {
      try {
        const { data, rateLimit } = await client.exchangeToken(short_lived_token);
        return { content: [{ type: "text", text: JSON.stringify({ ...data as object, _rateLimit: rateLimit }, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Token exchange failed: ${error instanceof Error ? error.message : String(error)}` }], isError: true };
      }
    }
  );

  // ─── meta_refresh_token ──────────────────────────────────────
  server.tool(
    "meta_refresh_token",
    "Refresh a long-lived token before it expires. Returns a new long-lived token.",
    {
      long_lived_token: z.string().describe("Current long-lived access token to refresh"),
    },
    async ({ long_lived_token }) => {
      try {
        const { data, rateLimit } = await client.refreshToken(long_lived_token);
        return { content: [{ type: "text", text: JSON.stringify({ ...data as object, _rateLimit: rateLimit }, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Token refresh failed: ${error instanceof Error ? error.message : String(error)}` }], isError: true };
      }
    }
  );

  // ─── meta_debug_token ────────────────────────────────────────
  server.tool(
    "meta_debug_token",
    "Debug/inspect an access token to check validity, expiration, scopes and associated user.",
    {
      input_token: z.string().describe("Access token to inspect"),
    },
    async ({ input_token }) => {
      try {
        const { data, rateLimit } = await client.debugToken(input_token);
        return { content: [{ type: "text", text: JSON.stringify({ ...data as object, _rateLimit: rateLimit }, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Token debug failed: ${error instanceof Error ? error.message : String(error)}` }], isError: true };
      }
    }
  );

  // ─── meta_get_app_info ───────────────────────────────────────
  server.tool(
    "meta_get_app_info",
    "Get Meta App basic information (name, category, namespace, etc.).",
    {},
    async () => {
      try {
        const { data, rateLimit } = await client.meta("GET", `/app`, {
          fields: "id,name,category,namespace,link,company,description",
        });
        return { content: [{ type: "text", text: JSON.stringify({ ...data as object, _rateLimit: rateLimit }, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Get app info failed: ${error instanceof Error ? error.message : String(error)}` }], isError: true };
      }
    }
  );

  // ─── meta_subscribe_webhook ──────────────────────────────────
  server.tool(
    "meta_subscribe_webhook",
    "Subscribe to webhook notifications for an object (e.g., 'instagram', 'page'). Requires META_APP_ID and META_APP_SECRET.",
    {
      object: z.enum(["instagram", "page", "user", "permissions"]).describe("Object type to subscribe to"),
      callback_url: z.string().url().describe("HTTPS webhook endpoint URL"),
      verify_token: z.string().describe("Verification token for the webhook"),
      fields: z.string().describe("Comma-separated list of fields to subscribe (e.g., 'messages,feed')"),
    },
    async ({ object, callback_url, verify_token, fields }) => {
      try {
        const { data, rateLimit } = await client.meta("POST", `/app/subscriptions`, {
          object,
          callback_url,
          verify_token,
          fields,
        });
        return { content: [{ type: "text", text: JSON.stringify({ ...data as object, _rateLimit: rateLimit }, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Webhook subscribe failed: ${error instanceof Error ? error.message : String(error)}` }], isError: true };
      }
    }
  );

  // ─── meta_get_webhook_subscriptions ──────────────────────────
  server.tool(
    "meta_get_webhook_subscriptions",
    "List current webhook subscriptions for the Meta App.",
    {},
    async () => {
      try {
        const { data, rateLimit } = await client.meta("GET", `/app/subscriptions`);
        return { content: [{ type: "text", text: JSON.stringify({ ...data as object, _rateLimit: rateLimit }, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Get webhooks failed: ${error instanceof Error ? error.message : String(error)}` }], isError: true };
      }
    }
  );
}
