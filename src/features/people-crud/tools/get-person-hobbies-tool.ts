/**
 * Get Person Hobbies Tool
 * MCP Tool for retrieving all hobbies for a person
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
import { GetPersonHobbiesSchema } from "../schemas/person-schemas.js";
import type { GetPersonHobbiesResponse } from "../types.js";

const logger = createLogger("get-person-hobbies-tool");

/**
 * Zod schema for get person hobbies tool parameters.
 */
export const getPersonHobbiesToolSchema = GetPersonHobbiesSchema;

/**
 * MCP tool metadata for get person hobbies.
 * Provides LLM-friendly description and schema for tool discovery.
 */
export const getPersonHobbiesToolMetadata = {
  name: "get-person-hobbies",
  description:
    "Retrieve all hobbies associated with a specific person by their unique person ID. " +
    "The person ID must be a non-empty string representing a valid person identifier. " +
    "Returns a list of hobby associations for the person including IDs and timestamps. " +
    "Returns an empty list if the person has no hobbies. " +
    "Returns an error if the person is not found or if access is denied. " +
    "Requires authentication with a valid JWT token.",
  schema: getPersonHobbiesToolSchema,
};

/**
 * Handler for the get person hobbies MCP tool.
 * Retrieves all hobbies for a person via GET /people/{personId}/hobbies endpoint.
 *
 * @param params - The person ID
 * @returns MCP tool response with list of person hobbies or error details
 */
export async function getPersonHobbiesToolHandler(params: unknown) {
  try {
    // Validate input parameters using Zod schema
    const validatedParams = getPersonHobbiesToolSchema.parse(params);
    logger.info("Getting hobbies for person", {
      personId: validatedParams.personId,
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
    logger.debug("Making GET request to", { url });

    // Make authenticated API request
    const response = await axios.get<GetPersonHobbiesResponse>(url, {
      headers: {
        Authorization: `Bearer ${storedToken.token}`,
        Accept: "application/json",
      },
      timeout: API_CONFIG.TIMEOUT,
    });

    logger.info("Person hobbies retrieved successfully", {
      personId: validatedParams.personId,
      hobbiesCount: response.data.data?.length || 0,
    });

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response.data, null, 2),
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
                  error: ERROR_MESSAGES.NOT_FOUND,
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
