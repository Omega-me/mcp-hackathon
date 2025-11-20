# Quickstart: People CRUD Operations

**Feature**: 005-peoples-crud
**Date**: November 20, 2025
**Purpose**: Quick setup and usage guide for People CRUD MCP tools

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

Before using people tools, you must authenticate:

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

### 1. get-all-people

**Purpose**: Retrieve a list of all people

**Parameters**: None (optional future parameters: page, limit, filter)

**Example Request**:

```typescript
{
  "tool": "get-all-people",
  "params": {}
}
```

**Example Response**:

```json
{
  "content": [
    {
      "type": "text",
      "text": "{\"success\":true,\"data\":[{\"id\":\"123e4567-e89b-12d3-a456-426614174000\",\"firstName\":\"John\",\"lastName\":\"Doe\",\"email\":\"john.doe@example.com\",\"teamId\":42,\"createdAt\":\"2025-11-20T10:00:00Z\",\"updatedAt\":\"2025-11-20T10:00:00Z\"}]}"
    }
  ]
}
```

---

### 2. create-person

**Purpose**: Create a new person record

**Parameters**:

- `firstName` (required): Person's first name (1-255 characters)
- `lastName` (required): Person's last name (1-255 characters)
- `email` (required): Valid email address (must be unique)
- `teamId` (optional): Team ID (positive integer)

**Example Request**:

```typescript
{
  "tool": "create-person",
  "params": {
    "firstName": "Jane",
    "lastName": "Smith",
    "email": "jane.smith@example.com",
    "teamId": 42
  }
}
```

**Example Response**:

```json
{
  "content": [
    {
      "type": "text",
      "text": "{\"success\":true,\"data\":{\"id\":\"987f6543-e21b-45d6-b789-426614174111\",\"firstName\":\"Jane\",\"lastName\":\"Smith\",\"email\":\"jane.smith@example.com\",\"teamId\":42,\"createdAt\":\"2025-11-20T10:30:00Z\",\"updatedAt\":\"2025-11-20T10:30:00Z\"}}"
    }
  ]
}
```

**Without teamId**:

```typescript
{
  "tool": "create-person",
  "params": {
    "firstName": "Bob",
    "lastName": "Johnson",
    "email": "bob.johnson@example.com"
  }
}
```

---

### 3. get-person

**Purpose**: Retrieve a specific person by ID

**Parameters**:

- `id` (required): Person's unique identifier

**Example Request**:

```typescript
{
  "tool": "get-person",
  "params": {
    "id": "987f6543-e21b-45d6-b789-426614174111"
  }
}
```

**Example Response**:

```json
{
  "content": [
    {
      "type": "text",
      "text": "{\"success\":true,\"data\":{\"id\":\"987f6543-e21b-45d6-b789-426614174111\",\"firstName\":\"Jane\",\"lastName\":\"Smith\",\"email\":\"jane.smith@example.com\",\"teamId\":42,\"createdAt\":\"2025-11-20T10:30:00Z\",\"updatedAt\":\"2025-11-20T10:30:00Z\"}}"
    }
  ]
}
```

---

### 4. update-person

**Purpose**: Update an existing person (full replacement)

**Parameters**:

- `id` (required): Person's unique identifier
- `firstName` (required): Updated first name (1-255 characters)
- `lastName` (required): Updated last name (1-255 characters)
- `email` (required): Updated email address (valid format, unique)
- `teamId` (optional): Updated team ID (positive integer)

**Example Request**:

```typescript
{
  "tool": "update-person",
  "params": {
    "id": "987f6543-e21b-45d6-b789-426614174111",
    "firstName": "Jane",
    "lastName": "Smith-Johnson",
    "email": "jane.johnson@example.com",
    "teamId": 43
  }
}
```

**Example Response**:

```json
{
  "content": [
    {
      "type": "text",
      "text": "{\"success\":true,\"data\":{\"id\":\"987f6543-e21b-45d6-b789-426614174111\",\"firstName\":\"Jane\",\"lastName\":\"Smith-Johnson\",\"email\":\"jane.johnson@example.com\",\"teamId\":43,\"createdAt\":\"2025-11-20T10:30:00Z\",\"updatedAt\":\"2025-11-20T11:15:00Z\"}}"
    }
  ]
}
```

**Note**: All fields except teamId are required. PUT operation replaces the entire resource.

---

### 5. delete-person

**Purpose**: Permanently delete a person record

**Parameters**:

- `id` (required): Person's unique identifier

**Example Request**:

```typescript
{
  "tool": "delete-person",
  "params": {
    "id": "987f6543-e21b-45d6-b789-426614174111"
  }
}
```

**Example Response**:

```json
{
  "content": [
    {
      "type": "text",
      "text": "{\"success\":true,\"message\":\"Person deleted successfully\"}"
    }
  ]
}
```

**Warning**: This operation is irreversible. The person record will be permanently removed.

---

## Common Workflows

### Workflow 1: Create and Verify Person

```typescript
// Step 1: Authenticate
{ "tool": "login", "params": { "email": "user@example.com", "password": "pass123" } }

// Step 2: Create person
{
  "tool": "create-person",
  "params": {
    "firstName": "Alice",
    "lastName": "Williams",
    "email": "alice.williams@example.com",
    "teamId": 10
  }
}
// Response includes person ID: "abc123..."

// Step 3: Verify creation
{ "tool": "get-person", "params": { "id": "abc123..." } }

// Step 4: List all to confirm
{ "tool": "get-all-people", "params": {} }
```

---

