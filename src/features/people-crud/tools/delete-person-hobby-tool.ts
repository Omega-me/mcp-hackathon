/**
 * Delete Person Hobby Tool
 * MCP Tool for removing a hobby from a person
 * Feature: people-crud
 */

import { z } from "zod";
import axios from "axios";
import { getToken } from "../../jwt-auth/services/token-storage.js";
import { createLogger } from "../../../shared/utils/logger.js";
import { API_CONFIG } from "../../mcp-api-server/constants.js";
import {
  PEOPLE_HOBBIES_BY_ID_PATH,
  ERROR_MESSAGES,
  HTTP_STATUS,
} from "../constants.js";
import { DeletePersonHobbySchema } from "../schemas/person-schemas.js";

const logger = createLogger("delete-person-hobby-tool");

/**
 * Zod schema for delete person hobby tool parameters.
 */
export const deletePersonHobbyToolSchema = DeletePersonHobbySchema;

/**
 * MCP tool metadata for delete person hobby.
 * Provides LLM-friendly description and schema for tool discovery.
 */
export const deletePersonHobbyToolMetadata = {
  name: "delete-person-hobby",
  description:
    "Permanently remove a hobby association from a person by person ID and hobby ID. " +
    "The person ID must be a non-empty string representing a valid person identifier. " +
    "The hobby ID must be a non-empty string representing a valid hobby identifier. " +
    "This operation is irreversible and will permanently remove the person-hobby association. " +
    "Returns a success confirmation message if the deletion is successful. " +
    "Returns an error if the person or hobby association is not found or if access is denied. " +
    "Requires authentication with a valid JWT token.",
  schema: deletePersonHobbyToolSchema,
};

/**
 * Handler for the delete person hobby MCP tool.
 * Removes a hobby from a person via DELETE /people/{personId}/hobbies/{hobbyId} endpoint.
 *
 * @param params - The person ID and hobby ID
 * @returns MCP tool response with success message or error details
 */
export async function deletePersonHobbyToolHandler(params: unknown) {
  try {
    // Validate input parameters using Zod schema
    const validatedParams = deletePersonHobbyToolSchema.parse(params);
    logger.info("Deleting hobby from person", {
      personId: validatedParams.personId,
      hobbyId: validatedParams.hobbyId,
    });

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
    const url = `${API_CONFIG.BASE_URL}${PEOPLE_HOBBIES_BY_ID_PATH(
      validatedParams.personId,
      validatedParams.hobbyId
    )}`;
    logger.debug("Making DELETE request to", { url });

    // Make authenticated API request
    await axios.delete(url, {
      headers: {
        Authorization: `Bearer ${storedToken.token}`,
      },
    });

    logger.info("Hobby removed from person successfully", {
      personId: validatedParams.personId,
      hobbyId: validatedParams.hobbyId,
    });

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(
            {
              success: true,
              message: "Hobby removed from person successfully",
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
                error: ERROR_MESSAGES.VALIDATION_ERROR,
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
                  error: "Person hobby association not found",
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
    logger.error("Unexpected error", { error });
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
