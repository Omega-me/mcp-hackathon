import { z } from "zod";
import axios from "axios";
import { getToken } from "../../jwt-auth/services/token-storage.js";
import { createLogger } from "../../../shared/utils/logger.js";
import { API_CONFIG } from "../../mcp-api-server/constants.js";
import {
  ERROR_MESSAGES,
  HTTP_STATUS,
  ORGANIZATIONS_TREE_PATH,
} from "../constants.js";
import { OrganizationIdSchema } from "../schemas/organization-schemas.js";
import type { Organization } from "../types.js";

const logger = createLogger("get-organization-tool");

/**
 * Zod schema for get organization by ID tool parameters.
 * Validates the organization ID parameter.
 */
export const getOrganizationToolSchema = OrganizationIdSchema;

/**
 * MCP tool metadata for get organization by ID.
 * Provides LLM-friendly description and schema for tool discovery.
 */
export const getOrganizationToolMetadata = {
  name: "get-organization",
  description:
    "Retrieve a specific organization by its unique identifier (ID). " +
    "The ID must be a non-empty string representing a valid organization identifier. " +
    "Returns the organization details including name, description, and timestamps. " +
    "Returns an error if the organization is not found or if access is denied. " +
    "Requires authentication with a valid JWT token.",
  schema: getOrganizationToolSchema,
};

/**
 * Handler for the get organization by ID MCP tool.
 * Retrieves a specific organization via GET /organizations/{id} endpoint.
 *
 * @param params - The organization ID parameter
 * @returns MCP tool response with organization data or error details
 */
export async function getOrganizationToolHandler(params: unknown) {
  try {
    // Validate input parameters using Zod schema
    const validatedParams = getOrganizationToolSchema.parse(params);
    logger.info("Retrieving organization", { id: validatedParams.id });

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

    // Construct API URL with organization ID
    const url = `${API_CONFIG.BASE_URL}${ORGANIZATIONS_TREE_PATH(
      validatedParams.id
    )}`;
    logger.debug("Making GET request to", { url });

    // Make authenticated API request
    const response = await axios.get<Organization>(url, {
      headers: {
        Authorization: `Bearer ${storedToken.token}`,
      },
    });

    logger.info("Organization retrieved successfully", {
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
                error: "Invalid organization ID parameter",
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

      if (status === HTTP_STATUS.BAD_REQUEST) {
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(
                {
                  success: false,
                  error: ERROR_MESSAGES.INVALID_ID,
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
