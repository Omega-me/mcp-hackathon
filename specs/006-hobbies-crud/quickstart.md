# Quickstart: Hobbies CRUD Operations

**Feature**: 006-hobbies-crud
**Date**: November 20, 2025
**Purpose**: Quick setup and usage guide for Hobbies CRUD MCP tools

## Prerequisites

- Node.js v22.x or later (LTS)
- pnpm package manager
- MCP server running and configured
- Valid JWT authentication token (obtained via login tool)
- API endpoint accessible at `http://10.138.80.113:5000`

## Setup

### 1. Install Dependencies

Dependencies are already installed as part of the main project:

```bash
pnpm install
```

### 2. Build the Project

```bash
pnpm build
```

### 3. Start MCP Server

**For stdio transport** (VS Code extension):

```bash
node dist/stdio-entry.js
```

**For HTTP transport** (testing/development):

```bash
node dist/http-entry.js
```

### 4. Authenticate

Before using hobby tools, you must authenticate:

```typescript
// Use login tool to get JWT token
{
  "tool": "login",
  "params": {
    "email": "your.email@example.com",
    "password": "your_password"
  }
}
```

The JWT token is automatically stored and used for subsequent requests.

---

## Available Tools

### 1. get-all-hobbies

**Purpose**: Retrieve a list of all hobbies

**Parameters**: None (optional future parameters: page, limit, filter)

**Example Request**:

```typescript
{
  "tool": "get-all-hobbies",
  "params": {}
}
```

**Example Response**:

```json
{
  "content": [
    {
      "type": "text",
      "text": "{\"success\":true,\"data\":[{\"id\":\"hobby-123\",\"name\":\"Photography\",\"description\":\"Capturing moments through lens\",\"createdAt\":\"2025-11-20T10:00:00Z\",\"updatedAt\":\"2025-11-20T10:00:00Z\"},{\"id\":\"hobby-456\",\"name\":\"Hiking\",\"description\":null,\"createdAt\":\"2025-11-20T11:00:00Z\",\"updatedAt\":\"2025-11-20T11:00:00Z\"}]}"
    }
  ]
}
```

---

### 2. create-hobby

**Purpose**: Create a new hobby record

**Parameters**:

- `name` (required): Hobby name (1-255 characters, must be unique)
- `description` (optional): Hobby description (max 1000 characters)

**Example Request** (with description):

```typescript
{
  "tool": "create-hobby",
  "params": {
    "name": "Photography",
    "description": "Capturing moments through lens"
  }
}
```

**Example Response**:

```json
{
  "content": [
    {
      "type": "text",
      "text": "{\"success\":true,\"data\":{\"id\":\"hobby-789\",\"name\":\"Photography\",\"description\":\"Capturing moments through lens\",\"createdAt\":\"2025-11-20T10:30:00Z\",\"updatedAt\":\"2025-11-20T10:30:00Z\"}}"
    }
  ]
}
```

**Example Request** (without description):

```typescript
{
  "tool": "create-hobby",
  "params": {
    "name": "Hiking"
  }
}
```

**Example Response**:

```json
{
  "content": [
    {
      "type": "text",
      "text": "{\"success\":true,\"data\":{\"id\":\"hobby-456\",\"name\":\"Hiking\",\"description\":null,\"createdAt\":\"2025-11-20T11:00:00Z\",\"updatedAt\":\"2025-11-20T11:00:00Z\"}}"
    }
  ]
}
```

---

### 3. get-hobby

**Purpose**: Retrieve a specific hobby by ID

**Parameters**:

- `id` (required): Hobby unique identifier

**Example Request**:

```typescript
{
  "tool": "get-hobby",
  "params": {
    "id": "hobby-123"
  }
}
```

**Example Response**:

```json
{
  "content": [
    {
      "type": "text",
      "text": "{\"success\":true,\"data\":{\"id\":\"hobby-123\",\"name\":\"Photography\",\"description\":\"Capturing moments through lens\",\"createdAt\":\"2025-11-20T10:00:00Z\",\"updatedAt\":\"2025-11-20T10:00:00Z\"}}"
    }
  ]
}
```

