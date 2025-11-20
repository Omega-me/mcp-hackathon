# Research: Hobbies CRUD Operations

**Feature**: 006-hobbies-crud
**Date**: November 20, 2025
**Purpose**: Document research findings and technical decisions for Hobbies CRUD implementation

## Research Questions & Findings

### 1. Hobby Name Validation with Zod

**Question**: What is the proper Zod pattern for non-empty string validation?

**Research Approach**:

- Reviewed Zod documentation
- Examined existing validation patterns in people-crud and organizations-crud
- Investigated string validation best practices

**Finding**:
Zod provides `.min()` and `.trim()` methods for string validation:

```typescript
z.string()
  .min(1, "Name is required")
  .max(255, "Name must be 255 characters or less")
  .trim();
```

**Rationale**:

- `.min(1)` ensures non-empty strings
- `.trim()` removes leading/trailing whitespace before validation
- `.max()` enforces maximum length constraints
- Provides clear error messages
- Consistent with Zod best practices

**Decision**: Use `z.string().min(1).max(255).trim()` for hobby name validation

**Example Usage**:

```typescript
name: z.string()
  .min(1, "Hobby name is required")
  .max(255, "Hobby name must be 255 characters or less")
  .trim();
```

---

### 2. MCP Tool Implementation Patterns

**Question**: What are the established patterns for MCP tool metadata and handlers in this codebase?

**Research Approach**:

- Analyzed people-crud tool implementations
- Reviewed organizations-crud tool patterns
- Examined jwt-auth tool patterns
- Examined mcp-api-server tool registration

**Findings**:

**Tool Structure Pattern** (from people-crud and organizations-crud):

```typescript
// 1. Import dependencies
import { z } from "zod";
import axios from "axios";
import { getToken } from "../../jwt-auth/services/token-storage.js";
import { createLogger } from "../../../shared/utils/logger.js";

// 2. Define or import Zod schema
export const toolSchema = z.object({...});

// 3. Export tool metadata
export const toolMetadata = {
  name: "tool-name",
  description: "Detailed LLM-friendly description...",
  schema: toolSchema,
};

// 4. Export async handler function
export async function toolHandler(params: unknown) {
  // Validate params
  // Get auth token
  // Make API request
  // Handle response/errors
  // Return MCP response format
}
```

**Key Patterns**:

- Use kebab-case for tool names (e.g., "get-all-hobbies", "create-hobby")
- Provide verbose descriptions (3-4 sentences minimum)
- Include constraints and requirements in descriptions
- Mention authentication requirements explicitly
- Log operations using createLogger
- Return JSON in text content blocks with proper formatting
- Handle auth, validation, and API errors separately with clear messages
- Use existing api-client service for HTTP requests

**Decision**: Follow exact pattern from people-crud for consistency and maintainability

---

### 3. API Request/Response Structure

**Question**: What is the exact structure for Hobby API requests and responses?

**Research Approach**:

- User specification review
- Examination of existing CRUD patterns in codebase

**Findings**:

**User-Specified Request Body** (for create and update):

```json
{
  "name": "string",
  "description": "string"
}
```

**Inferred Response Structures** (based on people-crud and organizations-crud patterns):

**GET /hobbies Response**:

```json
{
  "data": [
    {
      "id": "string",
      "name": "string",
      "description": "string",
      "createdAt": "2025-11-20T10:00:00.000Z",
      "updatedAt": "2025-11-20T10:00:00.000Z"
    }
  ]
}
```

**POST /hobbies Response** (201 Created):

```json
{
  "data": {
    "id": "string",
    "name": "string",
    "description": "string",
    "createdAt": "2025-11-20T10:00:00.000Z",
    "updatedAt": "2025-11-20T10:00:00.000Z"
  }
}
```

**GET /hobbies/{id} Response**:

```json
{
  "data": {
    "id": "string",
    "name": "string",
    "description": "string",
    "createdAt": "2025-11-20T10:00:00.000Z",
    "updatedAt": "2025-11-20T10:00:00.000Z"
  }
}
```

**PUT /hobbies/{id} Response**:

```json
{
  "data": {
    "id": "string",
    "name": "string",
    "description": "string",
    "createdAt": "2025-11-20T10:00:00.000Z",
    "updatedAt": "2025-11-20T10:00:00.000Z"
  }
}
```

**DELETE /hobbies/{id} Response**:

```json
{
  "success": true,
  "message": "Hobby deleted successfully"
}
```

**Decision**: Follow standard API response patterns from existing features

