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
| `reeling_list_channels` | Lists all connected channels (YouTube, Bluesky, TikTok, Instagram, Threads, Pinterest, etc.) with handle names and account status. |
| `reeling_get_channel_options` | Retrieves publishing options for a connected channel, such as Pinterest boards (ID, name, privacy) or TikTok creator options. |
| `reeling_publish_post` | Publishes or schedules short-form video posts simultaneously to targeted platforms. |
| `reeling_get_post_status` | Checks delivery, processing, and publishing status for a specific post. |
| `reeling_get_analytics` | Fetches aggregated analytics: total views, likes, comments, impressions, and per-platform breakdown. |
| `reeling_sync_metrics` | Triggers a live sync against YouTube, Bluesky, Instagram, Threads, and TikTok APIs. |
| `reeling_get_inbox` | Retrieves audience comments across social channels into a unified inbox. |
| `reeling_reply_to_comment` | Posts a direct reply to a comment on any connected social platform. |
| `reeling_adapt_content_ai` | Uses Reeling's AI copy engine to adapt a hook/script for TikTok, Instagram, YouTube, Threads, or Bluesky. |
| `reeling_generate_video` | Generates short-form video clips in seconds with fal.ai MiniMax H3 Max AI models and saves them directly to Reeling storage. |
| `reeling_create_storyboard` | Generates structured multi-scene storyboards (30s up to 5 minutes) broken into consecutive 5s cinematic cuts with audio/foley cues. |
| `reeling_stitch_storyboard` | Renders storyboard scenes via MiniMax H3 and stitches them into a continuous MP4 video with FFmpeg, uploading to R2 storage. |

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

### 4. Remote Hosted SSE Server (for Grok Bot, Claude Remote, Web Agents)
You can run `reeling-mcp` as a persistent Server-Sent Events (SSE) server for remote AI agents:

```bash
# Run locally or deploy to Railway / Render / VPS / Docker
npx reeling-mcp --sse --port 3005
```

Endpoints exposed:
* `GET /health`: Health check status.
* `GET /sse`: Server-Sent Events connection stream (`?api_key=rl_...` or `X-API-Key` header).
* `POST /messages?sessionId=...`: JSON-RPC protocol message receiver.

#### Grok Bot Configuration (xAI)
Add to your Grok Bot custom MCP servers:
* **Transport**: SSE
* **Endpoint**: `https://mcp.reeling.app/sse` (or `http://localhost:3005/sse`)
* **Headers**: `X-API-Key: rl_your_live_api_key_here`

---

## 🤖 ChatGPT, Dots & ElizaOS Integrations

See the `/integrations` directory for ready-to-use packages:
* **ChatGPT Custom GPT**: `integrations/chatgpt/` (OpenAPI schema & instructions)
* **xAI Grok Bot Plugin**: `integrations/grokbot/` (Plugin manifest)
* **ElizaOS Autonomous Agent Plugin**: `integrations/elizaos/` (`@elizaos/plugin-reeling`)
* **Discord Community Bot**: `integrations/discord/` (Slash commands `/reel`)

---

## 🧪 Testing Locally

You can test the MCP server manually using the MCP inspector:

```bash
npx @modelcontextprotocol/inspector node bin/cli.js
```

Or test SSE mode:
```bash
node bin/cli.js --sse --port 3005
curl http://localhost:3005/health
```

---

## 📄 License
MIT © [reeling.app](https://reeling.app)
