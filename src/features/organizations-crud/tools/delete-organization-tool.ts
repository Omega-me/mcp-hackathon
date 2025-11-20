import { z } from "zod";
import axios from "axios";
import { getToken } from "../../jwt-auth/services/token-storage.js";
import { createLogger } from "../../../shared/utils/logger.js";
import { API_CONFIG } from "../../mcp-api-server/constants.js";
import {
  ORGANIZATIONS_BY_ID_PATH,
  ERROR_MESSAGES,
  HTTP_STATUS,
} from "../constants.js";
import { DeleteOrganizationSchema } from "../schemas/organization-schemas.js";

const logger = createLogger("delete-organization-tool");

/**
 * Zod schema for delete organization tool parameters.
 * Validates the organization ID parameter for deletion.
 */
export const deleteOrganizationToolSchema = DeleteOrganizationSchema;

/**
 * MCP tool metadata for delete organization.
 * Provides LLM-friendly description and schema for tool discovery.
 */
export const deleteOrganizationToolMetadata = {
  name: "delete-organization",
  description:
    "Permanently delete an organization by its unique identifier (ID). " +
    "The ID must be a non-empty string representing a valid organization identifier. " +
    "This operation is irreversible and will permanently remove the organization. " +
    "Returns a success confirmation message if the deletion is successful. " +
    "Returns an error if the organization is not found, has dependencies, or if access is denied. " +
    "Organizations with existing dependencies (e.g., linked entities) cannot be deleted. " +
    "Requires authentication with a valid JWT token.",
  schema: deleteOrganizationToolSchema,
};

/**
 * Handler for the delete organization MCP tool.
 * Deletes an organization via DELETE /organizations/{id} endpoint.
 *
 * @param params - The organization ID parameter
 * @returns MCP tool response with success confirmation or error details
 */
export async function deleteOrganizationToolHandler(params: unknown) {
  try {
    // Validate input parameters using Zod schema
    const validatedParams = deleteOrganizationToolSchema.parse(params);
    logger.info("Deleting organization", { id: validatedParams.id });

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
    const url = `${API_CONFIG.BASE_URL}${ORGANIZATIONS_BY_ID_PATH(
      validatedParams.id
    )}`;
    logger.debug("Making DELETE request to", { url });

    // Make authenticated API request
    const response = await axios.delete(url, {
      headers: {
        Authorization: `Bearer ${storedToken.token}`,
      },
    });

    logger.info("Organization deleted successfully", {
      id: validatedParams.id,
      status: response.status,
    });

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(
            {
              success: true,
              message: `Organization with ID '${validatedParams.id}' has been successfully deleted.`,
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

      if (status === HTTP_STATUS.CONFLICT) {
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(
                {
                  success: false,
                  error: ERROR_MESSAGES.HAS_DEPENDENCIES,
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