**Error Response** (Hobby Not Found):

```json
{
  "content": [
    {
      "type": "text",
      "text": "{\"success\":false,\"error\":\"Hobby not found\"}"
    }
  ]
}
```

---

### 4. update-hobby

**Purpose**: Update an existing hobby (full replacement)

**Parameters**:

- `id` (required): Hobby unique identifier
- `name` (required): Updated hobby name (1-255 characters, must be unique)
- `description` (optional): Updated hobby description (max 1000 characters)

**Note**: This is a PUT operation (full replacement). All fields must be provided even if unchanged.

**Example Request**:

```typescript
{
  "tool": "update-hobby",
  "params": {
    "id": "hobby-123",
    "name": "Wildlife Photography",
    "description": "Capturing animals in their natural habitat"
  }
}
```

**Example Response**:

```json
{
  "content": [
    {
      "type": "text",
      "text": "{\"success\":true,\"data\":{\"id\":\"hobby-123\",\"name\":\"Wildlife Photography\",\"description\":\"Capturing animals in their natural habitat\",\"createdAt\":\"2025-11-20T10:00:00Z\",\"updatedAt\":\"2025-11-20T12:30:00Z\"}}"
    }
  ]
}
```

**Example Request** (remove description by omitting it):

```typescript
{
  "tool": "update-hobby",
  "params": {
    "id": "hobby-123",
    "name": "Photography"
  }
}
```

---

### 5. delete-hobby

**Purpose**: Permanently delete a hobby

**Parameters**:

- `id` (required): Hobby unique identifier

**Example Request**:

```typescript
{
  "tool": "delete-hobby",
  "params": {
    "id": "hobby-123"
  }
}
```

**Example Response** (Success):

```json
{
  "content": [
    {
      "type": "text",
      "text": "{\"success\":true,\"message\":\"Hobby deleted successfully\"}"
    }
  ]
}
```

**Error Response** (Hobby Has Dependencies):

```json
{
  "content": [
    {
      "type": "text",
      "text": "{\"success\":false,\"error\":\"Hobby cannot be deleted due to existing dependencies\"}"
    }
  ]
}
```

---

## Common Error Scenarios

### Authentication Required

**Error**:

```json
{
  "success": false,
  "error": "Authentication required. Please login first using the login tool."
}
```

**Solution**: Use the login tool to authenticate before making hobby requests.

---

### Invalid Hobby Name

**Error**:

```json
{
  "success": false,
  "error": "Hobby name is required"
}
```

**Solution**: Provide a non-empty name (1-255 characters).

---

### Duplicate Hobby Name

**Error**:

```json
{
  "success": false,
  "error": "A hobby with this name already exists"
}
```

**Solution**: Choose a different, unique hobby name.

---

### Hobby Not Found

**Error**:

```json
{
  "success": false,
  "error": "Hobby not found"
}
```

**Solution**: Verify the hobby ID is correct using get-all-hobbies tool.

---

### Description Too Long

**Error**:

```json
{
  "success": false,
  "error": "Description must be 1000 characters or less"
}
```

**Solution**: Shorten the description to 1000 characters or less.

---

## Complete Usage Example

### Step-by-Step Hobby Management Workflow

