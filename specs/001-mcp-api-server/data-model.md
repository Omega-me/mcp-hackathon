# Data Model: MCP API Server

**Feature**: 001-mcp-api-server
**Phase**: 1 - Design & Contracts
**Date**: 2025-11-19

## Overview

This document defines the data structures, types, and models used in the MCP API Server. The server acts as a stateless proxy between MCP clients and external APIs, so the data model focuses on request/response structures and configuration.

## Core Entities

### 1. MCP Server Configuration

Represents the MCP server metadata and configuration.

```typescript
interface McpServerConfig {
  name: string; // "mcp-api-server"
  version: string; // Semantic version (e.g., "1.0.0")
}
```

**Purpose**: Identifies the server to MCP clients and tools.

**Validation**: Name must be kebab-case, version must follow semver.

---

### 2. API Configuration

Represents the external API endpoint configuration.

```typescript
interface ApiConfig {
  baseUrl: string; // Base URL of the API (e.g., "http://10.138.80.113:5000")
  timeout: number; // Request timeout in milliseconds (default: 5000)
  defaultHeaders?: Record<string, string>; // Optional default headers
}
```

**Purpose**: Configures the HTTP client for making requests to external APIs.

**Validation**:

- baseUrl must be valid HTTP/HTTPS URL
- timeout must be positive integer
- defaultHeaders are optional key-value pairs

---

### 3. Tool Definition

Represents an MCP tool that maps to an API endpoint.

```typescript
interface ToolDefinition {
  name: string; // Unique tool identifier (e.g., "hello")
  description: string; // Human-readable description
  parameters: z.ZodObject<any>; // Zod schema for parameters
  handler: ToolHandler; // Function that executes the tool
}

type ToolHandler = (params: unknown) => Promise<ToolResponse>;
```

**Purpose**: Defines the contract and implementation of an MCP tool.

**Validation**:

- name must be lowercase, alphanumeric with hyphens
- parameters validated at runtime by Zod
- handler must return valid ToolResponse

---

### 4. Tool Response

Represents the response from a tool execution.

```typescript
interface ToolResponse {
  content: ToolContent[];
  isError?: boolean;
}

interface ToolContent {
  type: "text" | "image" | "resource";
  text?: string;
  data?: string;
  mimeType?: string;
}
```

**Purpose**: Standard format for tool responses following MCP protocol.

**Validation**:

- At least one content item required
- Type must be valid MCP content type
- Text content must have text field
- Image content must have data and mimeType

---

### 5. API Request

Represents an HTTP request to the external API.

```typescript
interface ApiRequest {
  method: "GET" | "POST" | "PUT" | "DELETE";
  endpoint: string; // Relative path (e.g., "/api/hello")
  headers?: Record<string, string>;
  params?: Record<string, string | number>; // Query parameters
  data?: unknown; // Request body
}
```

**Purpose**: Structured representation of HTTP request to external API.

**Validation**:

- method must be valid HTTP verb
- endpoint must start with /
- params and data are optional

---

### 6. API Response

Represents an HTTP response from the external API.

```typescript
interface ApiResponse<T = unknown> {
  status: number;
  statusText: string;
  data: T;
  headers: Record<string, string>;
}
```

**Purpose**: Typed representation of API response data.

**Validation**:

- status must be valid HTTP status code (100-599)
- data contains the response payload

---

### 7. Error Response

Represents an error that occurred during API request or tool execution.

```typescript
interface ErrorResponse {
  error: {
    code: string; // Error code (e.g., "API_ERROR", "TIMEOUT")
    message: string; // Human-readable error message
    details?: unknown; // Optional error details
  };
}
```

**Purpose**: Standardized error format for tool failures.

**Error Codes**:

- `API_ERROR`: External API returned an error
- `TIMEOUT`: Request exceeded timeout limit
- `NETWORK_ERROR`: Network connectivity issue
- `VALIDATION_ERROR`: Invalid parameters provided
- `INTERNAL_ERROR`: Unexpected server error

---

### 8. Transport Configuration

Represents configuration for different transport types.

