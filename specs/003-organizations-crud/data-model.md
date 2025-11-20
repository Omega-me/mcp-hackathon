# Data Model: Organizations CRUD Operations

**Feature**: Organizations CRUD Operations  
**Date**: November 20, 2025  
**Phase**: Phase 1 - Design

## Organization Entity

### Core Fields

| Field         | Type              | Required           | Description                                  | Constraints                            |
| ------------- | ----------------- | ------------------ | -------------------------------------------- | -------------------------------------- |
| `id`          | string            | Yes (API assigned) | Unique identifier for the organization       | System-generated, immutable            |
| `name`        | string            | Yes                | Organization name                            | 1-255 characters, unique across system |
| `description` | string            | No                 | Organization description                     | Optional, no length limit specified    |
| `createdAt`   | string (ISO 8601) | Yes (API assigned) | Timestamp when organization was created      | System-generated, immutable            |
| `updatedAt`   | string (ISO 8601) | Yes (API assigned) | Timestamp when organization was last updated | System-updated on changes              |

### TypeScript Interface

```typescript
export interface Organization {
  id: string;
  name: string;
  description?: string;
  createdAt: string; // ISO 8601 timestamp
  updatedAt: string; // ISO 8601 timestamp
}
```

---

## Request Schemas

### 1. Get All Organizations

**Endpoint**: `GET /organizations`

**Parameters**: None (current implementation)

**Future Parameters** (schema-defined, not implemented):

```typescript
interface GetAllOrganizationsParams {
  page?: number; // Pagination page number
  limit?: number; // Results per page (max 100)
  filter?: string; // Filter criteria
}
```

**Response**:

```typescript
interface GetAllOrganizationsResponse {
  data: Organization[];
  // Future: pagination metadata
  // total?: number;
  // page?: number;
  // limit?: number;
}
```

**Zod Schema**:

```typescript
// Current: accepts no parameters, but schema allows future extension
export const GetAllOrganizationsParamsSchema = z
  .object({
    page: z.number().int().positive().optional(),
    limit: z.number().int().positive().max(100).optional(),
    filter: z.string().optional(),
  })
  .optional();
```

---

### 2. Create Organization

**Endpoint**: `POST /organizations`

**Request Body**:

```typescript
interface CreateOrganizationRequest {
  name: string; // Required, 1-255 chars
  description?: string; // Optional
}
```

**Response**:

```typescript
interface CreateOrganizationResponse {
  data: Organization; // Newly created organization with ID
}
```

**Zod Schema**:

```typescript
export const CreateOrganizationSchema = z.object({
  name: z
    .string()
    .min(1, "Organization name is required")
    .max(255, "Organization name must not exceed 255 characters")
    .trim(),
  description: z.string().optional(),
});

export type CreateOrganizationInput = z.infer<typeof CreateOrganizationSchema>;
```

**Validation Rules**:

- `name`: Required, non-empty after trimming, max 255 characters
- `description`: Optional, no length constraint
- Unique name constraint enforced by API (returns 409 Conflict if duplicate)

---

### 3. Get Organization by ID

**Endpoint**: `GET /organizations/{id}`

**URL Parameters**:

```typescript
interface GetOrganizationParams {
  id: string; // Required
}
```

**Response**:

```typescript
interface GetOrganizationResponse {
  data: Organization;
}
```

**Zod Schema**:

```typescript
export const OrganizationIdSchema = z.object({
  id: z.string().min(1, "Organization ID is required").trim(),
});

export type OrganizationIdInput = z.infer<typeof OrganizationIdSchema>;
```

**Validation Rules**:

- `id`: Required, non-empty string after trimming
- Format validation depends on API (UUID, integer, etc.)

---

### 4. Update Organization (PUT)

**Endpoint**: `PUT /organizations/{id}`

**URL Parameters**:

```typescript
interface UpdateOrganizationParams {
  id: string; // Required in URL
}
```

**Request Body**:

```typescript
interface UpdateOrganizationRequest {
  name: string; // Required (full replacement)
  description?: string; // Optional, but must be provided
}
```

**Response**:

```typescript
interface UpdateOrganizationResponse {
  data: Organization; // Updated organization
}
```

**Zod Schema**:

```typescript
export const UpdateOrganizationSchema = z.object({
  id: z.string().min(1, "Organization ID is required").trim(),
  name: z
    .string()
    .min(1, "Organization name is required")
    .max(255, "Organization name must not exceed 255 characters")
    .trim(),
  description: z.string().optional(),
});

export type UpdateOrganizationInput = z.infer<typeof UpdateOrganizationSchema>;
```

