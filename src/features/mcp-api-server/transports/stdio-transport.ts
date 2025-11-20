/**
 * Stdio Transport Setup
 * Configures MCP server for stdio transport (local spawned processes)
 */

import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createLogger } from "../../../shared/utils/logger.js";

const logger = createLogger("Stdio Transport");

/**
 * Start MCP server with stdio transport
 * @param server - The MCP server instance
 */
export async function startStdioTransport(server: McpServer): Promise<void> {
  logger.info("Starting stdio transport");

  const transport = new StdioServerTransport();

  await server.connect(transport);

  logger.info("Stdio transport connected successfully");
  logger.info("MCP server is ready to accept requests via stdio");
}
