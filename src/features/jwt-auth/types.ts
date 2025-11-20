/**
 * JWT Authentication Feature Types
 *
 * TypeScript interfaces for auth requests, responses, and internal storage.
 * Defines the data contracts for external API integration and token management.
 */

// ====================
// Request Types
// ====================

/**
 * Login request payload sent to external auth API
 */
export interface LoginRequest {
  /** User's email address (must be valid email format) */
  email: string;
  /** User's password (API validates strength requirements) */
  password: string;
}

/**
 * Signup request payload sent to external auth API
 */
export interface SignupRequest {
  /** User's email address (must be valid email format) */
  email: string;
  /** User's desired password (API validates strength requirements) */
  password: string;
}

// ====================
// Response Types
// ====================

/**
 * Successful authentication response from external API
 */
export interface AuthResponse {
  /** JWT token for authenticated requests */
  token: string;
  /** Unique identifier for the authenticated user */
  userId?: string;
  /** Token expiration timestamp (ISO 8601) or duration in seconds */
  expiresAt?: string | number;
  /** User's email address (returned by some auth APIs) */
  email?: string;
}

/**
 * Error response from external auth API
 */
export interface AuthError {
  /** Error type/code (e.g., "invalid_credentials", "user_exists") */
  error: string;
  /** Human-readable error message */
  message?: string;
  /** HTTP status code from the API */
  statusCode?: number;
  /** Additional error details for debugging */
  details?: unknown;
}

// ====================
// Internal Storage Types
// ====================

/**
 * Token data stored in-memory by the token storage service
 */
export interface StoredToken {
  /** JWT token string */
  token: string;
  /** User ID associated with this token */
  userId: string;
  /** Email address of the authenticated user */
  email?: string;
  /** Timestamp when token was stored (ISO 8601) */
  storedAt: string;
  /** Token expiration timestamp or duration (from external API) */
  expiresAt?: string | number;
}

// ====================
// Tool Response Types
// ====================

/**
 * Response from get-token tool indicating authentication status
 */
export interface GetTokenResponse {
  /** Whether user is currently authenticated */
  authenticated: boolean;
  /** JWT token if authenticated, null otherwise */
  token: string | null;
  /** User ID if authenticated, null otherwise */
  userId: string | null;
  /** Email if authenticated, null otherwise */
  email?: string | null;
  /** Message explaining authentication state */
  message?: string;
}

/**
 * Response from login and signup tools
 */
export interface AuthToolResponse {
  /** Whether the operation was successful */
  success: boolean;
  /** Success or error message */
  message: string;
  /** User ID if successful, undefined otherwise */
  userId?: string;
  /** Error type if failed, undefined otherwise */
  error?: string;
}

// ====================
// Service Types
// ====================

/**
 * Configuration for auth API client
 */
export interface AuthApiConfig {
  baseUrl: string;
  timeout: number;
  headers: Record<string, string>;
}

/**
 * Result of an API call (success or error)
 */
export type ApiResult<T> =
  | { success: true; data: T }
  | { success: false; error: AuthError };
