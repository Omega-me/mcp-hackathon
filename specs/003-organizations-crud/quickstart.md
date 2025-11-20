# Quickstart Guide: Organizations CRUD Operations

**Feature**: Organizations CRUD Operations  
**Branch**: `003-organizations-crud`  
**Last Updated**: November 20, 2025

## Overview

This feature provides five MCP tools for complete CRUD (Create, Read, Update, Delete) operations on organizations through the `/organizations` API endpoint. All operations require JWT authentication.

## Prerequisites

1. **Authentication Required**: You must be logged in before using any organization tools
2. **MCP Server Running**: The server must be running in either stdio or HTTP mode
3. **API Access**: The external API at `http://10.138.80.113:5000` must be accessible

## Quick Setup

### 1. Start the MCP Server

**For stdio mode**:

```bash
pnpm run dev:stdio
```

**For HTTP mode**:

```bash
pnpm run dev:http
```

### 2. Authenticate

Before using organization tools, you must login:

```json
{
  "tool": "login",
  "parameters": {
    "email": "user@example.com",
    "password": "yourpassword"
  }
}
```

Or create a new account:

```json
{
  "tool": "signup",
  "parameters": {
    "email": "newuser@example.com",
    "password": "securepassword"
  }
}
```

## Tool Usage

### 1. Get All Organizations

Retrieve a list of all organizations you have permission to view.

**Tool Name**: `get-all-organizations`

**Parameters**: None (currently)

**Example**:

```json
{
  "tool": "get-all-organizations",
  "parameters": {}
}
```

**Response**:

```json
{
  "data": [
    {
      "id": "org-123",
      "name": "Acme Corporation",
      "description": "Leading provider of innovative solutions",
      "createdAt": "2025-11-20T10:00:00Z",
      "updatedAt": "2025-11-20T10:00:00Z"
    },
    {
      "id": "org-456",
      "name": "TechStart Inc",
      "description": "Startup focused on AI technologies",
      "createdAt": "2025-11-19T15:30:00Z",
      "updatedAt": "2025-11-20T09:15:00Z"
    }
  ]
}
```

**Future Enhancement**: This tool will support pagination and filtering parameters in a future release.

---

### 2. Create Organization

Create a new organization with a name and optional description.

**Tool Name**: `create-organization`

**Parameters**:

- `name` (required): Organization name (1-255 characters, must be unique)
- `description` (optional): Organization description

**Example 1**: With name and description

```json
{
  "tool": "create-organization",
  "parameters": {
    "name": "Acme Corporation",
    "description": "Leading provider of innovative solutions"
  }
}
```

**Example 2**: With name only

```json
{
  "tool": "create-organization",
  "parameters": {
    "name": "TechStart Inc"
  }
}
```

**Response**:

```json
{
  "data": {
    "id": "org-789",
    "name": "Acme Corporation",
    "description": "Leading provider of innovative solutions",
    "createdAt": "2025-11-20T10:00:00Z",
    "updatedAt": "2025-11-20T10:00:00Z"
  }
}
```

**Common Errors**:

- `409 Conflict`: Organization name already exists
- `400 Bad Request`: Name is missing or exceeds 255 characters

---

### 3. Get Organization by ID

Retrieve detailed information about a specific organization.

**Tool Name**: `get-organization`

**Parameters**:

- `id` (required): Organization unique identifier

**Example**:

```json
{
  "tool": "get-organization",
  "parameters": {
    "id": "org-123"
  }
}
```

**Response**:

```json
{
  "data": {
    "id": "org-123",
    "name": "Acme Corporation",
    "description": "Leading provider of innovative solutions",
    "createdAt": "2025-11-20T10:00:00Z",
    "updatedAt": "2025-11-20T10:00:00Z"
  }
}
```

**Common Errors**:

- `404 Not Found`: Organization ID doesn't exist
- `403 Forbidden`: Insufficient permissions to view this organization

---

### 4. Update Organization

Update an existing organization (full replacement with PUT method).

**Tool Name**: `update-organization`

**Parameters**:

- `id` (required): Organization unique identifier
- `name` (required): New organization name (1-255 characters)
- `description` (optional): New organization description

**Important**: This uses PUT method (full replacement). You must provide all fields, even if only updating one. To keep existing values, first fetch the organization, then submit the update with your changes.

**Example 1**: Update name and description

```json
{
  "tool": "update-organization",
  "parameters": {
    "id": "org-123",
    "name": "Acme Corporation Ltd",
    "description": "Global leader in innovative solutions and technologies"
  }
}
```

**Example 2**: Update only name (provide existing description)

```json
{
  "tool": "update-organization",
  "parameters": {
    "id": "org-456",
    "name": "TechStart International",
    "description": "Startup focused on AI technologies"
  }
}
```

**Response**:

```json
{
  "data": {
    "id": "org-123",
    "name": "Acme Corporation Ltd",
    "description": "Global leader in innovative solutions and technologies",
    "createdAt": "2025-11-20T10:00:00Z",
    "updatedAt": "2025-11-20T14:30:00Z"
  }
}
```