**Rationale**:

- Consistent with existing CRUD implementations
- Predictable structure for error handling
- Clear separation between data and metadata
- Standard HTTP status codes (200, 201, 400, 401, 404, 409, 500)

---

### 4. Error Handling Patterns

**Question**: What error codes and messages should be standardized for hobby operations?

**Research Approach**:

- Analyzed error handling in people-crud constants.ts
- Reviewed organizations-crud error patterns
- Examined standard HTTP status code usage

**Findings**:

**Error Message Pattern** (from people-crud):

```typescript
export const ERROR_MESSAGES = {
  AUTH_REQUIRED:
    "Authentication required. Please login first using the login tool.",
  INVALID_ID: "Invalid hobby ID provided",
  NAME_REQUIRED: "Hobby name is required",
  NAME_TOO_LONG: "Hobby name must be 255 characters or less",
  DESCRIPTION_TOO_LONG: "Description must be 1000 characters or less",
  HOBBY_NOT_FOUND: "Hobby not found",
  DUPLICATE_NAME: "A hobby with this name already exists",
  API_ERROR: "API request failed",
  NETWORK_ERROR: "Network error occurred while communicating with API",
} as const;
```

**HTTP Status Codes**:

```typescript
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
} as const;
```

**Error Response Format**:

```typescript
{
  success: false,
  error: "Clear, actionable error message"
}
```

**Decision**: Use constants pattern for all error messages and status codes

**Rationale**:

- Centralized error message management
- Easy to update messages across all tools
- Type-safe error handling with TypeScript
- Consistent user experience across all operations
- Facilitates internationalization if needed in future

---

### 5. Authentication Integration

**Question**: How should hobby tools integrate with the existing JWT authentication system?

**Research Approach**:

- Reviewed jwt-auth/services/token-storage.ts
- Examined how people-crud and organizations-crud use authentication
- Analyzed API client configuration

**Findings**:

**Token Storage Service** (from jwt-auth feature):

```typescript
import { getToken } from "../../jwt-auth/services/token-storage.js";

// In tool handler
const token = getToken();
if (!token) {
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(
          { success: false, error: ERROR_MESSAGES.AUTH_REQUIRED },
          null,
          2
        ),
      },
    ],
  };
}
```

**API Request with Authentication**:

```typescript
const response = await axios.post(
  `${API_CONFIG.BASE_URL}/hobbies`,
  requestBody,
  {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  }
);
```

**Decision**: Reuse token-storage service from jwt-auth feature

**Rationale**:

- Single source of truth for authentication state
- Consistent authentication across all features
- No duplication of auth logic
- Centralized token management (login/logout)

---

### 6. API Client Service Reuse

**Question**: Should hobby tools create a new HTTP client or reuse existing infrastructure?

**Research Approach**:

- Examined mcp-api-server/services/api-client.ts
- Analyzed how other CRUD features make API calls
- Evaluated code reuse opportunities

**Findings**:

From people-crud and organizations-crud patterns, tools make direct axios calls with:

1. **Base URL** from API_CONFIG constant
2. **Authentication headers** from token-storage
3. **Error handling** for network and HTTP errors
4. **Logging** using shared logger utility

**Decision**: Make direct axios calls following established pattern

**Rationale**:

- Consistent with existing people-crud and organizations-crud
- Simple and straightforward - no unnecessary abstraction
- Full control over request configuration
- Easy to add hobby-specific error handling
- Maintains KISS principle

---

## Technology Stack Summary

### Core Technologies

- **Language**: TypeScript (strict mode enabled)
- **Runtime**: Node.js v22.x LTS
- **Package Manager**: pnpm
- **MCP SDK**: @modelcontextprotocol/sdk
- **HTTP Client**: axios
- **Validation**: zod
- **Logging**: Custom logger utility (shared/utils/logger.ts)

### Dependencies

**Production**:

- @modelcontextprotocol/sdk (existing)
- axios (existing)
- zod (existing)

**Dev Dependencies**:

- typescript (existing)
- @types/node (existing)
- nodemon (existing)

**No new dependencies required** - all needed packages already exist in the project.

---

## Architecture Decisions

### 1. Feature-Based Structure

**Decision**: Create self-contained `hobbies-crud` feature under `src/features/`

**Rationale**:

- Follows established project architecture
- Clear separation of concerns
- Easy to locate and maintain hobby-related code
- Consistent with people-crud, organizations-crud, jwt-auth features
- Supports future feature additions without cross-contamination

