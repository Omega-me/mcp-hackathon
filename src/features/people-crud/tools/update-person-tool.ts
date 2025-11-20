/**
 * Update Person Tool
 * MCP Tool for updating an existing person
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
import { UpdatePersonSchema } from "../schemas/person-schemas.js";
import type { Person } from "../types.js";

const logger = createLogger("update-person-tool");

/**
 * Zod schema for update person tool parameters.
 */
export const updatePersonToolSchema = UpdatePersonSchema;

/**
 * MCP tool metadata for update person.
 */
export const updatePersonToolMetadata = {
  name: "update-person",
  description:
    "Update an existing person with full body replacement (PUT semantics). " +
    "Requires the person ID parameter and complete body with first name, last name, email, and optional team ID. " +
    "The first name and last name are required and must be between 1-255 characters. " +
    "The email is required and must be a valid email format. " +
    "The team ID is optional and must be a positive integer. " +
    "This is a complete replacement operation - all fields must be provided. " +
    "Returns the updated person with modified timestamps. " +
    "Returns an error if the person is not found or if validation fails. " +
    "Requires authentication with a valid JWT token.",
  schema: updatePersonToolSchema,
};

/**
 * Handler for the update person MCP tool.
 */
export async function updatePersonToolHandler(params: unknown) {
  try {
    // Validate input parameters
    const validatedParams = updatePersonToolSchema.parse(params);
    logger.info("Updating person", {
      id: validatedParams.id,
      firstName: validatedParams.firstName,
      lastName: validatedParams.lastName,
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
    const url = `${API_CONFIG.BASE_URL}${PEOPLE_BY_ID_PATH(
      validatedParams.id
    )}`;
    logger.debug("Making PUT request to", { url });

    // Make authenticated API request
    const response = await axios.put<Person>(
      url,
      {
        firstName: validatedParams.firstName,
        lastName: validatedParams.lastName,
        email: validatedParams.email,
        teamId: validatedParams.teamId,
      },
      {
        headers: {
          Authorization: `Bearer ${storedToken.token}`,
          "Content-Type": "application/json",
        },
      }
    );

    logger.info("Person updated successfully", {
      id: response.data.id,
    });

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(
            {
              success: true,
              data: response.data,
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
                  error: ERROR_MESSAGES.DUPLICATE_EMAIL,
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

      if (status === HTTP_STATUS.BAD_REQUEST) {
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(
                {
                  success: false,
                  error: ERROR_MESSAGES.VALIDATION_ERROR,
                  details: errorData,
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
