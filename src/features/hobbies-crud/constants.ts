// API endpoints
export const HOBBIES_BASE_PATH = "/hobbies";
export const HOBBIES_BY_ID_PATH = "/hobbies/:id";

// Validation limits
export const MIN_NAME_LENGTH = 1;
export const MAX_NAME_LENGTH = 255;
export const MAX_DESCRIPTION_LENGTH = 1000;

// HTTP status codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
} as const;

// Error messages
export const ERROR_MESSAGES = {
  AUTH_REQUIRED:
    "Authentication required. Please login first using the login tool.",
  INVALID_ID: "Invalid hobby ID provided",
  NAME_REQUIRED: "Hobby name is required",
  NAME_TOO_LONG: `Hobby name must be ${MAX_NAME_LENGTH} characters or less`,
  DESCRIPTION_TOO_LONG: `Description must be ${MAX_DESCRIPTION_LENGTH} characters or less`,
  HOBBY_NOT_FOUND: "Hobby not found",
  DUPLICATE_NAME: "A hobby with this name already exists",
  DELETE_CONFLICT:
    "Cannot delete hobby. Hobby may have dependencies or constraints.",
  API_ERROR: "API request failed",
  NETWORK_ERROR: "Network error occurred while communicating with API",
} as const;
