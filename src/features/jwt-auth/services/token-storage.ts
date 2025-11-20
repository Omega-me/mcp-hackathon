/**
 * Token Storage Service
 *
 * In-memory storage for JWT authentication tokens.
 * Simple Map-based implementation following YAGNI and KISS principles.
 *
 * ⚠️ IMPORTANT: Storage is ephemeral - tokens are lost on server restart.
 * This is intentional for MVP. Future enhancement can add persistent storage.
 */

import { StoredToken } from "../types.js";
import { createLogger } from "../../../shared/utils/logger.js";
import { LOG_EVENTS } from "../constants.js";

const logger = createLogger("Token Storage");

// ====================
// In-Memory Storage
// ====================

/**
 * Single-user token storage.
 * For multi-user support, this would need to be a Map<userId, StoredToken>.
 */
let currentToken: StoredToken | null = null;

// ====================
// Public API
// ====================

/**
 * Store authentication token in memory
 *
 * @param userId - Unique identifier for the user
 * @param token - JWT token string
 * @param email - Optional email address
 * @param expiresAt - Optional expiration timestamp/duration
 */
export function storeToken(
  userId: string,
  token: string,
  email?: string,
  expiresAt?: string | number
): void {
  currentToken = {
    userId,
    token,
    email,
    storedAt: new Date().toISOString(),
    expiresAt,
  };

  logger.info(LOG_EVENTS.TOKEN_STORED, {
    userId,
    email,
    storedAt: currentToken.storedAt,
    hasExpiration: !!expiresAt,
  });
}

/**
 * Retrieve the currently stored token
 *
 * @returns StoredToken if exists, null if no active session
 */
export function getToken(): StoredToken | null {
  if (currentToken === null) {
    logger.info(LOG_EVENTS.TOKEN_NOT_FOUND, {
      message: "No token in storage",
    });
  } else {
    logger.info(LOG_EVENTS.TOKEN_RETRIEVED, {
      userId: currentToken.userId,
      email: currentToken.email,
    });
  }

  return currentToken;
}

/**
 * Clear the stored token (logout)
 */
export function clearToken(): void {
  if (currentToken !== null) {
    logger.info(LOG_EVENTS.TOKEN_CLEARED, {
      userId: currentToken.userId,
      email: currentToken.email,
    });
  }

  currentToken = null;
}

/**
 * Check if a token is currently stored
 *
 * @returns true if token exists, false otherwise
 */
export function hasToken(): boolean {
  return currentToken !== null;
}

/**
 * Get the stored token string only (convenience method)
 *
 * @returns token string if exists, null otherwise
 */
export function getTokenString(): string | null {
  return currentToken?.token ?? null;
}

/**
 * Get the stored user ID only (convenience method)
 *
 * @returns userId if token exists, null otherwise
 */
export function getUserId(): string | null {
  return currentToken?.userId ?? null;
}
