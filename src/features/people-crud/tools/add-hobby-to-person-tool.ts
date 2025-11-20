/**
 * Add Hobby to Person Tool
 * MCP Tool for adding a hobby to a person
 * Feature: people-crud
 */

import { z } from "zod";
import axios from "axios";
import { getToken } from "../../jwt-auth/services/token-storage.js";
import { createLogger } from "../../../shared/utils/logger.js";
import { API_CONFIG } from "../../mcp-api-server/constants.js";
import {
  PEOPLE_HOBBIES_PATH,
  ERROR_MESSAGES,
  HTTP_STATUS,
} from "../constants.js";
import { AddHobbyToPersonSchema } from "../schemas/person-schemas.js";
import type { PersonHobby } from "../types.js";

const logger = createLogger("add-hobby-to-person-tool");

/**
 * Zod schema for add hobby to person tool parameters.
 * Validates the request body for adding a hobby to a person.
 */
export const addHobbyToPersonToolSchema = AddHobbyToPersonSchema;

/**
 * MCP tool metadata for add hobby to person.
 * Provides LLM-friendly description and schema for tool discovery.
 */
export const addHobbyToPersonToolMetadata = {
  name: "add-hobby-to-person",
  description:
    "Add a hobby to a person by their unique person ID. " +
    "The person ID must be a non-empty string representing a valid person identifier. " +
    "The hobby ID must be a positive integer representing an existing hobby. " +
    "Returns the newly created person-hobby association with server-generated ID and timestamps. " +
    "Requires authentication with a valid JWT token.",
  schema: addHobbyToPersonToolSchema,
};

/**
 * Handler for the add hobby to person MCP tool.
 * Adds a hobby to a person via POST /people/{personId}/hobbies endpoint.
 *
 * @param params - The person ID and hobby ID
 * @returns MCP tool response with created person-hobby association or error details
 */
export async function addHobbyToPersonToolHandler(params: unknown) {
  try {
    // Validate input parameters using Zod schema
    const validatedParams = addHobbyToPersonToolSchema.parse(params);
    logger.info("Adding hobby to person", {
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
    const url = `${API_CONFIG.BASE_URL}${PEOPLE_HOBBIES_PATH(
      validatedParams.personId
    )}`;
    logger.debug("Making POST request to", { url });

    // Make authenticated API request
    const response = await axios.post<PersonHobby>(
      url,
      {
        hobbyId: validatedParams.hobbyId,
      },
      {
        headers: {
          Authorization: `Bearer ${storedToken.token}`,
          "Content-Type": "application/json",
        },
      }
    );

    logger.info("Hobby added to person successfully", {
      id: response.data.id,
      personId: response.data.personId,
      hobbyId: response.data.hobbyId,
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
                  error: "Person or hobby not found",
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

      if (status === HTTP_STATUS.CONFLICT) {
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(
                {
                  success: false,
                  error: "Hobby already added to this person",
                },
                null,
                2
              ),
            },
          ],
        };
      }

      if (
        status === HTTP_STATUS.BAD_REQUEST ||
        status === HTTP_STATUS.UNPROCESSABLE_ENTITY
      ) {
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
