# Research: MCP API Server

**Feature**: 001-mcp-api-server
**Phase**: 0 - Outline & Research
**Date**: 2025-11-19

## Purpose

Research MCP SDK patterns, transport mechanisms, and best practices for implementing a TypeScript-based MCP server that supports both stdio and HTTP transports.

## Research Areas

### 1. MCP SDK Structure and Patterns

**Decision**: Use `McpServer` class from `@modelcontextprotocol/sdk/server/mcp.js`

**Rationale**:

- High-level API that handles protocol compliance automatically
- Built-in support for tools, resources, and prompts registration
- Simplified error handling and request routing
- Recommended approach per MCP documentation

**Alternatives Considered**:

- Low-level `Server` class: Requires manual protocol handling, adds unnecessary complexity (violates KISS)
- Custom protocol implementation: Would require implementing full MCP spec, violates YAGNI

**Implementation Pattern**:

```typescript
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

const server = new McpServer({
  name: "mcp-api-server",
  version: "1.0.0",
});
```

### 2. Stdio Transport Setup

**Decision**: Use `StdioServerTransport` for local process communication

**Rationale**:

- Standard MCP transport for spawned processes
- Zero configuration needed
- Direct integration with MCP Inspector and CLI tools
- Recommended for local development and testing

**Implementation Pattern**:

```typescript
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

const transport = new StdioServerTransport();
await server.connect(transport);
```

**Alternatives Considered**:

- Custom stdio handling: Reinventing the wheel, violates YAGNI
- Only HTTP transport: Would not support local spawned usage patterns

### 3. HTTP Transport Setup

**Decision**: Use `StreamableHTTPServerTransport` with Express in stateless mode

**Rationale**:

- Stateless mode (creating new transport per request) prevents request ID collisions
- Simpler than session management for initial implementation (YAGNI)
- Works with standard HTTP/HTTPS
- Compatible with browser-based and remote MCP clients

**Implementation Pattern**:

```typescript
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import express from "express";

const app = express();
app.use(express.json());

app.post("/mcp", async (req, res) => {
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: () => crypto.randomUUID(),
  });
  await server.connect(transport);
  await transport.handleRequest(req, res, req.body);
});
```

**Alternatives Considered**:

- Session management mode: Adds complexity not needed for stateless API proxy (violates YAGNI)
- WebSocket transport: Not required for current use case, adds dependency
- Custom HTTP protocol: Would not be MCP-compliant

### 4. Tool Registration and Schema Validation

**Decision**: Use `server.registerTool()` with Zod schemas

**Rationale**:

- Type-safe parameter validation
- Automatic JSON schema generation from Zod schemas
- Clear parameter documentation in tool descriptions
- Zod is already specified in requirements

**Implementation Pattern**:

```typescript
import { z } from "zod";

server.registerTool(
  "hello",
  {
    description: "Query the hello API endpoint",
    parameters: z.object({
      // parameters if needed
    }),
  },
  async (params) => {
    // tool implementation
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  }
);
```

**Alternatives Considered**:

- Manual JSON schema: More verbose, error-prone, violates DRY
- No validation: Would allow invalid requests through, poor UX

### 5. HTTP Client for External API Calls

**Decision**: Use Axios for HTTP requests to external API

**Rationale**:

- Simple, well-documented API
- Built-in timeout support
- Automatic JSON parsing
- Better error messages than native fetch
- Wide industry adoption

**Implementation Pattern**:

```typescript
import axios from "axios";

const response = await axios.get(API_ENDPOINT, {
  timeout: API_TIMEOUT,
  headers: {
    // auth headers if needed
  },
});
```

**Alternatives Considered**:

- Native fetch: Requires more boilerplate for timeouts and error handling
- node-fetch: Axios provides better DX and error handling
- Got: Overkill for simple GET requests, violates KISS

### 6. Error Handling Strategy

**Decision**: Wrap API errors in descriptive MCP error responses

**Rationale**:

