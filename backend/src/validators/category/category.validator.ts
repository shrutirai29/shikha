import { z } from "zod";

export const createCategorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Category name must be at least 2 characters"),

  description: z.string().trim().optional(),

  image: z.string().url().optional(),
});

export const updateCategorySchema = createCategorySchema.partial();

export const categoryQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().trim().optional().default(""),
  sort: z
    .enum([
      "createdAt",
      "-createdAt",
      "name",
      "-name",
    ])
    .default("-createdAt"),
});
