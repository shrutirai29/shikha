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

export type CreateReviewInput = z.infer<
  typeof createReviewSchema
>;