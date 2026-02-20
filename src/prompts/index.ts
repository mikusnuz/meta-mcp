import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export function registerPrompts(server: McpServer) {
  server.prompt(
    "content_publish",
    "Cross-post content to Instagram and Threads simultaneously",
    {},
    () => ({
      messages: [
        {
          role: "user" as const,
          content: {
            type: "text" as const,
            text: [
              "Help me publish content across Instagram and Threads.",
              "",
              "Please follow these steps:",
              "1. Ask me what content I want to post (text, image URL, video URL)",
              "2. Use ig_publish_photo or ig_publish_video to post on Instagram",
              "3. Use threads_publish_text, threads_publish_image, or threads_publish_video to post on Threads",
              "4. Report back the permalink for each platform",
              "",
              "Tips:",
              "- Instagram captions can be up to 2200 characters",
              "- Threads posts are limited to 500 characters",
              "- Both platforms require publicly accessible HTTPS URLs for media",
              "- Video uploads may take time to process",
            ].join("\n"),
          },
        },
      ],
    })
  );

  server.prompt(
    "analytics_report",
    "Generate a combined analytics report for Instagram and Threads",
    {},
    () => ({
      messages: [
        {
          role: "user" as const,
          content: {
            type: "text" as const,
            text: [
              "Generate a comprehensive analytics report for my Instagram and Threads accounts.",
              "",
              "Please use the following tools:",
              "1. ig_get_profile — Get Instagram profile stats (followers, media count)",
              "2. ig_get_account_insights — Get Instagram insights for the last 7 days (metric: impressions,reach,profile_views, period: day)",
              "3. ig_get_media_list — Get recent 10 posts to analyze engagement",
              "4. threads_get_profile — Get Threads profile info",
              "5. threads_get_user_insights — Get Threads insights (metric: views,likes,replies,reposts,quotes)",
              "6. threads_get_posts — Get recent 10 Threads posts",
              "",
              "Then compile a report covering:",
              "- Follower count and growth trends",
              "- Top performing content on each platform",
              "- Engagement rate comparison (likes, comments, shares)",
              "- Recommendations for content strategy",
            ].join("\n"),
          },
        },
      ],
    })
  );
}
