**English** | [한국어](README.ko.md)

# meta-mcp

[![npm version](https://img.shields.io/npm/v/@mikusnuz/meta-mcp)](https://www.npmjs.com/package/@mikusnuz/meta-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Full-coverage MCP server for **Instagram Graph API**, **Threads API**, and **Meta platform** management.

## Features

- **52 tools** across Instagram (31), Threads (15), and Meta platform (6)
- **Instagram**: Publish photos/videos/reels/stories/carousels, manage comments, view insights, search hashtags, handle DMs
- **Threads**: Publish text/images/videos/carousels, manage replies, view insights
- **Meta**: Token exchange/refresh/debug, webhook management
- **2 resources**: Instagram profile, Threads profile
- **2 prompts**: Cross-platform content publishing, analytics report
- Rate limit tracking via `x-app-usage` header

## Account Requirements

| Platform | Account Type | Notes |
|----------|-------------|-------|
| **Instagram** | Business or Creator account | Personal accounts cannot use the Graph API. Free to switch in Instagram settings |
| **Threads** | Any account | All Threads accounts can use the API |
| **Meta** (token/webhook tools) | Meta Developer App | Create at [developers.facebook.com](https://developers.facebook.com) |

## Installation

### npx (Recommended)

```json
{
  "mcpServers": {
    "meta": {
      "command": "npx",
      "args": ["-y", "@mikusnuz/meta-mcp"],
      "env": {
        "INSTAGRAM_ACCESS_TOKEN": "your_ig_token",
        "INSTAGRAM_USER_ID": "your_ig_user_id",
        "THREADS_ACCESS_TOKEN": "your_threads_token",
        "THREADS_USER_ID": "your_threads_user_id"
      }
    }
  }
}
```

### Manual

```bash
git clone https://github.com/mikusnuz/meta-mcp.git
cd meta-mcp
npm install
npm run build
```

```json
{
  "mcpServers": {
    "meta": {
      "command": "node",
      "args": ["/path/to/meta-mcp/dist/index.js"],
      "env": {
        "INSTAGRAM_ACCESS_TOKEN": "your_ig_token",
        "INSTAGRAM_USER_ID": "your_ig_user_id",
        "THREADS_ACCESS_TOKEN": "your_threads_token",
        "THREADS_USER_ID": "your_threads_user_id"
      }
    }
  }
}
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `INSTAGRAM_ACCESS_TOKEN` | For Instagram | Instagram Graph API access token |
| `INSTAGRAM_USER_ID` | For Instagram | Instagram Business/Creator account ID |
| `THREADS_ACCESS_TOKEN` | For Threads | Threads API access token |
| `THREADS_USER_ID` | For Threads | Threads user ID |
| `META_APP_ID` | For token/webhook tools | Meta App ID |
| `META_APP_SECRET` | For token/webhook tools | Meta App Secret |

You only need to set the variables for the platforms you use. For example, if you only use Threads, just set `THREADS_ACCESS_TOKEN` and `THREADS_USER_ID`.

## Tools

### Meta Platform (6)

| Tool | Description |
|------|-------------|
| `meta_exchange_token` | Exchange short-lived token for long-lived token (~60 days) |
| `meta_refresh_token` | Refresh a long-lived token before expiration |
| `meta_debug_token` | Inspect token validity, expiration, and scopes |
| `meta_get_app_info` | Get Meta App information |
| `meta_subscribe_webhook` | Subscribe to webhook notifications |
| `meta_get_webhook_subscriptions` | List current webhook subscriptions |

### Instagram — Publishing (6)

| Tool | Description |
|------|-------------|
| `ig_publish_photo` | Publish a photo post |
| `ig_publish_video` | Publish a video post |
| `ig_publish_carousel` | Publish a carousel/album (2-10 items) |
| `ig_publish_reel` | Publish a Reel |
| `ig_publish_story` | Publish a Story (24hr) |
| `ig_get_container_status` | Check media container processing status |

### Instagram — Media (5)

| Tool | Description |
|------|-------------|
| `ig_get_media_list` | List published media |
| `ig_get_media` | Get media details |
| `ig_delete_media` | Delete a media post |
| `ig_get_media_insights` | Get media analytics |
| `ig_toggle_comments` | Enable/disable comments on a post |

### Instagram — Comments (7)

| Tool | Description |
|------|-------------|
| `ig_get_comments` | Get comments on a post |
| `ig_get_comment` | Get comment details |
| `ig_post_comment` | Post a comment |
| `ig_get_replies` | Get replies to a comment |
| `ig_reply_to_comment` | Reply to a comment |
| `ig_hide_comment` | Hide/unhide a comment |
| `ig_delete_comment` | Delete a comment |

### Instagram — Profile & Insights (3)

| Tool | Description |
|------|-------------|
| `ig_get_profile` | Get account profile info |
| `ig_get_account_insights` | Get account-level analytics |
| `ig_business_discovery` | Look up another business account |

### Instagram — Hashtags (4)

| Tool | Description |
|------|-------------|
| `ig_search_hashtag` | Search hashtag by name |
| `ig_get_hashtag` | Get hashtag info |
| `ig_get_hashtag_recent` | Get recent media for a hashtag |
| `ig_get_hashtag_top` | Get top media for a hashtag |

### Instagram — Mentions & Tags (2)

| Tool | Description |
|------|-------------|
| `ig_get_mentioned_comments` | Get comments mentioning you |
| `ig_get_tagged_media` | Get media you're tagged in |

### Instagram — Messaging (4)

| Tool | Description |
|------|-------------|
| `ig_get_conversations` | List DM conversations |
| `ig_get_messages` | Get messages in a conversation |
| `ig_send_message` | Send a DM |
| `ig_get_message` | Get message details |

### Threads — Publishing (5)

| Tool | Description |
|------|-------------|
| `threads_publish_text` | Publish a text post |
| `threads_publish_image` | Publish an image post |
| `threads_publish_video` | Publish a video post |
| `threads_publish_carousel` | Publish a carousel (2-20 items) |
| `threads_get_container_status` | Check container processing status |

### Threads — Media (2)

| Tool | Description |
|------|-------------|
| `threads_get_posts` | List published posts |
| `threads_get_post` | Get post details |

### Threads — Replies (4)

| Tool | Description |
|------|-------------|
| `threads_get_replies` | Get replies to a post |
| `threads_reply` | Reply to a post |
| `threads_hide_reply` | Hide a reply |
| `threads_unhide_reply` | Unhide a reply |

### Threads — Profile (2)

| Tool | Description |
|------|-------------|
| `threads_get_profile` | Get Threads profile info |
| `threads_get_user_threads` | List user's threads |

### Threads — Insights (2)

| Tool | Description |
|------|-------------|
| `threads_get_post_insights` | Get post analytics |
| `threads_get_user_insights` | Get account-level analytics |

## Resources

| Resource URI | Description |
|-------------|-------------|
| `instagram://profile` | Instagram account profile data |
| `threads://profile` | Threads account profile data |

## Prompts

| Prompt | Description |
|--------|-------------|
| `content_publish` | Cross-post content to Instagram and Threads |
| `analytics_report` | Generate combined analytics report |

## Getting Access Tokens

### Instagram

1. Create a Meta App at [developers.facebook.com](https://developers.facebook.com)
2. Add the "Instagram Graph API" product
3. Connect an Instagram Business or Creator account
4. Generate a token in the Graph API Explorer with required permissions
5. Use `meta_exchange_token` to convert to a long-lived token (60 days)

### Threads

1. Create a Meta App at [developers.facebook.com](https://developers.facebook.com)
2. Add the "Threads API" product
3. Complete the authorization flow to get an access token
4. Use `meta_exchange_token` to convert to a long-lived token

## License

MIT
