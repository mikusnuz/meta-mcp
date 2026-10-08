**English** | [한국어](README.ko.md)

# meta-mcp

[![npm version](https://img.shields.io/npm/v/@mikusnuz/meta-mcp)](https://www.npmjs.com/package/@mikusnuz/meta-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![MCP Badge](https://lobehub.com/badge/mcp/mikusnuz-meta-mcp)](https://lobehub.com/discover/mcp/mikusnuz-meta-mcp)

Full-coverage MCP server for **Instagram Graph API** (v26.0), **Threads API**, and **Meta platform** management.

## When to Use

Tell your AI assistant things like:

- **"Post a photo to Instagram"** — publish photos, videos, reels, stories, and carousels
- **"Publish a text post on Threads"** — text posts with polls, GIFs, link attachments, and topic tags
- **"Get my Instagram follower count and insights"** — account and post-level analytics
- **"Schedule a carousel post"** — multi-image albums on Instagram (2-10) or Threads (2-20)
- **"Reply to comments on my latest post"** — read and respond to comments on both platforms
- **"Cross-post to Instagram and Threads"** — use the built-in `content_publish` prompt
- **"Get analytics for my Threads account"** — views, likes, replies, reposts, quotes, clicks
- **"Manage Instagram DMs"** — list conversations, read messages, send replies

> **AI Agent Integration**: See [`llms.txt`](llms.txt) for a machine-readable summary, or copy [`templates/CLAUDE.md`](templates/CLAUDE.md) / [`templates/AGENTS.md`](templates/AGENTS.md) into your project for automatic MCP discovery.

## Features

- **66 tools** across Instagram (33), Threads (27), and Meta platform (6)
- **Instagram**: Publish photos/videos/reels/stories/carousels with alt text, manage comments, view insights, search hashtags, handle DMs, manage collaboration invites
- **Threads**: Publish text/images/videos/carousels with polls, GIFs, topic tags, link attachments, alt text, spoiler flags, ghost posts, reply approvals, location tags, and Instagram Stories cross-sharing; manage replies and pending reply approvals; search posts and locations; profile/mentions discovery; oEmbed; view insights; delete posts
- **Meta**: Token exchange/refresh/debug, webhook management
- **2 resources**: Instagram profile, Threads profile
- **2 prompts**: Cross-platform content publishing, analytics report
- Rate limit tracking via `x-app-usage` header

## What's New in v2.2.0

- Fixed Instagram business discovery and collaboration invite requests. Use `media_id` and `accept` for invites; `invite_id` and `action` remain supported aliases.
- Account insights support `metric_type`, `breakdown`, and demographic `timeframe`. Metrics such as `views` select `total_value` automatically.
- Standalone videos now publish as Reels shared to the feed. Photo, Reel, and carousel publishing support AI info and paid-partnership labels; Reels also support `trial_params`.
- Public Threads oEmbed works without a token. Includes the token refresh, Instagram Messaging, publishing, and reply handling fixes since v2.1.1.

## What's New in v2.1.0

- **Graph API v26.0**: Upgraded from v25.0 (no deprecated fields/endpoints from the v26.0 changelog were in use)
- **Tenor removed**: GIPHY is now the only GIF provider (Tenor was sunset March 31, 2026); `gif_provider` param dropped
- **Threads Ghost Posts**: `is_ghost_post` on `threads_publish_text` (auto-archived after 24h)
- **Threads Reply Approvals**: `enable_reply_approvals` on publish tools, plus `threads_get_pending_replies` and `threads_manage_pending_reply`
- **Threads → Instagram Stories cross-share**: `crossreshare_to_ig` / `crossreshare_to_ig_dark_mode` on all publish tools
- **Threads Location Tagging**: `location_id` on publish tools, plus `threads_search_locations` and `threads_get_location`
- **Threads Profile Discovery**: `threads_lookup_profile` and `threads_get_profile_posts` for public profiles
- **Threads Mentions**: `threads_get_mentions`
- **Threads oEmbed**: `threads_get_oembed` for embedding public posts
- **Threads Conversations**: `threads_get_conversation` for flattened (nested) reply threads
- **Fixed `threads_search_posts`**: now calls the correct `/keyword_search` endpoint with the correct `search_mode`/`search_type` parameters (previous version targeted a non-existent endpoint)
- Post/reply fields expanded with `is_verified`, `profile_picture_url`, `location_id`, `root_post`, `replied_to`, `reply_audience`

## What's New in v2.0.0

- **Graph API v25.0**: Upgraded from v21.0 (expired Sep 2025) to v25.0 (current)
- **Fixed deprecated metrics**: `impressions`, `video_views`, `engagement` replaced with `views`, `reach`, `saved`, `shares`
- **Threads polls**: Create posts with interactive poll attachments
- **Threads GIFs**: Attach GIFs from GIPHY or Tenor
- **Threads topic tags**: Categorize posts with topic tags
- **Threads link attachments**: Attach URL preview cards to text posts
- **Threads post search**: Search public posts by keyword or topic tag
- **Threads post deletion**: Delete posts (rate limited to 100/day)
- **Threads publishing limit**: Check remaining quota
- **Threads quote posts**: Quote other posts by ID
- **Threads spoiler flag**: Mark content as spoiler
- **Threads alt text**: Add accessibility descriptions to all media types
- **Threads new reply controls**: `parent_post_author_only` and `followers_only` options
- **Instagram alt text**: Support for photo, reel, and carousel items
- **Instagram collaboration invites**: Query and respond to collab invites
- **Updated insights metrics**: New `clicks`, `reposts`, `reels_skip_rate` metrics

## Account Requirements

| Platform | Account Type | Notes |
|----------|-------------|-------|
| **Instagram** | Business or Creator account | Personal accounts cannot use the Graph API. Free to switch in Instagram settings |
| **Threads** | Any account | All Threads accounts can use the API (Instagram account link no longer required since Sep 2025) |
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
        "INSTAGRAM_MESSAGING_ACCESS_TOKEN": "your_page_access_token",
        "INSTAGRAM_PAGE_ID": "your_linked_page_id",
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
        "INSTAGRAM_MESSAGING_ACCESS_TOKEN": "your_page_access_token",
        "INSTAGRAM_PAGE_ID": "your_linked_page_id",
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
| `INSTAGRAM_MESSAGING_ACCESS_TOKEN` | For Instagram DMs | Page access token for Instagram Messaging with Facebook Login |
| `INSTAGRAM_PAGE_ID` | For Instagram DMs | Facebook Page ID linked to the Instagram professional account |
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
| `meta_refresh_token` | Extend an Instagram/Facebook token or refresh a Threads token (`platform` selects the flow) |
| `meta_debug_token` | Inspect token validity, expiration, and scopes |
| `meta_get_app_info` | Get Meta App information |
| `meta_subscribe_webhook` | Subscribe to webhook notifications |
| `meta_get_webhook_subscriptions` | List current webhook subscriptions |

### Instagram — Publishing (6)

| Tool | Description |
|------|-------------|
| `ig_publish_photo` | Publish a photo post (supports alt_text) |
| `ig_publish_video` | Publish a video post |
| `ig_publish_carousel` | Publish a carousel/album (2-10 items, supports alt_text per item) |
| `ig_publish_reel` | Publish a Reel (supports alt_text) |
| `ig_publish_story` | Publish a Story (24hr) |
| `ig_get_container_status` | Check media container processing status |

### Instagram — Media (5)

| Tool | Description |
|------|-------------|
| `ig_get_media_list` | List published media |
| `ig_get_media` | Get media details |
| `ig_delete_media` | Delete a media post |
| `ig_get_media_insights` | Get media analytics (views, reach, saved, shares) |
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

### Instagram — Profile & Insights (5)

| Tool | Description |
|------|-------------|
| `ig_get_profile` | Get account profile info |
| `ig_get_account_insights` | Get account-level analytics (views, reach, follower_count) |
| `ig_business_discovery` | Look up another business account |
| `ig_get_collaboration_invites` | Get pending collaboration invites |
| `ig_respond_collaboration_invite` | Accept or decline collaboration invites |

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

### Threads — Publishing (7)

| Tool | Description |
|------|-------------|
| `threads_publish_text` | Publish a text post (polls, GIFs, link attachments, topic tags, quote posts, spoiler flag, ghost posts, reply approvals, location tag, IG Stories cross-share) |
| `threads_publish_image` | Publish an image post (alt_text, topic tags, spoiler flag, reply approvals, location tag, IG Stories cross-share) |
| `threads_publish_video` | Publish a video post (alt_text, topic tags, spoiler flag, reply approvals, location tag, IG Stories cross-share) |
| `threads_publish_carousel` | Publish a carousel (2-20 items, alt_text per item, reply approvals, location tag, IG Stories cross-share) |
| `threads_delete_post` | Delete a post (max 100/day) |
| `threads_get_container_status` | Check container processing status |
| `threads_get_publishing_limit` | Check remaining publishing quota (250 posts/day) |

### Threads — Media & Search (4)

| Tool | Description |
|------|-------------|
| `threads_get_posts` | List published posts (includes topic_tag, poll, GIF, location, verification fields) |
| `threads_get_post` | Get post details |
| `threads_get_profile_posts` | List a public profile's posts by username (Profile Discovery) |
| `threads_search_posts` | Search public posts via `/keyword_search` by keyword or topic tag, filterable by media type and author |

### Threads — Replies (7)

| Tool | Description |
|------|-------------|
| `threads_get_replies` | Get top-level replies to a post |
| `threads_get_conversation` | Get all replies (flattened, including nested) to a post |
| `threads_reply` | Reply to a post (supports image/video attachments) |
| `threads_hide_reply` | Hide a reply |
| `threads_unhide_reply` | Unhide a reply |
| `threads_get_pending_replies` | Get replies awaiting approval on a post with reply approvals enabled |
| `threads_manage_pending_reply` | Approve or ignore a pending reply |

### Threads — Profile & Discovery (3)

| Tool | Description |
|------|-------------|
| `threads_get_profile` | Get Threads profile info (includes is_verified) |
| `threads_get_user_threads` | List user's threads |
| `threads_lookup_profile` | Look up a public profile by username (Profile Discovery) |

### Threads — Mentions (1)

| Tool | Description |
|------|-------------|
| `threads_get_mentions` | Get posts where the user was @mentioned |

### Threads — Locations (2)

| Tool | Description |
|------|-------------|
| `threads_search_locations` | Search for locations to tag, by query or coordinates |
| `threads_get_location` | Get a location object by ID |

### Threads — Tools & Resources (1)

| Tool | Description |
|------|-------------|
| `threads_get_oembed` | Get embed HTML/metadata for a public post |

### Threads — Insights (2)

| Tool | Description |
|------|-------------|
| `threads_get_post_insights` | Get post analytics (views, likes, replies, reposts, quotes, clicks) |
| `threads_get_user_insights` | Get account-level analytics (also available to Threads profiles without a linked Instagram account) |

## Resources

| Resource URI | Description |
|-------------|-------------|
| `instagram://profile` | Instagram account profile data |
| `threads://profile` | Threads account profile data (includes is_verified) |

## Prompts

| Prompt | Description |
|--------|-------------|
| `content_publish` | Cross-post content to Instagram and Threads |
| `analytics_report` | Generate combined analytics report |

## Setup Guide

### Step 1: Create a Meta Developer App

All platforms (Instagram, Threads) require a Meta Developer App.

1. Go to [developers.facebook.com](https://developers.facebook.com) and log in
2. Click **"My Apps"** → **"Create App"**
3. Select **"Other"** → **"Business"** (or "None" for personal use)
4. Enter an app name and create

Your **`META_APP_ID`** and **`META_APP_SECRET`** are in **App Settings → Basic**.

### Step 2: Instagram Setup

> Requires an **Instagram Business or Creator account**. Switch for free in Instagram app → Settings → Account type.

1. In your Meta App, go to **"Add Products"** → add **"Instagram Graph API"**
2. Go to **"Instagram Graph API" → "Settings"** and connect your Instagram Business account via a Facebook Page
3. Open the [Graph API Explorer](https://developers.facebook.com/tools/explorer/)
   - Select your app
   - Add permissions: `instagram_basic`, `instagram_content_publish`, `instagram_manage_comments`, `instagram_manage_insights`, `instagram_manage_contents`, `instagram_manage_messages`, `pages_show_list`, `pages_read_engagement`, `pages_manage_metadata`
   - Click **"Generate Access Token"** and authorize
4. The generated token is short-lived (~1 hour). Exchange it for a long-lived token (~60 days):
   ```
   GET https://graph.facebook.com/v26.0/oauth/access_token
     ?grant_type=fb_exchange_token
     &client_id=YOUR_APP_ID
     &client_secret=YOUR_APP_SECRET
     &fb_exchange_token=SHORT_LIVED_TOKEN
   ```
   Or use the `meta_exchange_token` tool after setup.
5. **Get your Instagram User ID** — call this with your token:
   ```
   GET https://graph.facebook.com/v26.0/me/accounts?fields=id,name,access_token&access_token=YOUR_TOKEN
   ```
   This returns your Facebook Pages. For each page, get the linked Instagram account:
   ```
   GET https://graph.facebook.com/v26.0/{page-id}?fields=instagram_business_account&access_token=YOUR_TOKEN
   ```
   The `instagram_business_account.id` is your **`INSTAGRAM_USER_ID`** (a numeric ID like `17841400123456789`).
   For the DM tools, the matching Page's `id` is `INSTAGRAM_PAGE_ID` and its
   `access_token` is `INSTAGRAM_MESSAGING_ACCESS_TOKEN`. Do not use the IG User
   ID or the user token in their place.

### Step 3: Threads Setup

> Works with **any Threads account** (personal or business). Instagram account link is no longer required since September 2025.

1. In your Meta App, go to **"Add Products"** → add **"Threads API"**
2. Go to **"Threads API" → "Settings"**:
   - Add your Threads account as a **Threads Tester** under "Roles"
   - Accept the invitation in the Threads app: **Settings → Account → Website permissions → Invites**
3. Generate an authorization URL:
   ```
   https://threads.net/oauth/authorize
     ?client_id=YOUR_APP_ID
     &redirect_uri=YOUR_REDIRECT_URI
     &scope=threads_basic,threads_content_publish,threads_manage_insights,threads_manage_replies,threads_read_replies,threads_keyword_search,threads_manage_mentions,threads_delete,threads_location_tagging,threads_profile_discovery
     &response_type=code
   ```
   - For local testing, use `https://localhost/` as redirect URI (configure in App Settings → Threads API → Redirect URIs)
4. After authorization, exchange the code for an access token:
   ```
   POST https://graph.threads.net/oauth/access_token
   Content-Type: application/x-www-form-urlencoded

   client_id=YOUR_APP_ID
   &client_secret=YOUR_APP_SECRET
   &grant_type=authorization_code
   &redirect_uri=YOUR_REDIRECT_URI
   &code=AUTHORIZATION_CODE
   ```
5. Exchange for a long-lived token (~60 days):
   ```
   GET https://graph.threads.net/access_token
     ?grant_type=th_exchange_token
     &client_secret=YOUR_APP_SECRET
     &access_token=SHORT_LIVED_TOKEN
   ```
6. **Get your Threads User ID** — call this with your token:
   ```
   GET https://graph.threads.net/v1.0/me?fields=id,username&access_token=YOUR_TOKEN
   ```
   The `id` field is your **`THREADS_USER_ID`** (a numeric ID like `1234567890`).

### Step 4: Configure Environment Variables

Set only the variables for the platforms you use:

```bash
# Instagram (requires Business/Creator account)
INSTAGRAM_ACCESS_TOKEN=EAAxxxxxxx...     # Long-lived token from Step 2
INSTAGRAM_USER_ID=17841400123456789      # Numeric ID from Step 2.5
INSTAGRAM_MESSAGING_ACCESS_TOKEN=EAA...  # Page token from Step 2.5 (DM tools only)
INSTAGRAM_PAGE_ID=123456789012345        # Linked Facebook Page ID (DM tools only)

# Threads (any account)
THREADS_ACCESS_TOKEN=THQWxxxxxxx...      # Long-lived token from Step 3
THREADS_USER_ID=1234567890               # Numeric ID from Step 3.6

# Meta App (for token management & webhooks)
META_APP_ID=123456789012345              # From App Settings → Basic
META_APP_SECRET=abcdef0123456789abcdef   # From App Settings → Basic
```

### Token Renewal

Access tokens expire after ~60 days. Refresh before expiration:

- **Instagram**: Use `meta_refresh_token` with `platform=instagram` (requires `META_APP_ID` and `META_APP_SECRET`)
- **Threads**: Use `meta_refresh_token` with `platform=threads` or call:
  ```
  GET https://graph.threads.net/refresh_access_token
    ?grant_type=th_refresh_token
    &access_token=CURRENT_LONG_LIVED_TOKEN
  ```

You can check token status anytime with `meta_debug_token`.

## Deprecated Metrics (v22.0+)

The following Instagram metrics were deprecated in Graph API v22.0 (January 2025) and removed for all versions on April 21, 2025:

| Deprecated Metric | Replacement |
|-------------------|-------------|
| `impressions` | `views` |
| `video_views` | `views` |
| `plays` | `views` |
| `clips_replays_count` | `views` |
| `engagement` | `saves` + `shares` + `likes` + `comments` |
| `email_contacts` | Removed (no replacement) |
| `phone_call_clicks` | Removed (no replacement) |
| `text_message_clicks` | Removed (no replacement) |
| `get_directions_clicks` | Removed (no replacement) |
| `website_clicks` | Removed (no replacement) |
| `profile_views` | Removed (no replacement) |

## License

MIT
