# Research: Organizations CRUD Operations

**Feature**: Organizations CRUD Operations  
**Date**: November 20, 2025  
**Phase**: Phase 0 - Research & Technical Decisions

## Research Topics

### 1. Zod Schema Validation Patterns for MCP Tools

**Decision**: Use Zod for runtime validation of MCP tool parameters and API payloads

**Rationale**:

- Already used in existing features (hello-tool, auth tools)
- Provides type-safe validation with TypeScript inference
- Excellent error messages for invalid inputs
- Integrates seamlessly with MCP SDK tool definitions
- Zero additional dependencies (already installed)

**Implementation Pattern**:

```typescript
// Define schemas for validation
const OrganizationIdSchema = z.object({
  id: z.string().min(1, "Organization ID is required"),
});

const CreateOrganizationSchema = z.object({
  name: z.string().min(1, "Organization name is required").max(255),
  description: z.string().optional(),
});

const UpdateOrganizationSchema = z.object({
  id: z.string().min(1, "Organization ID is required"),
  name: z.string().min(1, "Organization name is required").max(255),
  description: z.string().optional(),
});

// Future-ready: pagination and filtering (not implemented yet)
const GetAllOrganizationsSchema = z.object({
  page: z.number().int().positive().optional(),
  limit: z.number().int().positive().max(100).optional(),
  filter: z.string().optional(),
});

// In tool handler
const parsed = CreateOrganizationSchema.parse(params);
```

**Alternatives Considered**:

- Manual validation: Rejected - verbose, error-prone, no type inference
- Joi: Rejected - additional dependency, less TypeScript integration
- Class-validator: Rejected - requires decorators, overkill for simple validation

---

### 2. MCP Tool Parameter Descriptions for LLM Consumption

**Decision**: Provide detailed, LLM-friendly descriptions in tool schemas with explicit field types, constraints, and examples

**Rationale**:

- LLMs need clear, natural language descriptions to understand tool usage
- Type information alone is insufficient for semantic understanding
- Examples help LLMs construct valid requests
- Following MCP SDK best practices from existing tools

**Implementation Pattern**:

```typescript
// Tool definition with rich descriptions
{
  name: "create-organization",
  description: "Create a new organization with a name and optional description. Returns the created organization with its assigned ID.",
  inputSchema: {
    type: "object",
    properties: {
      name: {
        type: "string",
        description: "Name of the organization (required, 1-255 characters). Must be unique across all organizations."
      },
      description: {
        type: "string",
        description: "Optional description of the organization. Provide context about the organization's purpose or role."
      }
    },
    required: ["name"]
  }
}

// For get-all with future extensibility
{
  name: "get-all-organizations",
  description: "Retrieve a list of all organizations. Future support for pagination and filtering will be added.",
  inputSchema: {
    type: "object",
    properties: {
      // Reserved for future use - not implemented yet
      // page: { type: "number", description: "Page number for pagination (future feature)" },
      // limit: { type: "number", description: "Number of results per page (future feature)" },
      // filter: { type: "string", description: "Filter criteria (future feature)" }
    },
    required: []
  }
}
```

**Best Practices from Existing Tools**:

- Start descriptions with action verbs
- Explain what data is returned
- Specify constraints (min/max length, required fields)
- Note any dependencies (e.g., "requires authentication")
- Include examples in comments when helpful
- Document future extensibility points without implementing them

**Alternatives Considered**:

- Minimal descriptions: Rejected - LLMs need semantic context
- Code comments only: Rejected - not accessible to LLM at runtime
- Separate documentation: Rejected - descriptions should be co-located with schema

---

### 3. REST API Integration Patterns

**Decision**: Reuse existing `api-client` service from `mcp-api-server` feature for all HTTP calls

**Rationale**:

- DRY principle - existing service handles auth token injection, error handling, logging
- Consistent error handling across all API calls
- Already configured for base URL and timeouts
- Supports all HTTP methods needed (GET, POST, PUT, DELETE)

**Integration Pattern**:

```typescript
// In tool handlers - import shared api-client
import { apiClient } from "../../mcp-api-server/services/api-client";
import { getStoredToken } from "../../jwt-auth/services/token-storage";

// Get all organizations
const token = getStoredToken();
const response = await apiClient.get("/organizations", {
  headers: { Authorization: `Bearer ${token}` },
});

// Create organization
const response = await apiClient.post(
  "/organizations",
  {
    name: params.name,
    description: params.description,
  },
  {
    headers: { Authorization: `Bearer ${token}` },
  }
);

// Get by ID
const response = await apiClient.get(`/organizations/${params.id}`, {
  headers: { Authorization: `Bearer ${token}` },
});

// Update (PUT with full body)
const response = await apiClient.put(
  `/organizations/${params.id}`,
  {
    name: params.name,
    description: params.description,
  },
  {
    headers: { Authorization: `Bearer ${token}` },
  }
);

// Delete
const response = await apiClient.delete(`/organizations/${params.id}`, {
  headers: { Authorization: `Bearer ${token}` },
});
```

