# Tasks: Organizations CRUD Operations

**Input**: Design documents from `/specs/003-organizations-crud/`  
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅

**Tests**: Per project constitution, tests are NOT required. All tasks focus on implementation only. Verification is done manually using examples from quickstart.md.

**Organization**: Tasks are grouped by user story to enable independent implementation of each story.

## Format: `- [ ] [ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, US4, US5)
- All file paths are absolute from repository root

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create feature directory structure and shared configuration

- [ ] T001 Create feature directory structure: `src/features/organizations-crud/` with subdirectories `tools/` and `schemas/`
- [ ] T002 [P] Create `src/features/organizations-crud/types.ts` with Organization interface and request/response types from data-model.md
- [ ] T003 [P] Create `src/features/organizations-crud/constants.ts` with API paths, error messages, and validation constants from data-model.md

**Checkpoint**: Feature directory structure ready

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core validation schemas that ALL tools depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T004 Create `src/features/organizations-crud/schemas/organization-schemas.ts` with all 5 Zod schemas: GetAllOrganizationsParamsSchema, CreateOrganizationSchema, OrganizationIdSchema, UpdateOrganizationSchema, DeleteOrganizationSchema (per data-model.md)
- [ ] T005 Export all types inferred from Zod schemas using `z.infer<typeof Schema>` in schemas file

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - List All Organizations (Priority: P1) 🎯 MVP

**Goal**: Implement GET /organizations tool to retrieve list of all organizations

**Independent Verification**: Call `get-all-organizations` tool → receives array of organizations (or empty array). Check with quickstart.md examples.

### Implementation for User Story 1

- [ ] T006 [P] [US1] Create `src/features/organizations-crud/tools/get-all-organizations-tool.ts` implementing MCP tool handler
- [ ] T007 [US1] Import apiClient from `src/features/mcp-api-server/services/api-client.ts` in get-all-organizations-tool.ts
- [ ] T008 [US1] Import getStoredToken from `src/features/jwt-auth/services/token-storage.ts` in get-all-organizations-tool.ts
- [ ] T009 [US1] Implement tool handler: validate params (future pagination), get token, call GET /organizations, return formatted response per contracts/get-all-organizations-tool.json
- [ ] T010 [US1] Add error handling for 401 Unauthorized, 403 Forbidden, 500 Server Error per data-model.md error codes
- [ ] T011 [US1] Register get-all-organizations tool in `src/features/mcp-api-server/server.ts` MCP server tools list

**Checkpoint**: User Story 1 complete - can manually verify by calling tool and getting organization list

---

## Phase 4: User Story 2 - Create New Organization (Priority: P2)

**Goal**: Implement POST /organizations tool to create organizations with name and description

**Independent Verification**: Call `create-organization` with name and description → receives created organization with ID. Verify with `get-all-organizations`.

### Implementation for User Story 2

- [x] T012 [P] [US2] Create `src/features/organizations-crud/tools/create-organization-tool.ts` implementing MCP tool handler
- [x] T013 [US2] Import apiClient from `src/features/mcp-api-server/services/api-client.ts` in create-organization-tool.ts
- [x] T014 [US2] Import getStoredToken from `src/features/jwt-auth/services/token-storage.ts` in create-organization-tool.ts
- [x] T015 [US2] Implement tool handler: validate params with CreateOrganizationSchema, get token, call POST /organizations with body, return created organization per contracts/create-organization-tool.json
- [x] T016 [US2] Add error handling for 400 Bad Request (validation), 401 Unauthorized, 409 Conflict (duplicate name), 500 Server Error per data-model.md
- [x] T017 [US2] Register create-organization tool in `src/features/mcp-api-server/server.ts` MCP server tools list

**Checkpoint**: User Story 2 complete - can create organizations and verify they appear in list

---

## Phase 5: User Story 3 - Retrieve Organization by ID (Priority: P3)

**Goal**: Implement GET /organizations/{id} tool to retrieve specific organization details

**Independent Verification**: Call `get-organization` with valid ID → receives organization details. Try invalid ID → receives 404 error.

### Implementation for User Story 3

- [x] T018 [P] [US3] Create `src/features/organizations-crud/tools/get-organization-tool.ts` implementing MCP tool handler
- [x] T019 [US3] Import apiClient from `src/features/mcp-api-server/services/api-client.ts` in get-organization-tool.ts
- [x] T020 [US3] Import getStoredToken from `src/features/jwt-auth/services/token-storage.ts` in get-organization-tool.ts
- [x] T021 [US3] Implement tool handler: validate ID with OrganizationIdSchema, get token, call GET /organizations/{id}, return organization per contracts/get-organization-tool.json
- [x] T022 [US3] Add error handling for 400 Bad Request (invalid ID), 401 Unauthorized, 403 Forbidden, 404 Not Found, 500 Server Error per data-model.md
- [x] T023 [US3] Register get-organization tool in `src/features/mcp-api-server/server.ts` MCP server tools list

