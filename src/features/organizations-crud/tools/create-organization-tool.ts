import { z } from "zod";
import axios from "axios";
import { getToken } from "../../jwt-auth/services/token-storage.js";
import { createLogger } from "../../../shared/utils/logger.js";
import { API_CONFIG } from "../../mcp-api-server/constants.js";
import {
  ORGANIZATIONS_BASE_PATH,
  ERROR_MESSAGES,
  HTTP_STATUS,
} from "../constants.js";
import { CreateOrganizationSchema } from "../schemas/organization-schemas.js";
import type { Organization } from "../types.js";

const logger = createLogger("create-organization-tool");

/**
 * Zod schema for create organization tool parameters.
 * Validates the request body for creating a new organization.
 */
export const createOrganizationToolSchema = CreateOrganizationSchema;

/**
 * MCP tool metadata for create organization.
 * Provides LLM-friendly description and schema for tool discovery.
 */
export const createOrganizationToolMetadata = {
  name: "create-organization",
  description:
    "Create a new organization with the specified name and optional description. " +
    "The name is required and must be between 1-255 characters. " +
    "The description is optional and can be up to 1000 characters. " +
    "Returns the newly created organization with server-generated ID and timestamps. " +
    "Requires authentication with a valid JWT token.",
  schema: createOrganizationToolSchema,
};

/**
 * Handler for the create organization MCP tool.
 * Creates a new organization via POST /organizations endpoint.
 *
 * @param params - The organization data (name required, description optional)
 * @returns MCP tool response with created organization data or error details
 */
export async function createOrganizationToolHandler(params: unknown) {
  try {
    // Validate input parameters using Zod schema
    const validatedParams = createOrganizationToolSchema.parse(params);
    logger.info("Creating organization", { name: validatedParams.name });

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
    const url = `${API_CONFIG.BASE_URL}${ORGANIZATIONS_BASE_PATH}`;
    logger.debug("Making POST request to", { url });

    // Make authenticated API request
    const response = await axios.post<Organization>(
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

    logger.info("Organization created successfully", {
      id: response.data.id,
      name: response.data.name,
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

      if (status === HTTP_STATUS.BAD_REQUEST) {
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(
                {
                  success: false,
                  error: "Invalid organization data provided",
                  details: errorData,
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
                  error: "An organization with this name may already exist",
                  details: errorData,
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
                error: `API request failed with status ${status}`,
                details: errorData || error.message,
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
              error: ERROR_MESSAGES.SERVER_ERROR,
              details: error instanceof Error ? error.message : "Unknown error",
            },
            null,
            2
          ),
        },
      ],
    };
  }
}
