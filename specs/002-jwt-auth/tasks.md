# Tasks: JWT Authentication System

**Input**: Design documents from `/specs/002-jwt-auth/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Per project constitution, tests are NOT required. All tasks focus on implementation only. Verification is done manually using MCP inspector.

**Organization**: Tasks are grouped by user story to enable independent implementation of each story.

## Format: `- [ ] [ID] [P?] [Story?] Description with file path`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup

**Purpose**: Create jwt-auth feature directory structure and foundational files

- [x] T001 Create jwt-auth feature directory structure: `src/features/jwt-auth/`, `src/features/jwt-auth/services/`, `src/features/jwt-auth/tools/`
- [x] T002 [P] Create constants file in `src/features/jwt-auth/constants.ts` with AUTH_API_CONFIG (endpoints, timeout), ERROR_MESSAGES, and TOOLS metadata
- [x] T003 [P] Create types file in `src/features/jwt-auth/types.ts` with LoginRequest, SignupRequest, AuthResponse, AuthError, StoredToken, GetTokenResponse interfaces

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core services that MUST be complete before ANY user story tool can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T004 Implement token storage service in `src/features/jwt-auth/services/token-storage.ts` with Map<string, StoredToken>, storeToken(), getToken(), clearToken(), hasToken() functions
- [x] T005 Implement auth API service in `src/features/jwt-auth/services/auth-api.ts` with callLoginAPI(), callSignupAPI() functions (mock responses initially: return { token: "mock-jwt-" + Date.now(), userId: "mock-user-" + random })

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - New User Registration (Priority: P1) 🎯 MVP

**Goal**: Enable new users to create accounts via signup MCP tool, receive success confirmation, and have token automatically stored for immediate use

**Independent Verification**: Call signup tool with valid email/password, verify success response with userId, then call get-token to confirm token was stored

### Implementation for User Story 1

- [x] T006 [P] [US1] Create signup tool metadata and schema in `src/features/jwt-auth/tools/signup-tool.ts` with zod schema for email (string.email), password (string.min(1)), firstName (string.max(100).optional), lastName (string.max(100).optional)
- [x] T007 [US1] Implement signup tool handler in `src/features/jwt-auth/tools/signup-tool.ts` that calls callSignupAPI(), stores token via storeToken(), logs event, returns { success: true, message: "Signup successful", userId }
- [x] T008 [US1] Add error handling in signup tool for validation errors, user_exists errors, network errors, and server errors with appropriate error messages
- [x] T009 [US1] Register signup tool in `src/features/mcp-api-server/server.ts` by importing signupToolMetadata and signupToolHandler, calling server.registerTool()

**Checkpoint**: User Story 1 complete - signup tool functional and can be tested independently with MCP inspector

---

## Phase 4: User Story 2 - User Authentication (Priority: P2)

**Goal**: Enable existing users to login via login MCP tool, receive JWT token, and have it stored for accessing protected endpoints

**Independent Verification**: Call login tool with valid credentials (email/password), verify success response with userId, confirm token stored by calling get-token

### Implementation for User Story 2

- [x] T010 [P] [US2] Create login tool metadata and schema in `src/features/jwt-auth/tools/login-tool.ts` with zod schema for email (string.email), password (string.min(1))
- [x] T011 [US2] Implement login tool handler in `src/features/jwt-auth/tools/login-tool.ts` that calls callLoginAPI(), stores token via storeToken(), logs event, returns { success: true, message: "Login successful", userId }
- [x] T012 [US2] Add error handling in login tool for invalid_credentials, validation errors, network errors, and server errors (without revealing which credential part is wrong)
- [x] T013 [US2] Register login tool in `src/features/mcp-api-server/server.ts` by importing loginToolMetadata and loginToolHandler, calling server.registerTool()

**Checkpoint**: User Stories 1 and 2 complete - both signup and login functional independently

---

## Phase 5: User Story 3 - Accessing Protected Endpoints (Priority: P3)

**Goal**: Enable users to retrieve stored authentication token for use in protected endpoint calls

**Independent Verification**: After login/signup, call get-token with no parameters and verify it returns { authenticated: true, token: "...", userId: "..." }. Restart server and verify get-token returns { authenticated: false, token: null, message: "..." }

### Implementation for User Story 3

- [x] T014 [P] [US3] Create get-token tool metadata and schema in `src/features/jwt-auth/tools/get-token-tool.ts` with empty input schema (no parameters)
- [x] T015 [US3] Implement get-token tool handler in `src/features/jwt-auth/tools/get-token-tool.ts` that calls getToken() from storage, returns { authenticated: true, token, userId } if found, or { authenticated: false, token: null, userId: null, message: "No active session. Please login or signup first." } if not found
- [x] T016 [US3] Add logging in get-token tool for token retrieval attempts (success and not-authenticated cases)
- [x] T017 [US3] Register get-token tool in `src/features/mcp-api-server/server.ts` by importing getTokenToolMetadata and getTokenToolHandler, calling server.registerTool()

**Checkpoint**: All 3 user stories complete - full authentication flow functional

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements and validation across all authentication features

- [x] T018 [P] Add comprehensive error logging across all tools with logger.error() including error context (email, operation type, error details)
- [x] T019 [P] Add success logging across all tools with logger.info() for authentication events (signup success, login success, token retrieved)
- [x] T020 Build project with `pnpm build` and verify TypeScript compilation succeeds with no errors
- [ ] T021 Start server with `pnpm start:http` and verify it starts on localhost:3000/mcp without errors
- [ ] T022 Manual validation using quickstart.md: test signup → get-token → server restart → get-token → login → get-token flow
- [ ] T023 Test edge cases: invalid email format, missing password, duplicate signup, get-token before login, malformed inputs
- [ ] T024 Verify all error messages are user-friendly and don't expose sensitive details (e.g., "Email or password incorrect" not "Email not found")
- [ ] T025 Update quickstart.md with actual external API endpoint URLs once provided (replace mock references)

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1 (Setup)
    ↓
Phase 2 (Foundational) ← BLOCKS all user stories
    ↓
Phase 3 (US1 - Signup) ←─┐
Phase 4 (US2 - Login)  ←─┼─ Can run in parallel (different tools)
Phase 5 (US3 - Get Token) ←┘
    ↓
Phase 6 (Polish)
```

