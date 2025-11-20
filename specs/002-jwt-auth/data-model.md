# Phase 1: Data Model - JWT Authentication System

**Feature**: JWT Authentication System  
**Date**: 2025-11-19  
**Status**: Complete

## Overview

This document defines the data entities, relationships, and validation rules for the JWT authentication feature. Since this feature integrates with an external auth API, the data model focuses on request/response structures and internal storage rather than persistent database schemas.

---

## Entity Definitions

### 1. LoginRequest

**Purpose**: Input parameters for login operation

**Fields**:
| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| email | string | Yes | Valid email format | User's email address |
| password | string | Yes | Min 1 char (API validates strength) | User's password |

**Example**:

```typescript
{
  email: "user@example.com",
  password: "SecurePass123!"
}
```

**Validation Rules**:

- Email must match RFC 5322 format
- Password cannot be empty
- No max length (API enforces limits)

---

### 2. SignupRequest

**Purpose**: Input parameters for user registration

**Fields**:
| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| email | string | Yes | Valid email format | User's email address |
| password | string | Yes | Min 1 char (API validates strength) | Desired password |
| firstName | string | No | Max 100 chars | User's first name |
| lastName | string | No | Max 100 chars | User's last name |

**Example**:

```typescript
{
  email: "newuser@example.com",
  password: "SecurePass123!",
  firstName: "John",
  lastName: "Doe"
}
```

**Validation Rules**:

- Email must match RFC 5322 format
- Password cannot be empty
- firstName and lastName are optional
- External API performs additional validation (password strength, email uniqueness)

---

### 3. AuthResponse

**Purpose**: Response from external auth API after successful authentication

**Fields**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| token | string | Yes | JWT token for authentication |
| userId | string | No | Unique user identifier |
| expiresAt | string (ISO 8601) | No | Token expiration timestamp |

**Example**:

```typescript
{
  token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  userId: "usr_1234567890",
  expiresAt: "2025-11-19T15:30:00Z"
}
```

**Notes**:

- Token format is opaque to this system (validated by external API)
- userId may be extracted from token or provided separately
- expiresAt is optional - token itself contains expiration

---

### 4. AuthError

**Purpose**: Error response from external auth API

**Fields**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| error | string | Yes | Error code (e.g., "invalid_credentials", "user_exists") |
| message | string | No | Human-readable error description |
| statusCode | number | No | HTTP status code |

**Example**:

```typescript
{
  error: "invalid_credentials",
  message: "Email or password is incorrect",
  statusCode: 401
}
```

**Common Error Codes**:

- `invalid_credentials`: Login failed (wrong email/password)
- `user_exists`: Signup failed (email already registered)
- `validation_error`: Input validation failed
- `server_error`: Internal auth API error
- `network_error`: Failed to reach auth API

---

### 5. TokenStorage (Internal)

**Purpose**: In-memory storage for authenticated user token

**Structure**:

```typescript
Map<string, StoredToken>;

interface StoredToken {
  token: string; // JWT token
  userId: string; // User identifier
  storedAt: Date; // When token was stored
  email?: string; // User email (optional)
}
```

**Example**:

```typescript
// Key: userId
tokenStorage.set("usr_1234567890", {
  token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  userId: "usr_1234567890",
  storedAt: new Date("2025-11-19T10:00:00Z"),
  email: "user@example.com",
});
```

**Characteristics**:

- Ephemeral (lost on server restart)
- Single entry (overwrites on new login)
- No expiration tracking (token contains expiry)
- Key is userId for quick lookup

---

### 6. GetTokenResponse

**Purpose**: Response from get-token MCP tool

**Fields**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| token | string | Yes | JWT token if user is authenticated |
| userId | string | No | User identifier |
| authenticated | boolean | Yes | Whether user has valid token |

**Example (authenticated)**:

```typescript
{
  token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  userId: "usr_1234567890",
  authenticated: true
}
```

**Example (not authenticated)**:

```typescript
{
  token: null,
  userId: null,
  authenticated: false
}
```

---

## Relationships

```
┌─────────────────┐
│  User (Client)  │
└────────┬────────┘
         │
         │ calls MCP tools
         ▼
┌─────────────────────────────────────┐
│  MCP Tools (login/signup/get-token) │
└────────┬────────────────────────────┘
         │
         ├─────────────────┐
         │                 │
         ▼                 ▼
┌──────────────────┐  ┌──────────────┐
│  External Auth   │  │    Token     │
│      API         │  │   Storage    │
│  (Login/Signup)  │  │  (In-Memory) │
└──────────────────┘  └──────────────┘
```

**Flow 1: Login/Signup**

1. User calls login or signup MCP tool with credentials
2. Tool forwards request to external auth API
3. API validates and returns AuthResponse with token
4. Tool stores token in TokenStorage
5. Tool returns success response to user

**Flow 2: Get Token**

1. User calls get-token MCP tool
2. Tool queries TokenStorage
3. Tool returns token if exists, else returns not authenticated

**Flow 3: Future Protected Endpoint**

1. User calls protected endpoint MCP tool
2. Tool calls get-token internally
3. Tool includes token in API request Authorization header
4. External API validates token and processes request

---

## State Transitions

