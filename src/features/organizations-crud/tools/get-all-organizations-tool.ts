/**
 * Get All Organizations Tool
 * MCP Tool for retrieving list of all organizations
 * Feature: organizations-crud
 */

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
import type { GetAllOrganizationsResponse } from "../types.js";

const logger = createLogger("Get All Organizations Tool");

// ====================
// Tool Schema
// ====================

/**
 * Zod schema for get-all-organizations tool input validation
 * Currently no parameters, but schema includes future pagination support
 */
export const getAllOrganizationsToolSchema = z.object({});

export type GetAllOrganizationsToolInput = z.infer<
  typeof getAllOrganizationsToolSchema
>;

// ====================
// Tool Metadata
// ====================

export const getAllOrganizationsToolMetadata = {
  name: "get-all-organizations",
  description:
    "Retrieve a list of all organizations. Returns all organizations the authenticated user has permission to view. Future support for pagination and filtering will be added.",
  schema: getAllOrganizationsToolSchema,
};

// ====================
// Tool Handler
// ====================

/**
 * Handler for get-all-organizations tool
 */
export async function getAllOrganizationsToolHandler(_params: unknown) {
  try {
    logger.info("Tool invoked");

    // Get authentication token
    const storedToken = getToken();
    if (!storedToken) {
      logger.error("No authentication token found");
      throw new Error(ERROR_MESSAGES.AUTH_REQUIRED);
    }

    const url = `${API_CONFIG.BASE_URL}${ORGANIZATIONS_BASE_PATH}`;

    logger.info("Calling API", { endpoint: url });

    // Call API with auth token
    const response = await axios.get<GetAllOrganizationsResponse>(url, {
      headers: {
        Authorization: `Bearer ${storedToken.token}`,
        Accept: "application/json",
      },
      timeout: API_CONFIG.TIMEOUT,
    });

    logger.info("API call successful", {
      status: response.status,
      organizationCount: response.data.data?.length || 0,
    });

    // Return MCP response format
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response.data, null, 2),
        },
      ],
    };
  } catch (error: any) {
    logger.error("Error occurred", {
      error: error.message,
      status: error.response?.status,
    });

    // Handle specific HTTP error codes
    if (error.response) {
      const status = error.response.status;

      switch (status) {
        case HTTP_STATUS.UNAUTHORIZED:
          throw new Error(ERROR_MESSAGES.AUTH_REQUIRED);
        case HTTP_STATUS.FORBIDDEN:
          throw new Error(ERROR_MESSAGES.FORBIDDEN);
        case HTTP_STATUS.SERVER_ERROR:
          throw new Error(ERROR_MESSAGES.SERVER_ERROR);
        default:
          throw new Error(
            `API error: ${status} - ${
              error.response.statusText || "Unknown error"
            }`
          );
      }
    }

    // Re-throw original error if not an HTTP response error
    throw new Error(`Failed to get organizations: ${error.message}`);
  }
}
