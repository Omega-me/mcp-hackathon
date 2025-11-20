/**
 * Constants for Organizations CRUD Operations
 * Feature: organizations-crud
 */

/**
 * API Endpoints
 */
export const ORGANIZATIONS_BASE_PATH = "/organizations";
export const ORGANIZATIONS_BY_ID_PATH = (id: string) => `/organizations/${id}`;

/**
 * Validation Constants
 */
export const MAX_ORGANIZATION_NAME_LENGTH = 255;
export const MIN_ORGANIZATION_NAME_LENGTH = 1;

/**
 * Error Messages
 */
export const ERROR_MESSAGES = {
  AUTH_REQUIRED:
    "Authentication required. Please login using the login tool first.",
  INVALID_ID: "Invalid organization ID format",
  NAME_REQUIRED: "Organization name is required",
  NAME_TOO_LONG: `Organization name must not exceed ${MAX_ORGANIZATION_NAME_LENGTH} characters`,
  NOT_FOUND: "Organization not found",
  DUPLICATE_NAME: "Organization with this name already exists",
  HAS_DEPENDENCIES: "Cannot delete organization with existing dependencies",
  SERVER_ERROR: "Server error occurred. Please try again.",
  FORBIDDEN: "Access denied. Insufficient permissions.",
  VALIDATION_ERROR: "Validation error occurred",
} as const;

/**
 * HTTP Status Codes
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  SERVER_ERROR: 500,
} as const;
