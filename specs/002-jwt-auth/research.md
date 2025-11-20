# Phase 0: Research - JWT Authentication System

**Feature**: JWT Authentication System  
**Date**: 2025-11-19  
**Status**: Complete

## Overview

This document captures research findings and technical decisions for implementing JWT authentication in the MCP server. The feature adds three new MCP tools (login, signup, get-token) that integrate with external auth API and manage token storage.

## Research Questions & Findings

### 1. Token Storage Strategy

**Decision**: In-memory Map storage

**Rationale**:

- YAGNI principle - no need for persistent storage initially
- Simple implementation with no external dependencies
- Sufficient for single-user session in development/demo
- Easy to upgrade to Redis/database when multi-user support needed

**Alternatives considered**:

- File system storage: Added complexity, I/O overhead, no real benefit
- Redis: Premature - requires additional infrastructure, configuration
- Database: Over-engineered for current scope

**Implementation approach**:

```typescript
// Simple in-memory storage
const tokenStorage = new Map<string, string>();
// Key: user identifier, Value: JWT token
```

---

### 2. External Auth API Integration

**Decision**: Use existing axios-based API client pattern from hello-tool

**Rationale**:

- Consistent with existing codebase (`api-client.ts` already implements POST requests)
- Axios already installed and configured
- Can mock responses initially by returning hardcoded tokens
- Easy transition to real API by changing endpoint URLs

**Alternatives considered**:

- Native fetch API: Would break consistency with existing code
- Different HTTP client: Unnecessary dependency addition

**Implementation approach**:

- Create `auth-api.ts` service similar to existing API client
- Initial mock: Return `{ token: "mock-jwt-token-12345", userId: "user-123" }`
- Later: Replace with actual API URLs provided by user

---

### 3. JWT Token Validation

**Decision**: No validation in Phase 1 - validation is external API's responsibility

**Rationale**:

- Spec clarifies: "External auth API handles token generation and sets expiration time"
- System only stores and forwards tokens
- Protected endpoint validation will be added in separate feature/phase when needed
- YAGNI - don't build token decoding/validation until protected endpoints exist

**Alternatives considered**:

- JWT decode library (jsonwebtoken): Premature - no validation requirements yet
- Token expiration tracking: Not needed - external API manages this

**Implementation approach**:

- Store tokens as opaque strings
- Provide retrieval mechanism only
- Validation deferred to future protected endpoint implementation

---

### 4. MCP Tool Design Pattern

**Decision**: Follow existing hello-tool pattern exactly

**Rationale**:

- Proven pattern in codebase
- Maintains consistency
- Developers familiar with structure
- Uses zod schemas for input validation

**Pattern**:

```typescript
// Each tool has:
// 1. Zod schema for parameters
// 2. Tool metadata (name, description, schema)
// 3. Async handler function returning MCP-formatted response
```

**Implementation approach**:

- `login-tool.ts`: Accept email/password, call auth API, store token, return success
- `signup-tool.ts`: Accept user details, call auth API, store token, return success
- `get-token-tool.ts`: Retrieve stored token, return token or error if not authenticated

---

### 5. Error Handling Strategy

**Decision**: Return structured error responses matching hello-tool pattern

**Rationale**:

- Consistency with existing tools
- MCP SDK expects specific response format
- Clear error messages for debugging

**Error categories**:

- Authentication failed (invalid credentials)
- Network/API errors (external service down)
- Token not found (user not logged in)

**Implementation approach**:

```typescript
return {
  content: [
    {
      type: "text" as const,
      text: JSON.stringify({ error: errorMessage }, null, 2),
    },
  ],
  isError: true,
};
```

---

### 6. Logging Strategy

**Decision**: Use existing logger utility with feature-specific logger instances

**Rationale**:

- Logger already exists in `shared/utils/logger.ts`
- Consistent logging format across features
- Helpful for debugging authentication flow

**Implementation approach**:

```typescript
const logger = createLogger("JWT Auth");
logger.info("Login attempt", { userId });
logger.error("Authentication failed", error);
```

---

## Technology Stack Summary

| Component         | Technology                | Justification                             |
| ----------------- | ------------------------- | ----------------------------------------- |
| Language          | TypeScript (strict mode)  | Constitution requirement                  |
| Runtime           | Node.js LTS               | Constitution requirement                  |
| HTTP Client       | axios                     | Already installed, proven in codebase     |
| Schema Validation | zod                       | Already installed, used in existing tools |
| Token Storage     | In-memory Map             | YAGNI - simplest solution                 |
| Logging           | Existing logger utility   | Consistency                               |
| MCP SDK           | @modelcontextprotocol/sdk | Required for MCP tools                    |

**No new dependencies required** - All necessary libraries already installed.

---

## Best Practices Applied

### From MCP SDK Documentation

- Tool handlers return Promise with content array
- Input schemas use zod for type safety
- Error responses include isError flag
- Tool metadata includes clear descriptions

### From Existing Codebase

- Feature-based directory structure
- Constants file for configuration
- Separate service layer for API calls
- Logger for all significant operations
- Async/await for all I/O operations

### From TypeScript

- Explicit types for all functions
- Strict null checks
- Type-safe API responses
- Interface definitions for data structures

---

## Security Considerations

### In Scope (for this phase)

- Secure token storage in memory (not logged)
- Error messages don't reveal auth details
- Tokens treated as opaque strings

### Out of Scope (documented for future)

- Token encryption at rest (not needed for in-memory)
- Rate limiting on auth attempts
- Token revocation mechanism
- Multi-factor authentication
- Password strength validation (handled by external API)

---

## Integration Points

### With Existing System

- Register new tools in `mcp-api-server/server.ts`
- Use existing logger from `shared/utils/logger.ts`
- Follow axios pattern from existing API client

### With External Auth API

- POST to login endpoint: `/api/auth/login` (to be confirmed)
- POST to signup endpoint: `/api/auth/signup` (to be confirmed)
- Expect response: `{ token: string, userId?: string }`
- Handle errors: `{ error: string, message?: string }`

### With Future Protected Endpoints

- New tools will call `get-token-tool` internally or access storage service
- Include token in Authorization header: `Bearer ${token}`
- Handle 401 responses (token expired/invalid)

---

## Implementation Sequence

**Phase 0** (This document): ✅ Research complete

**Phase 1** (Next): Design & Contracts

- Create data-model.md
- Create API contracts (JSON schemas)
- Create quickstart.md
- Update agent context

**Phase 2** (After Phase 1): Task Breakdown

- Break down into implementable tasks
- Sequence tasks by priority
- Estimate effort per task

---

## Open Questions (None)

All technical decisions made. Ready to proceed to Phase 1 design.

---

## References

- Existing codebase: `src/features/mcp-api-server/`
- Constitution: `.specify/memory/constitution.md`
- Feature spec: `specs/002-jwt-auth/spec.md`
- MCP SDK: https://github.com/modelcontextprotocol/sdk
