# Quickstart Guide: MCP API Server

**Feature**: 001-mcp-api-server
**Version**: 1.0.0
**Date**: 2025-11-19

## Overview

The MCP API Server is a Model Context Protocol server that provides tools to query external API endpoints. It supports both stdio (for local processes) and HTTP (for remote access) transports.

## Prerequisites

- Node.js v22.x or later (LTS)
- pnpm package manager
- Access to API endpoint at `http://10.138.80.113:5000`

## Installation

### 1. Install Dependencies

```bash
# Install pnpm if not already installed
npm install -g pnpm

# Install project dependencies
pnpm install
```

### 2. Configure Environment (Optional)

Create a `.env` file in the project root:

```bash
# API Configuration
API_BASE_URL=http://10.138.80.113:5000
API_TIMEOUT=5000

# Transport Configuration
TRANSPORT=auto  # Options: stdio, http, auto
HTTP_PORT=3000
```

### 3. Build the Project

```bash
pnpm build
```

## Running the Server

### Option 1: Stdio Transport (Local/Spawned Process)

Use this mode when the server is spawned by another process (e.g., MCP Inspector, Claude Desktop).

```bash
# Run with Node
node dist/stdio-entry.js

# Or using pnpm script
pnpm start:stdio
```

**Use Cases**:

- Local development with MCP Inspector
- Integration with Claude Desktop
- CLI tools that spawn MCP servers

### Option 2: HTTP Transport (Remote Server)

Use this mode to run the server as a standalone HTTP service.

```bash
# Run with Node
node dist/http-entry.js

# Or using pnpm script
pnpm start:http
```

The server will start on `http://localhost:3000/mcp` (default).

**Use Cases**:

- Remote MCP clients
- Browser-based integrations
- Multiple concurrent clients

### Option 3: Auto-Detect Transport

The server can automatically choose the transport based on the environment:

```bash
# Auto-detect mode
node dist/index.js

# Or using pnpm script
pnpm start
```

**Detection Logic**:

- If `TRANSPORT=stdio` → uses stdio transport
- If `TRANSPORT=http` → uses HTTP transport
- If `TRANSPORT=auto` or unset → defaults to stdio

## Testing the Server

### With MCP Inspector (Recommended)

1. Install MCP Inspector:

```bash
npx @modelcontextprotocol/inspector
```

2. For stdio transport:

   - Run the server: `pnpm start:stdio`
   - Inspector will auto-detect the server

3. For HTTP transport:
   - Run the server: `pnpm start:http`
   - Connect to: `http://localhost:3000/mcp`

### With Claude Code

```bash
# For HTTP transport
claude mcp add --transport http mcp-api-server http://localhost:3000/mcp

# For stdio transport
claude mcp add --transport stdio mcp-api-server node /path/to/dist/stdio-entry.js
```

### With VS Code

```bash
# For HTTP transport
code --add-mcp '{"name":"mcp-api-server","type":"http","url":"http://localhost:3000/mcp"}'
```

### With curl (HTTP transport only)

Test the MCP server directly:

```bash
# Initialize connection
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "initialize",
    "params": {
      "protocolVersion": "2024-11-05",
      "clientInfo": {
        "name": "test-client",
        "version": "1.0.0"
      },
      "capabilities": {}
    },
    "id": 1
  }'

# List available tools
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools/list",
    "params": {},
    "id": 2
  }'

# Call the hello tool
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools/call",
    "params": {
      "name": "hello",
      "arguments": {}
    },
    "id": 3
  }'
```

## Available Tools

### `hello`

Queries the `/api/hello` endpoint at the configured API base URL.

**Parameters**: None

**Example Response**:

```json
{
  "content": [
    {
      "type": "text",
      "text": "{\n  \"message\": \"Hello from API\",\n  \"timestamp\": \"2025-11-19T10:00:00Z\"\n}"
    }
  ]
}
```

**Error Scenarios**:

- `NETWORK_ERROR`: API endpoint is unreachable
- `TIMEOUT`: Request exceeded 5 second timeout
- `API_ERROR`: API returned an error status code