### Workflow 2: Update Person Information

```typescript
// Step 1: Get current person data
{ "tool": "get-person", "params": { "id": "abc123..." } }

// Step 2: Update with new information
{
  "tool": "update-person",
  "params": {
    "id": "abc123...",
    "firstName": "Alice",
    "lastName": "Williams-Brown",
    "email": "alice.brown@example.com",
    "teamId": 15
  }
}

// Step 3: Verify update
{ "tool": "get-person", "params": { "id": "abc123..." } }
```

---

### Workflow 3: Delete Person

```typescript
// Step 1: Verify person exists
{ "tool": "get-person", "params": { "id": "abc123..." } }

// Step 2: Delete person
{ "tool": "delete-person", "params": { "id": "abc123..." } }

// Step 3: Confirm deletion (should return not found)
{ "tool": "get-person", "params": { "id": "abc123..." } }
```

---

## Error Handling

### Common Errors

#### Authentication Required

```json
{
  "success": false,
  "error": "Authentication required. Please login first using the login tool."
}
```

**Solution**: Use the login tool to obtain a JWT token.

---

#### Invalid Email Format

```json
{
  "success": false,
  "error": "Invalid email format"
}
```

**Solution**: Provide a valid email address (e.g., user@example.com).

---

#### Person Not Found

```json
{
  "success": false,
  "error": "Person not found"
}
```

**Solution**: Verify the person ID is correct. Use get-all-people to list available people.

---

#### Duplicate Email

```json
{
  "success": false,
  "error": "A person with this email already exists"
}
```

**Solution**: Email addresses must be unique. Use a different email or update the existing person.

---

#### Validation Error

```json
{
  "success": false,
  "error": "First name is required"
}
```

**Solution**: Ensure all required fields are provided and meet validation constraints.

---

## Validation Rules Summary

| Field     | Required                | Type   | Constraints                         |
| --------- | ----------------------- | ------ | ----------------------------------- |
| firstName | Yes (create/update)     | string | 1-255 characters, trimmed           |
| lastName  | Yes (create/update)     | string | 1-255 characters, trimmed           |
| email     | Yes (create/update)     | string | Valid email format, unique, trimmed |
| teamId    | No                      | number | Positive integer                    |
| id        | Yes (get/update/delete) | string | Non-empty, valid UUID               |

---

## Testing

### Manual Testing Checklist

- [ ] Authenticate and obtain JWT token
- [ ] List all people (empty or existing)
- [ ] Create person with all fields
- [ ] Create person without teamId
- [ ] Verify created person appears in list
- [ ] Get person by ID
- [ ] Update person information
- [ ] Verify updated person reflects changes
- [ ] Attempt to create duplicate email (should fail)
- [ ] Delete person
- [ ] Verify deleted person no longer exists
- [ ] Test error cases (missing fields, invalid email, etc.)

---

## Troubleshooting

### Issue: "Authentication required" error

**Cause**: No JWT token stored or token expired

**Solution**:

```typescript
{ "tool": "login", "params": { "email": "user@example.com", "password": "pass" } }
```

---

### Issue: "Network error occurred"

**Cause**: API endpoint unreachable

**Solution**:

- Verify API server is running at `http://10.138.80.113:5000`
- Check network connectivity
- Verify firewall settings

---

### Issue: "Person not found"

**Cause**: Invalid person ID or person deleted

**Solution**:

- Use get-all-people to list available people
- Verify the correct ID is being used
- Check if person was deleted

---

### Issue: Email validation fails

**Cause**: Invalid email format

**Solution**:

- Ensure email follows format: username@domain.tld
- Remove whitespace
- Use lowercase (recommended)

---

## Integration with VS Code

### MCP Configuration

Add to `.vscode/mcp.json`:

```json
{
  "servers": {
    "tse-test": {
      "command": "node",
      "args": ["dist/stdio-entry.js"],
      "type": "stdio"
    }
  }
}
```

### Using in VS Code

1. Open Command Palette (Ctrl/Cmd + Shift + P)
2. Type "MCP" to see available tools
3. Select desired people tool
4. Enter parameters in JSON format
5. View results in output panel

---

## API Reference

**Base URL**: `http://10.138.80.113:5000`

**Authentication**: Bearer JWT token in Authorization header

**Endpoints**:

- `GET /people` - List all people
- `POST /people` - Create person
- `GET /people/{id}` - Get person by ID
- `PUT /people/{id}` - Update person
- `DELETE /people/{id}` - Delete person

**For detailed API contracts**, see the `contracts/` directory.

---

## Next Steps

1. **Explore Related Features**:

   - Organizations CRUD (`003-organizations-crud`)
   - JWT Authentication (`002-jwt-auth`)

2. **Advanced Usage**:

   - Batch operations (future enhancement)
   - Filtering and search (future enhancement)
   - Pagination (future enhancement)

3. **Development**:
   - Review source code in `src/features/people-crud/`
   - Examine tool implementations
   - Understand validation schemas

---

## Support

**Documentation**:

- Feature Specification: `specs/005-peoples-crud/spec.md`
- Implementation Plan: `specs/005-peoples-crud/plan.md`
- Data Model: `specs/005-peoples-crud/data-model.md`
- Research: `specs/005-peoples-crud/research.md`

**Source Code**:

- Feature Directory: `src/features/people-crud/`
- Tool Handlers: `src/features/people-crud/tools/`
- Validation Schemas: `src/features/people-crud/schemas/`

---

**Quickstart Complete**: You're ready to use the People CRUD tools!
