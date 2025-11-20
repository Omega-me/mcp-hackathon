# MCP API Server

A Model Context Protocol (MCP) server that exposes tools to query external API endpoints.

## Overview

This MCP server provides a standardized interface to interact with external APIs through the MCP protocol. It supports both stdio (for local spawned processes) and HTTP transports (for remote access).

## Features

- **MCP Protocol Compliant**: Full support for MCP tool invocation
- **Dual Transport**: Both stdio and HTTP transports supported
- **Type-Safe**: Built with TypeScript in strict mode
- **Simple Configuration**: Environment variable-based configuration
- **Error Handling**: Clear, actionable error messages

## Quick Start

### Prerequisites

- Node.js v22.x or later
- pnpm package manager

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd hackathon

# Install dependencies
pnpm install

# Copy environment configuration
cp .env.example .env

# Build the project
pnpm build
```

### Running the Server

#### Stdio Transport (for local tools)

```bash
pnpm start:stdio
```

#### HTTP Transport (for remote access)

```bash
pnpm start:http
```

#### Auto-detect Transport

```bash
pnpm start
```

## Project Structure

```
src/
├── features/
│   └── mcp-api-server/       # MCP API server feature
│       ├── transports/        # Transport implementations
│       ├── tools/             # MCP tools
│       ├── services/          # Business logic
│       ├── constants.ts       # Constants and configuration
│       ├── types.ts           # TypeScript interfaces
│       └── server.ts          # MCP server setup
├── shared/                    # Shared utilities
└── index.ts                   # Main entry point
```

## Configuration

Configuration is done via environment variables. Copy `.env.example` to `.env` and adjust values as needed:

```bash
cp .env.example .env
```

### Environment Variables

| Variable       | Default                     | Description                                     |
| -------------- | --------------------------- | ----------------------------------------------- |
| `API_BASE_URL` | `http://10.138.80.113:5000` | Base URL of the external API                    |
| `API_TIMEOUT`  | `5000`                      | API request timeout in milliseconds             |
| `TRANSPORT`    | `auto`                      | Transport type: `stdio`, `http`, or `auto`      |
| `HTTP_PORT`    | `3000`                      | Port for HTTP transport (only used when `http`) |
| `DEBUG`        | `false`                     | Enable debug logging (`true` or `false`)        |

### Transport Auto-Detection

When `TRANSPORT=auto` (default), the server automatically detects the appropriate transport:

- **TTY detected**: Uses HTTP transport (port 3000)
- **No TTY (piped/spawned)**: Uses stdio transport

## Available Tools

### Authentication Tools

#### `signup`

Register a new user account.

**Parameters**:

- `email` (string, required): User email address
- `password` (string, required): User password

**Example**:

```json
{
  "method": "tools/call",
  "params": {
    "name": "signup",
    "arguments": {
      "email": "user@example.com",
      "password": "SecurePass123!"
    }
  }
}
```

#### `login`

Authenticate an existing user.

**Parameters**:

- `email` (string, required): User email address
- `password` (string, required): User password

**Example**:

```json
{
  "method": "tools/call",
  "params": {
    "name": "login",
    "arguments": {
      "email": "user@example.com",
      "password": "SecurePass123!"
    }
  }
}
```

#### `get-token`

Retrieve the currently stored authentication token.

**Parameters**: None

**Example**:

```json
{
  "method": "tools/call",
  "params": {
    "name": "get-token",
    "arguments": {}
  }
}
```

---

### Organizations CRUD Tools

Complete set of tools for managing organizations with full Create, Read, Update, Delete operations.

#### `get-all-organizations`

Retrieve a list of all organizations the authenticated user has permission to view.

**Parameters**: None (future support for pagination/filters)

**Authentication**: Required (JWT token)

**Example**:

```json
{
  "method": "tools/call",
  "params": {
    "name": "get-all-organizations",
    "arguments": {}
  }
}
```

**Success Response**:

```json
{
  "success": true,
  "data": [
    {
      "id": "org-123",
      "name": "Acme Corp",
      "description": "Leading technology company",
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

#### `create-organization`

Create a new organization with the specified name and optional description.

**Parameters**:

- `name` (string, required): Organization name (1-255 characters)
- `description` (string, optional): Organization description (max 1000 characters)

**Authentication**: Required (JWT token)

**Example**:

```json
{
  "method": "tools/call",
  "params": {
    "name": "create-organization",
    "arguments": {
      "name": "Tech Innovators Inc",
      "description": "Cutting-edge technology solutions"
    }
  }
}
```

**Success Response**:

```json
{
  "success": true,
  "data": {
    "id": "org-456",
    "name": "Tech Innovators Inc",
    "description": "Cutting-edge technology solutions",
    "createdAt": "2024-01-20T14:25:00Z",
    "updatedAt": "2024-01-20T14:25:00Z"
  }
}
```

#### `get-organization`

Retrieve a specific organization by its unique identifier.

**Parameters**:

- `id` (string, required): Organization ID

**Authentication**: Required (JWT token)

**Example**:

```json
{
  "method": "tools/call",
  "params": {
    "name": "get-organization",
    "arguments": {
      "id": "org-123"
    }
  }
}
```

**Success Response**:

```json
{
  "success": true,
  "data": {
    "id": "org-123",
    "name": "Acme Corp",
    "description": "Leading technology company",
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

**Error Response (Not Found)**:

```json
{
  "success": false,
  "error": "Organization not found"
}
```

#### `update-organization`

Update an existing organization with full body replacement (PUT semantics).

**Parameters**:

- `id` (string, required): Organization ID
- `name` (string, required): Organization name (1-255 characters)
- `description` (string, optional): Organization description (max 1000 characters)

**Authentication**: Required (JWT token)

**Note**: This is a complete replacement operation - all fields must be provided.

**Example**:

```json
{
  "method": "tools/call",
  "params": {
    "name": "update-organization",
    "arguments": {
      "id": "org-123",
      "name": "Acme Corporation",
      "description": "Global leader in technology solutions"
    }
  }
}
```

**Success Response**:

```json
{
  "success": true,
  "data": {
    "id": "org-123",
    "name": "Acme Corporation",
    "description": "Global leader in technology solutions",
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-20T16:45:00Z"
  }
}
```

#### `delete-organization`

Permanently delete an organization by its unique identifier.

**Parameters**:

- `id` (string, required): Organization ID

**Authentication**: Required (JWT token)

**Warning**: This operation is irreversible. Organizations with dependencies cannot be deleted.

**Example**:

```json
{
  "method": "tools/call",
  "params": {
    "name": "delete-organization",
    "arguments": {
      "id": "org-789"
    }
  }
}
```

**Success Response**:

```json
{
  "success": true,
  "message": "Organization with ID 'org-789' has been successfully deleted."
}
```

**Error Response (Has Dependencies)**:

```json
{
  "success": false,
  "error": "Cannot delete organization with existing dependencies"
}
```

---

### Demo Tool

### `hello`

Queries the `/api/hello` endpoint and returns the API response.

**Parameters**: None

**Example Request** (MCP Inspector or client):

```json
{
  "method": "tools/call",
  "params": {
    "name": "hello",
    "arguments": {}
  }
}
```

**Example Response**:

```json
{
  "content": [
    {
      "type": "text",
      "text": "{\n  \"message\": \"Hello from API\"\n}"
    }
  ]
}
```

## Testing

### Testing with MCP Inspector

Install the MCP Inspector:

```bash
npm install -g @modelcontextprotocol/inspector
```

Test the server with stdio transport:

```bash
pnpm build
mcp-inspector node dist/stdio-entry.js
```

### Testing with HTTP Transport

Start the HTTP server:

```bash
pnpm start:http
```

Test with curl:

```bash
# Health check
curl http://localhost:3000/health

# Call the hello tool
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "hello",
      "arguments": {}
    }
  }'
```

## Error Handling

The server provides clear error messages for common scenarios:

- **`TIMEOUT`**: API request exceeded timeout limit
- **`NETWORK_ERROR`**: Cannot connect to API or DNS resolution failed
- **`API_ERROR`**: API returned an error status (4xx/5xx)
- **`INTERNAL_ERROR`**: Unexpected server error

Example error response:

```json
{
  "content": [
    {
      "type": "text",
      "text": "Error: Request timed out after 5000ms. The API did not respond in time."
    }
  ],
  "isError": true
}
```

## Troubleshooting

### API Connection Issues

If you see `NETWORK_ERROR`:

1. Verify the API is running and accessible
2. Check `API_BASE_URL` in your `.env` file
3. Ensure network connectivity to the API server

### Timeout Issues

If you see `TIMEOUT` errors:

1. Check if the API is responding slowly
2. Increase `API_TIMEOUT` in `.env` (default: 5000ms)
3. Verify the API endpoint is correct

### Build Errors

```bash
# Clean build
rm -rf dist/
pnpm build
```

## Development

Built following the project constitution:

- ✅ **YAGNI** - Build only what's needed
- ✅ **Feature-Based Architecture** - Organized by features
- ✅ **TypeScript + Node.js + pnpm** - Modern stack
- ✅ **SOLID Principles** - Clean architecture
- ✅ **Constants Pattern** - Centralized configuration
- ✅ **KISS** - Keep it simple

### Adding New Tools

1. Create tool implementation in `src/features/mcp-api-server/tools/`
2. Define tool metadata (name, description, schema)
3. Register tool in `src/features/mcp-api-server/server.ts`
4. Rebuild: `pnpm build`

## Deployment

### Prerequisites for Production

- Node.js v22.x LTS installed on target server
- pnpm package manager
- Network access to external API endpoints
- Environment variables configured

### Deployment Steps

1. **Build the project**:

   ```bash
   pnpm install
   pnpm build
   ```

2. **Configure environment**:

   ```bash
   # Create production .env file
   cp .env.example .env

   # Edit .env with production values
   nano .env
   ```

3. **Run with process manager** (recommended):

   Using PM2:

   ```bash
   npm install -g pm2

   # For stdio transport
   pm2 start dist/stdio-entry.js --name mcp-api-server-stdio

   # For HTTP transport
   pm2 start dist/http-entry.js --name mcp-api-server-http --env production

   # Save configuration
   pm2 save
   pm2 startup
   ```

4. **Verify deployment**:

   ```bash
   # Check logs
   pm2 logs mcp-api-server-http

   # Check status
   pm2 status

   # Test health endpoint (HTTP transport)
   curl http://localhost:3000/health
   ```

### Docker Deployment (Optional)

Create `Dockerfile`:

```dockerfile
FROM node:22-alpine

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile --prod

# Copy source and build
COPY . .
RUN pnpm build

# Expose HTTP port
EXPOSE 3000

# Run HTTP transport by default
CMD ["node", "dist/http-entry.js"]
```

Build and run:

```bash
docker build -t mcp-api-server .
docker run -d \
  --name mcp-api-server \
  -p 3000:3000 \
  -e API_BASE_URL=http://10.138.80.113:5000 \
  -e TRANSPORT=http \
  mcp-api-server
```

### Monitoring

Monitor the application in production:

```bash
# With PM2
pm2 monit

# View logs
pm2 logs --lines 100

# Restart if needed
pm2 restart mcp-api-server-http
```

### Health Checks

For HTTP transport, use the `/health` endpoint:

```bash
curl http://localhost:3000/health
```

Expected response:

```json
{
  "status": "healthy",
  "transport": "http"
}
```

### Security Considerations

1. **Environment Variables**: Never commit `.env` files to version control
2. **Network Security**: Restrict API access to trusted networks
3. **Rate Limiting**: Consider adding rate limiting for HTTP transport
4. **HTTPS**: Use a reverse proxy (nginx, caddy) for HTTPS in production

Example nginx configuration:

```nginx
server {
    listen 443 ssl;
    server_name mcp-api.example.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## License

ISC
