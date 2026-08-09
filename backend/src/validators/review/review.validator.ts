import { z } from "zod";

export const createReviewSchema = z.object({
  rating: z
    .number()
    .int()
    .min(1, "Rating must be between 1 and 5")
    .max(5, "Rating must be between 1 and 5"),

  comment: z
    .string()
    .trim()
    .min(5, "Comment must contain at least 5 characters")
    .max(500, "Comment cannot exceed 500 characters"),
});

export const reviewQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

export const reviewAdminQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  rating: z.coerce.number().int().min(1).max(5).optional(),
  search: z.string().trim().optional().default(""),
});

export type CreateReviewInput = z.infer<
  typeof createReviewSchema
>;