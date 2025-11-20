````markdown
# Implementation Plan: People CRUD Operations

**Branch**: `005-peoples-crud` | **Date**: November 20, 2025 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/005-peoples-crud/spec.md`

## Summary

Implement People CRUD operations as MCP tools that interact with the `/people` and `/people/{id}` API endpoints. Create five tools: get-all (list people with future pagination/filter support), create (POST with firstName, lastName, email, teamId), get-by-id (GET with ID parameter), update (PUT with ID and full body including firstName, lastName, email, teamId), and delete (DELETE with ID). Use Zod for schema validation including email format validation, and provide detailed parameter descriptions for LLM consumption. All endpoints require JWT authentication from the existing auth system.

## Technical Context

**Language/Version**: TypeScript with Node.js (latest LTS - v22.x)
**Primary Dependencies**: @modelcontextprotocol/sdk (existing), axios (existing), zod (existing)
**Storage**: N/A (stateless API proxy - people data managed by external API)
**Package Manager**: pnpm (required per constitution)
**Target Platform**: MCP Server (existing - extends current mcp-api-server)
**Project Type**: Single project with Feature-Based Architecture (existing structure)
**Performance Goals**: <2s response time per operation, support 100 concurrent operations
**Constraints**: Requires JWT token from auth system, API endpoint at http://10.138.80.113:5000/people must be reachable, <200ms p95 for MCP protocol overhead
**Scale/Scope**: Single feature with 5 CRUD tools, designed for extensibility (future pagination/filtering)

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

### Constitution Compliance

✅ **YAGNI**: Building only what's needed - 5 concrete CRUD tools for people. Parameter structure designed to accommodate future pagination/filters without implementing them now.

✅ **Feature-Based Architecture**: Adding new `people-crud` feature under `src/features/people-crud/` with self-contained tools, services, types, and constants following existing pattern.

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

None identified. This implementation aligns with all constitution principles and follows established patterns from jwt-auth, mcp-api-server, and organizations-crud features.

**Status**: ✅ All gates passed. Ready for Phase 0 research.

## Project Structure

### Documentation (this feature)

```text
specs/005-peoples-crud/
├── spec.md              # Feature specification (completed)
├── plan.md              # This file (implementation plan)
├── research.md          # Phase 0 output (Zod email validation, MCP best practices)
├── data-model.md        # Phase 1 output (Person schema, API contracts)
├── quickstart.md        # Phase 1 output (Setup and usage guide)
├── contracts/           # Phase 1 output (MCP tool schemas)
│   ├── get-all-people-tool.json
│   ├── create-person-tool.json
│   ├── get-person-tool.json
│   ├── update-person-tool.json
│   └── delete-person-tool.json
└── checklists/
    └── requirements.md  # Specification quality checklist (completed)
