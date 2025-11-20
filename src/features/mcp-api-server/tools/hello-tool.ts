/**
 * Hello Tool
 * MCP tool that queries the /api/hello endpoint
 */

import { z } from "zod";
import { API_CONFIG, TOOLS } from "../constants.js";
import { createLogger } from "../../../shared/utils/logger.js";
import { post } from "../services/api-client.js";

const logger = createLogger("Hello Tool");

/**
 * Hello tool parameter schema
 */
export const helloToolSchema = {
  firstName: z.string().describe("First name"),
  lastName: z.string().describe("Last name"),
};

/**
 * Hello tool handler
 * Queries the /api/hello endpoint and returns formatted response
 */
export async function helloToolHandler(params: unknown) {
  logger.info("Executing hello tool");

  try {
    const response = await post(API_CONFIG.HELLO_ENDPOINT, params);

    // Format response as JSON with 2-space indentation per spec FR-013
    const formattedData = JSON.stringify(response.data, null, 2);

    logger.info("Hello tool executed successfully");

    return {
      content: [
        {
          type: "text" as const,
          text: formattedData,
        },
      ],
    };
  } catch (error) {
    logger.error("Hello tool execution failed", error);

    const errorMessage = error instanceof Error ? error.message : String(error);

    return {
      content: [
        {
          type: "text" as const,
          text: `Error: ${errorMessage}`,
        },
      ],
      isError: true,
    };
  }
}

/**
 * Tool metadata for registration
 */
export const helloToolMetadata = {
  name: TOOLS.HELLO.NAME,
  description: TOOLS.HELLO.DESCRIPTION,
  schema: helloToolSchema,
};