**Validation Rules**:

- `id`: Required, non-empty string
- `name`: Required, non-empty after trimming, max 255 characters
- `description`: Optional (can be empty string or omitted)
- PUT semantics: replaces entire resource, all fields must be provided

---

### 5. Delete Organization

**Endpoint**: `DELETE /organizations/{id}`

**URL Parameters**:

```typescript
interface DeleteOrganizationParams {
  id: string; // Required
}
```

**Response**:

```typescript
interface DeleteOrganizationResponse {
  success: boolean;
  message?: string;
}
```

**Zod Schema**:

```typescript
export const DeleteOrganizationSchema = z.object({
  id: z.string().min(1, "Organization ID is required").trim(),
});

export type DeleteOrganizationInput = z.infer<typeof DeleteOrganizationSchema>;
```

**Validation Rules**:

- `id`: Required, non-empty string after trimming
- API may return error if organization has dependencies (409 Conflict)

---

## Error Response Schema

All endpoints return errors in this format:

```typescript
interface ErrorResponse {
  error: {
    message: string;
    code?: string;
    details?: unknown;
  };
}
```

**HTTP Status Codes**:

- `200 OK`: Successful GET, PUT
- `201 Created`: Successful POST
- `204 No Content`: Successful DELETE
- `400 Bad Request`: Invalid input parameters
- `401 Unauthorized`: Missing or invalid authentication token
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Organization ID not found
- `409 Conflict`: Duplicate name or organization has dependencies
- `422 Unprocessable Entity`: Validation errors
- `500 Internal Server Error`: Server-side error

---

## State Transitions

```
[Non-existent] --CREATE--> [Active]
[Active] --READ--> [Active]
[Active] --UPDATE--> [Active]
[Active] --DELETE--> [Non-existent]
```

**Notes**:

- Organizations have no intermediate states (no draft, archived, etc.)
- DELETE is permanent (no soft delete in current scope)
- No state field in organization entity

---

## Validation Summary

### Client-Side (Zod) Validation

Performed before API call:

- Required field presence
- String length constraints
- Type validation
- Parameter trimming

### Server-Side (API) Validation

Assumed to be handled by API:

- Unique name constraint
- ID existence validation
- Dependency checks for delete
- Business rule validation
- Authorization checks

---

## Data Flow

### Create Flow

```
User/LLM Input → Zod Validation → API POST /organizations → Response → Return Organization
```

### Read Flow

```
User/LLM Input → Zod Validation → API GET /organizations or /organizations/{id} → Response → Return Organization(s)
```

### Update Flow

```
User/LLM Input → Zod Validation → API PUT /organizations/{id} → Response → Return Updated Organization
```

### Delete Flow

```
User/LLM Input → Zod Validation → API DELETE /organizations/{id} → Response → Return Success
```

---

## Constants

```typescript
// API Endpoints
export const ORGANIZATIONS_BASE_PATH = "/organizations";
export const ORGANIZATIONS_BY_ID_PATH = "/organizations/:id";

// Validation
export const MAX_ORGANIZATION_NAME_LENGTH = 255;
export const MIN_ORGANIZATION_NAME_LENGTH = 1;

// Error Messages
export const ERROR_MESSAGES = {
  AUTH_REQUIRED:
    "Authentication required. Please login using the login tool first.",
  INVALID_ID: "Invalid organization ID format",
  NAME_REQUIRED: "Organization name is required",
  NAME_TOO_LONG: "Organization name must not exceed 255 characters",
  NOT_FOUND: "Organization not found",
  DUPLICATE_NAME: "Organization with this name already exists",
  HAS_DEPENDENCIES: "Cannot delete organization with existing dependencies",
  SERVER_ERROR: "Server error occurred. Please try again.",
} as const;
```

---

## Implementation Notes

1. **Immutable Fields**: `id`, `createdAt`, `updatedAt` are managed by API, never sent in requests
2. **Type Safety**: Zod schemas provide runtime validation AND TypeScript type inference
3. **Extensibility**: Get-all schema includes future pagination parameters (not implemented)
4. **Error Handling**: All tools must catch and translate API errors to user-friendly messages
5. **Authentication**: All endpoints require JWT token in Authorization header
6. **Idempotency**: PUT and DELETE should be idempotent (safe to retry)
