# Tasks: MCP API Server

**Input**: Design documents from `/specs/001-mcp-api-server/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Per project constitution, tests are NOT required. All tasks focus on implementation only. Verification is done manually.

**Organization**: Tasks are grouped by user story to enable independent implementation of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/features/mcp-api-server/` for feature code, `src/shared/` for shared utilities
- Paths shown below assume single project feature-based architecture

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Initialize Node.js project with pnpm (package.json, .gitignore)
- [x] T002 Install dependencies: @modelcontextprotocol/sdk, express, zod, axios, typescript, @types/node, @types/express
- [x] T003 [P] Configure TypeScript (tsconfig.json with strict mode, ES2022, ESM)
- [x] T004 [P] Create project directory structure (src/features/mcp-api-server/, src/shared/)
- [x] T005 [P] Create .env.example file with API_BASE_URL, API_TIMEOUT, TRANSPORT, HTTP_PORT
- [x] T006 [P] Create basic README.md with project description

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T007 Create constants file in src/features/mcp-api-server/constants.ts
- [x] T008 Define TypeScript interfaces in src/features/mcp-api-server/types.ts
- [x] T009 [P] Create simple logger utility in src/shared/utils/logger.ts
- [x] T010 Create MCP server setup in src/features/mcp-api-server/server.ts
- [x] T011 Add build script to package.json (tsc)
- [x] T012 Add start scripts to package.json (start:stdio, start:http, start)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Query Single API Endpoint (Priority: P1) 🎯 MVP

**Goal**: Enable users to query the /api/hello endpoint through an MCP tool and receive formatted responses

**Independent Verification**: Run MCP server with stdio transport, use MCP Inspector to call hello tool, verify API response is returned correctly

### Implementation for User Story 1

- [x] T013 [P] [US1] Create API client service in src/features/mcp-api-server/services/api-client.ts with get() method accepting endpoint path, returning ApiResponse, implementing timeout from API_CONFIG, and wrapping Axios errors
- [x] T014 [P] [US1] Create hello tool implementation in src/features/mcp-api-server/tools/hello-tool.ts
- [x] T015 [US1] Register hello tool in src/features/mcp-api-server/server.ts (depends on T014)
- [x] T016 [P] [US1] Create stdio transport setup in src/features/mcp-api-server/transports/stdio-transport.ts
- [x] T017 [P] [US1] Create HTTP transport setup in src/features/mcp-api-server/transports/http-transport.ts
- [x] T018 [US1] Create stdio entry point in src/stdio-entry.ts (depends on T016)
- [x] T019 [US1] Create HTTP entry point in src/http-entry.ts (depends on T017)
- [x] T020 [US1] Create auto-detect entry point in src/index.ts (depends on T018, T019)
- [x] T021 [US1] Add error handling for API timeouts and network errors in api-client.ts
- [x] T022 [US1] Add error handling for tool execution failures in hello-tool.ts

**Checkpoint**: At this point, User Story 1 should be fully functional and manually verifiable with both stdio and HTTP transports

---

## Phase 4: User Story 2 - Handle Multiple API Endpoints (Priority: P2)

**Goal**: Support multiple tools, each querying different API endpoints, with proper isolation

**Independent Verification**: Configure additional API endpoints, create new tools, verify each tool queries its respective endpoint without interference

**Note**: This phase is DEFERRED per YAGNI principle. Only implement when second tool is actually needed.

### Implementation for User Story 2 (DEFERRED)

When second tool is needed:

- [ ] T023 [P] [US2] Refactor api-client.ts to support multiple endpoints configuration
- [ ] T024 [P] [US2] Create second tool implementation (e.g., user-info-tool.ts)
- [ ] T025 [US2] Register second tool in server.ts
- [ ] T026 [US2] Update constants.ts with new endpoint configuration
- [ ] T027 [US2] Verify tool isolation (calling one tool doesn't affect another)

**Checkpoint**: Multiple tools working independently

---

## Phase 5: User Story 3 - Handle API Errors Gracefully (Priority: P3)

**Goal**: Provide clear, actionable error messages for all failure scenarios

**Independent Verification**: Simulate various API failures and verify error messages are clear and helpful

### Implementation for User Story 3

- [x] T028 [P] [US3] Define error codes in constants.ts (API_ERROR, TIMEOUT, NETWORK_ERROR, etc.)
- [x] T029 [P] [US3] Create error formatting utility in services/api-client.ts
- [x] T030 [US3] Enhance error handling in hello-tool.ts with specific error messages
- [x] T031 [US3] Add HTTP status code error handling (4xx, 5xx) in api-client.ts
- [x] T032 [US3] Add request timeout error handling with clear messages
- [x] T033 [US3] Add network connectivity error handling
- [x] T034 [US3] Test error messages with simulated failures

**Checkpoint**: All error scenarios return clear, actionable error messages

---

## Phase 6: User Story 4 - Configure API Endpoints Easily (Priority: P4)

**Goal**: Enable configuration of API endpoints without code changes

**Independent Verification**: Update .env file with new API endpoint, restart server, verify new endpoint is used

**Note**: This phase is DEFERRED per YAGNI principle. Current implementation uses environment variables which satisfies basic configuration needs.

### Implementation for User Story 4 (DEFERRED)

When configuration flexibility is needed:

- [ ] T035 [US4] Enhance constants.ts to read from environment variables
- [ ] T036 [US4] Add validation for environment variables at startup
- [ ] T037 [US4] Document all configuration options in README.md
- [ ] T038 [US4] Create .env.example with all available options

**Checkpoint**: Configuration is flexible and well-documented

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final touches, documentation, and deployment preparation

- [x] T039 Update README.md with complete usage instructions
- [x] T040 [P] Add JSDoc comments to public functions and interfaces
- [x] T041 [P] Verify TypeScript compiles without errors or warnings
- [x] T042 Test stdio transport with MCP Inspector
- [x] T043 Test HTTP transport with curl or HTTP client
- [x] T044 Verify constitution compliance (YAGNI, KISS, SOLID, Constants)
- [x] T045 Create deployment documentation in README.md

---

## Dependencies

### Task Dependencies Diagram

```
Setup Phase (T001-T006) - All can run in parallel after T001
    ↓
Foundational Phase (T007-T012) - T011, T012 depend on package.json from T001
    ↓
User Story 1 (T013-T022) - Critical path: T013 → T014 → T015 → T016/T017 → T018/T019 → T020
    ↓
User Story 3 (T028-T034) - Can start after US1 complete
    ↓
Polish (T039-T045) - Final phase after all stories
```

### User Story Completion Order

1. **US1 (P1)**: MUST be completed first - establishes MVP functionality
2. **US3 (P3)**: Should be completed next - improves UX with better errors
3. **US2 (P2)**: DEFERRED - implement only when second tool is needed
4. **US4 (P4)**: DEFERRED - current env vars are sufficient

---

## Parallel Execution Opportunities

### Within User Story 1 (after T012 complete):

- T013, T014, T016, T017 can be developed in parallel (different files)
- T021, T022 can be added in parallel (different files)

### Within User Story 3 (after US1 complete):

- T028, T029 can be developed in parallel
- T031, T032, T033 can be implemented in parallel

### Cross-cutting (Phase 7):

- T040, T041 can run in parallel
- T042, T043 are independent verification tasks

---

## Implementation Strategy

### Sprint 1: MVP (User Story 1 only)

**Goal**: Working MCP server with single tool, both transports
**Tasks**: T001-T022 (22 tasks)
**Duration**: 1-2 days
**Deliverable**: Functional MCP server queryable via stdio and HTTP

### Sprint 2: Error Handling (User Story 3)

**Goal**: Production-ready error handling
**Tasks**: T028-T034 (7 tasks)
**Duration**: 0.5-1 day
**Deliverable**: Clear error messages for all failure scenarios

### Sprint 3: Polish

**Goal**: Documentation and deployment ready
**Tasks**: T039-T045 (7 tasks)
**Duration**: 0.5 day
**Deliverable**: Complete, deployable MCP server

**Total Estimated Tasks**: 36 tasks (22 MVP + 7 errors + 7 polish)
**Deferred Tasks**: 11 tasks (US2: 5 tasks, US4: 4 tasks, to be implemented only when needed)

---

## Constitution Compliance

Each task has been designed to align with:

✅ **YAGNI**: US2 and US4 marked as deferred, implement only when needed
✅ **Feature-Based**: All code in src/features/mcp-api-server/
✅ **SOLID**: Clear separation (tools/, services/, transports/)
✅ **Constants**: T007 ensures all magic values are constants
✅ **KISS**: Simple, direct implementations without over-engineering
✅ **No Testing**: No test tasks, manual verification only

---

## Task Execution Notes

- All tasks include exact file paths for implementation
- Tasks marked [P] can be parallelized to speed development
- Tasks marked [US#] belong to specific user stories for independent delivery
- Checkpoint after each phase ensures quality gates
- Deferred tasks prevent premature optimization (YAGNI)
- MVP focus (US1) delivers value quickly
