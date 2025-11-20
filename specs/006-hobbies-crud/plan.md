````markdown
# Implementation Plan: Hobbies CRUD Operations

**Branch**: `006-hobbies-crud` | **Date**: November 20, 2025 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/006-hobbies-crud/spec.md`

## Summary

Implement Hobbies CRUD operations as MCP tools that interact with the `/hobbies` and `/hobbies/{id}` API endpoints. Create five tools: get-all (list hobbies with future pagination/filter support), create (POST with name, description), get-by-id (GET with ID parameter), update (PUT with ID and full body including name, description), and delete (DELETE with ID). Use Zod for schema validation including name non-empty validation, and provide detailed parameter descriptions for LLM consumption. All endpoints require JWT authentication from the existing auth system.

## Technical Context

**Language/Version**: TypeScript with Node.js (latest LTS - v22.x)
**Primary Dependencies**: @modelcontextprotocol/sdk (existing), axios (existing), zod (existing)
**Storage**: N/A (stateless API proxy - hobby data managed by external API)
**Package Manager**: pnpm (required per constitution)
**Target Platform**: MCP Server (existing - extends current mcp-api-server)
**Project Type**: Single project with Feature-Based Architecture (existing structure)
**Performance Goals**: <2s response time per operation, support 100 concurrent operations
**Constraints**: Requires JWT token from auth system, API endpoint at http://10.138.80.113:5000/hobbies must be reachable, <200ms p95 for MCP protocol overhead
**Scale/Scope**: Single feature with 5 CRUD tools, designed for extensibility (future pagination/filtering)

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

### Constitution Compliance

✅ **YAGNI**: Building only what's needed - 5 concrete CRUD tools for hobbies. Parameter structure designed to accommodate future pagination/filters without implementing them now.

✅ **Feature-Based Architecture**: Adding new `hobbies-crud` feature under `src/features/hobbies-crud/` with self-contained tools, services, types, and constants following existing pattern.

✅ **TypeScript + Node.js + pnpm**: Using existing stack, TypeScript strict mode enabled, ES modules, pnpm package manager.

✅ **SOLID Principles**:

- Single Responsibility: Each tool handles one CRUD operation
- Open/Closed: Tool parameter schemas allow extension (pagination params) without modification
- Interface Segregation: Each tool has specific, minimal interface
- Dependency Inversion: Tools depend on api-client abstraction, not concrete HTTP implementation

✅ **Constants Pattern**: API endpoints, HTTP methods, error messages, validation rules as named constants in `constants.ts`.

✅ **KISS**: Simple, direct implementation. Reusing existing api-client service from mcp-api-server feature. No unnecessary abstractions or premature optimization.

✅ **No Testing Required**: Per constitution, no test files will be created.

### Potential Violations

None identified. This implementation aligns with all constitution principles and follows established patterns from jwt-auth, mcp-api-server, organizations-crud, and people-crud features.

**Status**: ✅ All gates passed. Ready for Phase 0 research.

## Project Structure

### Documentation (this feature)

```text
specs/006-hobbies-crud/
├── spec.md              # Feature specification (completed)
├── plan.md              # This file (implementation plan)
├── research.md          # Phase 0 output (Zod validation, MCP best practices)
├── data-model.md        # Phase 1 output (Hobby schema, API contracts)
├── quickstart.md        # Phase 1 output (Setup and usage guide)
├── contracts/           # Phase 1 output (MCP tool schemas)
│   ├── get-all-hobbies-tool.json
│   ├── create-hobby-tool.json
│   ├── get-hobby-tool.json
│   ├── update-hobby-tool.json
│   └── delete-hobby-tool.json
└── checklists/
    └── requirements.md  # Specification quality checklist (completed)
