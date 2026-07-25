import { z } from "zod";

export const productSearchQuerySchema = z.object({
  q: z.string().trim().optional().default(""),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  category: z.string().trim().optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  sort: z
    .enum([
      "createdAt",
      "-createdAt",
      "price",
      "-price",
      "name",
      "-name",
      "averageRating",
      "-averageRating",
    ])
    .default("-createdAt"),
});
