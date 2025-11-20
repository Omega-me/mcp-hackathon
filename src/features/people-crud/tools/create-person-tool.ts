/**
 * Create Person Tool
 * MCP Tool for creating a new person
 * Feature: people-crud
 */

import { z } from "zod";
import axios from "axios";
import { getToken } from "../../jwt-auth/services/token-storage.js";
import { createLogger } from "../../../shared/utils/logger.js";
import { API_CONFIG } from "../../mcp-api-server/constants.js";
import { PEOPLE_BASE_PATH, ERROR_MESSAGES, HTTP_STATUS } from "../constants.js";
import { CreatePersonSchema } from "../schemas/person-schemas.js";
import type { Person } from "../types.js";

const logger = createLogger("create-person-tool");

/**
 * Zod schema for create person tool parameters.
 * Validates the request body for creating a new person.
 */
export const createPersonToolSchema = CreatePersonSchema;

/**
 * MCP tool metadata for create person.
 * Provides LLM-friendly description and schema for tool discovery.
 */
export const createPersonToolMetadata = {
  name: "create-person",
  description:
    "Create a new person with the specified first name, last name, email, and optional team ID. " +
    "The first name and last name are required and must be between 1-255 characters. " +
    "The email is required and must be a valid email format. " +
    "The team ID is optional and must be a positive integer. " +
    "Returns the newly created person with server-generated ID and timestamps. " +
    "Requires authentication with a valid JWT token.",
  schema: createPersonToolSchema,
};

/**
 * Handler for the create person MCP tool.
 * Creates a new person via POST /people endpoint.
 *
 * @param params - The person data (firstName, lastName, email required; teamId optional)
 * @returns MCP tool response with created person data or error details
 */
export async function createPersonToolHandler(params: unknown) {
  try {
    // Validate input parameters using Zod schema
    const validatedParams = createPersonToolSchema.parse(params);
    logger.info("Creating person", {
      firstName: validatedParams.firstName,
      lastName: validatedParams.lastName,
      email: validatedParams.email,
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
    const url = `${API_CONFIG.BASE_URL}${PEOPLE_BASE_PATH}`;
    logger.debug("Making POST request to", { url });

    // Make authenticated API request
    const response = await axios.post<Person>(
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

    logger.info("Person created successfully", {
      id: response.data.id,
      firstName: response.data.firstName,
      lastName: response.data.lastName,
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

    // Handle HTTP errors from axios
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const errorData = error.response?.data;

      logger.error("API request failed", {
        status,
        error: errorData,
        message: error.message,
      });

      // Map HTTP status codes to user-friendly messages
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

      // Generic error for other status codes
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
