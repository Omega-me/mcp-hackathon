/**
 * Type definitions for MCP API Server
 */

/**
 * MCP Server Configuration
 */
export interface McpServerConfig {
  name: string;
  version: string;
}

/**
 * API Configuration
 */
export interface ApiConfig {
  baseUrl: string;
  timeout: number;
  defaultHeaders?: Record<string, string>;
}

/**
 * API Request
 */
export interface ApiRequest {
  method: "GET" | "POST" | "PUT" | "DELETE";
  endpoint: string;
  headers?: Record<string, string>;
  params?: Record<string, string | number>;
  data?: unknown;
}

/**
 * API Response
 */
export interface ApiResponse<T = unknown> {
  status: number;
  statusText: string;
  data: T;
  headers: Record<string, string>;
}

/**
 * Tool Content for MCP Protocol
 */
export interface ToolContent {
  type: "text" | "image" | "resource";
  text?: string;
  data?: string;
  mimeType?: string;
}

/**
 * Tool Response for MCP Protocol
 */
export interface ToolResponse {
  content: ToolContent[];
  isError?: boolean;
}

/**
 * Error Response
 */
export interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

/**
 * Transport Configuration
 */
export interface StdioTransportConfig {
  type: "stdio";
}

export interface HttpTransportConfig {
  type: "http";
  port: number;
  endpoint: string;
}

export type TransportConfig = StdioTransportConfig | HttpTransportConfig;
