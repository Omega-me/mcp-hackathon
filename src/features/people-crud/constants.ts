/**
 * Constants for People CRUD Operations
 * Feature: people-crud
 */

/**
 * API Endpoints
 */
export const PEOPLE_BASE_PATH = "/people";
export const PEOPLE_BY_ID_PATH = (id: string) => `/people/${id}`;

/**
 * Validation Constants
 */
export const MAX_NAME_LENGTH = 255;
export const MIN_NAME_LENGTH = 1;

/**
 * Error Messages
 */
export const ERROR_MESSAGES = {
  AUTH_REQUIRED:
    "Authentication required. Please login using the login tool first.",
  INVALID_ID: "Invalid person ID format",
  FIRST_NAME_REQUIRED: "First name is required",
  LAST_NAME_REQUIRED: "Last name is required",
  EMAIL_REQUIRED: "Email is required",
  INVALID_EMAIL: "Invalid email format",
  NAME_TOO_LONG: `Name must not exceed ${MAX_NAME_LENGTH} characters`,
  NOT_FOUND: "Person not found",
  DUPLICATE_EMAIL: "A person with this email already exists",
  HAS_DEPENDENCIES: "Cannot delete person with existing dependencies",
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
