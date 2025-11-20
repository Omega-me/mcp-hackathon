# Feature Specification: Additional API Tools Integration

**Feature Branch**: `004-api-tools-integration`  
**Created**: 2025-11-20  
**Status**: Draft  
**Input**: User description: "I need to create the other missing tools for this mcp server"

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Discover Available API Endpoints (Priority: P1)

Users need to know what API endpoints are available in the backend system so they can determine which MCP tools need to be created. The system should support querying or documenting all available endpoints.

**Why this priority**: Without knowing what endpoints exist on the backend API (http://10.138.80.113:5000), it's impossible to create MCP tools for them. This is the foundational step that enables all other work.

**Independent Verification**: Can be verified by accessing the backend API documentation endpoint (if available) or by manual inspection of the backend API codebase. Delivers immediate value by providing a complete inventory of available functionality.

**Acceptance Scenarios**:

1. **Given** the backend API is running, **When** a user requests the list of available endpoints, **Then** the system returns all HTTP endpoints with their methods (GET, POST, PUT, DELETE) and paths
2. **Given** endpoint documentation exists, **When** a user accesses it, **Then** they receive information about required parameters, authentication requirements, and response formats for each endpoint
3. **Given** no documentation endpoint exists, **When** a developer inspects the backend codebase, **Then** they can identify all REST endpoints and their specifications

---

### User Story 2 - Create MCP Tools for Identified Endpoints (Priority: P2)

Once endpoints are identified, users need to implement MCP tools that expose these backend API endpoints through the Model Context Protocol, following the established patterns from existing tools (hello, auth, organizations).

**Why this priority**: This transforms discovered endpoints into usable MCP tools. Each new tool extends the capabilities of the MCP server, enabling AI assistants to interact with more backend functionality.

**Independent Verification**: Can be verified by implementing a single MCP tool for one endpoint, invoking it through the MCP Inspector or HTTP transport, and confirming it successfully calls the backend API and returns formatted results.

**Acceptance Scenarios**:

1. **Given** a backend endpoint specification exists (e.g., GET /api/users), **When** a developer creates an MCP tool following the project patterns, **Then** the tool can be invoked via MCP protocol and successfully proxies requests to the backend
2. **Given** an MCP tool is registered with the server, **When** a client lists available tools via `tools/list`, **Then** the new tool appears with accurate descriptions and input schemas
3. **Given** a tool requires authentication, **When** the tool is invoked, **Then** it automatically includes the stored JWT token from the auth system

---

### User Story 3 - Handle Various HTTP Methods (Priority: P3)

The MCP tools should support all common HTTP methods (GET, POST, PUT, PATCH, DELETE) used by the backend API, properly mapping MCP tool parameters to appropriate HTTP request formats (query params, request body, path parameters).

**Why this priority**: Different endpoints use different HTTP methods and parameter styles. Supporting all methods ensures comprehensive API coverage, though basic GET/POST support delivers initial value.

**Independent Verification**: Can be verified by creating tools for endpoints using different HTTP methods (GET for retrieval, POST for creation, PUT for updates, DELETE for removal) and confirming each correctly formats the HTTP request.

**Acceptance Scenarios**:

1. **Given** an endpoint uses GET with query parameters, **When** an MCP tool is invoked with parameters, **Then** parameters are formatted as URL query strings
2. **Given** an endpoint uses POST with JSON body, **When** an MCP tool is invoked, **Then** parameters are serialized as JSON in the request body
3. **Given** an endpoint uses path parameters (e.g., /users/{id}), **When** an MCP tool is invoked with an id parameter, **Then** the id is interpolated into the URL path correctly

---

### User Story 4 - Validate Tool Parameters (Priority: P4)

Each MCP tool validates input parameters according to the backend API requirements before making HTTP requests, providing clear error messages for validation failures.

**Why this priority**: Input validation prevents unnecessary API calls and provides better error messages to users, but basic functionality works without comprehensive validation initially.

**Independent Verification**: Can be verified by invoking a tool with invalid parameters (missing required fields, wrong data types, out-of-range values) and confirming the tool returns validation errors before calling the backend API.

**Acceptance Scenarios**:

1. **Given** an endpoint requires a specific parameter type (e.g., number), **When** a tool is invoked with a string value, **Then** validation fails with a clear type error message
2. **Given** an endpoint has required parameters, **When** a tool is invoked with missing parameters, **Then** validation fails listing which required parameters are missing
3. **Given** an endpoint has constraints (e.g., string length 1-255), **When** a tool is invoked with invalid values, **Then** validation fails with constraint details

---

### Edge Cases

- What happens when the backend API adds new endpoints after MCP tools are deployed?
- How does the system handle endpoints with complex nested JSON payloads?
- What happens when an endpoint requires specific headers beyond authentication?
- How does the system handle endpoints that return binary data (files, images)?
- What happens when an endpoint requires multipart/form-data for file uploads?
- How does the system handle endpoints with pagination requiring multiple sequential calls?
- What happens when endpoint parameter names conflict with MCP reserved keywords?
- How does the system handle endpoints that use non-REST patterns (GraphQL, WebSocket)?

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST identify what backend API endpoints exist at http://10.138.80.113:5000 beyond the currently implemented ones (/api/hello, /auth/signup, /auth/login, /organizations)
- **FR-002**: System MUST provide MCP tools for each identified backend endpoint following the established architectural patterns (tools/, services/, constants.ts, types.ts structure)
- **FR-003**: Each new MCP tool MUST have a clear description indicating what backend endpoint it queries and what data it returns
- **FR-004**: Each new MCP tool MUST define input schemas using appropriate validation (Zod schemas following project patterns)
- **FR-005**: System MUST support GET requests with query parameters for retrieval operations
- **FR-006**: System MUST support POST requests with JSON bodies for creation operations
- **FR-007**: System MUST support PUT/PATCH requests with JSON bodies for update operations
- **FR-008**: System MUST support DELETE requests for deletion operations
- **FR-009**: System MUST support path parameters (e.g., /endpoint/{id}) in tool implementations
- **FR-010**: Tools for protected endpoints MUST include JWT authentication tokens from the existing auth system
- **FR-011**: System MUST format API responses as JSON text content with 2-space indentation within MCP protocol responses
- **FR-012**: System MUST provide clear error messages when backend API requests fail
- **FR-013**: System MUST validate tool input parameters before making backend API calls
- **FR-014**: System MUST register all new tools with the MCP server following the established registration pattern in server.ts
- **FR-015**: Tools MUST reuse the existing api-client service for HTTP requests to maintain consistency

### Key Entities _(include if feature involves data)_

- **API Endpoint**: Represents a backend HTTP endpoint with method (GET/POST/PUT/DELETE), path, parameters, authentication requirements, and response format
- **MCP Tool**: Maps to a single API endpoint, defines input schema, handles parameter transformation, invokes backend API, and formats response for MCP protocol
- **Tool Parameter**: Input to an MCP tool that maps to either query params, path params, or request body fields depending on HTTP method

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: All available backend API endpoints at http://10.138.80.113:5000 are identified and documented
- **SC-002**: Each identified endpoint has a corresponding MCP tool that can be successfully invoked via MCP protocol
- **SC-003**: Tool invocations complete within 5 seconds including backend API call time (assuming backend API responds within 3 seconds)
- **SC-004**: Tool descriptions are clear enough that LLM clients can determine which tool to use for a given task without ambiguity
- **SC-005**: 100% of tool invocations with valid parameters successfully reach the backend API and return responses
- **SC-006**: Invalid tool parameters are caught by validation with error messages returned within 100ms (before making backend API calls)

## Assumptions _(optional)_

- The backend API at http://10.138.80.113:5000 may have additional endpoints beyond /api/hello, /auth/\*, and /organizations
- Additional endpoints follow RESTful conventions similar to the organizations endpoints
- Additional endpoints that require authentication use the same JWT token pattern as organizations endpoints
- The backend API provides consistent error response formats across all endpoints
- No endpoints require special handling beyond standard HTTP methods and JSON payloads (no file uploads, WebSockets, or GraphQL for initial implementation)

## Dependencies _(optional)_

- **Existing MCP Server Infrastructure** (Feature 001): Relies on established server architecture, transports, and api-client service
- **JWT Authentication System** (Feature 002): Protected endpoints will use stored tokens from login/signup tools
- **Backend API Availability**: The backend API at http://10.138.80.113:5000 must be accessible and responsive
- **Backend API Documentation**: Endpoint discovery depends on either API documentation or direct inspection of backend codebase

## Out of Scope _(optional)_

- Modifying the backend API itself - this feature only creates MCP tools for existing endpoints
- Creating tools for non-REST protocols (GraphQL, gRPC, WebSocket) in initial implementation
- File upload/download functionality requiring multipart/form-data or binary handling
- Real-time endpoints requiring WebSocket connections
- Batch operations that call multiple backend endpoints in a single MCP tool invocation
- Auto-discovery mechanisms that dynamically register tools based on OpenAPI/Swagger specs (manual tool creation only)

## Open Questions _(optional)_

### Question 1: Which Backend API Endpoints Exist?

**Context**: The user mentioned "missing tools" but didn't specify which backend API endpoints need MCP tools created for them.

**What we need to know**: What additional endpoints exist on the backend API at http://10.138.80.113:5000 beyond the currently implemented ones?

**Suggested Answers**:

| Option | Answer                                                                                                        | Implications                                                                                                |
| ------ | ------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| A      | **Users CRUD**: GET /users (list), POST /users (create), GET /users/{id}, PUT /users/{id}, DELETE /users/{id} | Need to create 5 user management tools similar to organizations pattern, likely requiring admin permissions |
| B      | **Projects/Teams CRUD**: Similar CRUD operations for project or team entities                                 | Need to create another set of 5 CRUD tools, may have relationships to organizations                         |
| C      | **Audit/Activity Logs**: GET /audit-logs, GET /activity endpoints for viewing system events                   | Need read-only tools for security/compliance monitoring, may support filtering by date/user                 |
| D      | **Settings/Configuration**: GET /settings, PUT /settings endpoints                                            | Need tools for system or user preference management                                                         |
| E      | **No additional endpoints**: Only hello, auth, and organizations exist                                        | No additional tools needed - feature may not be necessary                                                   |
| F      | Custom                                                                                                        | Access backend API documentation or codebase to identify actual endpoints                                   | Requires investigation step before implementation |

**Your choice**: _[Wait for user response]_

---

### Question 2: Should Tools Be Generated or Hand-Crafted?

**Context**: Creating MCP tools requires writing TypeScript code with schemas, handlers, and metadata. This could be done manually for each endpoint or via code generation.

**What we need to know**: Should each tool be hand-crafted following existing patterns, or should we create a code generator/template system?

**Suggested Answers**:

| Option | Answer                                                                                               | Implications                                                                        |
| ------ | ---------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| A      | **Hand-craft each tool**: Write each tool manually like existing ones (hello, auth, organizations)   | More flexible, easier to customize, follows YAGNI principle, but more time per tool |
| B      | **Create tool generator script**: Build a script that generates tool boilerplate from endpoint specs | Faster for multiple endpoints, ensures consistency, but adds complexity upfront     |
| C      | **Mixed approach**: Hand-craft first 1-2 tools, then evaluate if generator is needed                 | Start simple, add generator only if pattern becomes repetitive (YAGNI-compliant)    |

**Your choice**: _[Wait for user response]_

---

### Question 3: How Should New Tools Be Organized?

**Context**: Currently there are three features (mcp-api-server, jwt-auth, organizations-crud) with tools organized within each feature directory.

**What we need to know**: Should new API endpoint tools be added to existing features or organized differently?

**Suggested Answers**:

| Option | Answer                                                                                                                      | Implications                                                                                  |
| ------ | --------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| A      | **Add to mcp-api-server feature**: Place all new tools in src/features/mcp-api-server/tools/                                | Simpler structure, all API tools in one place, but that directory grows large                 |
| B      | **Create feature per domain**: If adding users endpoints, create src/features/users-crud/ following organizations pattern   | Better separation of concerns, clearer boundaries, follows existing pattern for organizations |
| C      | **Create generic additional-api-tools feature**: New feature directory src/features/additional-api-tools/ for all new tools | Groups new functionality together, but may become a catch-all without clear domain boundaries |

**Your choice**: _[Wait for user response]_
