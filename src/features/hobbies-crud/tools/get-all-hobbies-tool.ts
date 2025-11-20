/**
 * Get All Hobbies Tool
 * MCP Tool for retrieving list of all hobbies
 * Feature: hobbies-crud
 */

import { z } from "zod";
import axios from "axios";
import { getToken } from "../../jwt-auth/services/token-storage.js";
import { createLogger } from "../../../shared/utils/logger.js";
import { API_CONFIG } from "../../mcp-api-server/constants.js";
import {
  HOBBIES_BASE_PATH,
  ERROR_MESSAGES,
  HTTP_STATUS,
} from "../constants.js";
import type { GetAllHobbiesResponse } from "../types.js";

const logger = createLogger("Get All Hobbies Tool");

// ====================
// Tool Schema
// ====================

/**
 * Zod schema for get-all-hobbies tool input validation
 * Currently no parameters, but schema includes future pagination support
 */
export const getAllHobbiesToolSchema = z.object({});

export type GetAllHobbiesToolInput = z.infer<typeof getAllHobbiesToolSchema>;

// ====================
// Tool Metadata
// ====================

export const getAllHobbiesToolMetadata = {
  name: "get-all-hobbies",
  description:
    "Retrieve a list of all hobbies. Returns all hobbies the authenticated user has permission to view. Future support for pagination and filtering will be added. Requires authentication with a valid JWT token.",
  schema: getAllHobbiesToolSchema,
};

// ====================
// Tool Handler
// ====================

/**
 * Handler for get-all-hobbies tool
 */
export async function getAllHobbiesToolHandler(_params: unknown) {
  try {
    logger.info("Tool invoked");

    // Get authentication token
    const storedToken = getToken();
    if (!storedToken) {
      logger.error("No authentication token found");
      throw new Error(ERROR_MESSAGES.AUTH_REQUIRED);
    }

    const url = `${API_CONFIG.BASE_URL}${HOBBIES_BASE_PATH}`;

    logger.info("Calling API", { endpoint: url });

    // Call API with auth token
    const response = await axios.get<GetAllHobbiesResponse>(url, {
      headers: {
        Authorization: `Bearer ${storedToken.token}`,
        Accept: "application/json",
      },
      timeout: API_CONFIG.TIMEOUT,
    });

    logger.info("API call successful", {
      status: response.status,
      hobbiesCount: response.data?.data?.length || 0,
      fullResponse: JSON.stringify(response.data),
    });

    // Return MCP response format
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(
            {
              success: true,
              data: response.data?.data || response.data,
            },
            null,
            2
          ),
        },
      ],
    };
  } catch (error) {
    logger.error("Error in tool handler", { error });

    if (axios.isAxiosError(error)) {
      const statusCode = error.response?.status;
      const errorData = error.response?.data;

      // Handle specific HTTP status codes
      if (statusCode === HTTP_STATUS.UNAUTHORIZED) {
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(
                {
                  success: false,
                  error: ERROR_MESSAGES.AUTH_REQUIRED,
                },
                null,
                2
              ),
            },
          ],
        };
      }

      // Handle other API errors
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              {
                success: false,
                error:
                  errorData?.message ||
                  errorData?.error ||
                  ERROR_MESSAGES.API_ERROR,
              },
              null,
              2
            ),
          },
        ],
      };
    }

    // Handle network errors
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(
            {
              success: false,
              error:
                error instanceof Error
                  ? error.message
                  : ERROR_MESSAGES.NETWORK_ERROR,
            },
            null,
            2
          ),
        },
      ],
    };
  }
}