### 2. Tool Separation

**Decision**: Create separate files for each of the 5 CRUD operations

**Rationale**:

- Single Responsibility Principle
- Easier to understand and maintain
- Parallel development possible
- Clear boundaries between operations
- Follows exact pattern from people-crud

### 3. Schema Validation Strategy

**Decision**: Define all Zod schemas in `schemas/hobby-schemas.ts`

**Rationale**:

- Centralized validation logic
- Reusable across multiple tools if needed
- Type inference for TypeScript
- Easy to update validation rules
- Consistent with people-crud pattern

### 4. Constants Management

**Decision**: Define all constants in `constants.ts` (endpoints, limits, messages, status codes)

**Rationale**:

- Single source of truth
- No magic strings in code
- Easy to update endpoints or messages
- Type-safe constant usage
- Matches constitution requirements

### 5. Type Definitions

**Decision**: Define all TypeScript interfaces in `types.ts`

**Rationale**:

- Centralized type definitions
- Import types across tools
- Better IDE support and autocomplete
- Type safety throughout feature
- Consistent with existing features

---

## Implementation Priorities

### Phase 1: Foundation (Highest Priority)

1. Create feature directory structure
2. Define constants (endpoints, error messages)
3. Define TypeScript types (Hobby, requests, responses)
4. Create Zod validation schemas

**Why First**: These are dependencies for all tools

### Phase 2: Read Operations (High Priority)

1. Implement get-all-hobbies-tool
2. Implement get-hobby-tool

**Why Second**: Foundation for testing and verification, no data modification

### Phase 3: Write Operations (Medium Priority)

1. Implement create-hobby-tool
2. Implement update-hobby-tool
3. Implement delete-hobby-tool

**Why Third**: Requires read operations for verification

### Phase 4: Integration (Required for Completion)

1. Register all tools in mcp-api-server/server.ts
2. Test all operations end-to-end
3. Document usage in quickstart.md

**Why Last**: Requires all tools to be implemented

---

## Risk Mitigation

### Risk 1: API Endpoint Availability

**Risk**: `/hobbies` endpoint might not exist or have different structure

**Mitigation**:

- Clear documentation of expected API structure
- Graceful error handling for unexpected responses
- Detailed logging for debugging
- User-friendly error messages

### Risk 2: Authentication Token Expiry

**Risk**: JWT token might expire during operations

**Mitigation**:

- Check for token existence before each operation
- Return clear auth error messages
- Guide user to re-login
- Consistent auth checking across all tools

### Risk 3: Duplicate Hobby Names

**Risk**: API might return conflict error for duplicate names

**Mitigation**:

- Handle 409 Conflict status code
- Return clear error message indicating duplicate
- Document uniqueness constraint in tool descriptions

### Risk 4: Data Validation Mismatch

**Risk**: Client validation might differ from server validation

**Mitigation**:

- Keep validation rules flexible (min/max ranges)
- Pass through server validation errors
- Clear error messages for validation failures
- Document validation constraints in tool descriptions

---

## Best Practices Applied

### 1. YAGNI (You Aren't Gonna Need It)

- Only implementing 5 required CRUD operations
- No search/filter implementation (reserved for future)
- No pagination implementation (reserved for future)
- No complex hobby relationships or hierarchies

### 2. KISS (Keep It Simple, Stupid)

- Direct axios calls instead of complex abstraction layers
- Simple error handling without elaborate error classes
- Straightforward tool structure following existing patterns
- No premature optimization

### 3. DRY (Don't Repeat Yourself)

- Reusing token-storage service for authentication
- Reusing API client configuration
- Reusing logger utility
- Centralized constants and types

### 4. SOLID Principles

- **Single Responsibility**: Each tool handles one operation
- **Open/Closed**: Schemas extensible without modification
- **Interface Segregation**: Minimal tool interfaces
- **Dependency Inversion**: Depend on abstractions (token-storage, logger)

---

## Conclusion

All research questions resolved. No [NEEDS CLARIFICATION] markers remain. Ready to proceed with Phase 1: Design & Contracts.

**Key Takeaways**:

1. Follow people-crud pattern exactly for consistency
2. Use Zod for name validation (`.min(1).max(255).trim()`)
3. Reuse existing services (token-storage, api-client config, logger)
4. Two-field request body: `{ name, description }`
5. Standard error handling with constants pattern
6. Feature-based directory structure
7. No new dependencies required

**Next Phase**: Create data-model.md and MCP tool contract JSON files