```typescript
interface StdioTransportConfig {
  type: "stdio";
}

interface HttpTransportConfig {
  type: "http";
  port: number; // Port to listen on (default: 3000)
  endpoint: string; // MCP endpoint path (default: "/mcp")
}

type TransportConfig = StdioTransportConfig | HttpTransportConfig;
```

**Purpose**: Configures how the MCP server communicates with clients.

**Validation**:

- type must be "stdio" or "http"
- port must be 1-65535 for HTTP
- endpoint must start with /

---

## Type Relationships

```
McpServerConfig
    │
    ├── Contains ToolDefinition[]
    │       │
    │       └── Uses ToolHandler
    │              │
    │              ├── Receives params (validated by Zod)
    │              ├── Makes ApiRequest
    │              │       │
    │              │       └── Gets ApiResponse or ErrorResponse
    │              │
    │              └── Returns ToolResponse
    │
    └── Uses TransportConfig
            │
            ├── StdioTransportConfig
            └── HttpTransportConfig
```

## Constants Structure

All magic values will be defined in `constants.ts`:

```typescript
// Server metadata
export const SERVER_CONFIG = {
  NAME: "mcp-api-server",
  VERSION: "1.0.0",
} as const;

// API configuration
export const API_CONFIG = {
  BASE_URL: process.env.API_BASE_URL || "http://10.138.80.113:5000",
  TIMEOUT: parseInt(process.env.API_TIMEOUT || "5000", 10),
  ENDPOINTS: {
    HELLO: "/api/hello",
  },
} as const;

// Transport configuration
export const TRANSPORT_CONFIG = {
  HTTP: {
    DEFAULT_PORT: 3000,
    DEFAULT_ENDPOINT: "/mcp",
  },
} as const;

// Error codes
export const ERROR_CODES = {
  API_ERROR: "API_ERROR",
  TIMEOUT: "TIMEOUT",
  NETWORK_ERROR: "NETWORK_ERROR",
  VALIDATION_ERROR: "VALIDATION_ERROR",
  INTERNAL_ERROR: "INTERNAL_ERROR",
} as const;

// Tool metadata
export const TOOLS = {
  HELLO: {
    NAME: "hello",
    DESCRIPTION: "Query the hello API endpoint at /api/hello",
  },
} as const;
```

## Validation Rules

### Parameter Validation

All tool parameters validated using Zod schemas before execution:

```typescript
// Example: Hello tool (no parameters for initial implementation)
const helloToolSchema = z.object({});

// Future tools might have parameters:
const exampleToolSchema = z.object({
  id: z.string().min(1),
  optional: z.string().optional(),
});
```

### API Response Validation

API responses should be validated for expected structure:

```typescript
// Validate response has expected shape
const validateApiResponse = <T>(data: unknown): T => {
  if (data === null || data === undefined) {
    throw new Error("API returned empty response");
  }
  return data as T;
};
```

## State Management

**Note**: This server is STATELESS by design (YAGNI).

- No session storage
- No database
- No in-memory caching
- Each request is independent

If state is needed in the future, it should be added only when a concrete use case emerges (YAGNI principle).

## Data Flow

```
MCP Client
    │
    ├─→ [Tool Invocation Request]
    │
    ↓
MCP Server (via Transport)
    │
    ├─→ [Validate Parameters with Zod]
    │
    ├─→ [Execute Tool Handler]
    │       │
    │       ├─→ [Build ApiRequest]
    │       │
    │       ├─→ [HTTP Request to External API]
    │       │
    │       ├─→ [Receive ApiResponse]
    │       │
    │       └─→ [Format as ToolResponse]
    │
    └─→ [Return to Client via Transport]
```

## Extension Points

When adding new tools in the future:

1. Define tool schema in `contracts/`
2. Add endpoint constant to `API_CONFIG.ENDPOINTS`
3. Create tool handler in `tools/`
4. Register tool with server in `server.ts`

This keeps each tool self-contained and follows the Open/Closed Principle (SOLID).

## Constitution Alignment

- ✅ **YAGNI**: No unnecessary abstractions, only types needed now
- ✅ **SOLID**: Clear separation of concerns, each entity has single responsibility
- ✅ **Constants**: All magic values defined as constants
- ✅ **KISS**: Simple, straightforward data structures
- ✅ **Feature-Based**: All types live within feature directory
