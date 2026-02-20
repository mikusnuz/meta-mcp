import { MetaConfig } from "../config.js";
import { RateLimit } from "../types.js";

const IG_BASE = "https://graph.facebook.com/v21.0";
const THREADS_BASE = "https://graph.threads.net/v1.0";

interface ClientResponse {
  data: unknown;
  rateLimit?: RateLimit;
}

export class MetaClient {
  private config: MetaConfig;

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
      qs.set("access_token", token);
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
      return { data, rateLimit };
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
    return this.request(IG_BASE, this.config.instagramAccessToken, method, path, params);
  }

  async threads(
    method: string,
    path: string,
    params?: Record<string, unknown>
  ): Promise<ClientResponse> {
    if (!this.config.threadsAccessToken) {
      throw new Error("THREADS_ACCESS_TOKEN is not configured.");
    }
    return this.request(THREADS_BASE, this.config.threadsAccessToken, method, path, params);
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
    return this.request(IG_BASE, appToken, method, path, params);
  }

  /** Exchange short-lived token for long-lived token */
  async exchangeToken(shortToken: string): Promise<ClientResponse> {
    if (!this.config.appId || !this.config.appSecret) {
      throw new Error("META_APP_ID and META_APP_SECRET are required for token exchange.");
    }
    return this.request(IG_BASE, shortToken, "GET", "/oauth/access_token", {
      grant_type: "fb_exchange_token",
      client_id: this.config.appId,
      client_secret: this.config.appSecret,
      fb_exchange_token: shortToken,
    });
  }

  /** Refresh a long-lived token */
  async refreshToken(longToken: string): Promise<ClientResponse> {
    return this.request(IG_BASE, longToken, "GET", "/oauth/access_token", {
      grant_type: "fb_exchange_token",
    });
  }

  /** Debug a token */
  async debugToken(inputToken: string): Promise<ClientResponse> {
    if (!this.config.appId || !this.config.appSecret) {
      throw new Error("META_APP_ID and META_APP_SECRET are required for token debug.");
    }
    const appToken = `${this.config.appId}|${this.config.appSecret}`;
    return this.request(IG_BASE, appToken, "GET", "/debug_token", {
      input_token: inputToken,
    });
  }

  get igUserId(): string {
    if (!this.config.instagramUserId) {
      throw new Error("INSTAGRAM_USER_ID is not configured.");
    }
    return this.config.instagramUserId;
  }

  get threadsUserId(): string {
    if (!this.config.threadsUserId) {
      throw new Error("THREADS_USER_ID is not configured.");
    }
    return this.config.threadsUserId;
  }
}
