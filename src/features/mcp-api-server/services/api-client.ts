/**
 * API Client Service
 * Handles HTTP requests to external APIs
 */

import axios, { AxiosError, AxiosResponse } from "axios";
import { API_CONFIG, HTTP_HEADERS, ERROR_CODES } from "../constants.js";
import { ApiResponse } from "../types.js";
import { createLogger } from "../../../shared/utils/logger.js";

const logger = createLogger("API Client");

/**
 * Format error message with error code
 */
function formatError(code: string, message: string): Error {
  const error = new Error(message);
  error.name = code;
  return error;
}

/**
 * Make a GET request to the API
 * @param endpoint - Relative endpoint path (e.g., "/api/hello")
 * @returns API response with data
 */
export async function get<T = unknown>(
  endpoint: string
): Promise<ApiResponse<T>> {
  const url = `${API_CONFIG.BASE_URL}${endpoint}`;

  logger.info(`GET ${url}`);

  try {
    const response: AxiosResponse<T> = await axios.get(url, {
      timeout: API_CONFIG.TIMEOUT,
      headers: {
        Accept: HTTP_HEADERS.ACCEPT_JSON,
      },
    });

    logger.info(`GET ${url} - ${response.status} ${response.statusText}`);

    return {
      status: response.status,
      statusText: response.statusText,
      data: response.data,
      headers: response.headers as Record<string, string>,
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;

      if (axiosError.code === "ECONNABORTED") {
        logger.error(`GET ${url} - Timeout after ${API_CONFIG.TIMEOUT}ms`);
        throw formatError(
          ERROR_CODES.TIMEOUT,
          `Request timed out after ${API_CONFIG.TIMEOUT}ms. The API did not respond in time.`
        );
      }

      if (axiosError.code === "ECONNREFUSED") {
        logger.error(`GET ${url} - Connection refused`);
        throw formatError(
          ERROR_CODES.NETWORK_ERROR,
          `Cannot connect to API at ${API_CONFIG.BASE_URL}. The server may be down or unreachable.`
        );
      }

      if (axiosError.code === "ENOTFOUND") {
        logger.error(`GET ${url} - Host not found`);
        throw formatError(
          ERROR_CODES.NETWORK_ERROR,
          `Cannot resolve hostname ${API_CONFIG.BASE_URL}. Please check the API URL configuration.`
        );
      }

      if (axiosError.response) {
        const status = axiosError.response.status;
        logger.error(
          `GET ${url} - ${status} ${axiosError.response.statusText}`
        );

        if (status >= 400 && status < 500) {
          throw formatError(
            ERROR_CODES.API_ERROR,
            `Client error ${status}: ${axiosError.response.statusText}. The request was invalid or unauthorized.`
          );
        }

        if (status >= 500) {
          throw formatError(
            ERROR_CODES.API_ERROR,
            `Server error ${status}: ${axiosError.response.statusText}. The API server encountered an error.`
          );
        }

        throw formatError(
          ERROR_CODES.API_ERROR,
          `API returned error ${status}: ${axiosError.response.statusText}`
        );
      }

      logger.error(`GET ${url} - ${axiosError.message}`);
      throw formatError(
        ERROR_CODES.NETWORK_ERROR,
        `Network error: ${axiosError.message}`
      );
    }

    logger.error(`GET ${url} - Unexpected error`, error);
    throw formatError(
      ERROR_CODES.INTERNAL_ERROR,
      `Unexpected error: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

export async function post<T = unknown, D = unknown>(
  endpoint: string,
  data: D
): Promise<ApiResponse<T>> {
  const url = `${API_CONFIG.BASE_URL}${endpoint}`;
  logger.info(`POST ${url}`);
  try {
    const response: AxiosResponse<T> = await axios.post(url, data, {
      timeout: API_CONFIG.TIMEOUT,
      headers: {
        Accept: HTTP_HEADERS.ACCEPT_JSON,
      },
    });

    logger.info(`GET ${url} - ${response.status} ${response.statusText}`);

    return {
      status: response.status,
      statusText: response.statusText,
      data: response.data,
      headers: response.headers as Record<string, string>,
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;

      if (axiosError.code === "ECONNABORTED") {
        logger.error(`GET ${url} - Timeout after ${API_CONFIG.TIMEOUT}ms`);
        throw formatError(
          ERROR_CODES.TIMEOUT,
          `Request timed out after ${API_CONFIG.TIMEOUT}ms. The API did not respond in time.`
        );
      }

      if (axiosError.code === "ECONNREFUSED") {
        logger.error(`GET ${url} - Connection refused`);
        throw formatError(
          ERROR_CODES.NETWORK_ERROR,
          `Cannot connect to API at ${API_CONFIG.BASE_URL}. The server may be down or unreachable.`
        );
      }

      if (axiosError.code === "ENOTFOUND") {
        logger.error(`GET ${url} - Host not found`);
        throw formatError(
          ERROR_CODES.NETWORK_ERROR,
          `Cannot resolve hostname ${API_CONFIG.BASE_URL}. Please check the API URL configuration.`
        );
      }

      if (axiosError.response) {
        const status = axiosError.response.status;
        logger.error(
          `GET ${url} - ${status} ${axiosError.response.statusText}`
        );

        if (status >= 400 && status < 500) {
          throw formatError(
            ERROR_CODES.API_ERROR,
            `Client error ${status}: ${axiosError.response.statusText}. The request was invalid or unauthorized.`
          );
        }

        if (status >= 500) {
          throw formatError(
            ERROR_CODES.API_ERROR,
            `Server error ${status}: ${axiosError.response.statusText}. The API server encountered an error.`
          );
        }

        throw formatError(
          ERROR_CODES.API_ERROR,
          `API returned error ${status}: ${axiosError.response.statusText}`
        );
      }

      logger.error(`GET ${url} - ${axiosError.message}`);
      throw formatError(
        ERROR_CODES.NETWORK_ERROR,
        `Network error: ${axiosError.message}`
      );
    }

    logger.error(`GET ${url} - Unexpected error`, error);
    throw formatError(
      ERROR_CODES.INTERNAL_ERROR,
      `Unexpected error: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}
