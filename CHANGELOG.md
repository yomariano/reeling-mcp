# Changelog

## 1.1.0 — 2026-10-22

- Add `reeling_discover_community_questions` and `reeling_draft_community_answer` tools for daily Reddit and Quora question discovery, value-first answer drafting, and 0–100 Pre-Publish Spam & Shadowban scoring.
- Expand `reeling_publish_post` documentation and platform support across all 15 channels (adding Reddit, Quora, Medium, Facebook, and Mastodon alongside X, YouTube, TikTok, Instagram, LinkedIn, Threads, Bluesky, Pinterest, Telegram, and Discord) plus `reply_to_url` deep-links.
- Enforce and report community cadence guardrails (max 3 answers/day and 3 standalone posts/week).
- Link the new AI Plugins & Agent Skills Hub (`https://reeling.app/plugins`).

## 1.0.1 — 2026-10-20

- Document reproducible installs from the GitHub release tag.
- Add a real MCP stdio integration test with an isolated local API fixture.
- Add automated checks, package file allowlisting and Node.js requirements.
- Link runnable publishing, status-polling and analytics examples.
- Add a registry descriptor, contribution guide and architecture overview.

## 1.0.0

Initial MCP adapter with stdio, Streamable HTTP and legacy SSE transports.
