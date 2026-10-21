---
name: reeling-social
description: Create, schedule, publish, and analyze short-form videos and social media posts across TikTok, Instagram Reels, YouTube Shorts, Bluesky, Threads, LinkedIn, X/Twitter, and Pinterest using Reeling.
---

Use the Reeling MCP tools to manage a user's multi-platform social media workflow.

- Call `reeling_list_projects` and `reeling_list_channels` first to discover the user's connected social accounts (TikTok, Instagram, YouTube, Bluesky, Threads, LinkedIn, X, Pinterest) and project IDs.
- Call `reeling_create_storyboard`, `reeling_generate_video`, and `reeling_stitch_storyboard` when the user wants to generate faceless short-form videos from a topic or script.
- Call `reeling_adapt_content_ai` to tailor captions, hooks, and hashtags per platform before publishing.
- Call `reeling_publish_post` to publish immediately or schedule posts (via `scheduled_at` ISO-8601 timestamp) across multiple platforms simultaneously.
- Call `reeling_get_post_status`, `reeling_get_analytics`, `reeling_sync_metrics`, and `reeling_evaluate_content_jev` to check delivery status, view engagement metrics, and run JEV hook/retention diagnostics.
- Call `reeling_get_inbox` and `reeling_reply_to_comment` to review and respond to audience comments across connected channels.

If the user has not linked a Reeling API key yet, guide them to subscribe at https://reeling.app/pricing?plan=creator&ref=mcp and generate an API key (`rl_...`) at https://reeling.app/settings?tab=api.
