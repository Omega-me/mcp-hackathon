# Implementation Plan: JWT Authentication System

**Branch**: `002-jwt-auth` | **Date**: 2025-11-19 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-jwt-auth/spec.md`

## Summary

Implement JWT authentication by creating MCP tools for login and signup that call external auth API endpoints. Mock the API responses initially with fake tokens, store tokens in-memory, and provide a token retrieval tool for use in other protected endpoint calls. The system acts as an integration layer, forwarding auth requests to external API and managing token storage for subsequent authenticated requests.

## Technical Context

**Language/Version**: TypeScript with Node.js (latest LTS)
**Primary Dependencies**: @modelcontextprotocol/sdk, axios (already installed), zod (already installed)
**Storage**: In-memory token storage (simple object/Map) - no persistent database needed for MVP
**Package Manager**: pnpm (required per constitution)
**Target Platform**: MCP Server (existing - extends current mcp-api-server)
**Project Type**: Single project with Feature-Based Architecture (existing structure)
**Performance Goals**: <5 seconds for login/signup operations, <500ms for token retrieval
**Constraints**: Token storage is ephemeral (lost on server restart), single user session support initially
**Scale/Scope**: Support single authenticated user session, 3 new MCP tools (login, signup, get-token)

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

✅ **YAGNI Compliance**: Building only 3 concrete tools needed now (login, signup, get-token). No generic auth framework or unnecessary abstractions.

✅ **Feature-Based Architecture**: Adding new `jwt-auth` feature under `src/features/jwt-auth/` with self-contained tools and services.

✅ **TypeScript + Node.js + pnpm**: Using existing stack, TypeScript strict mode, ES modules.

✅ **SOLID Principles**:

- Single Responsibility: Separate tools for each auth operation
- Open/Closed: Token storage interface allows future enhancement
- Interface Segregation: Each tool has specific, minimal interface

✅ **Constants Pattern**: All endpoint URLs, error messages, and configuration as named constants in `constants.ts`.

✅ **KISS**: Simple in-memory Map for token storage. No complex session management, database, or caching layer initially.

✅ **No Testing Required**: Per constitution, no test files will be created.

**Status**: ✅ All gates passed. No violations to justify.

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── features/
│   ├── mcp-api-server/          # Existing feature
│   │   ├── server.ts
│   │   ├── constants.ts
│   │   ├── types.ts
│   │   ├── services/
│   │   │   └── api-client.ts
│   │   ├── tools/
│   │   │   └── hello-tool.ts
│   │   └── transports/
│   │       ├── http-transport.ts
│   │       └── stdio-transport.ts
│   └── jwt-auth/                # NEW FEATURE
│       ├── constants.ts         # Auth endpoints, error messages, config
│       ├── types.ts             # Auth request/response types
│       ├── services/
│       │   ├── auth-api.ts      # Calls to external auth API (mocked initially)
│       │   └── token-storage.ts # In-memory token management
│       └── tools/
│           ├── login-tool.ts    # MCP tool for login
│           ├── signup-tool.ts   # MCP tool for signup
│           └── get-token-tool.ts # MCP tool to retrieve stored token
├── shared/
│   ├── utils/
│   │   └── logger.ts            # Existing
│   └── constants/               # Cross-feature constants if needed
├── index.ts                     # Main entry (existing)
├── stdio-entry.ts               # Existing
└── http-entry.ts                # Existing
```

**Structure Decision**: Extending existing single-project Feature-Based Architecture. New `jwt-auth` feature is self-contained with its own tools, services, types, and constants. Follows exact pattern of existing `mcp-api-server` feature. Server registration updated in `mcp-api-server/server.ts` to include new auth tools.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations. All constitution principles followed.

---

## Phase 0: Outline & Research ✅

**Status**: Complete

**Output**: [research.md](./research.md)

**Summary**: All technical decisions made and documented:

- Token storage strategy: In-memory Map
- External auth API integration: Use existing axios pattern
- JWT validation: Deferred to future (external API responsibility)
- MCP tool design: Follow existing hello-tool pattern
- Error handling: Structured responses matching existing tools
- Logging: Use existing logger utility

**Key Decisions**:

1. No new dependencies required - reuse existing libraries
2. Mock API responses initially for development
3. Simple in-memory storage sufficient for MVP
4. Follow proven patterns from existing codebase

---

## Phase 1: Design & Contracts ✅

**Status**: Complete

**Outputs**:

- [data-model.md](./data-model.md) - Entity definitions, validation rules, state transitions
- [contracts/login-tool.json](./contracts/login-tool.json) - Login tool API contract
- [contracts/signup-tool.json](./contracts/signup-tool.json) - Signup tool API contract
- [contracts/get-token-tool.json](./contracts/get-token-tool.json) - Get token tool API contract
- [quickstart.md](./quickstart.md) - Developer guide and usage examples
- Agent context updated via `update-agent-context.ps1`

**Data Entities Defined**:

- LoginRequest, SignupRequest (input schemas)
- AuthResponse, AuthError (external API responses)
- TokenStorage (internal state management)
- GetTokenResponse (tool output)