- MCP clients expect structured error responses
- Users need clear feedback about API failures
- Prevents raw error objects from leaking

**Implementation Pattern**:

```typescript
try {
  const response = await apiClient.get(endpoint);
  return { content: [{ type: "text", text: JSON.stringify(response.data) }] };
} catch (error) {
  if (axios.isAxiosError(error)) {
    throw new Error(`API request failed: ${error.message}`);
  }
  throw error;
}
```

### 7. Environment and Configuration

**Decision**: Use environment variables for API base URL and configuration

**Rationale**:

- Separates config from code
- Easy to override for different environments
- Standard Node.js pattern
- Supports deployment flexibility

**Implementation Pattern**:

```typescript
// constants.ts
export const API_CONFIG = {
  BASE_URL: process.env.API_BASE_URL || "http://10.138.80.113:5000",
  TIMEOUT: parseInt(process.env.API_TIMEOUT || "5000"),
} as const;
```

**Alternatives Considered**:

- Hardcoded values: Not flexible for different environments
- Config files (JSON/YAML): Overkill for 2-3 values, violates YAGNI
- Database config: Way too complex, violates YAGNI and KISS

### 8. TypeScript Configuration

**Decision**: Use strict mode with ES2022 target and ESM modules

**Rationale**:

- Strict mode catches more errors at compile time (required by constitution)
- ES2022 provides modern language features
- ESM is the standard for modern Node.js (required by constitution)
- MCP SDK is ESM-native

**Configuration**:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ES2022",
    "moduleResolution": "node",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "outDir": "./dist",
    "rootDir": "./src"
  }
}
```

### 9. Entry Points Strategy

**Decision**: Three entry points - stdio, http, and auto-detect

**Rationale**:

- Allows explicit transport selection
- Auto-detect mode for convenience
- Supports both local and remote usage patterns

**Entry Points**:

- `stdio-entry.ts`: Forces stdio transport
- `http-entry.ts`: Forces HTTP transport
- `index.ts`: Auto-detects based on `TRANSPORT` environment variable

## Technology Decisions Summary

| Technology                | Purpose                     | Justification                                          |
| ------------------------- | --------------------------- | ------------------------------------------------------ |
| @modelcontextprotocol/sdk | MCP protocol implementation | Official SDK, handles protocol compliance              |
| Express                   | HTTP server                 | Simple, standard, minimal setup                        |
| Zod                       | Schema validation           | Type-safe, clear errors, Zod specified in requirements |
| Axios                     | HTTP client                 | Better DX than fetch, built-in timeouts                |
| TypeScript                | Language                    | Required by constitution                               |
| pnpm                      | Package manager             | Required by constitution                               |

## Best Practices Applied

1. **YAGNI**: Only implementing stdio and HTTP transports, single tool, no sessions
2. **KISS**: Stateless HTTP transport, simple error wrapping, minimal configuration
3. **SOLID**: Separation of concerns (transport, server, API client)
4. **Constants**: All URLs, timeouts, and metadata in constants.ts
5. **Feature-Based**: All code under `src/features/mcp-api-server/`

## Implementation Notes

- Tool name will be "hello" to match API endpoint semantic
- Tool description will clearly state it queries /api/hello
- No authentication initially (YAGNI) - can be added when second tool needs it
- Simple console logging for debugging (no complex logging framework needed)
- Response format: JSON stringified with proper formatting

## Risks and Mitigations

| Risk                               | Mitigation                                      |
| ---------------------------------- | ----------------------------------------------- |
| API endpoint unreachable           | Add clear timeout errors, validate at startup   |
| Request ID collisions in HTTP mode | Use stateless transport (new per request)       |
| Large API responses                | Set reasonable timeout, document size limits    |
| TypeScript/ESM import issues       | Use .js extensions in imports per Node ESM spec |

## Next Steps

Proceed to Phase 1:

1. Create data model document (API request/response structures)
2. Define tool contract (parameters, response format)
3. Create quickstart guide for running server
