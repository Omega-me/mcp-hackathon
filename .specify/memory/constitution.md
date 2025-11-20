<!--
Sync Impact Report:
- Version: 0.0.0 → 1.0.0
- Initial constitution creation
- Principles defined: 6 core principles (YAGNI, Feature-Based Architecture, TypeScript/Node.js Stack, SOLID, Constants Pattern, No Testing)
- Templates alignment: All templates remain compatible (no breaking changes)
- Follow-up: None - all placeholders filled
-->

# Hackathon Project Constitution

## Core Principles

### I. YAGNI (You Aren't Gonna Need It)

Build only what is needed NOW. Do not implement features, abstractions, or infrastructure for anticipated future requirements.

**Rules:**

- MUST NOT create generic solutions before specific use cases exist
- MUST NOT add configuration options until second use case emerges
- MUST NOT build frameworks or platforms — build concrete features
- MUST remove unused code immediately

**Rationale:** Premature abstraction wastes time, increases complexity, and often solves the wrong problem. Features built for hypothetical futures become maintenance burdens.

### II. Feature-Based Architecture

Code MUST be organized by feature/domain, not by technical layer. Each feature is a self-contained module with its own models, services, utilities, and types.

**Rules:**

- Structure: `src/features/<feature-name>/` containing all feature code
- Each feature MUST have its own directory with clear boundaries
- Shared code goes in `src/shared/` only after used by 3+ features
- MUST NOT organize by technical layers (controllers/, models/, services/)

**Rationale:** Feature-based structure enables independent development, clear ownership, easy feature removal, and prevents shared monolithic layers that create coupling.

### III. TypeScript + Node.js Latest + pnpm

All code MUST be written in TypeScript using the latest stable Node.js version and pnpm as the package manager.

**Rules:**

- TypeScript strict mode MUST be enabled
- MUST use latest Node.js LTS version
- MUST use pnpm for dependency management
- MUST use modern ES modules (ESM) syntax
- MUST define explicit types — avoid `any`

**Rationale:** TypeScript provides type safety and better IDE support. Latest Node.js ensures modern features and performance. pnpm provides fast, disk-space-efficient dependency management.

### IV. SOLID Principles

Code MUST follow SOLID object-oriented design principles to maintain clean, maintainable architecture.

**Rules:**

- **Single Responsibility**: Each class/module has one reason to change
- **Open/Closed**: Open for extension, closed for modification
- **Liskov Substitution**: Subtypes must be substitutable for base types
- **Interface Segregation**: Many specific interfaces over one general interface
- **Dependency Inversion**: Depend on abstractions, not concretions

**Rationale:** SOLID principles prevent code rot, reduce coupling, enable testability, and make code easier to understand and modify.

### V. Constants Pattern

All magic values, configuration, and enums MUST be defined as named constants in dedicated constant files.

**Rules:**

- Create `constants.ts` per feature for feature-specific constants
- Create `src/shared/constants/` for cross-feature constants
- MUST use SCREAMING_SNAKE_CASE for constant names
- MUST group related constants using objects or enums
- MUST NOT use inline literals for business values

**Rationale:** Named constants improve readability, prevent typos, enable refactoring, and centralize configuration.

### VI. KISS (Keep It Simple, Stupid)

Favor simple, straightforward solutions over clever or complex ones. Optimize for readability and maintainability.

**Rules:**

- MUST choose the simplest solution that works
- MUST prefer explicit over implicit behavior
- MUST avoid unnecessary abstractions and indirection
- MUST write self-documenting code with clear names
- MUST question any solution that requires extensive comments

**Rationale:** Simple code is easier to understand, debug, and modify. Complexity should only be introduced when simpler approaches prove insufficient.

## Technology Stack

**Mandatory Technologies:**

- **Language**: TypeScript (strict mode)
- **Runtime**: Node.js (latest LTS)
- **Package Manager**: pnpm
- **Module System**: ES Modules (ESM)

**Standard Practices:**

- Use functional programming patterns where appropriate
- Prefer immutability and pure functions
- Use async/await for asynchronous operations
- Follow consistent code formatting (Prettier recommended)

## Testing Policy

**This project explicitly does NOT require tests.** No unit tests, integration tests, or end-to-end tests are needed.

**Rules:**

- Do NOT create test files or test infrastructure
- Do NOT include testing frameworks in dependencies
- Focus development time on feature implementation
- Manual testing and verification is sufficient

**Rationale:** This is a hackathon/prototype project where speed of development is prioritized over long-term maintainability. Testing infrastructure adds overhead without sufficient benefit for this use case.

## Development Workflow

**Feature Development:**

1. Create feature branch: `###-feature-name`
2. Implement feature in `src/features/<feature-name>/`
3. Follow YAGNI — build only what's needed
4. Use constants for all magic values
5. Ensure TypeScript compiles without errors
6. Manual verification of functionality

**Code Organization:**

- Each feature is self-contained in its directory
- Shared utilities only after 3+ feature use
- Clear module boundaries with explicit exports
- Consistent file naming: kebab-case for files, PascalCase for classes

**Quality Gates:**

- TypeScript compilation succeeds with no errors
- Code follows SOLID principles
- No magic values — constants used throughout
- Simple, readable implementation (KISS)
- YAGNI compliance — no speculative features

## Governance

This constitution defines the non-negotiable rules for this project. All development decisions, code reviews, and architecture choices MUST align with these principles.

**Amendment Process:**

- Amendments require explicit documentation of reasoning
- Version number MUST be updated according to semantic versioning
- Breaking principle changes increment MAJOR version
- New principles or expanded guidance increment MINOR version
- Clarifications and wording changes increment PATCH version

**Compliance:**

- All code reviews MUST verify constitution compliance
- Violations MUST be justified and documented
- Complexity MUST be justified against YAGNI and KISS principles
- When in doubt, choose the simpler, more constrained option

**Version**: 1.0.0 | **Ratified**: 2025-11-19 | **Last Amended**: 2025-11-19