```typescript
// 1. Login (get JWT token)
{
  "tool": "login",
  "params": {
    "email": "user@example.com",
    "password": "password123"
  }
}

// 2. Create first hobby
{
  "tool": "create-hobby",
  "params": {
    "name": "Photography",
    "description": "Taking photos of landscapes"
  }
}
// Response: { id: "hobby-001", name: "Photography", ... }

// 3. Create second hobby
{
  "tool": "create-hobby",
  "params": {
    "name": "Hiking",
    "description": "Exploring nature trails"
  }
}
// Response: { id: "hobby-002", name: "Hiking", ... }

// 4. List all hobbies
{
  "tool": "get-all-hobbies",
  "params": {}
}
// Response: [{ id: "hobby-001", ... }, { id: "hobby-002", ... }]

// 5. Get specific hobby
{
  "tool": "get-hobby",
  "params": {
    "id": "hobby-001"
  }
}
// Response: { id: "hobby-001", name: "Photography", ... }

// 6. Update hobby
{
  "tool": "update-hobby",
  "params": {
    "id": "hobby-001",
    "name": "Nature Photography",
    "description": "Taking photos of wildlife and landscapes"
  }
}
// Response: { id: "hobby-001", name: "Nature Photography", ... }

// 7. Delete hobby
{
  "tool": "delete-hobby",
  "params": {
    "id": "hobby-002"
  }
}
// Response: { success: true, message: "Hobby deleted successfully" }

// 8. Verify deletion
{
  "tool": "get-all-hobbies",
  "params": {}
}
// Response: [{ id: "hobby-001", ... }] (hobby-002 no longer present)
```

---

## Validation Rules Summary

### Hobby Name

- **Required**: Yes
- **Min Length**: 1 character
- **Max Length**: 255 characters
- **Uniqueness**: Must be unique (case-insensitive)
- **Trimming**: Leading/trailing whitespace is automatically removed

### Hobby Description

- **Required**: No (optional)
- **Max Length**: 1000 characters
- **Trimming**: Leading/trailing whitespace is automatically removed

### Hobby ID

- **Required**: Yes (for get/update/delete operations)
- **Format**: Non-empty string
- **Validation**: Must reference an existing hobby

---

## Integration with Other Features

### Associating Hobbies with People

Hobbies can be associated with people through the people-crud feature (when implemented):

```typescript
// Example: Update person to include hobby references
{
  "tool": "update-person",
  "params": {
    "id": "person-123",
    "hobbies": ["hobby-001", "hobby-002"]
    // ... other person fields
  }
}
```

**Note**: The actual implementation of hobby-person associations depends on the people feature design.

---

## Troubleshooting

### Tool Not Found

**Issue**: MCP server doesn't recognize hobby tools

**Solution**:

1. Ensure the project is built: `pnpm build`
2. Restart the MCP server
3. Verify tools are registered in `src/features/mcp-api-server/server.ts`

### Network Errors

**Issue**: "Network error occurred while communicating with API"

**Solution**:

1. Verify API server is running at `http://10.138.80.113:5000`
2. Check network connectivity
3. Verify firewall/proxy settings

### Token Expired

**Issue**: 401 Unauthorized errors after successful login

**Solution**:

1. Login again using the login tool
2. Check token expiration settings
3. Verify token storage is working correctly

---

## API Endpoint Reference

- **Base URL**: `http://10.138.80.113:5000`
- **GET /hobbies** - List all hobbies
- **POST /hobbies** - Create hobby
- **GET /hobbies/{id}** - Get hobby by ID
- **PUT /hobbies/{id}** - Update hobby
- **DELETE /hobbies/{id}** - Delete hobby

All endpoints require JWT authentication via `Authorization: Bearer <token>` header.

---

## Next Steps

1. **Explore Related Features**:

   - People CRUD: Associate hobbies with people
   - Organizations CRUD: Manage organizational contexts
   - JWT Auth: Authentication and token management

2. **Advanced Usage**:

   - Pagination and filtering (when implemented)
   - Bulk operations (when implemented)
   - Search functionality (when implemented)

3. **Development**:
   - Review data-model.md for detailed entity specifications
   - Check plan.md for implementation details
   - Refer to contracts/ for MCP tool schemas

---

## Support

For issues or questions:

1. Check error messages carefully - they provide actionable guidance
2. Review validation rules in this document
3. Verify authentication status using get-token tool
4. Check API server logs for backend issues
5. Refer to spec.md for feature requirements and assumptions