```

### Source Code (repository root)

```text
src/
├── features/
│   ├── mcp-api-server/          # Existing feature
│   │   ├── server.ts            # UPDATE: Register new people tools
│   │   ├── constants.ts
│   │   ├── types.ts
│   │   ├── services/
│   │   │   └── api-client.ts    # REUSE: For people API calls
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
│   └── people-crud/             # NEW FEATURE
│       ├── constants.ts         # API endpoints, error messages, validation rules
│       ├── types.ts             # Person types, request/response schemas
│       ├── schemas/
│       │   └── person-schemas.ts  # Zod validation schemas with email validation
│       └── tools/
│           ├── get-all-people-tool.ts  # GET /people (with future pagination)
│           ├── create-person-tool.ts   # POST /people
│           ├── get-person-tool.ts      # GET /people/{id}
│           ├── update-person-tool.ts   # PUT /people/{id}
│           └── delete-person-tool.ts   # DELETE /people/{id}
├── shared/
│   ├── utils/
│   │   └── logger.ts            # Existing
│   └── constants/
├── index.ts                     # Main entry (existing)
├── stdio-entry.ts               # Existing
└── http-entry.ts                # Existing
```

**Structure Decision**: Extending existing single-project Feature-Based Architecture. New `people-crud` feature is self-contained following the pattern of existing features (especially `organizations-crud`). Reuses existing `api-client` service from `mcp-api-server` and `token-storage` from `jwt-auth` for authentication. Tools will be registered in the main MCP server setup. Each tool is a separate file for clear separation of concerns and easy maintenance.

## Complexity Tracking

> **No violations detected during initial review**

No complexity violations identified. This implementation follows all constitution principles and reuses existing infrastructure appropriately.

---

## Phase 0: Research & Clarifications

### Research Tasks

1. **Email Validation with Zod**

   - **Question**: What is the proper Zod pattern for email validation?
   - **Finding**: Zod provides `.email()` method for email string validation
   - **Example**: `z.string().email("Invalid email format")`
   - **Reference**: Existing organizations-crud uses similar Zod patterns for string validation

2. **MCP Tool Best Practices**

   - **Question**: What are the established patterns for MCP tool metadata and handlers?
   - **Finding**: From existing features (organizations-crud, jwt-auth):
     - Export schema, metadata, and handler separately
     - Use descriptive tool names in kebab-case
     - Provide detailed LLM-friendly descriptions
     - Include parameter constraints in descriptions
     - Return structured JSON in text content blocks
   - **Pattern**: Already established across 3 existing features

3. **API Request Body Structure**

   - **Question**: What is the exact structure for create/update person requests?
   - **Clarified by user**:
     ```json
     {
       "firstName": "string",
       "lastName": "string",
       "email": "user@example.com",
       "teamId": 0
     }
     ```
   - **Note**: teamId is a number (team reference), not organizationId as initially assumed

4. **Error Handling Patterns**
   - **Question**: What error codes and messages should be standardized?
   - **Finding**: From organizations-crud constants.ts:
     - Define ERROR_MESSAGES object with standard messages
     - Define HTTP_STATUS constants for status codes
     - Use consistent error response format: `{ success: false, error: string }`
   - **Pattern**: Replicate for people-crud feature

### Decisions Made

1. **Person Entity Structure**:

   - id: string (server-generated)
   - firstName: string (required, 1-255 chars)
   - lastName: string (required, 1-255 chars)
   - email: string (required, valid email format, unique)
   - teamId: number (optional, reference to team)
   - createdAt: string (ISO 8601, server-generated)
   - updatedAt: string (ISO 8601, server-generated)

2. **API Endpoints**:

   - GET /people - List all people
   - POST /people - Create person
   - GET /people/{id} - Get person by ID
   - PUT /people/{id} - Update person (full replacement)
   - DELETE /people/{id} - Delete person

3. **Validation Rules**:

   - firstName: required, min 1 char, max 255 chars, trim whitespace
   - lastName: required, min 1 char, max 255 chars, trim whitespace
   - email: required, valid email format (Zod .email()), trim whitespace
   - teamId: optional, positive integer
   - id: required for get/update/delete, non-empty string, trim whitespace

4. **Authentication**:
   - All endpoints require JWT token
   - Reuse token-storage service from jwt-auth feature
   - Include Bearer token in Authorization header

---

## Phase 1: Design & Contracts

### Data Model

#### Person Entity

```typescript
interface Person {
  id: string; // Server-generated unique identifier
  firstName: string; // Required, 1-255 characters
  lastName: string; // Required, 1-255 characters
  email: string; // Required, valid email format, unique
  teamId?: number; // Optional, reference to team
  createdAt: string; // ISO 8601 timestamp (server-generated)
  updatedAt: string; // ISO 8601 timestamp (server-generated)
}
```

#### Request/Response Types

```typescript
// Create request body
interface CreatePersonRequest {
  firstName: string;
  lastName: string;
  email: string;
  teamId?: number;
}

// Update request body (same as create)
interface UpdatePersonRequest {
  firstName: string;
  lastName: string;
  email: string;
  teamId?: number;
}

