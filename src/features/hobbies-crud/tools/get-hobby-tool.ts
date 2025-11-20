/**
 * Get Hobby Tool
 * MCP Tool for retrieving a specific hobby by ID
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
import { HobbyIdSchema } from "../schemas/hobby-schemas.js";
import type { GetHobbyResponse } from "../types.js";

const logger = createLogger("get-hobby-tool");

/**
 * Zod schema for get hobby tool parameters
 */
export const getHobbyToolSchema = HobbyIdSchema;

/**
 * MCP tool metadata for get hobby
 */
export const getHobbyToolMetadata = {
  name: "get-hobby",
  description:
    "Retrieve a specific hobby by its unique identifier (ID). " +
    "The ID must be a non-empty string representing a valid hobby identifier. " +
    "Returns the hobby details including name, description, and timestamps. " +
    "Returns an error if the hobby is not found or if access is denied. " +
    "Requires authentication with a valid JWT token.",
  schema: getHobbyToolSchema,
};

/**
 * Handler for the get hobby MCP tool
 * Retrieves a hobby via GET /hobbies/{id} endpoint
 *
 * @param params - Object containing hobby ID
 * @returns MCP tool response with hobby data or error details
 */
export async function getHobbyToolHandler(params: unknown) {
  try {
    // Validate input parameters
    const validatedParams = getHobbyToolSchema.parse(params);
    logger.info("Getting hobby", { id: validatedParams.id });

    // Get authentication token
    const storedToken = getToken();
    if (!storedToken || !storedToken.token) {
      logger.error("Authentication token not found");
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

    // Construct API URL
    const url = `${API_CONFIG.BASE_URL}${HOBBIES_BASE_PATH}/${validatedParams.id}`;
    logger.debug("Making GET request to", { url });

    // Make authenticated API request
    const response = await axios.get<GetHobbyResponse>(url, {
      headers: {
        Authorization: `Bearer ${storedToken.token}`,
        Accept: "application/json",
      },
    });

    logger.info("Hobby retrieved successfully", {
      id: response.data.data.id,
      name: response.data.data.name,
    });

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(
            {
              success: true,
              data: response.data.data,
            },
            null,
            2
          ),
        },
      ],
    };
  } catch (error) {
    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      logger.error("Validation error", { errors: error.errors });
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              {
                success: false,
                error: ERROR_MESSAGES.INVALID_ID,
                details: error.errors,
              },
              null,
              2
            ),
          },
        ],
      };
    }

    // Handle HTTP errors from axios
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const errorData = error.response?.data;

      logger.error("API request failed", {
        status,
        error: errorData,
        message: error.message,
      });

      // Handle specific error cases
      if (status === HTTP_STATUS.UNAUTHORIZED) {
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

      if (status === HTTP_STATUS.NOT_FOUND) {
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(
                {
                  success: false,
                  error: ERROR_MESSAGES.HOBBY_NOT_FOUND,
                },
                null,
                2
              ),
            },
          ],
        };
      }

      if (status === HTTP_STATUS.BAD_REQUEST) {
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(
                {
                  success: false,
                  error: ERROR_MESSAGES.INVALID_ID,
                },
                null,
                2
              ),
            },
          ],
        };
      }

      // Generic API error
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              {
                success: false,
                error:
                  errorData?.error ||
                  errorData?.message ||
                  ERROR_MESSAGES.API_ERROR,
              },
              null,
              2
            ),
          },
        ],
      };
    }

    // Handle unexpected errors
    logger.error("Unexpected error", { error });
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
