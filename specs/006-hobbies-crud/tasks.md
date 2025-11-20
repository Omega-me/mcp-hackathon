---
description: "Task list for Hobbies CRUD Operations implementation"
---

# Tasks: Hobbies CRUD Operations

**Input**: Design documents from `/specs/006-hobbies-crud/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅

**Tests**: Per project constitution, tests are NOT required. All tasks focus on implementation only. Verification is done manually.

**Organization**: Tasks are grouped by user story to enable independent implementation of each story.

## Format: `- [ ] [ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, US4, US5)
- Include exact file paths in descriptions

---

## Phase 1: Setup

**Purpose**: Create hobbies-crud feature structure following Feature-Based Architecture

- [x] T001 Create feature directory structure: src/features/hobbies-crud/ with subdirectories schemas/ and tools/
- [x] T002 Verify existing dependencies (zod, axios, @modelcontextprotocol/sdk) are available in package.json

**Checkpoint**: Feature directory structure ready

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core feature infrastructure that MUST be complete before ANY user story tools can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T003 [P] Create constants.ts in src/features/hobbies-crud/constants.ts with API endpoints (HOBBIES_BASE_PATH="/hobbies", HOBBIES_BY_ID_PATH="/hobbies/:id"), validation limits (MIN_NAME_LENGTH=1, MAX_NAME_LENGTH=255, MAX_DESCRIPTION_LENGTH=1000), HTTP_STATUS object, and ERROR_MESSAGES object
- [x] T004 [P] Create types.ts in src/features/hobbies-crud/types.ts with Hobby interface, CreateHobbyRequest, UpdateHobbyRequest, and response types (GetAllHobbiesResponse, GetHobbyResponse, CreateHobbyResponse, UpdateHobbyResponse, DeleteHobbyResponse)
- [x] T005 [P] Create hobby-schemas.ts in src/features/hobbies-crud/schemas/hobby-schemas.ts with all Zod validation schemas (GetAllHobbiesParamsSchema, CreateHobbySchema with name validation, HobbyIdSchema, UpdateHobbySchema, DeleteHobbySchema)

**Checkpoint**: Foundation ready - user story tool implementation can now begin in parallel

---

## Phase 3: User Story 1 - List All Hobbies (Priority: P1) 🎯 MVP

**Goal**: Enable users to retrieve and view a list of all hobbies in the system

**Independent Verification**: Call get-all-hobbies tool after authenticating and receive a list of hobbies (or empty array). This delivers immediate value by showing what hobbies exist.

### Implementation for User Story 1

- [x] T006 [P] [US1] Create get-all-hobbies-tool.ts in src/features/hobbies-crud/tools/get-all-hobbies-tool.ts
- [x] T007 [US1] Implement tool schema export (GetAllHobbiesParamsSchema from schemas)
- [x] T008 [US1] Implement tool metadata export with name "get-all-hobbies" and detailed description
- [x] T009 [US1] Implement getAllHobbiesToolHandler function: validate params with Zod, get JWT token from token-storage, make GET request to /hobbies with Authorization header, handle success (return formatted JSON), handle errors (auth, network, API errors)
- [x] T010 [US1] Add logging using createLogger("get-all-hobbies-tool")

**Checkpoint**: User Story 1 complete - can list all hobbies independently

---

## Phase 4: User Story 2 - Create New Hobby (Priority: P2)

**Goal**: Enable users to create new hobby records with validation

**Independent Verification**: Call create-hobby tool with name and optional description, receive success with new hobby including generated ID, then call get-all-hobbies to verify hobby appears in list.

### Implementation for User Story 2

- [x] T011 [P] [US2] Create create-hobby-tool.ts in src/features/hobbies-crud/tools/create-hobby-tool.ts
- [x] T012 [US2] Implement tool schema export (CreateHobbySchema from schemas with name validation)
- [x] T013 [US2] Implement tool metadata export with name "create-hobby" and detailed description including field requirements (name required 1-255 chars, description optional max 1000 chars)
- [x] T014 [US2] Implement createHobbyToolHandler function: validate params with Zod (name non-empty), get JWT token, make POST request to /hobbies with body {name, description?}, handle success (return created hobby with ID), handle errors (validation, duplicate name 409, auth, network)
- [x] T015 [US2] Add logging for hobby creation operations

