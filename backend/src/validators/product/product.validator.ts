import { z } from "zod";

const productBaseSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "Product name must be at least 3 characters"),

  description: z
    .string()
    .trim()
    .min(10, "Description must be at least 10 characters"),

  price: z.coerce
    .number()
    .positive("Price must be greater than 0"),

  discountPrice: z.coerce
    .number()
    .nonnegative("Discount price cannot be negative")
    .optional(),

  stock: z.coerce
    .number()
    .int()
    .nonnegative("Stock cannot be negative"),

  images: z
    .array(z.string().url("Each image must be a valid URL"))
    .min(1, "At least one image is required"),

  category: z
    .string()
    .min(1, "Category is required"),

  isFeatured: z
    .boolean()
    .optional(),

  isActive: z
    .boolean()
    .optional(),
});

export const createProductSchema = productBaseSchema.refine(
  (data) =>
    data.discountPrice === undefined ||
    data.discountPrice < data.price,
  {
    path: ["discountPrice"],
    message: "Discount price must be lower than price",
  }
);

export const updateProductSchema = productBaseSchema
  .partial()
  .refine(
    (data) =>
      data.discountPrice === undefined ||
      data.price === undefined ||
      data.discountPrice < data.price,
    {
      path: ["discountPrice"],
      message: "Discount price must be lower than price",
    }
  );

export const productQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().trim().optional().default(""),
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
  category: z.string().trim().optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  isFeatured: z.coerce.boolean().optional(),
});
