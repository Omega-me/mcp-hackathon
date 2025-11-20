/**
 * Zod Validation Schemas for Organizations CRUD Operations
 * Feature: organizations-crud
 */

import { z } from "zod";
import {
  MAX_ORGANIZATION_NAME_LENGTH,
  MIN_ORGANIZATION_NAME_LENGTH,
  ERROR_MESSAGES,
} from "../constants.js";

/**
 * Schema for get all organizations parameters
 * Currently accepts no parameters, but includes future pagination/filter support
 */
export const GetAllOrganizationsParamsSchema = z
  .object({
    page: z.number().int().positive().optional(),
    limit: z.number().int().positive().max(100).optional(),
    filter: z.string().optional(),
  })
  .optional();

export type GetAllOrganizationsParams = z.infer<
  typeof GetAllOrganizationsParamsSchema
>;

/**
 * Schema for creating an organization
 */
export const CreateOrganizationSchema = z.object({
  name: z
    .string()
    .min(MIN_ORGANIZATION_NAME_LENGTH, ERROR_MESSAGES.NAME_REQUIRED)
    .max(MAX_ORGANIZATION_NAME_LENGTH, ERROR_MESSAGES.NAME_TOO_LONG)
    .trim(),
  description: z.string().optional(),
});

export type CreateOrganizationInput = z.infer<typeof CreateOrganizationSchema>;

/**
 * Schema for organization ID validation
 */
export const OrganizationIdSchema = z.object({
  id: z.string().min(1, ERROR_MESSAGES.INVALID_ID).trim(),
});

export type OrganizationIdInput = z.infer<typeof OrganizationIdSchema>;

/**
 * Schema for updating an organization (PUT - full replacement)
 */
export const UpdateOrganizationSchema = z.object({
  id: z.string().min(1, ERROR_MESSAGES.INVALID_ID).trim(),
  name: z
    .string()
    .min(MIN_ORGANIZATION_NAME_LENGTH, ERROR_MESSAGES.NAME_REQUIRED)
    .max(MAX_ORGANIZATION_NAME_LENGTH, ERROR_MESSAGES.NAME_TOO_LONG)
    .trim(),
  description: z.string().optional(),
});

export type UpdateOrganizationInput = z.infer<typeof UpdateOrganizationSchema>;

/**
 * Schema for deleting an organization
 */
export const DeleteOrganizationSchema = z.object({
  id: z.string().min(1, ERROR_MESSAGES.INVALID_ID).trim(),
});

export type DeleteOrganizationInput = z.infer<typeof DeleteOrganizationSchema>;
