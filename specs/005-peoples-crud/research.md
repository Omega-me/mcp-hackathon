# Research: People CRUD Operations

**Feature**: 005-peoples-crud
**Date**: November 20, 2025
**Purpose**: Document research findings and technical decisions for People CRUD implementation

## Research Questions & Findings

### 1. Email Validation with Zod

**Question**: What is the proper Zod pattern for email validation?

**Research Approach**:

- Reviewed Zod documentation
- Examined existing validation patterns in organizations-crud
- Investigated email validation best practices

**Finding**:
Zod provides a built-in `.email()` method for email string validation:

```typescript
z.string().email("Invalid email format");
```

**Rationale**:

- Built-in method ensures RFC 5322 compliance
- Provides clear error messages
- Consistent with Zod best practices
- No need for custom regex patterns

**Decision**: Use `z.string().email()` for email validation in person schemas

**Example Usage**:

```typescript
email: z.string().email("Invalid email format").trim();
```

---

### 2. MCP Tool Implementation Patterns

**Question**: What are the established patterns for MCP tool metadata and handlers in this codebase?

**Research Approach**:

- Analyzed organizations-crud tool implementations
- Reviewed jwt-auth tool patterns
- Examined mcp-api-server tool registration

**Findings**:

**Tool Structure Pattern** (from organizations-crud):

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

- Use kebab-case for tool names
- Provide verbose descriptions (3-4 sentences minimum)
- Include constraints and requirements in descriptions
- Mention authentication requirements
- Log operations using createLogger
- Return JSON in text content blocks
- Handle auth, validation, and API errors separately

**Decision**: Follow exact pattern from organizations-crud for consistency

---

### 3. API Request/Response Structure

**Question**: What is the exact structure for Person API requests and responses?

**Clarified by User**:

**Create/Update Request Body**:

```json
{
  "firstName": "string",
  "lastName": "string",
  "email": "user@example.com",
  "teamId": 0
}
```

**Key Clarifications**:

- teamId is a number (not organizationId)
- teamId is optional (can be omitted)
- Same body structure for both create and update
- firstName/lastName (not first_name/last_name)

**Inferred Response Structure** (based on pattern from organizations):

```json
{
  "data": {
    "id": "string",
    "firstName": "string",
    "lastName": "string",
    "email": "user@example.com",
    "teamId": 0,
    "createdAt": "2025-11-20T10:30:00Z",
    "updatedAt": "2025-11-20T10:30:00Z"
  }
}
```

**Decision**:

- Use camelCase for all field names
- teamId is optional number
- Server generates id, createdAt, updatedAt

---

### 4. Error Handling Strategy

**Question**: What error codes and messages should be standardized for people operations?

**Research Approach**:

- Reviewed organizations-crud/constants.ts
- Analyzed error handling in existing tools
- Examined HTTP status code usage

**Findings from Organizations Pattern**:

**Constants Pattern**:

```typescript
export const ERROR_MESSAGES = {
  AUTH_REQUIRED: "Authentication required...",
  INVALID_ID: "Invalid person ID provided",
  PERSON_NOT_FOUND: "Person not found",
  // ... more messages
} as const;

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  NOT_FOUND: 404,
  // ... more codes
} as const;
```

**Error Response Format**:

```json
{
  "success": false,
  "error": "Error message here"
}
```

**Error Handling Flow**:

1. Validate input with Zod (catches schema errors)
2. Check authentication (return AUTH_REQUIRED error)
3. Make API request with try-catch
4. Handle axios errors by status code
5. Return structured error response

**Decision**: Replicate error handling pattern from organizations-crud with people-specific messages

---

### 5. Validation Rules

**Question**: What validation constraints should be applied to person fields?

**Analysis**:

**firstName & lastName**:

- Required fields (user confirmed)
- Min length: 1 character (non-empty)
- Max length: 255 characters (database standard)
- Trim whitespace
- No special format required

**email**:

- Required field
- Must be valid email format (RFC 5322)
- Trim whitespace
- Case-insensitive (API enforces uniqueness)

