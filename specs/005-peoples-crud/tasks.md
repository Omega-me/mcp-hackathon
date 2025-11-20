---
description: "Task list for People CRUD Operations implementation"
---

# Tasks: People CRUD Operations

**Input**: Design documents from `/specs/005-peoples-crud/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅

**Tests**: Per project constitution, tests are NOT required. All tasks focus on implementation only. Verification is done manually.

**Organization**: Tasks are grouped by user story to enable independent implementation of each story.

## Format: `- [ ] [ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, US4, US5)
- Include exact file paths in descriptions

---

## Phase 1: Setup

**Purpose**: Create people-crud feature structure following Feature-Based Architecture

- [ ] T001 Create feature directory structure: src/features/people-crud/ with subdirectories schemas/ and tools/
- [ ] T002 Verify existing dependencies (zod, axios, @modelcontextprotocol/sdk) are available in package.json

**Checkpoint**: Feature directory structure ready

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core feature infrastructure that MUST be complete before ANY user story tools can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T003 [P] Create constants.ts in src/features/people-crud/constants.ts with API endpoints (/people, /people/{id}), validation limits (MIN_NAME_LENGTH=1, MAX_NAME_LENGTH=255), HTTP_STATUS object, and ERROR_MESSAGES object
- [ ] T004 [P] Create types.ts in src/features/people-crud/types.ts with Person interface, CreatePersonRequest, UpdatePersonRequest, and response types (GetAllPeopleResponse, GetPersonResponse, CreatePersonResponse, UpdatePersonResponse, DeletePersonResponse)
- [ ] T005 [P] Create person-schemas.ts in src/features/people-crud/schemas/person-schemas.ts with all Zod validation schemas (GetAllPeopleParamsSchema, CreatePersonSchema with email validation, PersonIdSchema, UpdatePersonSchema, DeletePersonSchema)

**Checkpoint**: Foundation ready - user story tool implementation can now begin in parallel

---

## Phase 3: User Story 1 - List All People (Priority: P1) 🎯 MVP

**Goal**: Enable users to retrieve and view a list of all people in the system

**Independent Verification**: Call get-all-people tool after authenticating and receive a list of people (or empty array). This delivers immediate value by showing what people exist.

### Implementation for User Story 1

- [ ] T006 [P] [US1] Create get-all-people-tool.ts in src/features/people-crud/tools/get-all-people-tool.ts
- [ ] T007 [US1] Implement tool schema export (GetAllPeopleParamsSchema from schemas)
- [ ] T008 [US1] Implement tool metadata export with name "get-all-people" and detailed description
- [ ] T009 [US1] Implement getAllPeopleToolHandler function: validate params with Zod, get JWT token from token-storage, make GET request to /people with Authorization header, handle success (return formatted JSON), handle errors (auth, network, API errors)
- [ ] T010 [US1] Add logging using createLogger("get-all-people-tool")

**Checkpoint**: User Story 1 complete - can list all people independently

---

## Phase 4: User Story 2 - Create New Person (Priority: P2)

**Goal**: Enable users to create new person records with validation

**Independent Verification**: Call create-person tool with firstName, lastName, email (and optional teamId), receive success with new person including generated ID, then call get-all-people to verify person appears in list.

### Implementation for User Story 2

- [ ] T011 [P] [US2] Create create-person-tool.ts in src/features/people-crud/tools/create-person-tool.ts
- [ ] T012 [US2] Implement tool schema export (CreatePersonSchema from schemas with email validation)
- [ ] T013 [US2] Implement tool metadata export with name "create-person" and detailed description including field requirements
- [ ] T014 [US2] Implement createPersonToolHandler function: validate params with Zod (including email format), get JWT token, make POST request to /people with body {firstName, lastName, email, teamId?}, handle success (return created person with ID), handle errors (validation, duplicate email 409, auth, network)
- [ ] T015 [US2] Add logging for person creation operations

**Checkpoint**: User Stories 1 AND 2 complete - can list and create people independently

---

## Phase 5: User Story 3 - Retrieve Person by ID (Priority: P3)

**Goal**: Enable users to retrieve detailed information about a specific person

**Independent Verification**: Call get-person tool with a valid person ID (from create or get-all results) and receive complete person details. Works independently of other operations.

### Implementation for User Story 3

- [ ] T016 [P] [US3] Create get-person-tool.ts in src/features/people-crud/tools/get-person-tool.ts
- [ ] T017 [US3] Implement tool schema export (PersonIdSchema from schemas)
- [ ] T018 [US3] Implement tool metadata export with name "get-person" and detailed description
- [ ] T019 [US3] Implement getPersonToolHandler function: validate ID with Zod, get JWT token, make GET request to /people/{id} with Authorization header, handle success (return person data), handle errors (invalid ID 400, not found 404, auth 401, network)
- [ ] T020 [US3] Add logging for person retrieval operations

