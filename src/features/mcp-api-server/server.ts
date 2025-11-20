/**
 * MCP Server Setup
 * Initializes and configures the MCP server
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SERVER_CONFIG } from "./constants.js";
import { createLogger } from "../../shared/utils/logger.js";
import { helloToolMetadata, helloToolHandler } from "./tools/hello-tool.js";
import {
  signupToolMetadata,
  signupToolHandler,
} from "../jwt-auth/tools/signup-tool.js";
import {
  loginToolMetadata,
  loginToolHandler,
} from "../jwt-auth/tools/login-tool.js";
import {
  getTokenToolMetadata,
  getTokenToolHandler,
} from "../jwt-auth/tools/get-token-tool.js";
import {
  getAllOrganizationsToolMetadata,
  getAllOrganizationsToolHandler,
} from "../organizations-crud/tools/get-all-organizations-tool.js";
import {
  createOrganizationToolMetadata,
  createOrganizationToolHandler,
} from "../organizations-crud/tools/create-organization-tool.js";
import {
  getOrganizationToolMetadata,
  getOrganizationToolHandler,
} from "../organizations-crud/tools/get-organization-tool.js";
import {
  updateOrganizationToolMetadata,
  updateOrganizationToolHandler,
} from "../organizations-crud/tools/update-organization-tool.js";
import {
  deleteOrganizationToolMetadata,
  deleteOrganizationToolHandler,
} from "../organizations-crud/tools/delete-organization-tool.js";

const logger = createLogger("MCP Server");

/**
 * Create and configure the MCP server
 */
export function createMcpServer(): McpServer {
  logger.info(
    `Creating MCP server: ${SERVER_CONFIG.NAME} v${SERVER_CONFIG.VERSION}`
  );

  const server = new McpServer({
    name: SERVER_CONFIG.NAME,
    version: SERVER_CONFIG.VERSION,
  });

  // Register hello tool
  logger.info(`Registering tool: ${helloToolMetadata.name}`);
  server.registerTool(
    helloToolMetadata.name,
    {
      description: helloToolMetadata.description,
      inputSchema: helloToolMetadata.schema,
    },
    helloToolHandler
  );

  // Register signup tool (JWT Auth - User Story 1)
  logger.info(`Registering tool: ${signupToolMetadata.name}`);
  server.registerTool(
    signupToolMetadata.name,
    {
      description: signupToolMetadata.description,
      inputSchema: signupToolMetadata.schema,
    },
    signupToolHandler
  );

  // Register login tool (JWT Auth - User Story 2)
  logger.info(`Registering tool: ${loginToolMetadata.name}`);
  server.registerTool(
    loginToolMetadata.name,
    {
      description: loginToolMetadata.description,
      inputSchema: loginToolMetadata.schema,
    },
    loginToolHandler
  );

  // Register get-token tool (JWT Auth - User Story 3)
  logger.info(`Registering tool: ${getTokenToolMetadata.name}`);
  server.registerTool(
    getTokenToolMetadata.name,
    {
      description: getTokenToolMetadata.description,
      inputSchema: getTokenToolMetadata.schema,
    },
    getTokenToolHandler
  );

  // Register get-all-organizations tool (Organizations CRUD - User Story 1)
  logger.info(`Registering tool: ${getAllOrganizationsToolMetadata.name}`);
  server.registerTool(
    getAllOrganizationsToolMetadata.name,
    {
      description: getAllOrganizationsToolMetadata.description,
      inputSchema: getAllOrganizationsToolMetadata.schema,
    },
    getAllOrganizationsToolHandler
  );

  // Register create-organization tool (Organizations CRUD - User Story 2)
  logger.info(`Registering tool: ${createOrganizationToolMetadata.name}`);
  server.registerTool(
    createOrganizationToolMetadata.name,
    {
      description: createOrganizationToolMetadata.description,
      inputSchema: createOrganizationToolMetadata.schema,
    },
    createOrganizationToolHandler
  );

  // Register get-organization tool (Organizations CRUD - User Story 3)
  logger.info(`Registering tool: ${getOrganizationToolMetadata.name}`);
  server.registerTool(
    getOrganizationToolMetadata.name,
    {
      description: getOrganizationToolMetadata.description,
      inputSchema: getOrganizationToolMetadata.schema,
    },
    getOrganizationToolHandler
  );

  // Register update-organization tool (Organizations CRUD - User Story 4)
  logger.info(`Registering tool: ${updateOrganizationToolMetadata.name}`);
  server.registerTool(
    updateOrganizationToolMetadata.name,
    {
      description: updateOrganizationToolMetadata.description,
      inputSchema: updateOrganizationToolMetadata.schema,
    },
    updateOrganizationToolHandler
  );

  // Register delete-organization tool (Organizations CRUD - User Story 5)
  logger.info(`Registering tool: ${deleteOrganizationToolMetadata.name}`);
  server.registerTool(
    deleteOrganizationToolMetadata.name,
    {
      description: deleteOrganizationToolMetadata.description,
      inputSchema: deleteOrganizationToolMetadata.schema,
    },
    deleteOrganizationToolHandler
  );

  logger.info("MCP server created successfully");

  return server;
}
