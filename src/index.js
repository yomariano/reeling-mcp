import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const API_URL = (process.env.REELING_API_URL || "https://api.reeling.app").replace(/\/+$/, "");
const API_KEY = process.env.REELING_API_KEY;

function getClient(overrideKey, fallbackKey) {
  const key = overrideKey || fallbackKey || API_KEY;
  if (!key) {
    throw new Error(
      "Missing Reeling API key. To autonomously generate short-form videos and publish across social platforms, an active Reeling subscription is required. Subscribe at https://reeling.app/pricing?plan=creator&ref=mcp and retrieve your API key from https://reeling.app/settings?tab=api."
    );
  }

  return axios.create({
    baseURL: API_URL,
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": key,
      "Authorization": `Bearer ${key}`,
    },
    timeout: 300000,
  });
}

// Tool specifications list
export const TOOLS_DEFINITIONS = [
      {
        name: "reeling_list_projects",
        description: "List all projects / workspaces available in your reeling.app account.",
        inputSchema: {
          type: "object",
          properties: {
            api_key: {
              type: "string",
              description: "Optional Reeling API key if not set in environment.",
            },
          },
        },
      },
      {
        name: "reeling_list_channels",
        description:
          "List all connected social media channels (YouTube, TikTok, Instagram, Bluesky, Threads, Pinterest, LinkedIn, Twitter/X, Discord, Telegram, etc.) with account details, usernames, and statuses.",
        inputSchema: {
          type: "object",
          properties: {
            project_id: {
              type: "string",
              description: "Optional UUID of the project to filter channels for.",
            },
            api_key: {
              type: "string",
              description: "Optional Reeling API key.",
            },
          },
        },
      },
      {
        name: "reeling_publish_post",
        description:
          "Publish or schedule short-form videos and posts across multiple social platforms simultaneously (TikTok, Instagram Reels, YouTube Shorts, Threads, Bluesky, Facebook, Twitter/X, LinkedIn, Pinterest).",
        inputSchema: {
          type: "object",
          required: ["content", "platforms"],
          properties: {
            content: {
              type: "string",
              description: "Post copy, caption, or description.",
            },
            platforms: {
              type: "array",
              items: { type: "string" },
              description:
                "List of platform keys to publish to, e.g. ['tiktok', 'instagram', 'youtube', 'bluesky', 'threads'].",
            },
            video_url: {
              type: "string",
              description:
                "Publicly accessible URL of the video file to publish (MP4, MOV, WebM).",
            },
            thumbnail_url: {
              type: "string",
              description:
                "Optional URL to a custom JPEG, PNG, or WebP thumbnail image.",
            },
            pinterest_board_id: {
              type: "string",
              description:
                "Optional Pinterest board ID to pin to. If omitted, uses default board or auto-creates 'Reeling Videos'.",
            },
            pinterest_link: {
              type: "string",
              description:
                "Optional destination link for Pinterest Pin.",
            },
            title: {
              type: "string",
              description:
                "Title for video platforms like YouTube Shorts or Pinterest pin titles.",
            },
            scheduled_at: {
              type: "string",
              description:
                "Optional ISO 8601 timestamp (e.g. 2026-09-10T15:00:00Z) to schedule post for future publishing.",
            },
            project_id: {
              type: "string",
              description: "Optional project ID to associate with the post.",
            },
            api_key: {
              type: "string",
              description: "Optional Reeling API key.",
            },
          },
        },
      },
      {
        name: "reeling_get_channel_options",
        description:
          "Retrieve publishing options for a connected channel, such as Pinterest boards (ID, name, privacy) or TikTok creator configurations.",
        inputSchema: {
          type: "object",
          required: ["channel_id"],
          properties: {
            channel_id: {
              type: "string",
              description: "UUID of the connected channel (from reeling_list_channels).",
            },
            api_key: {
              type: "string",
              description: "Optional Reeling API key.",
            },
          },
        },
      },
      {
        name: "reeling_get_post_status",
        description:
          "Retrieve delivery and publishing status for a post across all targeted social networks.",
        inputSchema: {
          type: "object",
          required: ["post_id"],
          properties: {
            post_id: {
              type: "string",
              description: "UUID of the post to check.",
            },
            api_key: {
              type: "string",
              description: "Optional Reeling API key.",
            },
          },
        },
      },
      {
        name: "reeling_get_analytics",
        description:
          "Retrieve aggregated performance analytics across all connected platforms (views, likes, comments, impressions, platform breakdown, and top-performing posts).",
        inputSchema: {
          type: "object",
          properties: {
            start_date: {
              type: "string",
              description: "Optional ISO start date for analytics range.",
            },
            end_date: {
              type: "string",
              description: "Optional ISO end date for analytics range.",
            },
            api_key: {
              type: "string",
              description: "Optional Reeling API key.",
            },
          },
        },
      },
      {
        name: "reeling_sync_metrics",
        description:
          "Trigger an on-demand real-time metric sync against live APIs (YouTube, Bluesky, Instagram, Threads, TikTok).",
        inputSchema: {
          type: "object",
          properties: {
            post_id: {
              type: "string",
              description: "Optional post UUID to sync metrics for a specific post.",
            },
            api_key: {
              type: "string",
              description: "Optional Reeling API key.",
            },
          },
        },
      },
      {
        name: "reeling_evaluate_content_jev",
        description:
          "Run a Type-Safe JEV (Judgment & Evaluation Vector) diagnostic on published post metrics. Evaluates 0-3s hook velocity, cognitive concept fit, visual/code density, engagement triggers, and drop-off causes with Zod schema validation, returning actionable content prescriptions for future generations.",
        inputSchema: {
          type: "object",
          properties: {
            force_fresh: {
              type: "boolean",
              description: "Whether to re-evaluate directly against live post metrics rather than using cached evaluation.",
            },
            api_key: {
              type: "string",
              description: "Optional Reeling API key.",
            },
          },
        },
      },
      {
        name: "reeling_get_inbox",
        description:
          "Fetch the unified social inbox containing audience comments and feedback across YouTube, Bluesky, Instagram, Threads, and TikTok.",
        inputSchema: {
          type: "object",
          properties: {
            platform: {
              type: "string",
              description: "Filter by platform: 'all', 'youtube', 'bluesky', 'instagram', 'threads', 'tiktok'.",
            },
            api_key: {
              type: "string",
              description: "Optional Reeling API key.",
            },
          },
        },
      },
      {
        name: "reeling_reply_to_comment",
        description:
          "Send a direct reply to a comment on a social network (YouTube, Bluesky, Instagram, Threads, TikTok).",
        inputSchema: {
          type: "object",
          required: ["comment_id", "platform", "reply_text"],
          properties: {
            comment_id: {
              type: "string",
              description: "The identifier of the comment being replied to.",
            },
            platform: {
              type: "string",
              description: "Platform: 'youtube', 'bluesky', 'instagram', 'threads', 'tiktok'.",
            },
            reply_text: {
              type: "string",
              description: "Text of the reply to publish.",
            },
            reply_context: {
              type: "object",
              description: "Platform-specific reply context (e.g. root URI/CID for Bluesky).",
            },
            api_key: {
              type: "string",
              description: "Optional Reeling API key.",
            },
          },
        },
      },
      {
        name: "reeling_adapt_content_ai",
        description:
          "Use Reeling's AI content adapter to transform a single hook, script, or topic into platform-tailored copy for TikTok, Instagram Reels, YouTube Shorts, Threads, and Bluesky.",
        inputSchema: {
          type: "object",
          required: ["topic"],
          properties: {
            topic: {
              type: "string",
              description: "Core topic, transcript, or draft text to adapt.",
            },
            tone: {
              type: "string",
              description: "Optional tone: 'engaging', 'humorous', 'educational', 'viral', 'professional'.",
            },
            platforms: {
              type: "array",
              items: { type: "string" },
              description: "Target platforms to generate copy for.",
            },
            api_key: {
              type: "string",
              description: "Optional Reeling API key.",
            },
          },
        },
      },
      {
        name: "reeling_generate_video",
        description:
          "Generate short-form video clips in seconds using fal.ai MiniMax H3 Max and Video-01 text-to-video AI models. Automatically saves the video to Cloudflare R2 storage and returns the public media URL ready for publishing to YouTube, TikTok, Instagram, etc.",
        inputSchema: {
          type: "object",
          required: ["prompt"],
          properties: {
            prompt: {
              type: "string",
              description:
                "Text description of the video to generate (e.g. 'Cinematic drone shot of a futuristic neon city at sunset, 4k ultra detailed'). Optional if image_url is provided.",
            },
            image_url: {
              type: "string",
              description:
                "Optional public image URL to animate into a video using image-to-video AI models.",
            },
            aspect_ratio: {
              type: "string",
              enum: ["9:16", "16:9"],
              description:
                "Aspect ratio for the generated video. '9:16' for vertical shorts/reels/tiktok, '16:9' for horizontal youtube.",
              default: "9:16",
            },
            fal_api_key: {
              type: "string",
              description:
                "Optional custom fal.ai API key (BYOK). If omitted, the server default fal.ai key is used.",
            },
            api_key: {
              type: "string",
              description: "Optional Reeling API key.",
            },
          },
        },
      },
      {
        name: "reeling_create_storyboard",
        description:
          "Generate an AI multi-scene storyboard (from 30 seconds up to 5 minutes) broken into sequential 5-second cinematic cuts with timecodes, scene titles, camera movements, and audio/foley cues.",
        inputSchema: {
          type: "object",
          required: ["topic"],
          properties: {
            topic: {
              type: "string",
              description:
                "Video topic, narrative concept, or full script to break into storyboard scenes.",
            },
            duration_seconds: {
              type: "number",
              description:
                "Target total duration in seconds (e.g. 30, 60, 120, 180, 300). Default is 30.",
              default: 30,
            },
            style: {
              type: "string",
              description: "Visual style preference (e.g. 'Cinematic', 'Photoreal', 'Cyberpunk', 'Anime').",
            },
            camera: {
              type: "string",
              description: "Camera motion preference (e.g. 'FPV Chase', 'Smooth Tracking', 'Macro Close-Up').",
            },
            api_key: {
              type: "string",
              description: "Optional Reeling API key.",
            },
          },
        },
      },
      {
        name: "reeling_stitch_storyboard",
        description:
          "Render each scene in a storyboard via fal.ai MiniMax H3 and stitch them into a single continuous MP4 video with FFmpeg, uploading the final result to Cloudflare R2 storage.",
        inputSchema: {
          type: "object",
          required: ["scenes"],
          properties: {
            scenes: {
              type: "array",
              description: "Array of storyboard scene objects with 'prompt' (and optional 'videoUrl').",
              items: {
                type: "object",
                required: ["prompt"],
                properties: {
                  prompt: { type: "string" },
                  videoUrl: { type: "string" },
                  title: { type: "string" },
                },
              },
            },
            aspect_ratio: {
              type: "string",
              enum: ["9:16", "16:9"],
              default: "9:16",
            },
            fal_api_key: {
              type: "string",
              description: "Optional custom fal.ai API key (BYOK).",
            },
            api_key: {
              type: "string",
              description: "Optional Reeling API key.",
            },
          },
        },
      },
];

