import { MetaConfig } from "../config.js";
import { RateLimit } from "../types.js";
import {
  buildTokenRefreshRequest,
  INSTAGRAM_GRAPH_BASE,
  MetaTokenPlatform,
  THREADS_GRAPH_BASE,
} from "./api-contracts.js";

interface ClientResponse {
  data: unknown;
  rateLimit?: RateLimit;
}

/**
 * Graph/Threads pagination URLs embed the caller's access_token. Strip it so
 * the token never reaches the LLM context; the cursors are enough to paginate.
 */
export function stripPagingTokens<T>(value: T): T {
  if (Array.isArray(value)) {
    value.forEach(stripPagingTokens);
  } else if (value && typeof value === "object") {
    const obj = value as Record<string, unknown>;
    for (const [key, child] of Object.entries(obj)) {
      if ((key === "next" || key === "previous") && typeof child === "string") {
        try {
          const url = new URL(child);
          url.searchParams.delete("access_token");
          obj[key] = url.toString();
        } catch {
          // Not a URL, leave it as is.
        }
      } else {
        stripPagingTokens(child);
      }
    }
  }
  return value;
}

export class MetaClient {
  private config: MetaConfig;
  private pageToken?: string;

  constructor(config: MetaConfig) {
    this.config = config;
  }

  private parseRateLimit(headers: Headers): RateLimit | undefined {
    const usage = headers.get("x-app-usage");
    if (!usage) return undefined;
    try {
      return JSON.parse(usage);
    } catch {
      return undefined;
    }
  }

