#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createRequire } from "node:module";
import { loadConfig, MetaConfig } from "./config.js";
import { MetaClient } from "./services/meta-client.js";

// Meta platform tools
import { registerMetaAuthTools } from "./tools/meta/auth.js";

// Instagram tools
import { registerIgPublishingTools } from "./tools/instagram/publishing.js";
import { registerIgMediaTools } from "./tools/instagram/media.js";
import { registerIgCommentTools } from "./tools/instagram/comments.js";
import { registerIgProfileTools } from "./tools/instagram/profile.js";
import { registerIgHashtagTools } from "./tools/instagram/hashtags.js";
import { registerIgMentionTools } from "./tools/instagram/mentions.js";
import { registerIgMessagingTools } from "./tools/instagram/messaging.js";

// Threads tools
import { registerThreadsPublishingTools } from "./tools/threads/publishing.js";
import { registerThreadsMediaTools } from "./tools/threads/media.js";
import { registerThreadsReplyTools } from "./tools/threads/replies.js";
import { registerThreadsProfileTools } from "./tools/threads/profile.js";
import { registerThreadsInsightTools } from "./tools/threads/insights.js";
import { registerThreadsMentionTools } from "./tools/threads/mentions.js";
import { registerThreadsLocationTools } from "./tools/threads/locations.js";
import { registerThreadsOembedTools } from "./tools/threads/oembed.js";

// Resources & Prompts
import { registerInstagramResources } from "./resources/instagram.js";
import { registerThreadsResources } from "./resources/threads.js";
import { registerPrompts } from "./prompts/index.js";

const { version } = createRequire(import.meta.url)("../package.json");

const server = new McpServer({
  name: "meta-mcp",
  version,
});

const config = loadConfig();
const client = new MetaClient(config);

// Register tools
registerMetaAuthTools(server, client);
registerIgPublishingTools(server, client);
registerIgMediaTools(server, client);
registerIgCommentTools(server, client);
registerIgProfileTools(server, client);
registerIgHashtagTools(server, client);
registerIgMentionTools(server, client);
registerIgMessagingTools(server, client);
registerThreadsPublishingTools(server, client);
registerThreadsMediaTools(server, client);
registerThreadsReplyTools(server, client);
registerThreadsProfileTools(server, client);
registerThreadsInsightTools(server, client);
registerThreadsMentionTools(server, client);
registerThreadsLocationTools(server, client);
registerThreadsOembedTools(server, client);

// Register resources
registerInstagramResources(server, client);
registerThreadsResources(server, client);

// Register prompts
registerPrompts(server);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});

// ── Smithery Sandbox ──

export function createSandboxServer() {
  const sandbox = new McpServer({
    name: "meta-mcp",
    version,
  });

  const mockConfig: MetaConfig = {
    appId: "",
    appSecret: "",
    instagramAccessToken: "",
    instagramUserId: "",
    instagramMessagingAccessToken: "",
    instagramPageId: "",
    threadsAccessToken: "",
    threadsUserId: "",
  };
  const mockClient = new MetaClient(mockConfig);

  registerMetaAuthTools(sandbox, mockClient);
  registerIgPublishingTools(sandbox, mockClient);
  registerIgMediaTools(sandbox, mockClient);
  registerIgCommentTools(sandbox, mockClient);
  registerIgProfileTools(sandbox, mockClient);
  registerIgHashtagTools(sandbox, mockClient);
  registerIgMentionTools(sandbox, mockClient);
  registerIgMessagingTools(sandbox, mockClient);
  registerThreadsPublishingTools(sandbox, mockClient);
  registerThreadsMediaTools(sandbox, mockClient);
  registerThreadsReplyTools(sandbox, mockClient);
  registerThreadsProfileTools(sandbox, mockClient);
  registerThreadsInsightTools(sandbox, mockClient);
  registerThreadsMentionTools(sandbox, mockClient);
  registerThreadsLocationTools(sandbox, mockClient);
  registerThreadsOembedTools(sandbox, mockClient);
  registerInstagramResources(sandbox, mockClient);
  registerThreadsResources(sandbox, mockClient);
  registerPrompts(sandbox);

  return sandbox;
}
