/**
 * HTTP Transport Setup
 * Configures MCP server for HTTP transport (remote access)
 */

import express from "express";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { TRANSPORT_CONFIG } from "../constants.js";
import { createLogger } from "../../../shared/utils/logger.js";
import { randomUUID } from "crypto";

const logger = createLogger("HTTP Transport");

/**
 * Start MCP server with HTTP transport
 * @param server - The MCP server instance
 */
export async function startHttpTransport(server: McpServer): Promise<void> {
  logger.info(`Starting HTTP transport on port ${TRANSPORT_CONFIG.HTTP_PORT}`);

  const app = express();
  app.use(express.json());

  // Create the transport once and connect the server
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: () => randomUUID(),
  });

  await server.connect(transport);
  logger.info("MCP server connected to HTTP transport");

  // MCP SSE endpoint (GET)
  app.get(TRANSPORT_CONFIG.HTTP_ENDPOINT, async (req, res) => {
    logger.debug("Received SSE connection request");
    try {
      await transport.handleRequest(req, res);
    } catch (error) {
      logger.error("Error handling SSE request", error);
      res.status(500).json({
        error: "Internal server error",
        message: error instanceof Error ? error.message : String(error),
      });
    }
  });

  // MCP POST endpoint
  app.post(TRANSPORT_CONFIG.HTTP_ENDPOINT, async (req, res) => {
    logger.debug(`Received MCP request: ${JSON.stringify(req.body)}`);

    try {
      await transport.handleRequest(req, res, req.body);
    } catch (error) {
      logger.error("Error handling MCP request", error);
      res.status(500).json({
        error: "Internal server error",
        message: error instanceof Error ? error.message : String(error),
      });
    }
  });

  // Health check endpoint
  app.get("/health", (_req, res) => {
    res.json({ status: "healthy", transport: "http" });
  });

  app.listen(TRANSPORT_CONFIG.HTTP_PORT, () => {
    logger.info(
      `HTTP transport listening on port ${TRANSPORT_CONFIG.HTTP_PORT}`
    );
    logger.info(
      `MCP endpoint: POST http://localhost:${TRANSPORT_CONFIG.HTTP_PORT}${TRANSPORT_CONFIG.HTTP_ENDPOINT}`
    );
    logger.info(
      `Health check: GET http://localhost:${TRANSPORT_CONFIG.HTTP_PORT}/health`
    );
  });
}
