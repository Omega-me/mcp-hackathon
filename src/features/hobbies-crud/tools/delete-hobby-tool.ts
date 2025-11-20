/**
 * Delete Hobby Tool
 * MCP Tool for permanently deleting a hobby
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
import { DeleteHobbySchema } from "../schemas/hobby-schemas.js";
import type { DeleteHobbyResponse } from "../types.js";

const logger = createLogger("delete-hobby-tool");

/**
 * Zod schema for delete hobby tool parameters
 */
export const deleteHobbyToolSchema = DeleteHobbySchema;

/**
 * MCP tool metadata for delete hobby
 */
export const deleteHobbyToolMetadata = {
  name: "delete-hobby",
  description:
    "Permanently delete a hobby by its unique identifier (ID). " +
    "The ID must be a non-empty string representing a valid hobby identifier. " +
    "This operation is irreversible and will permanently remove the hobby record. " +
    "Returns a success confirmation message if the deletion is successful. " +
    "Returns an error if the hobby is not found, has dependencies, or if access is denied. " +
    "Hobbies with existing dependencies (e.g., linked entities) cannot be deleted. " +
    "Requires authentication with a valid JWT token.",
  schema: deleteHobbyToolSchema,
};

/**
 * Handler for the delete hobby MCP tool
 * Deletes a hobby via DELETE /hobbies/{id} endpoint
 *
 * @param params - Object containing hobby ID
 * @returns MCP tool response with success confirmation or error details
 */
export async function deleteHobbyToolHandler(params: unknown) {
  try {
    // Validate input parameters
    const validatedParams = deleteHobbyToolSchema.parse(params);
    logger.info("Deleting hobby", { id: validatedParams.id });

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
    logger.debug("Making DELETE request to", { url });

    // Make authenticated API request
    const response = await axios.delete<DeleteHobbyResponse>(url, {
      headers: {
        Authorization: `Bearer ${storedToken.token}`,
        Accept: "application/json",
      },
    });

    logger.info("Hobby deleted successfully", {
      id: validatedParams.id,
      message: response.data.message,
    });

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(
            {
              success: true,
              message: response.data.message || "Hobby deleted successfully",
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

      if (status === HTTP_STATUS.CONFLICT) {
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(
                {
                  success: false,
                  error: ERROR_MESSAGES.DELETE_CONFLICT,
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
