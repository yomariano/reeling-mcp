#!/usr/bin/env node

import { runServer, startSseServer } from "../src/index.js";

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
