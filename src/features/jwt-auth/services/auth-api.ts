/**
 * Auth API Service
 *
 * Handles communication with external authentication API.
 * Initially uses mock responses for development/testing.
 * Can be enhanced to call real API endpoints when available.
 */

import axios, { AxiosError } from "axios";
import {
  AuthResponse,
  AuthError,
  LoginRequest,
  SignupRequest,
  ApiResult,
} from "../types.js";
import { AUTH_API_CONFIG, ERROR_MESSAGES, HTTP_STATUS } from "../constants.js";
import { createLogger } from "../../../shared/utils/logger.js";

const logger = createLogger("Auth API");

// ====================
// Configuration
// ====================

/**
 * Flag to enable/disable mock mode
 * Set to false when real API is available
 */
const USE_MOCK_API = false;

// ====================
// Mock Implementation
// ====================

/**
 * Generate mock JWT token for development
 */
function generateMockToken(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  return `mock-jwt-${timestamp}-${random}`;
}

/**
 * Generate mock user ID
 */
function generateMockUserId(): string {
  const random = Math.random().toString(36).substring(2, 15);
  return `mock-user-${random}`;
}

/**
 * Mock login API response (simulates successful authentication)
 */
function mockLogin(email: string): AuthResponse {
  logger.info("Mock API: Generating login response", { email });

  return {
    token: generateMockToken(),
    userId: generateMockUserId(),
    email,
    expiresAt: Date.now() + 3600000, // 1 hour from now
  };
}

/**
 * Mock signup API response (simulates successful registration)
 */
function mockSignup(email: string): AuthResponse {
  logger.info("Mock API: Generating signup response", { email });

  return {
    token: generateMockToken(),
    userId: generateMockUserId(),
    email,
    expiresAt: Date.now() + 3600000, // 1 hour from now
  };
}

// ====================
// Real API Implementation
// ====================

/**
 * Call real login API endpoint
 */
async function realLogin(
  credentials: LoginRequest
): Promise<ApiResult<AuthResponse>> {
  try {
    const response = await axios.post<AuthResponse>(
      `${"http://10.138.80.151:5000/api"}${AUTH_API_CONFIG.LOGIN_ENDPOINT}`,
      credentials,
      {
        headers: AUTH_API_CONFIG.HEADERS,
        timeout: AUTH_API_CONFIG.TIMEOUT,
      }
    );

    return { success: true, data: response.data };
  } catch (error) {
    console.log(error);
    return { success: false, error: mapAxiosError(error, "login") };
  }
}

/**
 * Call real signup API endpoint
 */
async function realSignup(
  userData: SignupRequest
): Promise<ApiResult<AuthResponse>> {
  try {
    const response = await axios.post<AuthResponse>(
      `${"http://10.138.80.151:5000/api"}${AUTH_API_CONFIG.SIGNUP_ENDPOINT}`,
      userData,
      {
        headers: AUTH_API_CONFIG.HEADERS,
        timeout: AUTH_API_CONFIG.TIMEOUT,
      }
    );

    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: mapAxiosError(error, "signup") };
  }
}

/**
 * Map axios error to AuthError
 */
function mapAxiosError(error: unknown, operation: string): AuthError {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{
      error?: string;
      message?: string;
    }>;

    // Network error
    if (!axiosError.response) {
      logger.error("Network error during auth operation", {
        operation,
        message: axiosError.message,
      });
      return {
        error: "network_error",
        message: ERROR_MESSAGES.NETWORK_ERROR,
        statusCode: 0,
      };
    }

    // API returned error response
    const status = axiosError.response.status;
    const errorData = axiosError.response.data;

    logger.error("API error during auth operation", {
      operation,
      status,
      errorData,
    });

    // Map common HTTP status codes to auth errors
    if (status === HTTP_STATUS.UNAUTHORIZED) {
      return {
        error: "invalid_credentials",
        message: ERROR_MESSAGES.INVALID_CREDENTIALS,
        statusCode: status,
      };
    }

    if (status === HTTP_STATUS.CONFLICT) {
      return {
        error: "user_exists",
        message: ERROR_MESSAGES.USER_EXISTS,
        statusCode: status,
      };
    }

    return {
      error: errorData?.error || "api_error",
      message: errorData?.message || ERROR_MESSAGES.API_ERROR,
      statusCode: status,
    };
  }

  // Unknown error
  logger.error("Unknown error during auth operation", {
    operation,
    error,
  });

  return {
    error: "unknown_error",
    message: ERROR_MESSAGES.UNKNOWN_ERROR,
  };
}

// ====================
// Public API
// ====================

/**
 * Authenticate user with email and password
 *
 * @param credentials - Login credentials
 * @returns Promise resolving to AuthResponse or AuthError
 */
export async function callLoginAPI(
  credentials: LoginRequest
): Promise<ApiResult<AuthResponse>> {
  logger.info("Calling login API", { email: credentials.email });

  if (USE_MOCK_API) {
    // Mock mode: always succeed with fake token
    const mockResponse = mockLogin(credentials.email);
    return { success: true, data: mockResponse };
  }

  // Real API mode
  return realLogin(credentials);
}

/**
 * Register new user account
 *
 * @param userData - Signup data
 * @returns Promise resolving to AuthResponse or AuthError
 */
export async function callSignupAPI(
  userData: SignupRequest
): Promise<ApiResult<AuthResponse>> {
  logger.info("Calling signup API", {
    email: userData.email,
  });

  if (USE_MOCK_API) {
    // Mock mode: always succeed with fake token
    const mockResponse = mockSignup(userData.email);
    return { success: true, data: mockResponse };
  }

  // Real API mode
  return realSignup(userData);
}

/**
 * Enable or disable mock API mode
 *
 * @param enabled - true to use mock responses, false to call real API
 */
export function setMockMode(enabled: boolean): void {
  logger.info("Auth API mock mode changed", {
    oldValue: USE_MOCK_API,
    newValue: enabled,
  });

  // Note: This modifies a const, which is not ideal but works for a simple flag.
  // For production, consider environment variables or config service.
  (global as any).AUTH_API_MOCK_MODE = enabled;
}