**Checkpoint**: User Stories 1 AND 2 complete - can list and create hobbies independently

---

## Phase 5: User Story 3 - Retrieve Hobby by ID (Priority: P3)

**Goal**: Enable users to retrieve detailed information about a specific hobby

**Independent Verification**: Call get-hobby tool with a valid hobby ID (from create or get-all results) and receive complete hobby details. Works independently of other operations.

### Implementation for User Story 3

- [x] T016 [P] [US3] Create get-hobby-tool.ts in src/features/hobbies-crud/tools/get-hobby-tool.ts
- [x] T017 [US3] Implement tool schema export (HobbyIdSchema from schemas)
- [x] T018 [US3] Implement tool metadata export with name "get-hobby" and detailed description
- [x] T019 [US3] Implement getHobbyToolHandler function: validate ID with Zod, get JWT token, make GET request to /hobbies/{id} with Authorization header, handle success (return hobby data), handle errors (invalid ID 400, not found 404, auth 401, network)
- [x] T020 [US3] Add logging for hobby retrieval operations

**Checkpoint**: User Stories 1, 2, AND 3 complete - can list, create, and retrieve individual hobbies

---

## Phase 6: User Story 4 - Update Existing Hobby (Priority: P4)

**Goal**: Enable users to update hobby information with full replacement (PUT semantics)

**Independent Verification**: Call update-hobby tool with ID and complete body (name, description?), receive updated hobby with new updatedAt timestamp, then call get-hobby to verify changes applied.

### Implementation for User Story 4

- [x] T021 [P] [US4] Create update-hobby-tool.ts in src/features/hobbies-crud/tools/update-hobby-tool.ts
- [x] T022 [US4] Implement tool schema export (UpdateHobbySchema from schemas with all required fields and name validation)
- [x] T023 [US4] Implement tool metadata export with name "update-hobby" and detailed description noting PUT/full replacement semantics
- [x] T024 [US4] Implement updateHobbyToolHandler function: validate params with Zod (id + full body), get JWT token, make PUT request to /hobbies/{id} with complete body {name, description?}, handle success (return updated hobby), handle errors (validation, duplicate name 409, not found 404, auth 401, network)
- [x] T025 [US4] Add logging for hobby update operations

**Checkpoint**: User Stories 1-4 complete - full CRUD except delete

---

## Phase 7: User Story 5 - Delete Hobby (Priority: P5)

**Goal**: Enable users to permanently remove hobby records

**Independent Verification**: Call delete-hobby tool with valid ID, receive success confirmation, then call get-hobby with same ID and receive not found error (404). Deletion is confirmed.

### Implementation for User Story 5

- [x] T026 [P] [US5] Create delete-hobby-tool.ts in src/features/hobbies-crud/tools/delete-hobby-tool.ts
- [x] T027 [US5] Implement tool schema export (DeleteHobbySchema from schemas)
- [x] T028 [US5] Implement tool metadata export with name "delete-hobby" and detailed description noting irreversibility
- [x] T029 [US5] Implement deleteHobbyToolHandler function: validate ID with Zod, get JWT token, make DELETE request to /hobbies/{id} with Authorization header, handle success (return success message), handle errors (not found 404, has dependencies 409, auth 401, network)
- [x] T030 [US5] Add logging for hobby deletion operations

**Checkpoint**: All 5 user stories complete - full CRUD functionality implemented

---

## Phase 8: Integration & Registration

**Purpose**: Wire up all tools to MCP server