**Checkpoint**: User Story 3 complete - can retrieve individual organization details

---

## Phase 6: User Story 4 - Update Existing Organization (Priority: P4)

**Goal**: Implement PUT /organizations/{id} tool to update organization with full body replacement

**Independent Verification**: Call `update-organization` with ID, name, description → receives updated organization. Verify changes with `get-organization`.

### Implementation for User Story 4

- [x] T024 [P] [US4] Create `src/features/organizations-crud/tools/update-organization-tool.ts` implementing MCP tool handler
- [x] T025 [US4] Import apiClient from `src/features/mcp-api-server/services/api-client.ts` in update-organization-tool.ts
- [x] T026 [US4] Import getStoredToken from `src/features/jwt-auth/services/token-storage.ts` in update-organization-tool.ts
- [x] T027 [US4] Implement tool handler: validate params with UpdateOrganizationSchema (id, name, description), get token, call PUT /organizations/{id} with full body, return updated organization per contracts/update-organization-tool.json
- [x] T028 [US4] Add error handling for 400 Bad Request (validation), 401 Unauthorized, 404 Not Found, 409 Conflict (duplicate name), 500 Server Error per data-model.md
- [x] T029 [US4] Register update-organization tool in `src/features/mcp-api-server/server.ts` MCP server tools list

**Checkpoint**: User Story 4 complete - can update organizations and verify changes persist

---

## Phase 7: User Story 5 - Delete Organization (Priority: P5)

**Goal**: Implement DELETE /organizations/{id} tool to permanently remove organizations

**Independent Verification**: Call `delete-organization` with ID → receives success confirmation. Verify with `get-organization` (404) and `get-all-organizations` (not in list).

### Implementation for User Story 5

- [x] T030 [P] [US5] Create `src/features/organizations-crud/tools/delete-organization-tool.ts` implementing MCP tool handler
- [x] T031 [US5] Import apiClient from `src/features/mcp-api-server/services/api-client.ts` in delete-organization-tool.ts
- [x] T032 [US5] Import getStoredToken from `src/features/jwt-auth/services/token-storage.ts` in delete-organization-tool.ts
- [x] T033 [US5] Implement tool handler: validate ID with DeleteOrganizationSchema, get token, call DELETE /organizations/{id}, return success message per contracts/delete-organization-tool.json
- [x] T034 [US5] Add error handling for 400 Bad Request (invalid ID), 401 Unauthorized, 403 Forbidden, 404 Not Found, 409 Conflict (has dependencies), 500 Server Error per data-model.md
- [x] T035 [US5] Register delete-organization tool in `src/features/mcp-api-server/server.ts` MCP server tools list

**Checkpoint**: User Story 5 complete - can delete organizations and verify removal

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Final integration, documentation, and quality improvements

- [x] T036 Add comprehensive logging to all tools using `src/shared/utils/logger.ts` for debugging (log tool invocations, API calls, errors)
- [x] T037 Review and ensure all error messages match ERROR_MESSAGES constants defined in `src/features/organizations-crud/constants.ts`
- [x] T038 Verify all 5 tools are registered in MCP server and appear in tool list
- [x] T039 Manual end-to-end test: Run through all workflows in quickstart.md (create, list, get, update, delete)
- [x] T040 Update main README.md with organizations CRUD tools documentation and usage examples

**Final Checkpoint**: Feature complete and production-ready

---

## Dependencies & Execution Order

### Story Completion Order (Sequential)

```
Phase 1 (Setup) → Phase 2 (Foundation) → Must complete before any user stories
└─→ Phase 3 (US1 - List) → Recommended first (discover organizations)
    └─→ Phase 4 (US2 - Create) → Creates data for other operations
        └─→ Phase 5 (US3 - Get by ID) → Needed to verify create/update
            └─→ Phase 6 (US4 - Update) → Modifies existing organizations
                └─→ Phase 7 (US5 - Delete) → Cleanup operations
                    └─→ Phase 8 (Polish)
```

### Parallel Execution Opportunities

**Within Each User Story Phase**:

- Tool file creation [P] can happen in parallel with imports
- All [P] marked tasks within same phase can run concurrently
- Each tool implementation is independent after foundation phase complete

**Example: After Phase 2 completes, can implement in parallel**:

- US1 tool (T006-T011)
- US2 tool (T012-T017)
- US3 tool (T018-T023)
- US4 tool (T024-T029)
- US5 tool (T030-T035)

**Note**: While parallel implementation is possible, sequential order by priority (P1→P2→P3→P4→P5) enables incremental testing and ensures MVP (US1) is delivered first.

---

