/**
 * Types for People CRUD Operations
 * Feature: people-crud
 */

/**
 * Person entity
 */
export interface Person {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  teamId?: number;
  createdAt: string; // ISO 8601 timestamp
  updatedAt: string; // ISO 8601 timestamp
}

/**
 * Request body for creating a person
 */
export interface CreatePersonRequest {
  firstName: string;
  lastName: string;
  email: string;
  teamId?: number;
}

/**
 * Response from creating a person
 */
export interface CreatePersonResponse {
  data: Person;
}

/**
 * Response from getting all people
 */
export interface GetAllPeopleResponse {
  data: Person[];
}

/**
 * Response from getting a single person
 */
export interface GetPersonResponse {
  data: Person;
}

/**
 * Request body for updating a person (PUT - full replacement)
 */
export interface UpdatePersonRequest {
  firstName: string;
  lastName: string;
  email: string;
  teamId?: number;
}

/**
 * Response from updating a person
 */
export interface UpdatePersonResponse {
  data: Person;
}

/**
 * Response from deleting a person
 */
export interface DeletePersonResponse {
  success: boolean;
  message: string;
}

/**
 * Parameters for get all people (future pagination support)
 */
export interface GetAllPeopleParams {
  page?: number;
  limit?: number;
  filter?: string;
}

/**
 * Person ID parameter for get/update/delete operations
 */
export interface PersonIdParam {
  id: string;
}
