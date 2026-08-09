import { z } from "zod";

export const createCouponSchema = z.object({
  code: z
    .string()
    .trim()
    .min(3)
    .max(20)
    .transform((value) => value.toUpperCase()),

  description: z
    .string()
    .trim()
    .min(5)
    .max(200),

  discountType: z.enum([
    "PERCENTAGE",
    "FIXED",
  ]),

  discountValue: z
    .number()
    .positive(),

  minimumPurchase: z
    .number()
    .min(0),

  maximumDiscount: z
    .number()
    .min(0),

  usageLimit: z
    .number()
    .int()
    .positive(),

  expiresAt: z.coerce.date(),
});

export const updateCouponSchema =
  createCouponSchema.partial();

export const couponQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

export const applyCouponSchema = z.object({
  code: z
    .string()
    .trim()
    .min(3)
    .max(20)
    .transform((value) => value.toUpperCase()),
});

export type CreateCouponInput = z.infer<
  typeof createCouponSchema
>;

export type UpdateCouponInput = z.infer<
  typeof updateCouponSchema
>;

export type ApplyCouponInput = z.infer<
  typeof applyCouponSchema
>;