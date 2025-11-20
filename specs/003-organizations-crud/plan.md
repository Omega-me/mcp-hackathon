# Implementation Plan: Organizations CRUD Operations

**Branch**: `003-organizations-crud` | **Date**: November 20, 2025 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/003-organizations-crud/spec.md`

## Summary

Implement Organizations CRUD operations as MCP tools that interact with the `/organizations` API endpoint. Create five tools: get-all (list organizations with future pagination/filter support), create (POST with name and description), get-by-id (GET with ID parameter), update (PUT with ID and full body), and delete (DELETE with ID). Use Zod for schema validation and provide detailed parameter descriptions for LLM consumption. All endpoints require JWT authentication from the existing auth system.

## Technical Context

**Language/Version**: TypeScript with Node.js (latest LTS - v22.x)
**Primary Dependencies**: @modelcontextprotocol/sdk (existing), axios (existing), zod (existing)
**Storage**: N/A (stateless API proxy - organization data managed by external API)
**Package Manager**: pnpm (required per constitution)
**Target Platform**: MCP Server (existing - extends current mcp-api-server)
**Project Type**: Single project with Feature-Based Architecture (existing structure)
**Performance Goals**: <2s response time per operation, support 100 concurrent operations
**Constraints**: Requires JWT token from auth system, API endpoint at http://10.138.80.113:5000/organizations must be reachable, <200ms p95 for MCP protocol overhead
**Scale/Scope**: Single feature with 5 CRUD tools, designed for extensibility (future pagination/filtering)

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

### Constitution Compliance

✅ **YAGNI**: Building only what's needed - 5 concrete CRUD tools for organizations. Parameter structure designed to accommodate future pagination/filters without implementing them now.

✅ **Feature-Based Architecture**: Adding new `organizations-crud` feature under `src/features/organizations-crud/` with self-contained tools, services, types, and constants following existing pattern.

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

None identified. This implementation aligns with all constitution principles and follows established patterns from jwt-auth and mcp-api-server features.

**Status**: ✅ All gates passed. Ready for Phase 0 research.

## Project Structure

### Documentation (this feature)

```text
specs/003-organizations-crud/
├── spec.md              # Feature specification (completed)
├── plan.md              # This file (implementation plan)
├── research.md          # Phase 0 output (Zod patterns, MCP best practices)
├── data-model.md        # Phase 1 output (Organization schema, API contracts)
├── quickstart.md        # Phase 1 output (Setup and usage guide)
├── contracts/           # Phase 1 output (MCP tool schemas)
│   ├── get-all-organizations-tool.json
│   ├── create-organization-tool.json
│   ├── get-organization-tool.json
│   ├── update-organization-tool.json
│   └── delete-organization-tool.json
└── checklists/
    └── requirements.md  # Specification quality checklist (completed)
