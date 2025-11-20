/**
 * Zod Validation Schemas for People CRUD Operations
 * Feature: people-crud
 */

import { z } from "zod";
import {
  MAX_NAME_LENGTH,
  MIN_NAME_LENGTH,
  ERROR_MESSAGES,
} from "../constants.js";

/**
 * Schema for get all people parameters
 * Currently accepts optional parameters for future pagination/filter support
 */
export const GetAllPeopleParamsSchema = z
  .object({
    page: z.number().int().positive().optional(),
    limit: z.number().int().positive().max(100).optional(),
    filter: z.string().optional(),
  })
  .optional();

export type GetAllPeopleParams = z.infer<typeof GetAllPeopleParamsSchema>;

/**
 * Schema for creating a person
 */
export const CreatePersonSchema = z.object({
  firstName: z
    .string()
    .min(MIN_NAME_LENGTH, ERROR_MESSAGES.FIRST_NAME_REQUIRED)
    .max(MAX_NAME_LENGTH, ERROR_MESSAGES.NAME_TOO_LONG)
    .trim(),
  lastName: z
    .string()
    .min(MIN_NAME_LENGTH, ERROR_MESSAGES.LAST_NAME_REQUIRED)
    .max(MAX_NAME_LENGTH, ERROR_MESSAGES.NAME_TOO_LONG)
    .trim(),
  email: z.string().email(ERROR_MESSAGES.INVALID_EMAIL).trim(),
  teamId: z.number().int().positive().optional(),
});

export type CreatePersonInput = z.infer<typeof CreatePersonSchema>;

/**
 * Schema for person ID validation
 */
export const PersonIdSchema = z.object({
  id: z.string().min(1, ERROR_MESSAGES.INVALID_ID).trim(),
});

export type PersonIdInput = z.infer<typeof PersonIdSchema>;

/**
 * Schema for updating a person (PUT - full replacement)
 */
export const UpdatePersonSchema = z.object({
  id: z.string().min(1, ERROR_MESSAGES.INVALID_ID).trim(),
  firstName: z
    .string()
    .min(MIN_NAME_LENGTH, ERROR_MESSAGES.FIRST_NAME_REQUIRED)
    .max(MAX_NAME_LENGTH, ERROR_MESSAGES.NAME_TOO_LONG)
    .trim(),
  lastName: z
    .string()
    .min(MIN_NAME_LENGTH, ERROR_MESSAGES.LAST_NAME_REQUIRED)
    .max(MAX_NAME_LENGTH, ERROR_MESSAGES.NAME_TOO_LONG)
    .trim(),
  email: z.string().email(ERROR_MESSAGES.INVALID_EMAIL).trim(),
  teamId: z.number().int().positive().optional(),
});

export type UpdatePersonInput = z.infer<typeof UpdatePersonSchema>;

/**
 * Schema for deleting a person
 */
export const DeletePersonSchema = z.object({
  id: z.string().min(1, ERROR_MESSAGES.INVALID_ID).trim(),
});

export type DeletePersonInput = z.infer<typeof DeletePersonSchema>;