- [x] T031 Import all 5 hobby tool handlers in src/features/mcp-api-server/server.ts (getAllHobbiesToolHandler, createHobbyToolHandler, getHobbyToolHandler, updateHobbyToolHandler, deleteHobbyToolHandler)
- [x] T032 Import all 5 hobby tool metadata in src/features/mcp-api-server/server.ts
- [x] T033 Register get-all-hobbies tool in MCP server tool list with metadata and handler
- [x] T034 Register create-hobby tool in MCP server tool list with metadata and handler
- [x] T035 Register get-hobby tool in MCP server tool list with metadata and handler
- [x] T036 Register update-hobby tool in MCP server tool list with metadata and handler
- [x] T037 Register delete-hobby tool in MCP server tool list with metadata and handler

**Checkpoint**: All tools registered and available via MCP server

---

## Phase 9: Build & Verification

**Purpose**: Ensure code compiles and performs manual verification

- [x] T038 Run pnpm build to compile TypeScript and verify no errors
- [x] T039 Fix any TypeScript compilation errors if present
- [ ] T040 Start MCP server in stdio mode: node dist/stdio-entry.js
- [ ] T041 Verify .vscode/mcp.json is configured correctly
- [ ] T042 Authenticate using login tool to obtain JWT token
- [ ] T043 Manual test: Call get-all-hobbies tool (should return empty array or existing hobbies)
- [ ] T044 Manual test: Call create-hobby tool with valid data (name and optional description)
- [ ] T045 Manual test: Call get-all-hobbies again to verify created hobby appears
- [ ] T046 Manual test: Call get-hobby tool with created hobby ID
- [ ] T047 Manual test: Call update-hobby tool to modify hobby data (name and description)
- [ ] T048 Manual test: Call get-hobby again to verify updates applied
- [ ] T049 Manual test: Call delete-hobby tool to remove hobby
- [ ] T050 Manual test: Call get-hobby with deleted ID (should return 404 not found)
- [ ] T051 Manual test: Try create-hobby with duplicate name (should return 409 error)
- [ ] T052 Manual test: Try create-hobby with empty/whitespace-only name (should return validation error)
- [ ] T053 Manual test: Try create-hobby with name exceeding 255 characters (should return validation error)
- [ ] T054 Manual test: Try create-hobby with description exceeding 1000 characters (should return validation error)
- [ ] T055 Manual test: Try create-hobby without authentication (should return auth required error)
- [ ] T056 Verify all error messages are clear and user-friendly
- [ ] T057 Review quickstart.md and verify all examples work as documented

**Checkpoint**: All features working correctly with no errors

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup (Phase 1) completion - BLOCKS all user story tools
- **User Stories (Phases 3-7)**: All depend on Foundational (Phase 2) completion
  - Once Phase 2 is complete, user stories CAN proceed in parallel (if multiple developers)
  - Or sequentially in priority order: US1 (P1) → US2 (P2) → US3 (P3) → US4 (P4) → US5 (P5)
- **Integration (Phase 8)**: Depends on all desired user story phases being complete (minimum US1 for MVP)
- **Build & Verification (Phase 9)**: Depends on Integration (Phase 8) completion

### User Story Dependencies

- **User Story 1 (P1)**: Depends only on Foundational - No dependencies on other stories
- **User Story 2 (P2)**: Depends only on Foundational - Independently testable (though typically tested with US1 get-all)
- **User Story 3 (P3)**: Depends only on Foundational - Independently testable (requires hobby ID from create or list)
- **User Story 4 (P4)**: Depends only on Foundational - Independently testable (requires hobby ID from create or list)
- **User Story 5 (P5)**: Depends only on Foundational - Independently testable (requires hobby ID from create or list)

**Key Insight**: All user stories are independently implementable after foundational phase. They can be delivered incrementally.

### Within Each Phase

- **Phase 2 (Foundational)**: T003, T004, T005 can all run in parallel [P]
- **Phase 3 (US1)**: T006 is [P] and can overlap with other story starts, but T007-T010 must be sequential within US1
- **Phase 4 (US2)**: T011 is [P] and can overlap with other stories, but T012-T015 must be sequential within US2
- **Phase 5 (US3)**: T016 is [P] and can overlap with other stories, but T017-T020 must be sequential within US3
- **Phase 6 (US4)**: T021 is [P] and can overlap with other stories, but T022-T025 must be sequential within US4
- **Phase 7 (US5)**: T026 is [P] and can overlap with other stories, but T027-T030 must be sequential within US5
- **Phase 8 (Integration)**: T031-T037 should be done sequentially to avoid merge conflicts in server.ts
- **Phase 9 (Verification)**: Must be sequential to properly test each operation

