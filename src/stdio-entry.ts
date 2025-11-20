#!/usr/bin/env node
/**
 * Stdio Entry Point
 * Starts the MCP server with stdio transport
 */

import "dotenv/config";
import { createMcpServer } from "./features/mcp-api-server/server.js";
import { startStdioTransport } from "./features/mcp-api-server/transports/stdio-transport.js";
import { createLogger } from "./shared/utils/logger.js";

const logger = createLogger("Main");

async function main() {
  try {
    logger.info("Starting MCP server with stdio transport");

    const server = createMcpServer();
    await startStdioTransport(server);

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