**Checkpoint**: User Stories 1, 2, AND 3 complete - can list, create, and retrieve individual people

---

## Phase 6: User Story 4 - Update Existing Person (Priority: P4)

**Goal**: Enable users to update person information with full replacement (PUT semantics)

**Independent Verification**: Call update-person tool with ID and complete body (firstName, lastName, email, teamId?), receive updated person with new updatedAt timestamp, then call get-person to verify changes applied.

### Implementation for User Story 4

- [ ] T021 [P] [US4] Create update-person-tool.ts in src/features/people-crud/tools/update-person-tool.ts
- [ ] T022 [US4] Implement tool schema export (UpdatePersonSchema from schemas with all required fields and email validation)
- [ ] T023 [US4] Implement tool metadata export with name "update-person" and detailed description noting PUT/full replacement semantics
- [ ] T024 [US4] Implement updatePersonToolHandler function: validate params with Zod (id + full body), get JWT token, make PUT request to /people/{id} with complete body {firstName, lastName, email, teamId?}, handle success (return updated person), handle errors (validation, duplicate email 409, not found 404, auth 401, network)
- [ ] T025 [US4] Add logging for person update operations

**Checkpoint**: User Stories 1-4 complete - full CRUD except delete

---

## Phase 7: User Story 5 - Delete Person (Priority: P5)

**Goal**: Enable users to permanently remove person records

**Independent Verification**: Call delete-person tool with valid ID, receive success confirmation, then call get-person with same ID and receive not found error (404). Deletion is confirmed.

### Implementation for User Story 5

- [ ] T026 [P] [US5] Create delete-person-tool.ts in src/features/people-crud/tools/delete-person-tool.ts
- [ ] T027 [US5] Implement tool schema export (DeletePersonSchema from schemas)
- [ ] T028 [US5] Implement tool metadata export with name "delete-person" and detailed description noting irreversibility
- [ ] T029 [US5] Implement deletePersonToolHandler function: validate ID with Zod, get JWT token, make DELETE request to /people/{id} with Authorization header, handle success (return success message), handle errors (not found 404, has dependencies 409, auth 401, network)
- [ ] T030 [US5] Add logging for person deletion operations

**Checkpoint**: All 5 user stories complete - full CRUD functionality implemented

---

## Phase 8: Integration & Registration

**Purpose**: Wire up all tools to MCP server

- [x] T031 Import all 5 people tool handlers in src/features/mcp-api-server/server.ts (getAllPeopleToolHandler, createPersonToolHandler, getPersonToolHandler, updatePersonToolHandler, deletePersonToolHandler)
- [x] T032 Import all 5 people tool metadata in src/features/mcp-api-server/server.ts
- [x] T033 Register get-all-people tool in MCP server tool list with metadata and handler
- [x] T034 Register create-person tool in MCP server tool list with metadata and handler
- [x] T035 Register get-person tool in MCP server tool list with metadata and handler
- [x] T036 Register update-person tool in MCP server tool list with metadata and handler
- [x] T037 Register delete-person tool in MCP server tool list with metadata and handler

**Checkpoint**: All tools registered and available via MCP server

---

## Phase 9: Build & Verification

**Purpose**: Ensure code compiles and performs manual verification

- [x] T038 Run pnpm build to compile TypeScript and verify no errors
- [x] T039 Fix any TypeScript compilation errors if present
- [ ] T040 Start MCP server in stdio mode: node dist/stdio-entry.js
- [ ] T041 Verify .vscode/mcp.json is configured correctly
- [ ] T042 Authenticate using login tool to obtain JWT token
- [ ] T043 Manual test: Call get-all-people tool (should return empty array or existing people)
- [ ] T044 Manual test: Call create-person tool with valid data (firstName, lastName, email, teamId)
- [ ] T045 Manual test: Call get-all-people again to verify created person appears
- [ ] T046 Manual test: Call get-person tool with created person ID
- [ ] T047 Manual test: Call update-person tool to modify person data
- [ ] T048 Manual test: Call get-person again to verify updates applied
- [ ] T049 Manual test: Call delete-person tool to remove person
- [ ] T050 Manual test: Call get-person with deleted ID (should return 404 not found)
- [ ] T051 Manual test: Try create-person with duplicate email (should return 409 error)
- [ ] T052 Manual test: Try create-person with invalid email format (should return validation error)
- [ ] T053 Manual test: Try create-person without authentication (should return auth required error)
- [ ] T054 Verify all error messages are clear and user-friendly
- [ ] T055 Review quickstart.md and verify all examples work as documented

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
- **User Story 3 (P3)**: Depends only on Foundational - Independently testable (requires person ID from create or list)
- **User Story 4 (P4)**: Depends only on Foundational - Independently testable (requires person ID from create or list)
- **User Story 5 (P5)**: Depends only on Foundational - Independently testable (requires person ID from create or list)

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
    ├─→ Developer 1: Phase 3 (US1 - get-all-people)
    ├─→ Developer 2: Phase 4 (US2 - create-person)
    ├─→ Developer 3: Phase 5 (US3 - get-person)
    ├─→ Developer 4: Phase 6 (US4 - update-person)
    └─→ Developer 5: Phase 7 (US5 - delete-person)