### User Story Dependencies

- **User Story 1 (Signup)**: Depends on Phase 2 (token-storage, auth-api services) - Independent of other stories
- **User Story 2 (Login)**: Depends on Phase 2 (token-storage, auth-api services) - Independent of other stories
- **User Story 3 (Get Token)**: Depends on Phase 2 (token-storage service only) - Independent of other stories

### Within Each User Story

1. Tool metadata and schema definition (can be parallel with other stories)
2. Tool handler implementation (depends on #1)
3. Error handling (depends on #2)
4. Registration in server.ts (depends on #2)

### Parallel Opportunities

**Phase 1 - Setup tasks**:

- T002 (constants) and T003 (types) can run in parallel

**Phase 2 - Foundational tasks**:

- T004 (token-storage) and T005 (auth-api) can run in parallel (no dependencies between them)

**Phase 3-5 - User Story implementations**:

- Once Phase 2 completes, ALL user stories can start in parallel:
  - T006-T009 (US1 - Signup tool)
  - T010-T013 (US2 - Login tool)
  - T014-T017 (US3 - Get-token tool)
- Within each story, metadata/schema tasks marked [P] can run before handler implementation

**Phase 6 - Polish tasks**:

- T018 (error logging) and T019 (success logging) can run in parallel
- T022-T024 (manual testing) should run sequentially after T020-T021

---

## Parallel Execution Examples

### Example 1: After Phase 2 Completion

Launch all three user stories simultaneously (if multiple developers available):

```bash
# Developer 1: User Story 1
Task: T006 - Create signup tool metadata/schema
Task: T007 - Implement signup tool handler
Task: T008 - Add error handling
Task: T009 - Register in server.ts

# Developer 2: User Story 2 (parallel)
Task: T010 - Create login tool metadata/schema
Task: T011 - Implement login tool handler
Task: T012 - Add error handling
Task: T013 - Register in server.ts

# Developer 3: User Story 3 (parallel)
Task: T014 - Create get-token tool metadata/schema
Task: T015 - Implement get-token tool handler
Task: T016 - Add logging
Task: T017 - Register in server.ts
```

### Example 2: Single Developer Sequential Approach

Implement in priority order (P1 → P2 → P3):

```bash
# Phase 1: Setup
T001, T002, T003

# Phase 2: Foundation (blocking)
T004, T005

# Phase 3: MVP - User Story 1 (P1) - Most critical
T006 → T007 → T008 → T009
[Test signup independently]

# Phase 4: User Story 2 (P2) - Next priority
T010 → T011 → T012 → T013
[Test login independently]

# Phase 5: User Story 3 (P3) - Complete flow
T014 → T015 → T016 → T017
[Test get-token independently]

# Phase 6: Polish
T018-T025
```

---

## Implementation Strategy

### MVP First Approach (Recommended)

1. **Complete Phase 1-2**: Setup foundation (T001-T005)
2. **Implement User Story 1 only**: Signup tool (T006-T009)
3. **Test MVP**: Verify signup works end-to-end
4. **Expand**: Add User Story 2 (Login)
5. **Complete**: Add User Story 3 (Get Token)
6. **Polish**: Final testing and validation

### Parallel Development Approach

1. **Complete Phase 1-2**: Setup foundation (T001-T005)
2. **Split team**: Assign one story per developer
3. **Develop in parallel**: All three tools simultaneously
4. **Integration**: Register all tools together
5. **Test together**: Verify full authentication flow

---

## Task Summary

**Total Tasks**: 25
**Setup Phase**: 3 tasks
**Foundational Phase**: 2 tasks (blocking)
**User Story 1 (P1 - Signup)**: 4 tasks
**User Story 2 (P2 - Login)**: 4 tasks
**User Story 3 (P3 - Get Token)**: 4 tasks
**Polish Phase**: 8 tasks

**Parallel Opportunities**:

- Phase 1: 2 tasks can run in parallel
- Phase 2: 2 tasks can run in parallel
- Phase 3-5: 3 user stories (12 tasks) can run in parallel after Phase 2
- Phase 6: 2 tasks can run in parallel

**Estimated Effort** (single developer):

- Phase 1 (Setup): 30 minutes
- Phase 2 (Foundation): 1 hour
- Phase 3 (US1 - Signup): 1 hour
- Phase 4 (US2 - Login): 45 minutes
- Phase 5 (US3 - Get Token): 45 minutes
- Phase 6 (Polish): 1 hour
- **Total**: ~5 hours (single developer, sequential)
- **With 3 developers**: ~3 hours (parallel user stories)

---

## Suggested MVP Scope

**Minimum Viable Product** includes User Story 1 only:

- T001-T005: Setup and foundation
- T006-T009: Signup tool implementation
- T020-T022: Build, start, basic validation

This delivers: "New users can create accounts and receive JWT tokens"

**Incremental Delivery**:

1. MVP: Signup tool (User Story 1)
2. V1.1: Add login tool (User Story 2)
3. V1.2: Add get-token tool (User Story 3)
4. V1.3: Polish and edge case handling

---

## Notes

- All file paths assume feature-based architecture under `src/features/jwt-auth/`
- No test files created per constitution (manual testing with MCP inspector)
- Mock responses used initially; update `auth-api.ts` with real API URLs later
- Token storage is in-memory; data lost on server restart (acceptable for MVP)
- Each user story is independently testable and deployable
- Logger from `src/shared/utils/logger.ts` used throughout for consistency
