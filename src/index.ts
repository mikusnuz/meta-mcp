#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { loadConfig } from "./config.js";
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

// Resources & Prompts
import { registerInstagramResources } from "./resources/instagram.js";
import { registerThreadsResources } from "./resources/threads.js";
import { registerPrompts } from "./prompts/index.js";

const server = new McpServer({
  name: "meta-mcp",
  version: "1.0.0",
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