**teamId**:

- Optional field
- Must be positive integer when provided
- References team entity (assumed)

**id** (for get/update/delete):

- Required for operations
- Non-empty string
- Trim whitespace
- Server-assigned format (don't validate format)

**Decision**: Apply consistent validation across all tools using Zod schemas

---

### 6. Authentication Integration

**Question**: How should JWT authentication be integrated for people endpoints?

**Research Findings**:

**Pattern from Organizations**:

```typescript
const storedToken = getToken();
if (!storedToken || !storedToken.token) {
  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(
          {
            success: false,
            error: ERROR_MESSAGES.AUTH_REQUIRED,
          },
          null,
          2
        ),
      },
    ],
  };
}

const response = await axios.post(url, body, {
  headers: {
    Authorization: `Bearer ${storedToken.token}`,
    "Content-Type": "application/json",
  },
});
```

**Decision**:

- Import getToken from jwt-auth/services/token-storage
- Check token before API calls
- Include Bearer token in Authorization header
- Return friendly error if not authenticated

---

### 7. API Endpoint Structure

**Question**: What are the exact API endpoints and HTTP methods?

**User Clarification**:

- GET /people - List all people
- POST /people - Create person
- GET /people/{id} - Get person by ID
- PUT /people/{id} - Update person
- DELETE /people/{id} - Delete person

**Base URL**: http://10.138.80.113:5000 (from API_CONFIG)

**Decision**: Follow RESTful pattern exactly as specified

---

## Technology Choices

### Validation Library: Zod

**Rationale**:

- Already used across all existing features
- Type-safe schema validation
- Excellent TypeScript integration
- Built-in email validation
- Clear error messages

**Alternatives Considered**: None (Zod is established standard)

---

### HTTP Client: Axios

**Rationale**:

- Already used in organizations-crud and jwt-auth
- Promise-based API
- Automatic JSON parsing
- Interceptor support (if needed later)
- Better error handling than fetch

**Alternatives Considered**: None (Axios is established standard)

---

### Logging: Custom Logger Utility

**Rationale**:

- Existing logger in shared/utils/logger.ts
- Consistent logging format across features
- Supports different log levels
- Feature-scoped logger instances

**Usage Pattern**:

```typescript
const logger = createLogger("tool-name");
logger.info("Operation", { details });
logger.error("Error occurred", { error });
```

**Alternatives Considered**: None (logger utility is established)

---

## Best Practices Applied

### 1. Feature Isolation

- Self-contained feature directory
- No cross-feature dependencies except shared services
- Clear boundaries and interfaces

### 2. Type Safety

- Explicit TypeScript interfaces
- Zod schema inference for type generation
- No `any` types
- Strict mode compliance

### 3. Error Handling

- Comprehensive error messages
- Structured error responses
- Graceful degradation
- Detailed logging

### 4. Code Consistency

- Follow organizations-crud pattern exactly
- Consistent naming conventions
- Uniform file structure
- Standard export patterns

### 5. Documentation

- Inline code comments
- JSDoc for exported functions
- Clear parameter descriptions
- Usage examples in quickstart

---

## Implementation Checklist

- [x] Email validation pattern identified (Zod .email())
- [x] MCP tool structure pattern documented
- [x] API request/response structure clarified
- [x] Error handling strategy defined
- [x] Validation rules established
- [x] Authentication integration pattern confirmed
- [x] API endpoints and methods verified
- [x] Technology choices documented
- [x] Best practices identified
- [x] No NEEDS CLARIFICATION items remaining

---

## References

**Existing Features Used as Reference**:

- `src/features/organizations-crud/` - Primary pattern reference
- `src/features/jwt-auth/` - Authentication integration
- `src/features/mcp-api-server/` - API client and server setup

**External Documentation**:

- Zod Documentation: https://zod.dev
- MCP Protocol: @modelcontextprotocol/sdk
- Axios Documentation: https://axios-http.com

---

**Research Complete**: All technical questions resolved. No clarifications needed. Ready for Phase 1: Design & Contracts.
