/**
 * Constants for MCP API Server
 * All configuration and magic values are centralized here per constitution
 */

/**
 * MCP Server Configuration
 */
export const SERVER_CONFIG = {
  NAME: "mcp-api-server",
  VERSION: "1.0.0",
} as const;

/**
 * API Configuration
 */
export const API_CONFIG = {
  BASE_URL: process.env.API_BASE_URL || "http://10.138.80.113:5000/api",
  TIMEOUT: parseInt(process.env.API_TIMEOUT || "5000", 10),
  HELLO_ENDPOINT: "/hello",
} as const;

/**
 * Transport Configuration
 */
export const TRANSPORT_CONFIG = {
  TYPE: (process.env.TRANSPORT || "auto") as "stdio" | "http" | "auto",
  HTTP_PORT: parseInt(process.env.HTTP_PORT || "3000", 10),
  HTTP_ENDPOINT: "/mcp",
} as const;

/**
 * Tool Definitions
 */
export const TOOLS = {
  HELLO: {
    NAME: "hello",
    DESCRIPTION:
      "Query the hello API endpoint at /api/hello to retrieve greeting messages.",
  },
} as const;

/**
 * HTTP Headers
 */
export const HTTP_HEADERS = {
  ACCEPT_JSON: "application/json",
  CONTENT_TYPE_JSON: "application/json",
} as const;

/**
 * Error Codes
 */
export const ERROR_CODES = {
  API_ERROR: "API_ERROR",
  TIMEOUT: "TIMEOUT",
  NETWORK_ERROR: "NETWORK_ERROR",
  VALIDATION_ERROR: "VALIDATION_ERROR",
  INTERNAL_ERROR: "INTERNAL_ERROR",
} as const;