**Error Handling**:

- 401 Unauthorized → "Authentication required. Please login first."
- 403 Forbidden → "Access denied. Insufficient permissions."
- 404 Not Found → "Organization not found with ID: {id}"
- 409 Conflict → "Organization with this name already exists"
- 422 Validation Error → Return specific validation errors from API
- 500 Server Error → "Server error occurred. Please try again."

**Alternatives Considered**:

- Create new HTTP client: Rejected - violates DRY, unnecessary duplication
- Use fetch directly: Rejected - missing error handling, auth injection, logging
- Axios instance per tool: Rejected - inconsistent configuration

---

### 4. Authentication Token Management

**Decision**: Use existing `token-storage` service from `jwt-auth` feature to retrieve tokens

**Rationale**:

- Centralized token management already implemented
- Consistent with other protected endpoints
- Single source of truth for authentication state
- Proper error handling when token is missing

**Implementation Pattern**:

```typescript
import { getStoredToken } from "../../jwt-auth/services/token-storage";

// In each tool handler
const token = getStoredToken();
if (!token) {
  throw new Error(
    "Authentication required. Please login using the login tool first."
  );
}

// Include in request headers
headers: {
  Authorization: `Bearer ${token}`;
}
```

**Alternatives Considered**:

- Pass token as parameter to each tool: Rejected - poor UX, repetitive
- Global state management: Rejected - token-storage already provides this
- Environment variables: Rejected - doesn't support dynamic login/logout

---

### 5. PUT vs PATCH for Updates

**Decision**: Use PUT method for full resource replacement as specified

**Rationale**:

- User requirement explicitly specifies PUT
- API contract requires full body (name and description)
- Semantic correctness: PUT replaces entire resource
- Simpler implementation: no partial update logic needed

**Implementation**:

```typescript
// PUT replaces the entire organization
// Both name and description must be provided even if unchanged
const response = await apiClient.put(`/organizations/${params.id}`, {
  name: params.name, // Required
  description: params.description, // Required (can be empty string)
});
```

**Validation**:

- Both name and description must be present in update requests
- Frontend/LLM must fetch current values if doing partial update
- Clear error if required fields are missing

**Alternatives Considered**:

- PATCH for partial updates: Rejected - not in user requirements
- Support both PUT and PATCH: Rejected - YAGNI, adds complexity
- Default values for missing fields: Rejected - unclear semantics

---

## Technology Stack Summary

**Runtime Validation**: Zod (already installed)
**HTTP Client**: Existing api-client service (axios-based)
**Authentication**: Existing token-storage service
**MCP SDK**: @modelcontextprotocol/sdk (already installed)
**TypeScript**: Strict mode with full type inference from Zod schemas

**No New Dependencies Required** ✅

---

## Implementation Decisions Summary

| Decision               | Choice                 | Rationale                                     |
| ---------------------- | ---------------------- | --------------------------------------------- |
| Validation Library     | Zod                    | Already used, type-safe, great errors         |
| HTTP Client            | Reuse api-client       | DRY, consistent error handling                |
| Auth Token             | Reuse token-storage    | Centralized, already implemented              |
| Update Method          | PUT (full replacement) | User requirement, simpler semantics           |
| Parameter Descriptions | Detailed, LLM-friendly | Better LLM comprehension and usage            |
| Future Extensibility   | Reserved schema fields | Ready for pagination without breaking changes |

---

## Open Questions Resolved

**Q**: Should we implement pagination now?  
**A**: No - YAGNI principle. Define schema to accept parameters but don't implement until needed.

**Q**: How to handle missing authentication token?  
**A**: Throw clear error message directing user to login tool.

**Q**: Should description be required or optional?  
**A**: Optional for create, but must be provided (can be empty) for PUT update.

**Q**: What HTTP status codes to expect?  
**A**: Standard REST codes - 200 OK, 201 Created, 204 No Content, 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 409 Conflict, 422 Validation Error, 500 Server Error.

**Q**: Should we validate organization ID format?  
**A**: Yes - ensure non-empty string. Specific format validation depends on API (UUID, integer, etc.) - handle in Zod schema.
