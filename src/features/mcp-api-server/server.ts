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
import {
  getAllPeopleToolMetadata,
  getAllPeopleToolHandler,
} from "../people-crud/tools/get-all-people-tool.js";
import {
  createPersonToolMetadata,
  createPersonToolHandler,
} from "../people-crud/tools/create-person-tool.js";
import {
  getPersonToolMetadata,
  getPersonToolHandler,
} from "../people-crud/tools/get-person-tool.js";
import {
  updatePersonToolMetadata,
  updatePersonToolHandler,
} from "../people-crud/tools/update-person-tool.js";
import {
  deletePersonToolMetadata,
  deletePersonToolHandler,
} from "../people-crud/tools/delete-person-tool.js";
import {
  addHobbyToPersonToolMetadata,
  addHobbyToPersonToolHandler,
} from "../people-crud/tools/add-hobby-to-person-tool.js";
import {
  getPersonHobbiesToolMetadata,
  getPersonHobbiesToolHandler,
} from "../people-crud/tools/get-person-hobbies-tool.js";
import {
  deletePersonHobbyToolMetadata,
  deletePersonHobbyToolHandler,
} from "../people-crud/tools/delete-person-hobby-tool.js";
import {
  getAllHobbiesToolMetadata,
  getAllHobbiesToolHandler,
} from "../hobbies-crud/tools/get-all-hobbies-tool.js";
import {
  createHobbyToolMetadata,
  createHobbyToolHandler,
} from "../hobbies-crud/tools/create-hobby-tool.js";
import {
  getHobbyToolMetadata,
  getHobbyToolHandler,
} from "../hobbies-crud/tools/get-hobby-tool.js";
import {
  updateHobbyToolMetadata,
  updateHobbyToolHandler,
} from "../hobbies-crud/tools/update-hobby-tool.js";
import {
  deleteHobbyToolMetadata,
  deleteHobbyToolHandler,
} from "../hobbies-crud/tools/delete-hobby-tool.js";

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

  // Register get-all-people tool (People CRUD - User Story 1)
  logger.info(`Registering tool: ${getAllPeopleToolMetadata.name}`);
  server.registerTool(
    getAllPeopleToolMetadata.name,
    {
      description: getAllPeopleToolMetadata.description,
      inputSchema: getAllPeopleToolMetadata.schema,
    },
    getAllPeopleToolHandler
  );

  // Register create-person tool (People CRUD - User Story 2)
  logger.info(`Registering tool: ${createPersonToolMetadata.name}`);
  server.registerTool(
    createPersonToolMetadata.name,
    {
      description: createPersonToolMetadata.description,
      inputSchema: createPersonToolMetadata.schema,
    },
    createPersonToolHandler
  );

  // Register get-person tool (People CRUD - User Story 3)
  logger.info(`Registering tool: ${getPersonToolMetadata.name}`);
  server.registerTool(
    getPersonToolMetadata.name,
    {
      description: getPersonToolMetadata.description,
      inputSchema: getPersonToolMetadata.schema,
    },
    getPersonToolHandler
  );

  // Register update-person tool (People CRUD - User Story 4)
  logger.info(`Registering tool: ${updatePersonToolMetadata.name}`);
  server.registerTool(
    updatePersonToolMetadata.name,
    {
      description: updatePersonToolMetadata.description,
      inputSchema: updatePersonToolMetadata.schema,
    },
    updatePersonToolHandler
  );

  // Register delete-person tool (People CRUD - User Story 5)
  logger.info(`Registering tool: ${deletePersonToolMetadata.name}`);
  server.registerTool(
    deletePersonToolMetadata.name,
    {
      description: deletePersonToolMetadata.description,
      inputSchema: deletePersonToolMetadata.schema,
    },
    deletePersonToolHandler
  );

  // Register add-hobby-to-person tool (People-Hobbies CRUD)
  logger.info(`Registering tool: ${addHobbyToPersonToolMetadata.name}`);
  server.registerTool(
    addHobbyToPersonToolMetadata.name,
    {
      description: addHobbyToPersonToolMetadata.description,
      inputSchema: addHobbyToPersonToolMetadata.schema,
    },
    addHobbyToPersonToolHandler
  );

  // Register get-person-hobbies tool (People-Hobbies CRUD)
  logger.info(`Registering tool: ${getPersonHobbiesToolMetadata.name}`);
  server.registerTool(
    getPersonHobbiesToolMetadata.name,
    {
      description: getPersonHobbiesToolMetadata.description,
      inputSchema: getPersonHobbiesToolMetadata.schema,
    },
    getPersonHobbiesToolHandler
  );

  // Register delete-person-hobby tool (People-Hobbies CRUD)
  logger.info(`Registering tool: ${deletePersonHobbyToolMetadata.name}`);
  server.registerTool(
    deletePersonHobbyToolMetadata.name,
    {
      description: deletePersonHobbyToolMetadata.description,
      inputSchema: deletePersonHobbyToolMetadata.schema,
    },
    deletePersonHobbyToolHandler
  );

  // Register get-all-hobbies tool (Hobbies CRUD - User Story 1)
  logger.info(`Registering tool: ${getAllHobbiesToolMetadata.name}`);
  server.registerTool(
    getAllHobbiesToolMetadata.name,
    {
      description: getAllHobbiesToolMetadata.description,
      inputSchema: getAllHobbiesToolMetadata.schema,
    },
    getAllHobbiesToolHandler
  );

  // Register create-hobby tool (Hobbies CRUD - User Story 2)
  logger.info(`Registering tool: ${createHobbyToolMetadata.name}`);
  server.registerTool(
    createHobbyToolMetadata.name,
    {
      description: createHobbyToolMetadata.description,
      inputSchema: createHobbyToolMetadata.schema,
    },
    createHobbyToolHandler
  );

  // Register get-hobby tool (Hobbies CRUD - User Story 3)
  logger.info(`Registering tool: ${getHobbyToolMetadata.name}`);
  server.registerTool(
    getHobbyToolMetadata.name,
    {
      description: getHobbyToolMetadata.description,
      inputSchema: getHobbyToolMetadata.schema,
    },
    getHobbyToolHandler
  );

  // Register update-hobby tool (Hobbies CRUD - User Story 4)
  logger.info(`Registering tool: ${updateHobbyToolMetadata.name}`);
  server.registerTool(
    updateHobbyToolMetadata.name,
    {
      description: updateHobbyToolMetadata.description,
      inputSchema: updateHobbyToolMetadata.schema,
    },
    updateHobbyToolHandler
  );

  // Register delete-hobby tool (Hobbies CRUD - User Story 5)
  logger.info(`Registering tool: ${deleteHobbyToolMetadata.name}`);
  server.registerTool(
    deleteHobbyToolMetadata.name,
    {
      description: deleteHobbyToolMetadata.description,
      inputSchema: deleteHobbyToolMetadata.schema,
    },
    deleteHobbyToolHandler
  );

  logger.info("MCP server created successfully");

  return server;
}