## Implementation Strategy

### Recommended Approach: Incremental Delivery

1. **Sprint 1 - MVP**: Complete Phase 1, 2, 3 (Setup + Foundation + US1 List)

   - Delivers: Ability to view all organizations
   - Value: Immediate visibility into existing data
   - Testable: Can verify with existing organizations in API

2. **Sprint 2 - Core CRUD**: Complete Phase 4, 5 (US2 Create + US3 Get by ID)

   - Delivers: Create organizations and retrieve individual details
   - Value: Can populate system with new organizations
   - Testable: Create → Get by ID → Verify in List

3. **Sprint 3 - Full CRUD**: Complete Phase 6, 7 (US4 Update + US5 Delete)

   - Delivers: Complete lifecycle management
   - Value: Full data management capabilities
   - Testable: Create → Update → Verify → Delete → Verify removal

4. **Sprint 4 - Polish**: Complete Phase 8 (logging, docs, final tests)
   - Delivers: Production-ready feature
   - Value: Proper observability and documentation

### Alternative: Parallel Development (if team has 5 developers)

After Phase 1-2 complete, assign one developer per user story (US1-US5). Each can work independently. Merge in priority order (P1→P2→P3→P4→P5) for incremental testing.

---

## Task Metrics

**Total Tasks**: 40  
**Setup Tasks**: 3 (Phase 1)  
**Foundation Tasks**: 2 (Phase 2)  
**User Story Tasks**: 30 (5 user stories × 6 tasks each)  
**Polish Tasks**: 5 (Phase 8)

**Tasks per User Story**:

- US1 (List All): 6 tasks
- US2 (Create): 6 tasks
- US3 (Get by ID): 6 tasks
- US4 (Update): 6 tasks
- US5 (Delete): 6 tasks

**Parallel Tasks**: 15 marked with [P] (can execute concurrently)  
**Sequential Tasks**: 25 (have dependencies)

**Estimated Effort** (rough):

- Phase 1 (Setup): 1-2 hours
- Phase 2 (Foundation): 2-3 hours (critical, requires careful schema design)
- Phase 3 (US1): 2-3 hours
- Phase 4 (US2): 2-3 hours
- Phase 5 (US3): 2-3 hours
- Phase 6 (US4): 2-3 hours
- Phase 7 (US5): 2-3 hours
- Phase 8 (Polish): 2-3 hours

**Total**: 15-23 hours for complete implementation

---

## Manual Verification Checklist

After implementation, verify each user story independently:

### ✅ US1 - List All Organizations

- [ ] Call `get-all-organizations` without params
- [ ] Receives array of organizations (or empty array if none exist)
- [ ] All organizations have id, name, createdAt, updatedAt
- [ ] No authentication error (token is being used)

### ✅ US2 - Create New Organization

- [ ] Call `create-organization` with name only
- [ ] Call `create-organization` with name and description
- [ ] Receives created organization with system-assigned ID
- [ ] New organization appears in `get-all-organizations` results
- [ ] Duplicate name returns 409 Conflict error

### ✅ US3 - Retrieve Organization by ID

- [ ] Call `get-organization` with valid ID from create
- [ ] Receives complete organization details
- [ ] Call with invalid ID returns 404 Not Found
- [ ] Call with empty/malformed ID returns 400 Bad Request

### ✅ US4 - Update Existing Organization

- [ ] Call `update-organization` with new name and description
- [ ] Receives updated organization with new updatedAt timestamp
- [ ] Call `get-organization` confirms changes persisted
- [ ] Duplicate name returns 409 Conflict error
- [ ] Non-existent ID returns 404 Not Found

### ✅ US5 - Delete Organization

- [ ] Call `delete-organization` with valid ID
- [ ] Receives success confirmation
- [ ] Call `get-organization` with same ID returns 404
- [ ] Organization no longer in `get-all-organizations` results
- [ ] Non-existent ID returns 404 Not Found

### ✅ Cross-Cutting Verification

- [ ] All operations require authentication (401 without token)
- [ ] All error messages are clear and actionable
- [ ] All operations logged for debugging
- [ ] All tools appear in MCP server tool list

---

## Notes

- **No Test Files**: Per constitution, no automated tests required. Use manual verification with quickstart.md examples.
- **Reuse Services**: All tools reuse existing api-client and token-storage - no duplication.
- **Schema-First**: Foundation phase (schemas) must complete before tool implementation to ensure type safety.
- **Independent Stories**: Each user story can be tested independently as a standalone feature increment.
- **Error Handling**: All tools must translate API errors to user-friendly messages per constants.ts.
- **Future-Ready**: Get-all schema includes pagination params (commented out, not implemented - YAGNI).
- **PUT Semantics**: Update tool uses PUT (full replacement) - both name and description must be provided even if only one changes.