## Configuration

### Environment Variables

| Variable       | Description                      | Default                     | Required |
| -------------- | -------------------------------- | --------------------------- | -------- |
| `API_BASE_URL` | Base URL of the external API     | `http://10.138.80.113:5000` | No       |
| `API_TIMEOUT`  | Request timeout in milliseconds  | `5000`                      | No       |
| `TRANSPORT`    | Transport mode (stdio/http/auto) | `auto`                      | No       |
| `HTTP_PORT`    | Port for HTTP transport          | `3000`                      | No       |

### Modifying Configuration

1. **Via Environment Variables**: Set before running the server

   ```bash
   API_BASE_URL=http://example.com:8080 pnpm start
   ```

2. **Via .env File**: Create `.env` in project root
   ```bash
   API_BASE_URL=http://example.com:8080
   API_TIMEOUT=10000
   ```

## Development Mode

For development with auto-reload:

```bash
# Install tsx for TypeScript execution
pnpm add -D tsx

# Run in development mode
pnpm tsx --watch src/index.ts
```

## Troubleshooting

### Server Won't Start

**Symptom**: Error on startup

**Solutions**:

1. Check Node.js version: `node --version` (must be 22.x+)
2. Reinstall dependencies: `rm -rf node_modules && pnpm install`
3. Rebuild: `pnpm build`
4. Check port availability (for HTTP): `lsof -i :3000`

### API Connection Fails

**Symptom**: `NETWORK_ERROR` or `TIMEOUT` errors

**Solutions**:

1. Verify API is accessible: `curl http://10.138.80.113:5000/api/hello`
2. Check firewall settings
3. Increase timeout: Set `API_TIMEOUT=10000`
4. Verify API_BASE_URL is correct

### HTTP Transport Not Responding

**Symptom**: HTTP requests hang or timeout

**Solutions**:

1. Check server is running: `curl http://localhost:3000/mcp`
2. Verify port is not in use: `lsof -i :3000`
3. Check for proper JSON in request body
4. Review server logs for errors

### Tool Not Found

**Symptom**: `Tool 'hello' not found` error

**Solutions**:

1. List available tools using MCP Inspector or curl
2. Verify tool is registered in server.ts
3. Check tool name spelling (must be lowercase "hello")
4. Rebuild the project: `pnpm build`

## Project Structure

```
src/
├── features/
│   └── mcp-api-server/
│       ├── transports/
│       │   ├── stdio-transport.ts    # Stdio transport setup
│       │   └── http-transport.ts     # HTTP transport setup
│       ├── tools/
│       │   └── hello-tool.ts         # Hello API tool
│       ├── services/
│       │   └── api-client.ts         # HTTP client for API
│       ├── types.ts                  # TypeScript interfaces
│       ├── constants.ts              # Configuration constants
│       └── server.ts                 # MCP server setup
├── shared/
│   └── utils/
│       └── logger.ts                 # Logging utility
├── stdio-entry.ts                    # Stdio entry point
├── http-entry.ts                     # HTTP entry point
└── index.ts                          # Auto-detect entry point
```

## Next Steps

1. **Add More Tools**: Create new tool files in `src/features/mcp-api-server/tools/`
2. **Add Authentication**: Implement auth headers in `api-client.ts`
3. **Add Error Recovery**: Implement retry logic for transient failures
4. **Monitor Performance**: Add metrics for response times

## Support

For issues or questions:

1. Check server logs for error details
2. Review the [MCP Documentation](https://modelcontextprotocol.io)
3. Verify API endpoint is accessible
4. Check Node.js and TypeScript compilation errors

## Manual Verification Checklist

- [ ] Server starts without errors (both stdio and HTTP modes)
- [ ] MCP Inspector can connect to the server
- [ ] `hello` tool appears in tool list
- [ ] Calling `hello` tool returns data from API
- [ ] Error messages are clear when API is unreachable
- [ ] TypeScript compiles without warnings
- [ ] Environment variables are respected
