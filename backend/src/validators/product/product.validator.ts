import { z } from "zod";

export const createProductSchema = z.object({
  name: z
    .string()
    .min(3, "Product name must be at least 3 characters"),

  description: z
    .string()
    .min(10, "Description must be at least 10 characters"),

  price: z
    .number()
    .positive("Price must be greater than 0"),

  discountPrice: z
    .number()
    .nonnegative("Discount price cannot be negative")
    .optional(),

  stock: z
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
});