```

### Source Code (repository root)

```text
src/
├── features/
│   ├── mcp-api-server/          # Existing feature
│   │   ├── server.ts            # UPDATE: Register new hobby tools
│   │   ├── constants.ts
│   │   ├── types.ts
│   │   ├── services/
│   │   │   └── api-client.ts    # REUSE: For hobby API calls
│   │   ├── tools/
│   │   │   └── hello-tool.ts
│   │   └── transports/
│   │       ├── http-transport.ts
│   │       └── stdio-transport.ts
│   ├── jwt-auth/                # Existing feature
│   │   ├── constants.ts
│   │   ├── types.ts
│   │   ├── services/
│   │   │   ├── auth-api.ts
│   │   │   └── token-storage.ts # REUSE: For auth tokens
│   │   └── tools/
│   │       ├── login-tool.ts
│   │       ├── signup-tool.ts
│   │       └── get-token-tool.ts
│   ├── organizations-crud/      # Existing feature (reference pattern)
│   │   ├── constants.ts
│   │   ├── types.ts
│   │   ├── schemas/
│   │   │   └── organization-schemas.ts
│   │   └── tools/
│   │       ├── get-all-organizations-tool.ts
│   │       ├── create-organization-tool.ts
│   │       ├── get-organization-tool.ts
│   │       ├── update-organization-tool.ts
│   │       └── delete-organization-tool.ts
│   ├── people-crud/             # Existing feature (reference pattern)
│   │   ├── constants.ts
│   │   ├── types.ts
│   │   ├── schemas/
│   │   │   └── person-schemas.ts
│   │   └── tools/
│   │       ├── get-all-people-tool.ts
│   │       ├── create-person-tool.ts
│   │       ├── get-person-tool.ts
│   │       ├── update-person-tool.ts
│   │       └── delete-person-tool.ts
│   └── hobbies-crud/            # NEW FEATURE
│       ├── constants.ts         # API endpoints, error messages, validation rules
│       ├── types.ts             # Hobby types, request/response schemas
│       ├── schemas/
│       │   └── hobby-schemas.ts # Zod validation schemas with name validation
│       └── tools/
│           ├── get-all-hobbies-tool.ts  # GET /hobbies (with future pagination)
│           ├── create-hobby-tool.ts     # POST /hobbies
│           ├── get-hobby-tool.ts        # GET /hobbies/{id}
│           ├── update-hobby-tool.ts     # PUT /hobbies/{id}
│           └── delete-hobby-tool.ts     # DELETE /hobbies/{id}
├── shared/
│   ├── utils/
│   │   └── logger.ts            # Existing
│   └── constants/
├── index.ts                     # Main entry (existing)
├── stdio-entry.ts               # Existing
└── http-entry.ts                # Existing
```

**Structure Decision**: Extending existing single-project Feature-Based Architecture. New `hobbies-crud` feature is self-contained following the pattern of existing features (especially `people-crud` and `organizations-crud`). Reuses existing `api-client` service from `mcp-api-server` and `token-storage` from `jwt-auth` for authentication. Tools will be registered in the main MCP server setup. Each tool is a separate file for clear separation of concerns and easy maintenance.

## Complexity Tracking

> **No violations detected during initial review**

No complexity violations identified. This implementation follows all constitution principles and reuses existing infrastructure appropriately.

---

## Phase 0: Research & Clarifications

### Research Tasks

1. **Hobby Name Validation with Zod**

   - **Question**: What is the proper Zod pattern for non-empty string validation?
   - **Finding**: Zod provides `.min(1)` and `.trim()` methods for string validation
   - **Example**: `z.string().min(1, "Name is required").trim()`
   - **Reference**: Existing people-crud and organizations-crud use similar patterns

2. **MCP Tool Best Practices**

   - **Question**: What are the established patterns for MCP tool metadata and handlers?
   - **Finding**: From existing features (people-crud, organizations-crud, jwt-auth):
     - Export schema, metadata, and handler separately
     - Use descriptive tool names in kebab-case
     - Provide detailed LLM-friendly descriptions
     - Include parameter constraints in descriptions
     - Return structured JSON in text content blocks
   - **Pattern**: Already established across 4 existing features

3. **API Request Body Structure**

   - **Question**: What is the exact structure for create/update hobby requests?
   - **Clarified by user**:
     ```json
     {
       "name": "string",
       "description": "string"
     }
     ```
   - **Note**: Only two fields needed - name (required) and description (optional)

4. **Error Handling Patterns**
   - **Question**: What error codes and messages should be standardized?
   - **Finding**: From people-crud and organizations-crud constants.ts:
     - Define ERROR_MESSAGES object with standard messages
     - Define HTTP_STATUS constants for status codes
     - Use consistent error response format: `{ success: false, error: string }`
   - **Pattern**: Replicate for hobbies-crud feature

### Decisions Made

1. **Hobby Entity Structure**:

   - id: string (server-generated)
   - name: string (required, 1-255 chars, unique)
   - description: string (optional, max 1000 chars)
   - createdAt: string (ISO 8601, server-generated)
   - updatedAt: string (ISO 8601, server-generated)

2. **API Endpoints**:

   - GET /hobbies - List all hobbies
   - POST /hobbies - Create hobby
   - GET /hobbies/{id} - Get hobby by ID
   - PUT /hobbies/{id} - Update hobby (full replacement)
   - DELETE /hobbies/{id} - Delete hobby

3. **Validation Rules**:

   - name: required, min 1 char, max 255 chars, trim whitespace
   - description: optional, max 1000 chars, trim whitespace
   - id: required for get/update/delete, non-empty string, trim whitespace

4. **Authentication**:
   - All endpoints require JWT token
   - Reuse token-storage service from jwt-auth feature
   - Include Bearer token in Authorization header

---

## Phase 1: Design & Contracts

### Data Model

#### Hobby Entity

```typescript
interface Hobby {
  id: string; // Server-generated unique identifier
  name: string; // Required, 1-255 characters, unique
  description?: string; // Optional, max 1000 characters
  createdAt: string; // ISO 8601 timestamp (server-generated)
  updatedAt: string; // ISO 8601 timestamp (server-generated)
}
```

#### Request/Response Types

```typescript
// Create request body
interface CreateHobbyRequest {
  name: string;
  description?: string;
}

