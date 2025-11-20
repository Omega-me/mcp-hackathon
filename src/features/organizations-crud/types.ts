/**
 * Types for Organizations CRUD Operations
 * Feature: organizations-crud
 */

/**
 * Organization entity
 */
export interface Organization {
  id: string;
  name: string;
  description?: string;
  createdAt: string; // ISO 8601 timestamp
  updatedAt: string; // ISO 8601 timestamp
}

/**
 * Request body for creating an organization
 */
export interface CreateOrganizationRequest {
  name: string;
  description?: string;
}

/**
 * Response from creating an organization
 */
export interface CreateOrganizationResponse {
  data: Organization;
}

/**
 * Response from getting all organizations
 */
export interface GetAllOrganizationsResponse {
  data: Organization[];
}

/**
 * Response from getting a single organization
 */
export interface GetOrganizationResponse {
  data: Organization;
}

/**
 * Request body for updating an organization (PUT - full replacement)
 */
export interface UpdateOrganizationRequest {
  id: string;
  name: string;
  description?: string;
}

/**
 * Response from updating an organization
 */
export interface UpdateOrganizationResponse {
  data: Organization;
}

/**
 * Request for deleting an organization
 */
export interface DeleteOrganizationRequest {
  id: string;
}

/**
 * Response from deleting an organization
 */
export interface DeleteOrganizationResponse {
  success: boolean;
  message?: string;
}

/**
 * Standard error response from API
 */
export interface ErrorResponse {
  error: {
    message: string;
    code?: string;
    details?: unknown;
  };
}

/**
 * Parameters for get all organizations (future pagination support)
 */
export interface GetAllOrganizationsParams {
  page?: number;
  limit?: number;
  filter?: string;
}
