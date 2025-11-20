# MCP API Server - Testing Guide

## Quick Start

### 1. Build and Start the Server

```bash
# Install dependencies (if not already done)
pnpm install

# Build the project
pnpm build

# Start the HTTP server
pnpm start:http
```

The server will start on **http://localhost:3000**

You should see output like:

```
[INFO] [Main] Starting MCP server with HTTP transport
[INFO] [MCP Server] Creating MCP server: mcp-api-server v1.0.0
[INFO] [MCP Server] Registering tool: hello
[INFO] [HTTP Transport] HTTP transport listening on port 3000
[INFO] [HTTP Transport] MCP endpoint: POST http://localhost:3000/mcp
[INFO] [HTTP Transport] Health check: GET http://localhost:3000/health
```

---

## HTTP Endpoints

### 1. Health Check Endpoint

**Purpose**: Verify the server is running

- **Method**: `GET`
- **URL**: `http://localhost:3000/health`
- **Headers**: None required
- **Body**: None

**Expected Response**:

```json
{
  "status": "healthy",
  "transport": "http"
}
```

**Status Code**: `200 OK`

---

### 2. MCP Endpoint (Tool Invocation)

**Purpose**: Call MCP tools via HTTP

- **Method**: `POST`
- **URL**: `http://localhost:3000/mcp`
- **Headers** (REQUIRED):
  - `Content-Type: application/json`
  - `Accept: application/json, text/event-stream`
- **Body**: JSON-RPC 2.0 format

> ⚠️ **Important**: The `Accept` header must include both `application/json` and `text/event-stream` or you'll get a "Not Acceptable" error.

---

## Testing with Postman

### Test 1: Health Check

1. **Create New Request** in Postman
2. **Set Method**: `GET`
3. **Set URL**: `http://localhost:3000/health`
4. **Click Send**

**Expected Result**:

- Status: `200 OK`
- Body: `{"status":"healthy","transport":"http"}`

---

### Test 2: Call Hello Tool (Success Case)

1. **Create New Request** in Postman
2. **Set Method**: `POST`
3. **Set URL**: `http://localhost:3000/mcp`
4. **Add Headers**:
   - Key: `Content-Type`, Value: `application/json`
   - Key: `Accept`, Value: `application/json, text/event-stream`
5. **Set Body** (select "raw" and "JSON"):

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "hello",
    "arguments": {}
  }
}
```

6. **Click Send**

**Expected Result** (if API is accessible):

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "content": [
      {
        "type": "text",
        "text": "{\n  \"message\": \"Hello from API\",\n  \"timestamp\": \"2025-11-19T...\"\n}"
      }
    ]
  }
}
```

**Status Code**: `200 OK`

---

### Test 3: List Available Tools

1. **Create New Request** in Postman
2. **Set Method**: `POST`
3. **Set URL**: `http://localhost:3000/mcp`
4. **Add Headers**:
   - Key: `Content-Type`, Value: `application/json`
   - Key: `Accept`, Value: `application/json, text/event-stream`
5. **Set Body**:

```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "method": "tools/list",
  "params": {}
}
```

6. **Click Send**

**Expected Result**:

```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "result": {
    "tools": [
      {
        "name": "hello",
        "description": "Query the hello API endpoint at /api/hello to retrieve greeting information",
        "inputSchema": {
          "type": "object",
          "properties": {},
          "additionalProperties": false
        }
      }
    ]
  }
}
```

---

### Test 4: Initialize MCP Session

1. **Create New Request** in Postman
2. **Set Method**: `POST`
3. **Set URL**: `http://localhost:3000/mcp`
4. **Add Headers**:
   - Key: `Content-Type`, Value: `application/json`
   - Key: `Accept`, Value: `application/json, text/event-stream`
5. **Set Body**:

```json
{
  "jsonrpc": "2.0",
  "id": 3,
  "method": "initialize",
  "params": {
    "protocolVersion": "2024-11-05",
    "capabilities": {},
    "clientInfo": {
      "name": "postman-test",
      "version": "1.0.0"
    }
  }
}
```

6. **Click Send**

**Expected Result**:

```json
{
  "jsonrpc": "2.0",
  "id": 3,
  "result": {
    "protocolVersion": "2024-11-05",
    "capabilities": {
      "tools": {}
    },
    "serverInfo": {
      "name": "mcp-api-server",
      "version": "1.0.0"
    }
  }
}
```

---

## Error Testing Scenarios

### Test 5: Network Error (API Unreachable)

**Scenario**: Test what happens when the external API is down

1. **Stop the external API** at `http://10.138.80.113:5000` (or change `API_BASE_URL` in `.env` to an invalid URL)
2. **Call the hello tool** (same as Test 2)