  private async request(
    baseUrl: string,
    token: string,
    method: string,
    path: string,
    params?: Record<string, unknown>
  ): Promise<ClientResponse> {
    let url = `${baseUrl}${path}`;
    const init: RequestInit = { method, signal: AbortSignal.timeout(30_000) };

    if (method === "GET" || method === "DELETE") {
      const qs = new URLSearchParams();
      if (token) qs.set("access_token", token);
      if (params) {
        for (const [k, v] of Object.entries(params)) {
          if (v !== undefined && v !== null && v !== "") {
            qs.set(k, String(v));
          }
        }
      }
      url += `?${qs.toString()}`;
    } else {
      const body: Record<string, unknown> = { access_token: token, ...params };
      init.headers = { "Content-Type": "application/json" };
      init.body = JSON.stringify(body);
    }

    const res = await fetch(url, init);

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`Meta API ${method} ${path} (${res.status}): ${text}`);
    }

    const rateLimit = this.parseRateLimit(res.headers);
    const contentType = res.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const data = await res.json();
      if (data.error) {
        throw new Error(`Meta API error: ${data.error.message} (code ${data.error.code})`);
      }
      return { data: stripPagingTokens(data), rateLimit };
    }
    const text = await res.text();
    return { data: text || { success: true }, rateLimit };
  }

  async ig(
    method: string,
    path: string,
    params?: Record<string, unknown>
  ): Promise<ClientResponse> {
    if (!this.config.instagramAccessToken) {
      throw new Error("INSTAGRAM_ACCESS_TOKEN is not configured.");
    }
    return this.request(
      INSTAGRAM_GRAPH_BASE,
      this.config.instagramAccessToken,
      method,
      path,
      params
    );
  }

  async igMessaging(
    method: string,
    path: string,
    params?: Record<string, unknown>
  ): Promise<ClientResponse> {
    if (!this.config.instagramMessagingAccessToken) {
      throw new Error(
        "INSTAGRAM_MESSAGING_ACCESS_TOKEN is not configured. Use a Page access token for Instagram Messaging with Facebook Login."
      );
    }
    return this.request(
      INSTAGRAM_GRAPH_BASE,
      this.config.instagramMessagingAccessToken,
      method,
      path,
      params
    );
  }

  async threads(
    method: string,
    path: string,
    params?: Record<string, unknown>
  ): Promise<ClientResponse> {
    if (!this.config.threadsAccessToken) {
      throw new Error("THREADS_ACCESS_TOKEN is not configured.");
    }
    return this.request(
      THREADS_GRAPH_BASE,
      this.config.threadsAccessToken,
      method,
      path,
      params
    );
  }

  /**
   * Call the Graph API as the Facebook Page configured in INSTAGRAM_PAGE_ID.
   * The page access token is resolved from /me/accounts, cached in memory and
   * never returned to callers.
   */
  async page(
    method: string,
    path: string,
    params?: Record<string, unknown>
  ): Promise<ClientResponse> {
    const token = await this.getPageToken();
    try {
      return await this.request(INSTAGRAM_GRAPH_BASE, token, method, path, params);
    } catch (error) {
      const message = (error instanceof Error ? error.message : String(error))
        .split(token)
        .join("[redacted]");
      if (/pages_manage_posts|\(#?200\)|"code":\s*200|code 200/.test(message)) {
        throw new Error(
          `Missing permission. Publishing to a Facebook Page requires pages_manage_posts on the INSTAGRAM_ACCESS_TOKEN. ${message}`
        );
      }
      throw new Error(message);
    }
  }

  private async getPageToken(): Promise<string> {
    if (this.pageToken) return this.pageToken;
    const pageId = this.instagramPageId;
    const { data } = await this.ig("GET", "/me/accounts", {
      fields: "id,access_token",
      limit: 100,
    });
    const pages = (data as { data?: Array<{ id: string; access_token?: string }> }).data ?? [];
    const page = pages.find((p) => p.id === pageId);
    if (!page?.access_token) {
      throw new Error(
        `Facebook Page ${pageId} was not found in /me/accounts for INSTAGRAM_ACCESS_TOKEN. Check INSTAGRAM_PAGE_ID and that the token has pages_show_list and pages_manage_posts.`
      );
    }
    this.pageToken = page.access_token;
    return page.access_token;
  }

  async threadsOembed(params: Record<string, unknown>): Promise<ClientResponse> {
    return this.request(THREADS_GRAPH_BASE, "", "GET", "/oembed", params);
  }

  async meta(
    method: string,
    path: string,
    params?: Record<string, unknown>
  ): Promise<ClientResponse> {
    if (!this.config.appId || !this.config.appSecret) {
      throw new Error("META_APP_ID and META_APP_SECRET are required.");
    }
    const appToken = `${this.config.appId}|${this.config.appSecret}`;
    return this.request(INSTAGRAM_GRAPH_BASE, appToken, method, path, params);
  }

  /** Exchange short-lived token for long-lived token */
  async exchangeToken(shortToken: string): Promise<ClientResponse> {
    if (!this.config.appId || !this.config.appSecret) {
      throw new Error("META_APP_ID and META_APP_SECRET are required for token exchange.");
    }
    return this.request(
      INSTAGRAM_GRAPH_BASE,
      shortToken,
      "GET",
      "/oauth/access_token",
      {
        grant_type: "fb_exchange_token",
        client_id: this.config.appId,
        client_secret: this.config.appSecret,
        fb_exchange_token: shortToken,
      }
    );
  }

  /** Extend an Instagram/Facebook token or refresh a Threads long-lived token. */
  async refreshToken(
    longToken: string,
    platform: MetaTokenPlatform
  ): Promise<ClientResponse> {
    const spec = buildTokenRefreshRequest(
      platform,
      longToken,
      this.config.appId,
      this.config.appSecret
    );
    return this.request(spec.baseUrl, spec.token, "GET", spec.path, spec.params);
  }

  /** Debug a token */
  async debugToken(inputToken: string): Promise<ClientResponse> {
    if (!this.config.appId || !this.config.appSecret) {
      throw new Error("META_APP_ID and META_APP_SECRET are required for token debug.");
    }
    const appToken = `${this.config.appId}|${this.config.appSecret}`;
    return this.request(INSTAGRAM_GRAPH_BASE, appToken, "GET", "/debug_token", {
      input_token: inputToken,
    });
  }

  get igUserId(): string {
    if (!this.config.instagramUserId) {
      throw new Error("INSTAGRAM_USER_ID is not configured.");
    }
    return this.config.instagramUserId;
  }

  get instagramPageId(): string {
    if (!this.config.instagramPageId) {
      throw new Error(
        "INSTAGRAM_PAGE_ID is not configured. Instagram Messaging with Facebook Login uses the linked Facebook Page ID."
      );
    }
    return this.config.instagramPageId;
  }

  get threadsUserId(): string {
    if (!this.config.threadsUserId) {
      throw new Error("THREADS_USER_ID is not configured.");
    }
    return this.config.threadsUserId;
  }
}