All Complete → Phase 8 (Integration) → Phase 9 (Verification)
```

**MVP Approach** (minimum viable product):

```
Phase 1 → Phase 2 → Phase 3 (US1) → Phase 8 → Phase 9 (partial)
Result: Can list all people (read-only MVP)
```

**Incremental Delivery**:

```
Phase 1 → Phase 2 → Phase 3 (US1) → Phase 4 (US2) → Phase 8 → Phase 9
Result: Can list and create people (basic functionality)

Then add: Phase 5 (US3) → Phase 8 (add to server) → Phase 9 (test)
Result: Can also retrieve individual people

Then add: Phase 6 (US4) → Phase 8 (add to server) → Phase 9 (test)
Result: Can also update people

Then add: Phase 7 (US5) → Phase 8 (add to server) → Phase 9 (test)
Result: Complete CRUD functionality
```

---

## Parallel Example: Foundational Phase

```bash
# After Phase 1, launch all foundational tasks in parallel:
Developer A: T003 - Create constants.ts
Developer B: T004 - Create types.ts
Developer C: T005 - Create person-schemas.ts

# All three can work simultaneously on different files
# Once all complete, ANY user story can begin
```

---

## Parallel Example: All User Stories

```bash
# After Phase 2 foundational completion:
Team Member 1: T006-T010 (US1: get-all-people-tool.ts)
Team Member 2: T011-T015 (US2: create-person-tool.ts)
Team Member 3: T016-T020 (US3: get-person-tool.ts)
Team Member 4: T021-T025 (US4: update-person-tool.ts)
Team Member 5: T026-T030 (US5: delete-person-tool.ts)

# All five tools can be developed in parallel
# Each team member works on a separate file
# No conflicts or dependencies between them
```

---

## Implementation Strategy

### MVP First (Recommended)

1. **Phases 1-2**: Setup + Foundation (REQUIRED)
2. **Phase 3**: User Story 1 - List People (P1) ← **Minimum Viable Product**
3. **Phase 8-9**: Integration + Build (partial verification)
4. **Deploy**: Users can now browse people

### Incremental Addition

After MVP, add stories in priority order:

- Add US2 (Create) → Deploy: Users can browse + create
- Add US3 (Get by ID) → Deploy: Users can also view details
- Add US4 (Update) → Deploy: Users can also modify
- Add US5 (Delete) → Deploy: Complete CRUD

### Story Independence Benefits

Each user story:

- ✅ Has its own tool file (no merge conflicts)
- ✅ Can be implemented independently
- ✅ Can be tested independently
- ✅ Can be deployed independently
- ✅ Delivers standalone value

---

## Task Count Summary

- **Setup**: 2 tasks
- **Foundational**: 3 tasks (BLOCKS everything)
- **User Story 1 (P1)**: 5 tasks
- **User Story 2 (P2)**: 5 tasks
- **User Story 3 (P3)**: 5 tasks
- **User Story 4 (P4)**: 5 tasks
- **User Story 5 (P5)**: 5 tasks
- **Integration**: 7 tasks
- **Build & Verification**: 18 tasks

**Total**: 55 tasks

**Critical Path** (minimum for MVP): T001 → T002 → T003-T005 (parallel) → T006-T010 → T031-T037 → T038-T043 = ~17 tasks

**Time Estimate**:

- Setup + Foundation: 2-3 hours
- Each User Story: 2-3 hours
- Integration: 1 hour
- Build + Verification: 2-3 hours
- **Total (all stories)**: 12-15 hours
- **MVP only (US1)**: 5-7 hours

---

## Validation Checklist

After completing all tasks, verify:

- [ ] All 5 tools are registered in MCP server
- [ ] TypeScript compiles with no errors (strict mode)
- [ ] All constants follow SCREAMING_SNAKE_CASE convention
- [ ] All error messages are user-friendly
- [ ] Email validation works correctly (rejects invalid emails)
- [ ] Authentication is required for all endpoints
- [ ] All tools return properly formatted MCP responses (JSON in text blocks)
- [ ] Logging is present in all tool handlers
- [ ] Code follows organizations-crud pattern exactly
- [ ] No magic strings or numbers (all in constants.ts)
- [ ] All file paths match Feature-Based Architecture structure
- [ ] Quickstart.md examples work as documented
- [ ] All edge cases from spec.md are handled

---

**Tasks Complete**: Ready for implementation. Follow the task order and checkpoints for systematic delivery.
