/**
 * Signup MCP Tool
 *
 * Enables new users to create accounts via the MCP protocol.
 * Calls external auth API, stores token, and returns success confirmation.
 *
 * User Story 1 (P1): New User Registration
 */

import { z } from "zod";
import { callSignupAPI } from "../services/auth-api.js";
import { storeToken } from "../services/token-storage.js";
import {
  TOOLS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  LOG_EVENTS,
} from "../constants.js";
import { createLogger } from "../../../shared/utils/logger.js";
import type { AuthToolResponse, SignupRequest } from "../types.js";

const logger = createLogger("Signup Tool");

// ====================
// Tool Schema
// ====================

/**
 * Zod schema for signup tool input validation
 */
export const signupToolSchema = z.object({
  email: z
    .string()
    .email(ERROR_MESSAGES.INVALID_EMAIL)
    .describe("User email address for account creation"),

  password: z
    .string()
    .min(1, ERROR_MESSAGES.PASSWORD_REQUIRED)
    .describe("User password (API validates strength requirements)"),
});

// Infer TypeScript type from schema
export type SignupToolInput = z.infer<typeof signupToolSchema>;

// ====================
// Tool Handler
// ====================

/**
 * Handle signup tool execution
 *
 * Workflow:
 * 1. Validate input parameters
 * 2. Call external auth API
 * 3. Store token on success
 * 4. Return success response with userId
 */
export async function signupToolHandler(params: unknown) {
  try {
    // Validate input
    const validatedParams = signupToolSchema.parse(params);

    logger.info(LOG_EVENTS.SIGNUP_STARTED, {
      email: validatedParams.email,
    });

    // Prepare signup request
    const signupData: SignupRequest = {
      email: validatedParams.email,
      password: validatedParams.password,
    };

    // Call external auth API
    const result = await callSignupAPI(signupData);

    if (!result.success) {
      // API returned error
      const error = result.error;

      logger.error(LOG_EVENTS.SIGNUP_FAILED, {
        email: validatedParams.email,
        errorType: error.error,
        message: error.message,
        statusCode: error.statusCode,
      });

      const response: AuthToolResponse = {
        success: false,
        message: error.message || ERROR_MESSAGES.API_ERROR,
        error: error.error,
      };

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(response, null, 2),
          },
        ],
      };
    }

    // Success: store token and return response
    const authResponse = result.data;

    storeToken(
      authResponse.userId || "unknown",
      authResponse.token,
      authResponse.email,
      authResponse.expiresAt
    );

    logger.info(LOG_EVENTS.SIGNUP_SUCCESS, {
      email: validatedParams.email,
      userId: authResponse.userId,
    });

    const response: AuthToolResponse = {
      success: true,
      message: SUCCESS_MESSAGES.SIGNUP_SUCCESS,
      userId: authResponse.userId,
    };

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response, null, 2),
        },
      ],
    };
  } catch (error) {
    // Handle validation errors
    if (error instanceof z.ZodError) {
      const validationErrors = error.errors.map(
        (e) => `${e.path.join(".")}: ${e.message}`
      );

      logger.error(LOG_EVENTS.SIGNUP_FAILED, {
        errorType: "validation_error",
        errors: validationErrors,
      });

      const response: AuthToolResponse = {
        success: false,
        message: validationErrors.join(", "),
        error: "validation_error",
      };

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(response, null, 2),
          },
        ],
      };
    }

    // Unexpected error
    logger.error(LOG_EVENTS.SIGNUP_FAILED, {
      errorType: "unknown_error",
      error: error instanceof Error ? error.message : String(error),
    });

    const response: AuthToolResponse = {
      success: false,
      message: ERROR_MESSAGES.UNKNOWN_ERROR,
      error: "unknown_error",
    };

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response, null, 2),
        },
      ],
    };
  }
}

// ====================
// Tool Metadata
// ====================

/**
 * Tool metadata for MCP server registration
 */
export const signupToolMetadata = {
  name: TOOLS.SIGNUP.name,
  description: TOOLS.SIGNUP.description,
  schema: signupToolSchema,
};
