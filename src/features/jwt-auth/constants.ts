/**
 * JWT Authentication Feature Constants
 *
 * Centralized configuration for auth API integration and tool metadata.
 * Follows the Constants Pattern from project constitution.
 */

// ====================
// Auth API Configuration
// ====================

export const AUTH_API_CONFIG = {
  BASE_URL: process.env.AUTH_API_BASE_URL || "http://10.138.80.113:5000/api",
  LOGIN_ENDPOINT: "/auth/login",
  SIGNUP_ENDPOINT: "/auth/register",
  TIMEOUT: 30000, // milliseconds (30 seconds)
  HEADERS: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
} as const;

// ====================
// Error Messages
// ====================

export const ERROR_MESSAGES = {
  // Validation Errors
  INVALID_EMAIL: "Invalid email format",
  PASSWORD_REQUIRED: "Password is required",
  FIRSTNAME_TOO_LONG: "First name must be 100 characters or less",
  LASTNAME_TOO_LONG: "Last name must be 100 characters or less",

  // Authentication Errors
  INVALID_CREDENTIALS: "Invalid email or password",
  USER_EXISTS: "User already exists with this email",

  // Network/API Errors
  NETWORK_ERROR: "Network error: Unable to reach authentication service",
  API_ERROR: "Authentication service error",
  TIMEOUT_ERROR: "Authentication request timed out",

  // Token Storage Errors
  NO_TOKEN: "No active session. Please login or signup first.",
  TOKEN_STORAGE_ERROR: "Failed to store authentication token",

  // Generic
  UNKNOWN_ERROR: "An unexpected error occurred",
} as const;

// ====================
// Success Messages
// ====================

export const SUCCESS_MESSAGES = {
  SIGNUP_SUCCESS: "Signup successful",
  LOGIN_SUCCESS: "Login successful",
  TOKEN_RETRIEVED: "Token retrieved successfully",
} as const;

// ====================
// Tool Metadata
// ====================

export const TOOLS = {
  SIGNUP: {
    name: "signup",
    description:
      "Register a new user account. Creates a new user with email and password, optionally including first and last name. Returns success confirmation with userId and automatically stores the authentication token for immediate use.",
  },
  LOGIN: {
    name: "login",
    description:
      "Authenticate an existing user. Validates credentials (email and password) and returns a JWT token for accessing protected endpoints. The token is automatically stored for subsequent authenticated requests.",
  },
  GET_TOKEN: {
    name: "get-token",
    description:
      "Retrieve the currently stored authentication token. Returns the token and userId if a user is logged in, or indicates no active session if not authenticated. Use this token in Authorization headers for protected endpoint calls.",
  },
} as const;

// ====================
// HTTP Status Codes
// ====================

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

// ====================
// Log Event Types
// ====================

export const LOG_EVENTS = {
  SIGNUP_STARTED: "signup_started",
  SIGNUP_SUCCESS: "signup_success",
  SIGNUP_FAILED: "signup_failed",
  LOGIN_STARTED: "login_started",
  LOGIN_SUCCESS: "login_success",
  LOGIN_FAILED: "login_failed",
  TOKEN_RETRIEVED: "token_retrieved",
  TOKEN_NOT_FOUND: "token_not_found",
  TOKEN_STORED: "token_stored",
  TOKEN_CLEARED: "token_cleared",
} as const;
