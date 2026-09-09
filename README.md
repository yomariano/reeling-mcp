# reeling-mcp 🎬🤖

Official **Model Context Protocol (MCP)** server for [reeling.app](https://reeling.app) — the open-source social media management & short-form video publishing platform.

With `reeling-mcp`, your AI coding assistants and agents (Claude Desktop, Cursor, Antigravity, Windsurf, OpenClaw, etc.) can directly publish short-form videos, schedule posts across multiple platforms, inspect live analytics, monitor incoming audience comments, reply to comments, and adapt content automatically.

---

## ⚡ Supported Platforms

- 🎵 **TikTok**
- 📸 **Instagram Reels & Stories**
- ▶️ **YouTube Shorts**
- 🦋 **Bluesky**
- 🧵 **Threads**
- 📌 **Pinterest**
- 💼 **LinkedIn**
- 🐦 **Twitter / X**
- 💬 **Discord & Telegram**

---

## 🛠️ Available MCP Tools

| Tool Name | Description |
|---|---|
| `reeling_list_projects` | Lists all projects & workspaces in your Reeling account. |
| `reeling_list_channels` | Lists all connected channels (YouTube, Bluesky, TikTok, Instagram, Threads, etc.) with handle names and account status. |
| `reeling_publish_post` | Publishes or schedules short-form video posts simultaneously to targeted platforms. |
| `reeling_get_post_status` | Checks delivery, processing, and publishing status for a specific post. |
| `reeling_get_analytics` | Fetches aggregated analytics: total views, likes, comments, impressions, and per-platform breakdown. |
| `reeling_sync_metrics` | Triggers a live sync against YouTube, Bluesky, Instagram, Threads, and TikTok APIs. |
| `reeling_get_inbox` | Retrieves audience comments across social channels into a unified inbox. |
| `reeling_reply_to_comment` | Posts a direct reply to a comment on any connected social platform. |
| `reeling_adapt_content_ai` | Uses Reeling's AI copy engine to adapt a hook/script for TikTok, Instagram, YouTube, Threads, or Bluesky. |
| `reeling_generate_video` | Generates short-form video clips in seconds with fal.ai MiniMax H3 Max AI models and saves them directly to Reeling storage. |

---

## 🔑 Getting Started

1. **Obtain your API Key**:
   - Go to [reeling.app](https://reeling.app) and sign in.
   - Navigate to **Settings** → **API Keys**.
   - Generate a new key (starts with `rl_...`).

---

## 💻 Configuration Examples

### 1. Claude Desktop
Add this to your `claude_desktop_config.json`:
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "reeling": {
      "command": "npx",
      "args": ["-y", "reeling-mcp"],
      "env": {
        "REELING_API_KEY": "rl_your_live_api_key_here",
        "REELING_API_URL": "https://api.reeling.app"
      }
    }
  }
}
```

Or run directly from source:
```json
{
  "mcpServers": {
    "reeling": {
      "command": "node",
      "args": ["/absolute/path/to/reeling-mcp/bin/cli.js"],
      "env": {
        "REELING_API_KEY": "rl_your_live_api_key_here"
      }
    }
  }
}
```

### 2. Cursor IDE
Create or edit `.cursor/mcp.json` in your project root:

```json
{
  "mcpServers": {
    "reeling": {
      "command": "npx -y reeling-mcp",
      "env": {
        "REELING_API_KEY": "rl_your_live_api_key_here"
      }
    }
  }
}
```

### 3. Antigravity (AGY)
Add to your `~/.gemini/antigravity-cli/mcp_config.json` or project MCP configuration:

```json
{
  "mcpServers": {
    "reeling": {
      "command": "node",
      "args": ["/Users/mariano/Developer/reeling/reeling-mcp/bin/cli.js"],
      "env": {
        "REELING_API_KEY": "rl_your_live_api_key_here"
      }
    }
  }
}
```

---

## 🧪 Testing Locally

You can test the MCP server manually using the MCP inspector:

```bash
npx @modelcontextprotocol/inspector node bin/cli.js
```

Or pass `REELING_API_KEY` directly:
```bash
REELING_API_KEY="rl_your_key" node bin/cli.js
```

---

## 📄 License
MIT © [reeling.app](https://reeling.app)
