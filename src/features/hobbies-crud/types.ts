/**
 * Hobby entity - complete representation
 */
export interface Hobby {
  id: string;
  name: string;
  description?: string;
  createdAt: string; // ISO 8601 timestamp
  updatedAt: string; // ISO 8601 timestamp
}

/**
 * Request body for creating a hobby
 */
export interface CreateHobbyRequest {
  name: string;
  description?: string;
}

/**
 * Response from creating a hobby
 */
export interface CreateHobbyResponse {
  data: Hobby;
}

/**
 * Response from getting all hobbies
 */
export interface GetAllHobbiesResponse {
  data: Hobby[];
}

/**
 * Response from getting a single hobby
 */
export interface GetHobbyResponse {
  data: Hobby;
}

/**
 * Request body for updating a hobby (PUT - full replacement)
 */
export interface UpdateHobbyRequest {
  name: string;
  description?: string;
}

/**
 * Response from updating a hobby
 */
export interface UpdateHobbyResponse {
  data: Hobby;
}

/**
 * Response from deleting a hobby
 */
export interface DeleteHobbyResponse {
  success: boolean;
  message: string;
}

/**
 * Parameters for get all hobbies (future pagination support)
 */
export interface GetAllHobbiesParams {
  page?: number;
  limit?: number;
  filter?: string;
}

/**
 * Hobby ID parameter for get/update/delete operations
 */
export interface HobbyIdParam {
  id: string;
}