// Update request body (same as create)
interface UpdateHobbyRequest {
  name: string;
  description?: string;
}

// API responses
interface GetAllHobbiesResponse {
  data: Hobby[];
}

interface CreateHobbyResponse {
  data: Hobby;
}

interface GetHobbyResponse {
  data: Hobby;
}

interface UpdateHobbyResponse {
  data: Hobby;
}

interface DeleteHobbyResponse {
  success: boolean;
  message: string;
}
```

### Validation Schemas (Zod)

```typescript
// Get all hobbies parameters (future pagination support)
const GetAllHobbiesParamsSchema = z
  .object({
    page: z.number().int().positive().optional(),
    limit: z.number().int().positive().max(100).optional(),
    filter: z.string().optional(),
  })
  .optional();

// Create hobby schema
const CreateHobbySchema = z.object({
  name: z
    .string()
    .min(1, "Hobby name is required")
    .max(255, "Hobby name must be 255 characters or less")
    .trim(),
  description: z
    .string()
    .max(1000, "Description must be 1000 characters or less")
    .trim()
    .optional(),
});

// Hobby ID validation
const HobbyIdSchema = z.object({
  id: z.string().min(1, "Invalid hobby ID").trim(),
});

// Update hobby schema (ID + create fields)
const UpdateHobbySchema = z.object({
  id: z.string().min(1, "Invalid hobby ID").trim(),
  name: z
    .string()
    .min(1, "Hobby name is required")
    .max(255, "Hobby name must be 255 characters or less")
    .trim(),
  description: z
    .string()
    .max(1000, "Description must be 1000 characters or less")
    .trim()
    .optional(),
});

// Delete hobby schema
const DeleteHobbySchema = z.object({
  id: z.string().min(1, "Invalid hobby ID").trim(),
});
```

### MCP Tool Contracts

See `contracts/` directory for complete JSON schema definitions for each tool:

1. **get-all-hobbies-tool.json** - List all hobbies
2. **create-hobby-tool.json** - Create new hobby
3. **get-hobby-tool.json** - Retrieve hobby by ID
4. **update-hobby-tool.json** - Update hobby by ID
5. **delete-hobby-tool.json** - Delete hobby by ID

### Constants Definition

```typescript
// API endpoints
export const HOBBIES_BASE_PATH = "/hobbies";
export const HOBBIES_BY_ID_PATH = "/hobbies/:id";