### Parallel Opportunities

**Maximum Parallelism** (if 5 developers available after Phase 2):

```
Phase 2 Complete
    ├─→ Developer 1: Phase 3 (US1 - get-all-hobbies)
    ├─→ Developer 2: Phase 4 (US2 - create-hobby)
    ├─→ Developer 3: Phase 5 (US3 - get-hobby)
    ├─→ Developer 4: Phase 6 (US4 - update-hobby)
    └─→ Developer 5: Phase 7 (US5 - delete-hobby)
All Complete → Phase 8 (Integration) → Phase 9 (Verification)
```

**MVP Approach** (minimum viable product):

```
Phase 1 → Phase 2 → Phase 3 (US1) → Phase 8 → Phase 9 (partial)
Result: Can list all hobbies (read-only MVP)
```

**Incremental Delivery**:

```
Phase 1 → Phase 2 → Phase 3 (US1) → Phase 4 (US2) → Phase 8 → Phase 9
Result: Can list and create hobbies (basic functionality)

Then add: Phase 5 (US3) → Phase 8 (add to server) → Phase 9 (test)
Result: Can also retrieve individual hobbies

Then add: Phase 6 (US4) → Phase 8 (add to server) → Phase 9 (test)
Result: Can also update hobbies

Then add: Phase 7 (US5) → Phase 8 (add to server) → Phase 9 (test)
Result: Complete CRUD functionality
```

---

## Parallel Example: Foundational Phase

```bash
# After Phase 1, launch all foundational tasks in parallel:
Developer A: T003 - Create constants.ts
Developer B: T004 - Create types.ts
Developer C: T005 - Create hobby-schemas.ts

# All three can work simultaneously on different files
# Once all complete, ANY user story can begin
```

---

## Parallel Example: All User Stories

```bash
# After Phase 2 foundational completion:
Team Member 1: T006-T010 (US1: get-all-hobbies-tool.ts)
Team Member 2: T011-T015 (US2: create-hobby-tool.ts)
Team Member 3: T016-T020 (US3: get-hobby-tool.ts)
Team Member 4: T021-T025 (US4: update-hobby-tool.ts)
Team Member 5: T026-T030 (US5: delete-hobby-tool.ts)

# All five tools can be developed in parallel
# Each team member works on a separate file
# No conflicts or dependencies between them
```

---

## Implementation Strategy

### MVP First (Recommended)

1. **Phases 1-2**: Setup + Foundation (REQUIRED)
2. **Phase 3**: User Story 1 - List Hobbies (P1) ← **Minimum Viable Product**
3. **Phase 8-9**: Integration + Build (partial verification)
4. **Deploy**: Users can now browse hobbies

### Incremental Addition

After MVP, add stories in priority order:

- Add US2 (Create) → Deploy: Users can browse + create
- Add US3 (Get by ID) → Deploy: Users can also view details
- Add US4 (Update) → Deploy: Users can also modify
- Add US5 (Delete) → Deploy: Complete CRUD

---

## Task Summary

**Total Tasks**: 57

- Setup: 2 tasks
- Foundational: 3 tasks (all parallelizable)
- User Story 1 (P1): 5 tasks (1 parallel start)
- User Story 2 (P2): 5 tasks (1 parallel start)
- User Story 3 (P3): 5 tasks (1 parallel start)
- User Story 4 (P4): 5 tasks (1 parallel start)
- User Story 5 (P5): 5 tasks (1 parallel start)
- Integration: 7 tasks
- Verification: 20 tasks

**Parallel Opportunities**: 8 tasks marked [P] can run in parallel
**Independent Stories**: All 5 user stories can be developed independently after foundational phase

**Suggested MVP Scope**: Phase 1 + Phase 2 + Phase 3 (US1) = 10 tasks for read-only hobby browsing