**Common Errors**:

- `404 Not Found`: Organization ID doesn't exist
- `409 Conflict`: New name already used by another organization
- `400 Bad Request`: Name is missing or invalid

---

### 5. Delete Organization

Permanently delete an organization. This action cannot be undone.

**Tool Name**: `delete-organization`

**Parameters**:

- `id` (required): Organization unique identifier

**Example**:

```json
{
  "tool": "delete-organization",
  "parameters": {
    "id": "org-789"
  }
}
```

**Response**:

```json
{
  "success": true,
  "message": "Organization deleted successfully"
}
```

**Common Errors**:

- `404 Not Found`: Organization ID doesn't exist
- `409 Conflict`: Organization has dependencies (e.g., active projects or users)
- `403 Forbidden`: Insufficient permissions to delete this organization

---

## Common Workflows

### Workflow 1: Create and Retrieve Organization

```bash
# 1. Login
tool: login
params: { email: "user@example.com", password: "pass123" }

# 2. Create organization
tool: create-organization
params: { name: "My Company", description: "My company description" }
# Response includes: { id: "org-new-123", ... }

# 3. Retrieve the created organization
tool: get-organization
params: { id: "org-new-123" }
```

### Workflow 2: Update Organization Name

```bash
# 1. Login (if not already authenticated)
tool: login
params: { email: "user@example.com", password: "pass123" }

# 2. Get current organization data
tool: get-organization
params: { id: "org-123" }
# Response: { id: "org-123", name: "Old Name", description: "Current desc" }

# 3. Update with new name (include existing description)
tool: update-organization
params: {
  id: "org-123",
  name: "New Name",
  description: "Current desc"  # Must include existing value
}
```

### Workflow 3: List and Delete Organization

```bash
# 1. Login
tool: login
params: { email: "user@example.com", password: "pass123" }

# 2. Get all organizations to find the one to delete
tool: get-all-organizations
params: {}

# 3. Delete specific organization
tool: delete-organization
params: { id: "org-456" }

# 4. Verify deletion
tool: get-all-organizations
params: {}
# Organization should no longer appear in list
```

---

## Error Handling

All tools return standard error responses:

```json
{
  "error": {
    "message": "Human-readable error message",
    "code": "ERROR_CODE",
    "details": {
      /* Optional additional context */
    }
  }
}
```

### Common Error Codes

| Code               | Description                      | Solution                               |
| ------------------ | -------------------------------- | -------------------------------------- |
| `AUTH_REQUIRED`    | No authentication token          | Use `login` tool first                 |
| `INVALID_ID`       | Invalid organization ID format   | Check ID is non-empty string           |
| `NOT_FOUND`        | Organization doesn't exist       | Verify ID with `get-all-organizations` |
| `DUPLICATE_NAME`   | Name already exists              | Choose a different name                |
| `HAS_DEPENDENCIES` | Cannot delete (has dependencies) | Remove dependencies first              |
| `VALIDATION_ERROR` | Invalid input parameters         | Check required fields and constraints  |

---

## Tips and Best Practices

1. **Always Login First**: All organization tools require authentication
2. **Check Token**: Use `get-token` tool to verify you're authenticated
3. **Unique Names**: Organization names must be unique - check with `get-all-organizations` first
4. **PUT Updates**: Remember to provide all fields when updating (full replacement)
5. **Verify After Changes**: Use `get-organization` to confirm changes were applied
6. **Handle Errors**: Check for error responses and handle them appropriately
7. **Future-Proof**: Get-all tool schema includes pagination params for future use

---

## Troubleshooting

### "Authentication required" Error

**Problem**: Not logged in or token expired  
**Solution**: Call `login` tool before using organization tools

### "Organization not found" Error

**Problem**: Invalid or deleted organization ID  
**Solution**: Use `get-all-organizations` to get valid IDs

### "Organization with this name already exists" Error

**Problem**: Duplicate organization name  
**Solution**: Choose a different name or update the existing organization

### "Cannot delete organization with existing dependencies" Error

**Problem**: Organization has related entities (projects, users, etc.)  
**Solution**: Remove or reassign dependencies before deleting

---

## Development Notes

- **Base API URL**: `http://10.138.80.113:5000`
- **Endpoint**: `/organizations` or `/organizations/{id}`
- **Authentication**: JWT Bearer token in Authorization header
- **Validation**: Zod schemas validate inputs before API calls
- **Error Translation**: API errors are translated to user-friendly messages

---

## Next Steps

After familiarizing yourself with these tools, you can:

1. Integrate organization tools into your workflows
2. Build automation scripts using the MCP tools
3. Extend functionality (pagination, filtering) when requirements emerge
4. Monitor usage patterns to optimize performance

For implementation details, see:

- [Feature Specification](./spec.md)
- [Implementation Plan](./plan.md)
- [Data Model](./data-model.md)
- [Tool Contracts](./contracts/)