// API responses
interface GetAllPeopleResponse {
  data: Person[];
}

interface CreatePersonResponse {
  data: Person;
}

interface GetPersonResponse {
  data: Person;
}

interface UpdatePersonResponse {
  data: Person;
}

interface DeletePersonResponse {
  success: boolean;
  message: string;
}
```

### Validation Schemas (Zod)

```typescript
// Get all people parameters (future pagination support)
const GetAllPeopleParamsSchema = z
  .object({
    page: z.number().int().positive().optional(),
    limit: z.number().int().positive().max(100).optional(),
    filter: z.string().optional(),
  })
  .optional();

// Create person schema
const CreatePersonSchema = z.object({
  firstName: z
    .string()
    .min(1, "First name is required")
    .max(255, "First name must be 255 characters or less")
    .trim(),
  lastName: z
    .string()
    .min(1, "Last name is required")
    .max(255, "Last name must be 255 characters or less")
    .trim(),
  email: z.string().email("Invalid email format").trim(),
  teamId: z.number().int().positive().optional(),
});

// Person ID validation
const PersonIdSchema = z.object({
  id: z.string().min(1, "Invalid person ID").trim(),
});

// Update person schema (ID + create fields)
const UpdatePersonSchema = z.object({
  id: z.string().min(1, "Invalid person ID").trim(),
  firstName: z
    .string()
    .min(1, "First name is required")
    .max(255, "First name must be 255 characters or less")
    .trim(),
  lastName: z
    .string()
    .min(1, "Last name is required")
    .max(255, "Last name must be 255 characters or less")
    .trim(),
  email: z.string().email("Invalid email format").trim(),
  teamId: z.number().int().positive().optional(),
});

// Delete person schema
const DeletePersonSchema = z.object({
  id: z.string().min(1, "Invalid person ID").trim(),
});
```

### MCP Tool Contracts

See `contracts/` directory for complete JSON schema definitions for each tool:

1. **get-all-people-tool.json** - List all people
2. **create-person-tool.json** - Create new person
3. **get-person-tool.json** - Retrieve person by ID
4. **update-person-tool.json** - Update person by ID
5. **delete-person-tool.json** - Delete person by ID

### Constants Definition

```typescript
// API endpoints
export const PEOPLE_BASE_PATH = "/people";
export const PEOPLE_BY_ID_PATH = "/people/:id";

// Validation limits
export const MIN_NAME_LENGTH = 1;
export const MAX_NAME_LENGTH = 255;

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
  INVALID_ID: "Invalid person ID provided",
  FIRST_NAME_REQUIRED: "First name is required",
  LAST_NAME_REQUIRED: "Last name is required",
  EMAIL_REQUIRED: "Email is required",
  INVALID_EMAIL: "Invalid email format",
  NAME_TOO_LONG: `Name must be ${MAX_NAME_LENGTH} characters or less`,
  PERSON_NOT_FOUND: "Person not found",
  DUPLICATE_EMAIL: "A person with this email already exists",
  API_ERROR: "API request failed",
  NETWORK_ERROR: "Network error occurred while communicating with API",
} as const;
```

### Integration Points

1. **MCP Server Registration** (src/features/mcp-api-server/server.ts):

   - Import all 5 people tool handlers
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
- Email validation added because it's explicitly required by spec and user input

✅ **Feature-Based Architecture**:

- New feature cleanly isolated in `src/features/people-crud/`
- Self-contained with own types, schemas, constants, and tools
- Clear boundaries - no cross-feature coupling except through shared services
- Follows exact pattern of existing organizations-crud feature

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

- Direct, straightforward implementation mirroring organizations-crud
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

   - Create people-crud feature directory structure
   - Implement constants, types, schemas
   - Create 5 MCP tool handlers
   - Register tools in MCP server
   - Manual testing and verification

3. **Documentation**:
   - Complete quickstart.md with usage examples
   - Document API contracts in contracts/ directory
   - Update main README if needed
````
