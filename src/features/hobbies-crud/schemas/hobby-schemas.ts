import { z } from "zod";
import {
  MIN_NAME_LENGTH,
  MAX_NAME_LENGTH,
  MAX_DESCRIPTION_LENGTH,
  ERROR_MESSAGES,
} from "../constants.js";

/**
 * Schema for get all hobbies parameters
 * Currently accepts optional parameters for future pagination/filter support
 */
export const GetAllHobbiesParamsSchema = z
  .object({
    page: z.number().int().positive().optional(),
    limit: z.number().int().positive().max(100).optional(),
    filter: z.string().optional(),
  })
  .optional();

export type GetAllHobbiesParams = z.infer<typeof GetAllHobbiesParamsSchema>;

/**
 * Schema for creating a hobby
 */
export const CreateHobbySchema = z.object({
  name: z
    .string()
    .min(MIN_NAME_LENGTH, ERROR_MESSAGES.NAME_REQUIRED)
    .max(MAX_NAME_LENGTH, ERROR_MESSAGES.NAME_TOO_LONG)
    .trim(),
  description: z
    .string()
    .max(MAX_DESCRIPTION_LENGTH, ERROR_MESSAGES.DESCRIPTION_TOO_LONG)
    .trim()
    .optional(),
});

export type CreateHobbyInput = z.infer<typeof CreateHobbySchema>;

/**
 * Schema for getting a hobby by ID
 */
export const HobbyIdSchema = z.object({
  id: z.string().min(1, ERROR_MESSAGES.INVALID_ID).trim(),
});

export type GetHobbyInput = z.infer<typeof HobbyIdSchema>;

/**
 * Schema for updating a hobby
 * Includes ID plus all fields from create (PUT semantics - full replacement)
 */
export const UpdateHobbySchema = z.object({
  id: z.string().min(1, ERROR_MESSAGES.INVALID_ID).trim(),
  name: z
    .string()
    .min(MIN_NAME_LENGTH, ERROR_MESSAGES.NAME_REQUIRED)
    .max(MAX_NAME_LENGTH, ERROR_MESSAGES.NAME_TOO_LONG)
    .trim(),
  description: z
    .string()
    .max(MAX_DESCRIPTION_LENGTH, ERROR_MESSAGES.DESCRIPTION_TOO_LONG)
    .trim()
    .optional(),
});

export type UpdateHobbyInput = z.infer<typeof UpdateHobbySchema>;

/**
 * Schema for deleting a hobby by ID
 */
export const DeleteHobbySchema = z.object({
  id: z.string().min(1, ERROR_MESSAGES.INVALID_ID).trim(),
});

export type DeleteHobbyInput = z.infer<typeof DeleteHobbySchema>;