### User Authentication State

```
┌─────────────────┐
│ Unauthenticated │ ──signup/login──> ┌──────────────┐
│  (No Token)     │                    │ Authenticated│
└─────────────────┘ <──server restart─ │ (Has Token)  │
                                       └──────────────┘
                                             │
                                             │ token expires
                                             │ (detected on API call)
                                             ▼
                                       ┌──────────────┐
                                       │   Expired    │
                                       │ (Need Login) │
                                       └──────────────┘
```

**States**:

- **Unauthenticated**: No token in storage
- **Authenticated**: Valid token in storage
- **Expired**: Token exists but rejected by API (user must re-login)

**Transitions**:

- `login` or `signup` → Authenticated
- `server restart` → Unauthenticated (storage cleared)
- `token expires` → Expired (detected on protected API call)
- `new login` → Authenticated (overwrites old token)

---

## Validation Rules Summary

### Input Validation (MCP Tool Level)

**LoginRequest**:

```typescript
{
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password required")
}
```

**SignupRequest**:

```typescript
{
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password required"),
  firstName: z.string().max(100).optional(),
  lastName: z.string().max(100).optional()
}
```

**GetTokenRequest**: No parameters (retrieves current user's token)

### External API Validation (Not Implemented Here)

The external auth API is responsible for:

- Password strength requirements
- Email uniqueness (no duplicates)
- Rate limiting
- Account lockout after failed attempts
- Email format beyond basic validation

### Storage Validation

Before storing token:

- Token must be non-empty string
- userId must be provided (from API response or extracted from token)

---

## Data Flow Examples

### Example 1: Successful Signup

**Input (SignupRequest)**:

```json
{
  "email": "newuser@example.com",
  "password": "MySecurePassword123!",
  "firstName": "Jane",
  "lastName": "Smith"
}
```

**External API Response (AuthResponse)**:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c3JfOTk5IiwiZW1haWwiOiJuZXd1c2VyQGV4YW1wbGUuY29tIiwiaWF0IjoxNzAwNDAwMDAwfQ.xxx",
  "userId": "usr_999",
  "expiresAt": "2025-11-19T20:00:00Z"
}
```

**Stored in TokenStorage**:

```typescript
Map {
  "usr_999" => {
    token: "eyJhbGciOiJIUzI1NiIs...",
    userId: "usr_999",
    storedAt: Date("2025-11-19T10:00:00Z"),
    email: "newuser@example.com"
  }
}
```

**Tool Response**:

```json
{
  "success": true,
  "message": "Signup successful",
  "userId": "usr_999"
}
```

---

### Example 2: Failed Login (Invalid Credentials)

**Input (LoginRequest)**:

```json
{
  "email": "user@example.com",
  "password": "WrongPassword"
}
```

**External API Response (AuthError)**:

```json
{
  "error": "invalid_credentials",
  "message": "Email or password is incorrect",
  "statusCode": 401
}
```

**Tool Response (Error)**:

```json
{
  "error": "Authentication failed",
  "details": "Email or password is incorrect"
}
```

**TokenStorage**: Unchanged (no token stored)

---

### Example 3: Get Token When Authenticated

**Input**: None (no parameters)

**TokenStorage State**:

```typescript
Map {
  "usr_999" => {
    token: "eyJhbGciOiJIUzI1NiIs...",
    userId: "usr_999",
    storedAt: Date("2025-11-19T10:00:00Z")
  }
}
```

**Tool Response**:

```json
{
  "authenticated": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "userId": "usr_999"
}
```

---

### Example 4: Get Token When Not Authenticated

**Input**: None

**TokenStorage State**: Empty Map

**Tool Response**:

```json
{
  "authenticated": false,
  "token": null,
  "userId": null,
  "message": "No active session. Please login or signup first."
}
```

---

## Mock Data (Initial Implementation)

For initial implementation without real external API:

**Mock AuthResponse**:

```typescript
{
  token: "mock-jwt-token-" + Date.now(),
  userId: "mock-user-" + Math.random().toString(36).substr(2, 9),
  expiresAt: new Date(Date.now() + 3600000).toISOString() // 1 hour from now
}
```

**Mock Success Conditions**:

- Any email + any password → Success (return mock token)
- Store in TokenStorage as normal
- Later replace with real API URL

**Mock Error Simulation** (Optional):

- Email "error@test.com" → Simulate API error
- Password "wrongpass" → Simulate invalid credentials

---

## Technical Constraints

### Memory Limitations

- Single token stored (single-user session)
- Storage cleared on server restart
- No persistence layer

### Concurrency

- No locking needed (single-threaded Node.js)
- Map operations are synchronous and atomic

### Performance

- O(1) token lookup by userId
- No expiration cleanup needed (tokens self-expire)

---

## Future Enhancements (Out of Scope)

- Multiple user sessions (Map with multiple entries)
- Token refresh mechanism
- Persistent storage (Redis/Database)
- Token expiration tracking and automatic cleanup
- Session management (activity tracking)
- User logout functionality

---

## References

- Feature spec: `specs/002-jwt-auth/spec.md`
- Research doc: `specs/002-jwt-auth/research.md`
- Zod documentation: https://zod.dev/
