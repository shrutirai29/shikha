import { z } from "zod";

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().optional().default(""),
  sort: z.string().optional().default("-createdAt"),
});

export type PaginationQuery = z.infer<typeof paginationQuerySchema>;