```

### Source Code (repository root)

```text
src/
├── features/
│   ├── mcp-api-server/          # Existing feature
│   │   ├── server.ts            # UPDATE: Register new organization tools
│   │   ├── constants.ts
│   │   ├── types.ts
│   │   ├── services/
│   │   │   └── api-client.ts    # REUSE: For organizations API calls
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
│   └── organizations-crud/      # NEW FEATURE
│       ├── constants.ts         # API endpoints, error messages, validation rules
│       ├── types.ts             # Organization types, request/response schemas
│       ├── schemas/
│       │   └── organization-schemas.ts  # Zod validation schemas
│       └── tools/
│           ├── get-all-organizations-tool.ts  # GET /organizations (with future pagination)
│           ├── create-organization-tool.ts    # POST /organizations
│           ├── get-organization-tool.ts       # GET /organizations/{id}
│           ├── update-organization-tool.ts    # PUT /organizations/{id}
│           └── delete-organization-tool.ts    # DELETE /organizations/{id}
├── shared/
│   ├── utils/
│   │   └── logger.ts            # Existing
│   └── constants/
├── index.ts                     # Main entry (existing)
├── stdio-entry.ts               # Existing
└── http-entry.ts                # Existing
```

**Structure Decision**: Extending existing single-project Feature-Based Architecture. New `organizations-crud` feature is self-contained following the pattern of existing features. Reuses existing `api-client` service from `mcp-api-server` and `token-storage` from `jwt-auth` for authentication. Tools will be registered in the main MCP server setup. Each tool is a separate file for clear separation of concerns and easy maintenance.

## Complexity Tracking

> **No violations detected during initial review**

No complexity violations identified. This implementation follows all constitution principles and reuses existing infrastructure appropriately.

---

## Post-Design Constitution Review

_Re-evaluation after Phase 1 design completed_

### Design Decisions Review

✅ **YAGNI Compliance**:

- Built exactly 5 tools as required - no more, no less
- Get-all tool schema includes future pagination parameters but doesn't implement them (YAGNI applied correctly)
- No premature abstraction layers created
- Reused existing services (api-client, token-storage) instead of creating new ones

✅ **Feature-Based Architecture**:

- New feature cleanly isolated in `src/features/organizations-crud/`
- Self-contained with own types, schemas, constants, and tools
- Clear boundaries - no cross-feature coupling except through shared services
- Follows exact pattern of existing jwt-auth feature

✅ **TypeScript + Node.js + pnpm**:

- All code will use TypeScript strict mode
- Zod schemas provide runtime validation AND compile-time type inference
- No new dependencies required (reusing existing: zod, axios, MCP SDK)
- ES modules syntax throughout

✅ **SOLID Principles Validation**:

- **Single Responsibility**: Each tool file handles exactly one CRUD operation
- **Open/Closed**: Schema definitions allow future parameter additions without modifying tool handlers
- **Liskov Substitution**: All tools implement consistent MCP tool interface
- **Interface Segregation**: Each tool has minimal, specific parameters (no generic "do everything" tools)
- **Dependency Inversion**: Tools depend on api-client interface, not axios directly; auth via token-storage interface

✅ **Constants Pattern**:

- All API endpoints defined in constants.ts: `ORGANIZATIONS_BASE_PATH`, `ORGANIZATIONS_BY_ID_PATH`
- All error messages centralized in `ERROR_MESSAGES` object
- Validation constraints as constants: `MAX_ORGANIZATION_NAME_LENGTH`
- No magic strings or numbers in tool implementations

✅ **KISS Compliance**:

- Straightforward implementation - no clever abstractions
- Tool handlers follow simple pattern: validate → get token → call API → return result
- Error handling is explicit and clear
- No unnecessary middleware or interceptors

### Architecture Decisions Validation

**Decision 1: Reuse api-client from mcp-api-server**

- **Rationale**: DRY principle, consistent error handling
- **Constitutional Alignment**: YAGNI (don't create new HTTP client), KISS (reuse working solution)
- **Status**: ✅ Approved

**Decision 2: Reuse token-storage from jwt-auth**

- **Rationale**: Centralized auth state management already implemented
- **Constitutional Alignment**: YAGNI (don't duplicate token management), Feature isolation maintained
- **Status**: ✅ Approved

**Decision 3: Separate tool file per operation**

- **Rationale**: Single Responsibility Principle, easy to locate and modify
- **Constitutional Alignment**: SOLID principles, Feature-based organization
- **Status**: ✅ Approved

**Decision 4: Zod for validation**

- **Rationale**: Already used in existing features, provides type safety and good errors
- **Constitutional Alignment**: No new dependencies, TypeScript integration, KISS
- **Status**: ✅ Approved

**Decision 5: PUT for updates (full replacement)**

- **Rationale**: User requirement, simpler semantics than PATCH
- **Constitutional Alignment**: YAGNI (don't implement both), KISS (clearer semantics)
- **Status**: ✅ Approved

**Decision 6: Reserved pagination parameters in get-all schema**

- **Rationale**: Future-proof without implementing now
- **Constitutional Alignment**: YAGNI (don't implement), Open/Closed (schema allows extension)
- **Status**: ✅ Approved - schema documents intent without implementation

### No Violations Found

All design decisions align with constitution principles. No compromises or violations requiring justification.

### Final Gate Status

**Status**: ✅ **PASSED** - Ready for implementation phase

All constitutional requirements met:

- No unnecessary complexity added
- Existing patterns followed consistently
- No new dependencies introduced
- Simple, maintainable design
- Clear separation of concerns
- Proper reuse of existing infrastructure

---

## Implementation Phases Summary

### ✅ Phase 0: Research (Completed)

- Zod validation patterns documented
- MCP tool parameter description best practices defined
- API integration patterns established
- Authentication flow clarified
- PUT vs PATCH decision documented

### ✅ Phase 1: Design (Completed)

- Data model defined with complete type definitions
- 5 tool contracts created with detailed schemas
- Quickstart guide written with examples and workflows
- Agent context updated with new feature technology

### 📋 Phase 2: Implementation (Next Step)

Use `/speckit.tasks` command to generate implementation tasks breakdown.

---

## Artifacts Generated

### Documentation

- ✅ `plan.md` - This implementation plan
- ✅ `research.md` - Technical decisions and patterns
- ✅ `data-model.md` - Complete data schemas and validation
- ✅ `quickstart.md` - User guide with examples
- ✅ `spec.md` - Feature specification (pre-existing)

### Contracts

- ✅ `contracts/get-all-organizations-tool.json`
- ✅ `contracts/create-organization-tool.json`
- ✅ `contracts/get-organization-tool.json`
- ✅ `contracts/update-organization-tool.json`
- ✅ `contracts/delete-organization-tool.json`

### Agent Context

- ✅ Updated `.github/agents/copilot-instructions.md` with feature technology

---

## Next Steps

1. Run `/speckit.tasks` to generate detailed implementation task breakdown
2. Implement tools following the contracts and data model specifications
3. Register tools in MCP server setup
4. Manual testing using examples from quickstart guide
5. Deploy and verify all 5 CRUD operations work end-to-end
