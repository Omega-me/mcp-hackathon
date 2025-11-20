/**
 * Get Token MCP Tool
 *
 * Enables users to retrieve stored authentication token.
 * No parameters required - returns current token if user is authenticated.
 *
 * User Story 3 (P3): Accessing Protected Endpoints
 */

import { z } from "zod";
import { getToken } from "../services/token-storage.js";
import {
  TOOLS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  LOG_EVENTS,
} from "../constants.js";
import { createLogger } from "../../../shared/utils/logger.js";
import type { GetTokenResponse } from "../types.js";

const logger = createLogger("Get Token Tool");

// ====================
// Tool Schema
// ====================

/**
 * Zod schema for get-token tool input validation
 * No parameters required - empty object
 */
export const getTokenToolSchema = z.object({});

// Infer TypeScript type from schema
export type GetTokenToolInput = z.infer<typeof getTokenToolSchema>;

// ====================
// Tool Handler
// ====================

/**
 * Handle get-token tool execution
 *
 * Workflow:
 * 1. Retrieve token from storage
 * 2. Return token and userId if authenticated
 * 3. Return not-authenticated message if no token
 */
export async function getTokenToolHandler(_params: unknown) {
  try {
    logger.info("Retrieving stored authentication token");

    // Get token from storage
    const storedToken = getToken();

    if (storedToken === null) {
      // No active session
      logger.info(LOG_EVENTS.TOKEN_NOT_FOUND, {
        authenticated: false,
      });

      const response: GetTokenResponse = {
        authenticated: false,
        token: null,
        userId: null,
        email: null,
        message: ERROR_MESSAGES.NO_TOKEN,
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

    // Token found - return authenticated response
    logger.info(LOG_EVENTS.TOKEN_RETRIEVED, {
      authenticated: true,
      userId: storedToken.userId,
      email: storedToken.email,
      hasExpiration: !!storedToken.expiresAt,
    });

    const response: GetTokenResponse = {
      authenticated: true,
      token: storedToken.token,
      userId: storedToken.userId,
      email: storedToken.email,
      message: SUCCESS_MESSAGES.TOKEN_RETRIEVED,
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
    // Unexpected error
    logger.error("Failed to retrieve token", {
      errorType: "unknown_error",
      error: error instanceof Error ? error.message : String(error),
    });

    const response: GetTokenResponse = {
      authenticated: false,
      token: null,
      userId: null,
      email: null,
      message: ERROR_MESSAGES.UNKNOWN_ERROR,
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
export const getTokenToolMetadata = {
  name: TOOLS.GET_TOKEN.name,
  description: TOOLS.GET_TOKEN.description,
  schema: {},
};