// Handle tool executions
export async function executeTool(name, args = {}, defaultApiKey = null) {
  const client = getClient(args.api_key, defaultApiKey);

  try {
    switch (name) {
      case "reeling_list_projects": {
        const res = await client.get("/api/v1/projects");
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(res.data, null, 2),
            },
          ],
        };
      }

      case "reeling_list_channels": {
        const res = await client.get("/api/v1/channels", {
          params: { project_id: args.project_id },
        });
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(res.data, null, 2),
            },
          ],
        };
      }

      case "reeling_publish_post": {
        const payload = {
          content: args.content,
          caption: args.caption || args.content,
          platforms: args.platforms,
          video_url: args.video_url,
          thumbnail_url: args.thumbnail_url,
          title: args.title,
          pinterest_board_id: args.pinterest_board_id,
          pinterest_link: args.pinterest_link,
          pinterest: args.pinterest,
          scheduled_for: args.scheduled_at || args.scheduled_for,
          scheduled_at: args.scheduled_at || args.scheduled_for,
          project_id: args.project_id,
        };
        const res = await client.post("/api/v1/publish", payload);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(res.data, null, 2),
            },
          ],
        };
      }

      case "reeling_get_channel_options": {
        const res = await client.get(`/api/v1/channels/${args.channel_id}/options`);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(res.data, null, 2),
            },
          ],
        };
      }

      case "reeling_get_post_status": {
        const res = await client.get(`/api/v1/posts/${args.post_id}`);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(res.data, null, 2),
            },
          ],
        };
      }

      case "reeling_get_analytics": {
        const res = await client.get("/api/analytics/overview", {
          params: {
            startDate: args.start_date,
            endDate: args.end_date,
          },
        });
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(res.data, null, 2),
            },
          ],
        };
      }

      case "reeling_sync_metrics": {
        const res = await client.post("/api/analytics/sync", {
          postId: args.post_id,
        });
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(res.data, null, 2),
            },
          ],
        };
      }

      case "reeling_evaluate_content_jev": {
        const res = await client.post("/api/analytics/insights/jev/evaluate", {
          forceFresh: Boolean(args.force_fresh),
        });
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(res.data, null, 2),
            },
          ],
        };
      }

      case "reeling_get_inbox": {
        const res = await client.get("/api/inbox/comments", {
          params: { platform: args.platform || "all" },
        });
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(res.data, null, 2),
            },
          ],
        };
      }

      case "reeling_reply_to_comment": {
        const res = await client.post("/api/inbox/reply", {
          commentId: args.comment_id,
          platform: args.platform,
          replyText: args.reply_text,
          replyContext: args.reply_context,
        });
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(res.data, null, 2),
            },
          ],
        };
      }

      case "reeling_adapt_content_ai": {
        const res = await client.post("/api/ai/adapt", {
          prompt: args.topic || args.prompt,
          tone: args.tone || "viral",
          platforms: args.platforms || ["tiktok", "instagram", "youtube", "threads", "bluesky"],
        });
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(res.data, null, 2),
            },
          ],
        };
      }

      case "reeling_generate_video": {
        const res = await client.post("/api/ai/generate-video", {
          prompt: args.prompt,
          imageUrl: args.image_url,
          apiKey: args.fal_api_key || process.env.FAL_KEY || process.env.FAL_API_KEY || undefined,
        });
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(res.data, null, 2),
            },
          ],
        };
      }

      case "reeling_create_storyboard": {
        const res = await client.post("/api/ai/storyboard/create", {
          topic: args.topic,
          durationSeconds: args.duration_seconds || 30,
          style: args.style,
          camera: args.camera,
        });
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(res.data, null, 2),
            },
          ],
        };
      }

      case "reeling_stitch_storyboard": {
        const res = await client.post("/api/ai/storyboard/stitch", {
          scenes: args.scenes,
          apiKey: args.fal_api_key || process.env.FAL_KEY || process.env.FAL_API_KEY || undefined,
        });
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(res.data, null, 2),
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool name: ${name}`);
    }
  } catch (error) {
    if (
      error.response?.status === 401 ||
      error.response?.status === 403 ||
      (typeof error.message === "string" && error.message.includes("Missing Reeling API key"))
    ) {
      return {
        isError: true,
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                status: "subscription_required",
                error_code: "ERR_REELING_SUBSCRIPTION_REQUIRED",
                message:
                  "An active Reeling subscription is required to autonomously generate videos and publish across social platforms.",
                upgrade_url: "https://reeling.app/pricing?plan=creator&ref=mcp",
                setup_instructions: [
                  "1. Subscribe to the Creator plan: https://reeling.app/pricing?plan=creator&ref=mcp",
                  "2. Sign in and open Settings → API Keys: https://reeling.app/settings?tab=api",
                  "3. Copy your live API key (starts with rl_).",
                  "4. Provide the key to this agent via REELING_API_KEY environment variable or the api_key parameter.",
                ],
              },
              null,
              2
            ),
          },
        ],
      };
    }

    const errorDetails = error.response?.data || error.message;
    return {
      isError: true,
      content: [
        {
          type: "text",
          text: `Error executing ${name}: ${
            typeof errorDetails === "object" ? JSON.stringify(errorDetails, null, 2) : errorDetails
          }`,
        },
      ],
    };
  }
}

export function createMcpServer(defaultApiKey = null) {
  const server = new Server(
    {
      name: "reeling-mcp",
      version: "1.0.0",
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return { tools: TOOLS_DEFINITIONS };
  });

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args = {} } = request.params;
    return executeTool(name, args, defaultApiKey);
  });

  return server;
}

// Run server with stdio transport (CLI default)
export async function runServer(defaultApiKey = null) {
  const server = createMcpServer(defaultApiKey);
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Reeling MCP Server running on stdio");
  return server;
}

// Run server with Streamable HTTP (/mcp) and SSE (/sse) transport over HTTP
export async function startSseServer(port = 3005, host = "0.0.0.0", defaultApiKey = null) {
  const http = await import("node:http");
  const crypto = await import("node:crypto");
  const { URL } = await import("node:url");

  const sessions = new Map();

  async function handleJsonRpcMessage(msg, apiKey) {
    if (!msg || typeof msg !== "object" || msg.jsonrpc !== "2.0") {
      return {
        jsonrpc: "2.0",
        id: msg?.id ?? null,
        error: { code: -32600, message: "Invalid Request" },
      };
    }

    // Notifications (no id) return null so caller can send 202 Accepted
    if (msg.id === undefined) {
      return null;
    }

    const { id, method, params = {} } = msg;

    if (method === "initialize") {
      const requestedVersion = params?.protocolVersion || "2024-11-05";
      const supportedVersions = ["2024-11-05", "2025-03-26", "2025-06-18", "2025-11-25"];
      const protocolVersion = supportedVersions.includes(requestedVersion)
        ? requestedVersion
        : "2024-11-05";
      return {
        jsonrpc: "2.0",
        id,
        result: {
          protocolVersion,
          capabilities: {
            tools: { listChanged: false },
          },
          serverInfo: {
            name: "reeling-mcp",
            version: "1.0.0",
          },
          instructions:
            "Reeling MCP Server connects AI agents (Grok Bot, ChatGPT, OpenAI Dots, Claude, Cursor) to reeling.app for multi-platform short-form video publishing (TikTok, Instagram Reels, YouTube Shorts, Threads, Bluesky, X, LinkedIn, Pinterest). If a user has not supplied an API key yet, guide them to https://reeling.app/pricing?plan=creator&ref=mcp and https://reeling.app/settings?tab=api.",
        },
      };
    }

    if (method === "ping") {
      return { jsonrpc: "2.0", id, result: {} };
    }

    if (method === "tools/list") {
      return {
        jsonrpc: "2.0",
        id,
        result: {
          tools: TOOLS_DEFINITIONS,
        },
      };
    }

    if (method === "tools/call") {
      const toolName = params?.name;
      const toolArgs = params?.arguments || {};
      const result = await executeTool(toolName, toolArgs, apiKey);
      return {
        jsonrpc: "2.0",
        id,
        result,
      };
    }

    return {
      jsonrpc: "2.0",
      id,
      error: { code: -32601, message: `Method not found: ${method}` },
    };
  }

  const httpServer = http.createServer(async (req, res) => {
    // Enable CORS for web-based agents (Grok Bot, ChatGPT, Claude web, Dots, etc.)
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, Accept, Authorization, X-API-Key, Mcp-Session-Id, Last-Event-ID"
    );
    res.setHeader("Access-Control-Expose-Headers", "Mcp-Session-Id");

    if (req.method === "OPTIONS") {
      res.writeHead(204);
      res.end();
      return;
    }

    const reqUrl = new URL(req.url, `http://${req.headers.host || "localhost"}`);
    const pathname = reqUrl.pathname;

    if (pathname === "/.well-known/openai-apps-challenge" && req.method === "GET") {
      const challengeToken = (process.env.OPENAI_APPS_CHALLENGE_TOKEN || "").trim();
      if (!challengeToken) {
        res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" });
        res.end("OPENAI_APPS_CHALLENGE_TOKEN not configured");
        return;
      }
      res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" });
      res.end(challengeToken);
      return;
    }

    if (
      (req.method === "GET" || req.method === "HEAD") &&
      (pathname === "/downloads/reeling-openai.zip" ||
        pathname === "/downloads/reeling-claude.zip" ||
        pathname === "/downloads/grok-connector.json" ||
        pathname === "/downloads/checksums.json" ||
        pathname === "/assets/reeling.png")
    ) {
      const fs = await import("node:fs/promises");
      const path = await import("node:path");
      const { fileURLToPath } = await import("node:url");
      const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
      const fileMap = {
        "/downloads/reeling-openai.zip": {
          file: path.join(rootDir, "dist", "public-downloads", "reeling-openai.zip"),
          type: "application/zip",
        },
        "/downloads/reeling-claude.zip": {
          file: path.join(rootDir, "dist", "public-downloads", "reeling-claude.zip"),
          type: "application/zip",
        },
        "/downloads/grok-connector.json": {
          file: path.join(rootDir, "dist", "public-downloads", "grok-connector.json"),
          type: "application/json; charset=utf-8",
        },
        "/downloads/checksums.json": {
          file: path.join(rootDir, "dist", "public-downloads", "checksums.json"),
          type: "application/json; charset=utf-8",
        },
        "/assets/reeling.png": {
          file: path.join(rootDir, "public", "assets", "reeling.png"),
          type: "image/png",
        },
      };
      const entry = fileMap[pathname];
      try {
        const data = await fs.readFile(entry.file);
        res.writeHead(200, {
          "Content-Type": entry.type,
          "Content-Length": data.length,
          "Cache-Control": "public, max-age=300",
        });
        res.end(data);
      } catch {
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Package file not found" }));
      }
      return;
    }

    if (pathname === "/health") {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          ok: true,
          status: "ok",
          server: "reeling-mcp",
          version: "1.0.0",
          transports: ["streamable-http", "sse"],
          endpoints: {
            mcp: "https://mcp.reeling.app/mcp",
            sse: "https://mcp.reeling.app/sse",
            install: "https://mcp.reeling.app/install",
            openaiPluginZip: "https://mcp.reeling.app/downloads/reeling-openai.zip",
            claudePluginZip: "https://mcp.reeling.app/downloads/reeling-claude.zip",
            grokManifest: "https://mcp.reeling.app/downloads/grok-connector.json",
            checksums: "https://mcp.reeling.app/downloads/checksums.json",
          },
          tools: TOOLS_DEFINITIONS.map((t) => t.name),
          activeSessions: sessions.size,
        })
      );
      return;
    }

    if ((pathname === "/" || pathname === "/install") && req.method === "GET") {
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.end(`<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Connect Reeling MCP — Grok Bot, ChatGPT, Dots, Claude & Cursor</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; max-width: 760px; margin: 40px auto; padding: 0 20px; color: #111827; line-height: 1.6; }
    code, pre { background: #f3f4f6; padding: 2px 6px; border-radius: 6px; font-size: 0.92em; }
    pre { padding: 14px; overflow-x: auto; }
    .card { border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px; margin: 18px 0; }
    h1, h2 { color: #0f172a; }
    .btn { display: inline-block; background: #7c3aed; color: #fff; text-decoration: none; padding: 8px 14px; border-radius: 8px; margin-right: 8px; font-weight: 600; font-size: 0.92em; }
  </style>
</head>
<body>
  <h1>Connect Reeling to Grok Bot, ChatGPT, Dots, Claude &amp; Cursor</h1>
  <p>Hosted Streamable HTTP MCP Endpoint: <code>https://mcp.reeling.app/mcp</code></p>
  <div class="card">
    <h2>1. Direct Custom MCP Connection (Instant)</h2>
    <ol>
      <li>Open <strong>Connect Apps / Plugins / Connectors</strong>.</li>
      <li>Click <strong>Add custom MCP</strong> (or <strong>New Connector &rarr; Custom</strong>).</li>
      <li>Name: <code>Reeling</code></li>
      <li>MCP Server URL: <code>https://mcp.reeling.app/mcp</code></li>
      <li>Authentication: Choose <strong>No authentication</strong> (you can supply your <code>rl_...</code> API key directly in chat or via workspace settings).</li>
    </ol>
  </div>
  <div class="card">
    <h2>2. Agent Plugins 1.0 Directory Packages</h2>
    <p>Download pre-built plugin bundles for directory upload or local installation:</p>
    <p>
      <a class="btn" href="/downloads/reeling-openai.zip">reeling-openai.zip</a>
      <a class="btn" href="/downloads/reeling-claude.zip">reeling-claude.zip</a>
      <a class="btn" href="/downloads/grok-connector.json">grok-connector.json</a>
    </p>
  </div>
  <div class="card">
    <h2>3. Connect in Claude Desktop / Cursor / Windsurf (CLI)</h2>
    <p>Run locally via <code>npx -y reeling-mcp</code> or point HTTP connector to <code>https://mcp.reeling.app/mcp</code>.</p>
  </div>
  <p id="support"><a href="https://reeling.app/developers">Reeling Developer Portal</a> &middot; <a href="https://reeling.app/pricing">Pricing</a> &middot; <a href="https://reeling.app/privacy">Privacy Policy</a> &middot; <a href="https://reeling.app/terms">Terms</a></p>
</body>
</html>`);
      return;
    }

    // Streamable HTTP MCP endpoint (/mcp)
    if (pathname === "/mcp") {
      const apiKey =
        req.headers["x-api-key"] ||
        (req.headers.authorization?.startsWith("Bearer ")
          ? req.headers.authorization.slice(7)
          : null) ||
        reqUrl.searchParams.get("api_key") ||
        defaultApiKey;

      if (req.method === "DELETE") {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ ok: true }));
        return;
      }

      if (req.method === "GET") {
        // Streamable HTTP GET opens an SSE notification stream
        res.writeHead(200, {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache, no-transform",
          Connection: "keep-alive",
        });
        res.write(": connected\n\n");
        const keepAlive = setInterval(() => {
          res.write(": ping\n\n");
        }, 25000);
        req.on("close", () => clearInterval(keepAlive));
        return;
      }

      if (req.method === "POST") {
        let rawBody = "";
        for await (const chunk of req) {
          rawBody += chunk;
          if (rawBody.length > 1024 * 1024) {
            res.writeHead(413, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: "Payload too large" }));
            return;
          }
        }

        let parsed;
        try {
          parsed = JSON.parse(rawBody);
        } catch {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(
            JSON.stringify({
              jsonrpc: "2.0",
              id: null,
              error: { code: -32700, message: "Parse error" },
            })
          );
          return;
        }

        const sessionId =
          req.headers["mcp-session-id"] || crypto.randomUUID();
        res.setHeader("Mcp-Session-Id", sessionId);

        if (Array.isArray(parsed)) {
          const responses = (
            await Promise.all(parsed.map((item) => handleJsonRpcMessage(item, apiKey)))
          ).filter((r) => r !== null);

          if (responses.length === 0) {
            res.writeHead(202);
            res.end();
            return;
          }
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify(responses));
          return;
        }

        const responseObj = await handleJsonRpcMessage(parsed, apiKey);
        if (responseObj === null) {
          res.writeHead(202);
          res.end();
          return;
        }

        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(responseObj));
        return;
      }
    }

    // Legacy SSE connection stream endpoint (/sse)
    if (pathname === "/sse" && req.method === "GET") {
      const apiKey =
        req.headers["x-api-key"] ||
        (req.headers.authorization?.startsWith("Bearer ")
          ? req.headers.authorization.slice(7)
          : null) ||
        reqUrl.searchParams.get("api_key") ||
        defaultApiKey;

      const serverInstance = createMcpServer(apiKey);
      const transport = new SSEServerTransport("/messages", res);

      sessions.set(transport.sessionId, { server: serverInstance, transport });

      transport.onclose = () => {
        sessions.delete(transport.sessionId);
      };

      try {
        await serverInstance.connect(transport);
      } catch (err) {
        console.error("Error connecting SSE transport:", err);
        sessions.delete(transport.sessionId);
      }
      return;
    }

    // JSON-RPC message incoming endpoint
    if (pathname === "/messages" && req.method === "POST") {
      const sessionId = reqUrl.searchParams.get("sessionId");
      if (!sessionId || !sessions.has(sessionId)) {
        res.writeHead(404, { "Content-Type": "text/plain" });
        res.end("Session not found or expired. Reconnect via GET /sse");
        return;
      }

      const { transport } = sessions.get(sessionId);
      try {
        await transport.handlePostMessage(req, res);
      } catch (err) {
        console.error("Error handling POST message in SSE session:", err);
      }
      return;
    }

    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not Found. Reeling MCP server endpoints: POST/GET /mcp, GET /health, GET /install, GET /sse, POST /messages");
  });

  return new Promise((resolve, reject) => {
    httpServer.listen(port, host, () => {
      console.log(`Reeling MCP Server running on http://${host}:${port}/mcp (Streamable HTTP) and /sse`);
      resolve(httpServer);
    });
    httpServer.on("error", reject);
  });
}

// Auto-run if executed directly as entrypoint
if (process.argv[1]?.endsWith("index.js")) {
  const isSse = process.argv.includes("--sse") || process.env.MCP_TRANSPORT === "sse" || Boolean(process.env.PORT);
  const portIndex = process.argv.indexOf("--port");
  const port = portIndex !== -1 ? parseInt(process.argv[portIndex + 1], 10) : (parseInt(process.env.PORT, 10) || 3005);

  if (isSse) {
    startSseServer(port).catch((err) => {
      console.error("Fatal error starting Reeling MCP SSE server:", err);
      process.exit(1);
    });
  } else {
    runServer().catch((err) => {
      console.error("Fatal error starting Reeling MCP stdio server:", err);
      process.exit(1);
    });
  }
}
