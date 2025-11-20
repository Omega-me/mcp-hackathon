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
import { UpdateOrganizationSchema } from "../schemas/organization-schemas.js";
import type { Organization } from "../types.js";

const logger = createLogger("update-organization-tool");

/**
 * Zod schema for update organization tool parameters.
 * Validates the organization ID and full body for PUT operation.
 */
export const updateOrganizationToolSchema = UpdateOrganizationSchema;

/**
 * MCP tool metadata for update organization.
 * Provides LLM-friendly description and schema for tool discovery.
 */
export const updateOrganizationToolMetadata = {
  name: "update-organization",
  description:
    "Update an existing organization with full body replacement (PUT semantics). " +
    "Requires the organization ID parameter and complete body with name and optional description. " +
    "The name is required and must be between 1-255 characters. " +
    "The description is optional and can be up to 1000 characters. " +
    "This is a complete replacement operation - all fields must be provided. " +
    "Returns the updated organization with modified timestamps. " +
    "Returns an error if the organization is not found or if validation fails. " +
    "Requires authentication with a valid JWT token.",
  schema: updateOrganizationToolSchema,
};

/**
 * Handler for the update organization MCP tool.
 * Updates an existing organization via PUT /organizations/{id} endpoint.
 *
 * @param params - The organization ID and complete body data (name required, description optional)
 * @returns MCP tool response with updated organization data or error details
 */
export async function updateOrganizationToolHandler(params: unknown) {
  try {
    // Validate input parameters using Zod schema
    const validatedParams = updateOrganizationToolSchema.parse(params);
    logger.info("Updating organization", {
      id: validatedParams.id,
      name: validatedParams.name,
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

    // Construct API URL with organization ID
    const url = `${API_CONFIG.BASE_URL}${ORGANIZATIONS_BY_ID_PATH(
      validatedParams.id
    )}`;
    logger.debug("Making PUT request to", { url });

    // Make authenticated API request with full body replacement
    const response = await axios.put<Organization>(
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

    logger.info("Organization updated successfully", {
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
                  error: "Invalid organization data or ID",
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
