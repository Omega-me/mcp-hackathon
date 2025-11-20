#!/usr/bin/env node
/**
 * Main Entry Point
 * Auto-detects transport type and starts the MCP server
 */

import "dotenv/config";
import { createMcpServer } from "./features/mcp-api-server/server.js";
import { startStdioTransport } from "./features/mcp-api-server/transports/stdio-transport.js";
import { startHttpTransport } from "./features/mcp-api-server/transports/http-transport.js";
import { TRANSPORT_CONFIG } from "./features/mcp-api-server/constants.js";
import { createLogger } from "./shared/utils/logger.js";

const logger = createLogger("Main");

async function main() {
  try {
    logger.info(`Starting MCP server (transport: ${TRANSPORT_CONFIG.TYPE})`);

    const server = createMcpServer();

    // Auto-detect or use configured transport
    if (TRANSPORT_CONFIG.TYPE === "stdio") {
      await startStdioTransport(server);
    } else if (TRANSPORT_CONFIG.TYPE === "http") {
      await startHttpTransport(server);
    } else {
      // Auto mode: detect based on stdin
      if (process.stdin.isTTY) {
        logger.info("TTY detected, using HTTP transport");
        await startHttpTransport(server);
      } else {
        logger.info("No TTY detected, using stdio transport");
        await startStdioTransport(server);
      }
    }

    // Keep process alive
    process.on("SIGINT", () => {
      logger.info("Received SIGINT, shutting down");
      process.exit(0);
    });
  } catch (error) {
    logger.error("Failed to start MCP server", error);
    process.exit(1);
  }
}

main();