**Expected Result**:

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "content": [
      {
        "type": "text",
        "text": "Error: Cannot connect to API at http://10.138.80.113:5000. The server may be down or unreachable."
      }
    ],
    "isError": true
  }
}
```

---

### Test 6: Timeout Error

**Scenario**: Test timeout handling

1. **Edit `.env` file**: Set `API_TIMEOUT=100` (very short timeout)
2. **Restart the server**: `pnpm start:http`
3. **Call the hello tool** (same as Test 2)

**Expected Result**:

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "content": [
      {
        "type": "text",
        "text": "Error: Request timed out after 100ms. The API did not respond in time."
      }
    ],
    "isError": true
  }
}
```

---

### Test 7: Invalid Tool Name

**Scenario**: Call a tool that doesn't exist

**Request Body**:

```json
{
  "jsonrpc": "2.0",
  "id": 4,
  "method": "tools/call",
  "params": {
    "name": "nonexistent",
    "arguments": {}
  }
}
```

**Expected Result**: Error response indicating tool not found

---

## Postman Collection

### Import Collection (JSON)

Save this as `MCP-API-Server.postman_collection.json`:

```json
{
  "info": {
    "name": "MCP API Server",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Health Check",
      "request": {
        "method": "GET",
        "header": [],
        "url": {
          "raw": "http://localhost:3000/health",
          "protocol": "http",
          "host": ["localhost"],
          "port": "3000",
          "path": ["health"]
        }
      }
    },
    {
      "name": "Initialize MCP Session",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"jsonrpc\": \"2.0\",\n  \"id\": 1,\n  \"method\": \"initialize\",\n  \"params\": {\n    \"protocolVersion\": \"2024-11-05\",\n    \"capabilities\": {},\n    \"clientInfo\": {\n      \"name\": \"postman-test\",\n      \"version\": \"1.0.0\"\n    }\n  }\n}"
        },
        "url": {
          "raw": "http://localhost:3000/mcp",
          "protocol": "http",
          "host": ["localhost"],
          "port": "3000",
          "path": ["mcp"]
        }
      }
    },
    {
      "name": "List Tools",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          },
          {
            "key": "Accept",
            "value": "application/json, text/event-stream"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"jsonrpc\": \"2.0\",\n  \"id\": 2,\n  \"method\": \"tools/list\",\n  \"params\": {}\n}"
        },
        "url": {
          "raw": "http://localhost:3000/mcp",
          "protocol": "http",
          "host": ["localhost"],
          "port": "3000",
          "path": ["mcp"]
        }
      }
    },
    {
      "name": "Call Hello Tool",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          },
          {
            "key": "Accept",
            "value": "application/json, text/event-stream"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"jsonrpc\": \"2.0\",\n  \"id\": 3,\n  \"method\": \"tools/call\",\n  \"params\": {\n    \"name\": \"hello\",\n    \"arguments\": {}\n  }\n}"
        },
        "url": {
          "raw": "http://localhost:3000/mcp",
          "protocol": "http",
          "host": ["localhost"],
          "port": "3000",
          "path": ["mcp"]
        }
      }
    }
  ]
}
```

**To Import**:

1. Open Postman
2. Click **Import** button
3. Select the JSON file
4. All requests will be added to your collection

---

## Troubleshooting

### Server Won't Start

**Check if port 3000 is already in use**:

```bash
# Windows
netstat -ano | findstr :3000

# If port is in use, change it in .env
HTTP_PORT=3001
```

### Connection Refused

**Verify server is running**:

```bash
# Check server logs
# Should see "HTTP transport listening on port 3000"
```

### API Not Responding

**Check external API**:

```bash
# Test the external API directly
curl http://10.138.80.113:5000/api/hello
```

If the API is not accessible, you'll get network errors in the MCP responses (this is expected behavior - the error handling is working correctly).

### "Not Acceptable" Error

**Error**: `Client must accept both application/json and text/event-stream`

**Solution**: Add the required Accept header:

- Key: `Accept`
- Value: `application/json, text/event-stream`

This is required by the MCP protocol for HTTP transport.

### Invalid JSON Error

**Verify JSON is valid**:

- Use Postman's JSON validator (it will highlight syntax errors)
- Ensure both headers are set:
  - `Content-Type: application/json`
  - `Accept: application/json, text/event-stream`

---

## Environment Configuration

Current API endpoint: `http://10.138.80.113:5000/api/hello`

To change the API endpoint:

1. Edit `.env` file:
   ```
   API_BASE_URL=http://your-api-server:port
   API_TIMEOUT=5000
   ```
2. Restart the server: `pnpm start:http`

---

## Next Steps

1. ✅ Test Health Check
2. ✅ Test Initialize
3. ✅ Test List Tools
4. ✅ Test Hello Tool (verify external API is accessible)
5. ✅ Test Error Scenarios
6. 📝 Document actual API responses from your environment

---

## Server Logs

Watch server logs for debugging:

- Successful requests show: `[INFO] [API Client] GET http://...`
- Errors show: `[ERROR] [API Client] GET http://... - error details`
- Tool executions show: `[INFO] [Hello Tool] Executing hello tool`

All requests are logged for troubleshooting!
