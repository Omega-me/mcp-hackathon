/**
 * Delete Person Tool
 * MCP Tool for deleting a person
 * Feature: people-crud
 */

import { z } from "zod";
import axios from "axios";
import { getToken } from "../../jwt-auth/services/token-storage.js";
import { createLogger } from "../../../shared/utils/logger.js";
import { API_CONFIG } from "../../mcp-api-server/constants.js";
import {
  PEOPLE_BY_ID_PATH,
  ERROR_MESSAGES,
  HTTP_STATUS,
} from "../constants.js";
import { DeletePersonSchema } from "../schemas/person-schemas.js";

const logger = createLogger("delete-person-tool");

/**
 * Zod schema for delete person tool parameters.
 */
export const deletePersonToolSchema = DeletePersonSchema;

/**
 * MCP tool metadata for delete person.
 */
export const deletePersonToolMetadata = {
  name: "delete-person",
  description:
    "Permanently delete a person by their unique identifier (ID). " +
    "The ID must be a non-empty string representing a valid person identifier. " +
    "This operation is irreversible and will permanently remove the person record. " +
    "Returns a success confirmation message if the deletion is successful. " +
    "Returns an error if the person is not found, has dependencies, or if access is denied. " +
    "People with existing dependencies (e.g., linked entities) cannot be deleted. " +
    "Requires authentication with a valid JWT token.",
  schema: deletePersonToolSchema,
};

/**
 * Handler for the delete person MCP tool.
 */
export async function deletePersonToolHandler(params: unknown) {
  try {
    // Validate input parameters
    const validatedParams = deletePersonToolSchema.parse(params);
    logger.info("Deleting person", { id: validatedParams.id });

    // Retrieve authentication token
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
    const url = `${API_CONFIG.BASE_URL}${PEOPLE_BY_ID_PATH(
      validatedParams.id
    )}`;
    logger.debug("Making DELETE request to", { url });

    // Make authenticated API request
    await axios.delete(url, {
      headers: {
        Authorization: `Bearer ${storedToken.token}`,
      },
    });

    logger.info("Person deleted successfully", {
      id: validatedParams.id,
    });

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(
            {
              success: true,
              message: "Person deleted successfully",
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

    // Handle HTTP errors
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const errorData = error.response?.data;

      logger.error("API request failed", {
        status,
        error: errorData,
      });

      if (status === HTTP_STATUS.NOT_FOUND) {
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(
                {
                  success: false,
                  error: ERROR_MESSAGES.NOT_FOUND,
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
                  error: ERROR_MESSAGES.HAS_DEPENDENCIES,
                },
                null,
                2
              ),
            },
          ],
        };
      }

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

      if (status === HTTP_STATUS.FORBIDDEN) {
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(
                {
                  success: false,
                  error: ERROR_MESSAGES.FORBIDDEN,
                },
                null,
                2
              ),
            },
          ],
        };
      }

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              {
                success: false,
                error: ERROR_MESSAGES.SERVER_ERROR,
                details: errorData,
              },
              null,
              2
            ),
          },
        ],
      };
    }

    // Handle unexpected errors
    logger.error("Unexpected error", {
      error: error instanceof Error ? error.message : String(error),
    });

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(
            {
              success: false,
              error: "An unexpected error occurred",
              details: error instanceof Error ? error.message : String(error),
            },
            null,
            2
          ),
        },
      ],
    };
  }
}
