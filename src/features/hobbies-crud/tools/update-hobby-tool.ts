/**
 * Update Hobby Tool
 * MCP Tool for updating an existing hobby
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
import { UpdateHobbySchema } from "../schemas/hobby-schemas.js";
import type { UpdateHobbyResponse } from "../types.js";

const logger = createLogger("update-hobby-tool");

/**
 * Zod schema for update hobby tool parameters
 */
export const updateHobbyToolSchema = UpdateHobbySchema;

/**
 * MCP tool metadata for update hobby
 */
export const updateHobbyToolMetadata = {
  name: "update-hobby",
  description:
    "Update an existing hobby with full body replacement (PUT semantics). " +
    "Requires the hobby ID parameter and complete body with name and optional description. " +
    "The name is required and must be between 1-255 characters. " +
    "The description is optional and can be up to 1000 characters. " +
    "This is a complete replacement operation - all fields must be provided. " +
    "Returns the updated hobby with modified timestamps. " +
    "Returns an error if the hobby is not found or if validation fails. " +
    "Requires authentication with a valid JWT token.",
  schema: updateHobbyToolSchema,
};

/**
 * Handler for the update hobby MCP tool
 * Updates a hobby via PUT /hobbies/{id} endpoint
 *
 * @param params - Object containing hobby ID and update data
 * @returns MCP tool response with updated hobby data or error details
 */
export async function updateHobbyToolHandler(params: unknown) {
  try {
    // Validate input parameters
    const validatedParams = updateHobbyToolSchema.parse(params);
    logger.info("Updating hobby", {
      id: validatedParams.id,
      name: validatedParams.name,
      hasDescription: !!validatedParams.description,
    });

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
    logger.debug("Making PUT request to", { url });

    // Make authenticated API request
    const response = await axios.put<UpdateHobbyResponse>(
      url,
      {
        name: validatedParams.name,
        description: validatedParams.description,
      },
      {
        headers: {
          Authorization: `Bearer ${storedToken.token}`,
          "Content-Type": "application/json",
        },
      }
    );

    logger.info("Hobby updated successfully", {
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
                error: "Invalid input parameters",
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

      if (status === HTTP_STATUS.CONFLICT) {
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(
                {
                  success: false,
                  error: ERROR_MESSAGES.DUPLICATE_NAME,
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
