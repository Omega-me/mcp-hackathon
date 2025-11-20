# Implementation Plan: MCP API Server

**Branch**: `001-mcp-api-server` | **Date**: 2025-11-19 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-mcp-api-server/spec.md`

## Summary

Build an MCP (Model Context Protocol) server that exposes tools to query external API endpoints. The server will support both stdio and HTTP transports, allowing it to be used as a local spawned process or as a remote HTTP service. Initial implementation focuses on a single tool that queries the `/api/hello` endpoint at `http://10.138.80.113:5000`.

## Technical Context

**Language/Version**: TypeScript with Node.js (latest LTS - v22.x)
**Primary Dependencies**: @modelcontextprotocol/sdk, Express, Zod, Axios
**Storage**: N/A (stateless API proxy)
**Package Manager**: pnpm (required per constitution)
**Target Platform**: Server/API (dual transport: stdio + HTTP)
**Project Type**: Single project with feature-based architecture
**Performance Goals**: <2s response time for API queries, support 100 concurrent requests
**Constraints**: API endpoint at http://10.138.80.113:5000 must be reachable, <200ms p95 for MCP protocol overhead
**Scale/Scope**: Single feature with 1 tool initially, extensible to multiple tools

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

### Constitution Compliance

✅ **YAGNI**: Building only what's needed - single tool for one endpoint, no premature abstraction
✅ **Feature-Based Architecture**: Will organize as `src/features/mcp-api-server/`
✅ **TypeScript + Node.js + pnpm**: All mandatory technologies will be used
✅ **SOLID Principles**: Will apply separation of concerns (transport, server, API client)
✅ **Constants Pattern**: API URLs, timeouts, and MCP metadata will be constants
✅ **KISS**: Simple, direct implementation without unnecessary complexity
✅ **No Testing**: Per constitution, no test infrastructure will be created

### Potential Violations

None identified. This implementation aligns with all constitution principles.

## Project Structure

### Documentation (this feature)

```text
specs/001-mcp-api-server/
├── plan.md              # This file
├── research.md          # Phase 0 output (MCP SDK patterns, transport setup)
├── data-model.md        # Phase 1 output (API request/response structures)
├── quickstart.md        # Phase 1 output (How to run the server)
├── contracts/           # Phase 1 output (Tool schemas)
│   └── hello-tool.json
└── checklists/
    └── requirements.md  # Specification quality checklist
```

### Source Code (repository root)

```text
src/
├── features/
│   └── mcp-api-server/
│       ├── transports/
│       │   ├── stdio-transport.ts    # stdio transport setup
│       │   └── http-transport.ts     # Express + HTTP transport setup
│       ├── tools/
│       │   └── hello-tool.ts         # Hello API tool implementation
│       ├── services/
│       │   └── api-client.ts         # HTTP client for external API
│       ├── types.ts                  # TypeScript interfaces
│       ├── constants.ts              # API URLs, timeouts, MCP metadata
│       └── server.ts                 # MCP server setup
├── shared/
│   ├── types/
│   │   └── mcp.ts                    # Shared MCP types (if needed)
│   └── utils/
│       └── logger.ts                 # Simple logging utility
├── stdio-entry.ts                    # Entry point for stdio transport
├── http-entry.ts                     # Entry point for HTTP transport
└── index.ts                          # Main entry (chooses transport based on env)

package.json
tsconfig.json
.env.example
README.md
```

**Structure Decision**: Single project with feature-based architecture. The MCP API server is organized as a single feature under `src/features/mcp-api-server/` with clear separation between transports, tools, services, and configuration. Entry points are at the root level to support both stdio and HTTP transports.

## Complexity Tracking

> **No violations detected - this section can remain empty**

## Post-Design Constitution Review

_Re-evaluation after Phase 1 design completed_

### Design Decisions Review

✅ **YAGNI Compliance**:

- Single tool implementation (hello) - no premature tool framework
- Stateless HTTP transport - no session management until needed
- Simple error wrapping - no complex error recovery until needed
- Environment variables only - no config file system until 3+ variables

✅ **Feature-Based Architecture**:

- All code under `src/features/mcp-api-server/`
- Clear subdirectories: transports/, tools/, services/
- No shared code yet (will move to shared/ only after 3+ features)

✅ **TypeScript + Node.js + pnpm**:

- Strict mode TypeScript with ES2022
- ESM modules throughout
- pnpm for dependency management
- Explicit types, no `any` usage

✅ **SOLID Principles**:

- Single Responsibility: Each module has one job (transport, tool, API client)
- Open/Closed: New tools can be added without modifying existing code
- Dependency Inversion: Server depends on abstractions (McpServer, Transport interfaces)
- Interface Segregation: Tool, Transport, and ApiClient are separate concerns

✅ **Constants Pattern**:

- All constants in `constants.ts` (API URLs, timeouts, tool metadata)
- SCREAMING_SNAKE_CASE for constant names
- Grouped by domain (SERVER_CONFIG, API_CONFIG, TOOLS)

✅ **KISS**:

- Simple, straightforward implementation
- No unnecessary abstractions
- Direct API calls without complex middleware
- Clear, self-documenting code structure

### Final Approval

**Status**: ✅ APPROVED - No constitution violations

The design maintains full alignment with all constitution principles. Implementation can proceed to Phase 2 (tasks breakdown via `/speckit.tasks` command).

## Summary

This implementation plan defines a focused, constitution-compliant MCP server that:

1. Exposes a single `hello` tool querying `http://10.138.80.113:5000/api/hello`
2. Supports both stdio and HTTP transports
3. Uses official MCP SDK, Express, Zod, and Axios
4. Follows feature-based architecture with clear separation of concerns
5. Implements only what's needed now (YAGNI)
6. Maintains simplicity throughout (KISS)

**Next Command**: `/speckit.tasks` to break down implementation into actionable tasks.

| Violation                  | Why Needed         | Simpler Alternative Rejected Because |
| -------------------------- | ------------------ | ------------------------------------ |
| [e.g., 4th project]        | [current need]     | [why 3 projects insufficient]        |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient]  |