// Validation limits
export const MIN_NAME_LENGTH = 1;
export const MAX_NAME_LENGTH = 255;
export const MAX_DESCRIPTION_LENGTH = 1000;

// HTTP status codes
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

// Error messages
export const ERROR_MESSAGES = {
  AUTH_REQUIRED:
    "Authentication required. Please login first using the login tool.",
  INVALID_ID: "Invalid hobby ID provided",
  NAME_REQUIRED: "Hobby name is required",
  NAME_TOO_LONG: `Hobby name must be ${MAX_NAME_LENGTH} characters or less`,
  DESCRIPTION_TOO_LONG: `Description must be ${MAX_DESCRIPTION_LENGTH} characters or less`,
  HOBBY_NOT_FOUND: "Hobby not found",
  DUPLICATE_NAME: "A hobby with this name already exists",
  API_ERROR: "API request failed",
  NETWORK_ERROR: "Network error occurred while communicating with API",
} as const;
```

### Integration Points

1. **MCP Server Registration** (src/features/mcp-api-server/server.ts):

   - Import all 5 hobby tool handlers
   - Register tools with MCP server instance
   - Map tool names to handler functions

2. **Authentication Integration** (src/features/jwt-auth/services/token-storage.ts):

   - Import getToken function
   - Use stored JWT token in Authorization headers
   - Handle missing/expired token cases

3. **API Client Integration** (src/features/mcp-api-server/services/api-client.ts):
   - Reuse existing API client configuration
   - Use API_CONFIG.BASE_URL constant
   - Leverage axios instance with error handling

---

## Post-Design Constitution Review

_Re-evaluation after Phase 1 design completed_

### Design Decisions Review

✅ **YAGNI Compliance**:

- Built exactly 5 tools as required - no more, no less
- Get-all tool schema includes future pagination parameters but doesn't implement them (YAGNI applied correctly)
- No premature abstraction layers created
- Reused existing services (api-client, token-storage) instead of creating new ones
- Name validation added because it's explicitly required by spec

✅ **Feature-Based Architecture**:

- New feature cleanly isolated in `src/features/hobbies-crud/`
- Self-contained with own types, schemas, constants, and tools
- Clear boundaries - no cross-feature coupling except through shared services
- Follows exact pattern of existing people-crud and organizations-crud features

✅ **TypeScript + Node.js + pnpm**:

- All code in TypeScript with strict mode
- Using existing Node.js v22.x LTS environment
- pnpm package manager (existing)
- ES modules throughout

✅ **SOLID Principles Verified**:

- **Single Responsibility**: Each tool = one operation, each schema = one validation concern
- **Open/Closed**: Schemas allow future extension (pagination) without modifying tool handlers
- **Liskov Substitution**: Not applicable (no inheritance hierarchy)
- **Interface Segregation**: Each tool has minimal, specific interface (Zod schema)
- **Dependency Inversion**: Tools depend on abstract token-storage and api-client services

✅ **Constants Pattern Verified**:

- `constants.ts` defines all endpoints, validation limits, HTTP status codes, error messages
- No magic strings or numbers in tool implementations
- SCREAMING_SNAKE_CASE for constants
- Grouped into logical objects (ERROR_MESSAGES, HTTP_STATUS)

✅ **KISS Verified**:

- Direct, straightforward implementation mirroring people-crud
- No unnecessary abstractions or frameworks
- Clear, linear flow in each tool handler
- Explicit error handling without complex error hierarchies

✅ **No Testing Required**: Per constitution, no test files created.

### Final Validation

**All constitution gates passed**. Design is complete, follows all established patterns, and ready for implementation phase (Phase 2: Tasks).

---

## Next Steps

1. **Phase 2: Task Breakdown** (via `/speckit.tasks` command):

   - Generate detailed implementation tasks
   - Create ordered work items
   - Define acceptance criteria for each task

2. **Implementation**:

   - Create hobbies-crud feature directory structure
   - Implement constants, types, schemas
   - Create 5 MCP tool handlers
   - Register tools in MCP server
   - Manual testing and verification

3. **Documentation**:
   - Complete quickstart.md with usage examples
   - Document API contracts in contracts/ directory
   - Update main README if needed
````