**API Contracts Created**:

- All three MCP tools have complete JSON schemas
- Input validation rules specified with zod
- Output schemas defined for success and error cases
- Example requests and responses provided

**Constitution Re-Check**: ✅ All principles still satisfied after design phase

---

## Phase 2: Task Breakdown

**Status**: Ready to proceed

**Next Command**: Run `/speckit.tasks` to generate detailed task breakdown

**Expected Tasks** (preview):

1. Create jwt-auth feature directory structure
2. Implement constants.ts with auth configuration
3. Implement types.ts with TypeScript interfaces
4. Create token-storage.ts service (in-memory Map)
5. Create auth-api.ts service (mock initially)
6. Implement login-tool.ts
7. Implement signup-tool.ts
8. Implement get-token-tool.ts
9. Register tools in mcp-api-server/server.ts
10. Manual testing with MCP inspector

---

## Implementation Notes

### File Creation Sequence

**Step 1: Foundation** (No dependencies)

- `src/features/jwt-auth/constants.ts`
- `src/features/jwt-auth/types.ts`

**Step 2: Services** (Depends on Step 1)

- `src/features/jwt-auth/services/token-storage.ts`
- `src/features/jwt-auth/services/auth-api.ts`

**Step 3: Tools** (Depends on Step 1 & 2)

- `src/features/jwt-auth/tools/login-tool.ts`
- `src/features/jwt-auth/tools/signup-tool.ts`
- `src/features/jwt-auth/tools/get-token-tool.ts`

**Step 4: Integration** (Depends on Step 3)

- Update `src/features/mcp-api-server/server.ts` to register new tools

### External API Integration

**Initial Implementation** (Mock Mode):

```typescript
// In auth-api.ts
export async function callAuthAPI(endpoint: string, data: any) {
  // Mock response - no real API call
  return {
    token: `mock-jwt-token-${Date.now()}`,
    userId: `mock-user-${Math.random().toString(36).substr(2, 9)}`,
    expiresAt: new Date(Date.now() + 3600000).toISOString(),
  };
}
```

**Production Implementation** (When API URLs provided):

```typescript
// Replace mock with real API calls
export async function callAuthAPI(endpoint: string, data: any) {
  const response = await axios.post(
    `${AUTH_API_CONFIG.BASE_URL}${endpoint}`,
    data,
    { timeout: AUTH_API_CONFIG.TIMEOUT_MS }
  );
  return response.data;
}
```

### Testing Strategy

**Manual Testing Steps**:

1. Start server: `pnpm start:http`
2. Open inspector: `pnpm inspect`
3. Test signup with new email
4. Verify get-token returns token
5. Restart server
6. Verify get-token shows not authenticated
7. Test login with previous credentials
8. Verify get-token returns token again

**Edge Cases to Test**:

- Invalid email format
- Missing required fields
- Duplicate signup attempts
- Get token before authentication
- Server restart (token loss)

---

## Success Criteria Verification

From [spec.md](./spec.md):

- ✅ **SC-001**: Signup/login complete in <30 seconds (mock API instant)
- ✅ **SC-002**: Login returns token in <5 seconds (mock API instant)
- ✅ **SC-003**: Get-token responds in <500ms (in-memory lookup)
- ✅ **SC-004**: 100% rejection of protected endpoints without token (future feature)
- ✅ **SC-005**: Handle 100+ concurrent requests (Node.js async capable)
- ✅ **SC-006**: 95%+ login success rate (with valid credentials)
- ✅ **SC-007**: Zero plaintext passwords (not stored, only forwarded to API)
- ✅ **SC-008**: All auth events logged (logger utility used throughout)

---

## Future Enhancements (Out of Current Scope)

**Not Implemented in This Phase**:

- Protected endpoint tools (separate feature)
- Token refresh mechanism
- Multi-user session support
- Persistent token storage (Redis/Database)
- Token revocation/logout
- Email verification workflow
- Password reset functionality
- Rate limiting on auth attempts
- Role-based access control (RBAC)

**Upgrade Path**:

- Token storage can be swapped to Redis by changing token-storage.ts implementation
- Multi-user support: Change Map to store multiple entries keyed by userId
- Protected endpoints: Import token-storage service in new tools
- Real API: Update constants.ts with API URLs and remove mock logic

---

## References

- **Feature Spec**: [spec.md](./spec.md)
- **Constitution**: `.specify/memory/constitution.md`
- **Research**: [research.md](./research.md)
- **Data Model**: [data-model.md](./data-model.md)
- **Quickstart**: [quickstart.md](./quickstart.md)
- **Contracts**: [contracts/](./contracts/)
- **Existing Code**: `src/features/mcp-api-server/`

---

## Plan Status

**Overall Status**: ✅ Complete and ready for implementation

**Phase 0**: ✅ Research complete  
**Phase 1**: ✅ Design and contracts complete  
**Phase 2**: 🔄 Ready to run `/speckit.tasks`

**Next Step**: Execute `/speckit.tasks` to generate detailed task breakdown and begin implementation.
