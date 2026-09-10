import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const API_URL = (process.env.REELING_API_URL || "https://api.reeling.app").replace(/\/+$/, "");
const API_KEY = process.env.REELING_API_KEY;

function getClient(overrideKey) {
  const key = overrideKey || API_KEY;
  if (!key) {
    throw new Error(
      "Missing Reeling API key. Set the REELING_API_KEY environment variable or pass api_key parameter."
    );
  }

  return axios.create({
    baseURL: API_URL,
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": key,
      "Authorization": `Bearer ${key}`,
    },
    timeout: 60000,
  });
}

// Create MCP Server instance
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

// Define tool specifications
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
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
    ],
  };
});

// Handle tool executions
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args = {} } = request.params;
  const client = getClient(args.api_key);

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
          platforms: args.platforms,
          video_url: args.video_url,
          title: args.title,
          scheduled_at: args.scheduled_at,
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
          aspectRatio: args.aspect_ratio || "9:16",
          apiKey: args.fal_api_key || process.env.FAL_KEY || "17aba0d7-14e5-4088-9101-b8170ff2fc56:1a7e3da08028cabaea27a4ce1ec29cf6",
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
          aspectRatio: args.aspect_ratio || "9:16",
          apiKey: args.fal_api_key || process.env.FAL_KEY || "17aba0d7-14e5-4088-9101-b8170ff2fc56:1a7e3da08028cabaea27a4ce1ec29cf6",
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
});

// Run server with stdio transport
export async function runServer() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Reeling MCP Server running on stdio");
}

if (process.argv[1]?.endsWith("index.js") || process.argv[1]?.endsWith("cli.js")) {
  runServer().catch((err) => {
    console.error("Fatal error starting Reeling MCP server:", err);
    process.exit(1);
  });
}
