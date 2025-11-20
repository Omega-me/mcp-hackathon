/**
 * Create Hobby Tool
 * MCP Tool for creating a new hobby
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
import { CreateHobbySchema } from "../schemas/hobby-schemas.js";
import type { CreateHobbyResponse } from "../types.js";

const logger = createLogger("create-hobby-tool");

/**
 * Zod schema for create hobby tool parameters.
 * Validates the request body for creating a new hobby.
 */
export const createHobbyToolSchema = CreateHobbySchema;

/**
 * MCP tool metadata for create hobby.
 * Provides LLM-friendly description and schema for tool discovery.
 */
export const createHobbyToolMetadata = {
  name: "create-hobby",
  description:
    "Create a new hobby with the specified name and optional description. " +
    "The name is required and must be between 1-255 characters. " +
    "The description is optional and can be up to 1000 characters. " +
    "Returns the newly created hobby with server-generated ID and timestamps. " +
    "Requires authentication with a valid JWT token.",
  schema: createHobbyToolSchema,
};

/**
 * Handler for the create hobby MCP tool.
 * Creates a new hobby via POST /hobbies endpoint.
 *
 * @param params - The hobby data (name required, description optional)
 * @returns MCP tool response with created hobby data or error details
 */
export async function createHobbyToolHandler(params: unknown) {
  try {
    // Validate input parameters using Zod schema
    const validatedParams = createHobbyToolSchema.parse(params);
    logger.info("Creating hobby", {
      name: validatedParams.name,
      hasDescription: !!validatedParams.description,
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
    const url = `${API_CONFIG.BASE_URL}${HOBBIES_BASE_PATH}`;
    logger.debug("Making POST request to", { url });

    // Make authenticated API request
    const response = await axios.post<CreateHobbyResponse>(
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

    logger.info("Hobby created successfully", {
      id: response.data?.data?.id,
      name: response.data?.data?.name,
      fullResponse: JSON.stringify(response.data),
    });

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
