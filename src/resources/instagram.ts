import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { MetaClient } from "../services/meta-client.js";

export function registerInstagramResources(server: McpServer, client: MetaClient) {
  server.resource(
    "instagram-profile",
    "instagram://profile",
    { description: "Instagram Business/Creator account profile information", mimeType: "application/json" },
    async () => {
      const { data } = await client.ig("GET", `/${client.igUserId}`, {
        fields: "id,name,username,biography,followers_count,follows_count,media_count,profile_picture_url,website",
      });
      return {
        contents: [
          {
            uri: "instagram://profile",
            mimeType: "application/json",
            text: JSON.stringify(data, null, 2),
          },
        ],
      };
    }
  );
}
