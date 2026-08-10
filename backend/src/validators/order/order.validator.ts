import { z } from "zod";

export const ORDER_STATUSES = [
  "Pending",
  "Processing",
  "Shipped",
  "Delivered",
  "Cancelled",
] as const;

export const createOrderSchema = z.object({
  shippingAddress: z.object({
    fullName: z
      .string()
      .trim()
      .min(2, "Full name is required"),

    phone: z
      .string()
      .trim()
      .min(10, "Phone number must be at least 10 digits")
      .max(15, "Phone number is too long"),

    addressLine1: z
      .string()
      .trim()
      .min(5, "Address Line 1 is required"),

    addressLine2: z
      .string()
      .trim()
      .optional(),

    city: z
      .string()
      .trim()
      .min(2, "City is required"),

    state: z
      .string()
      .trim()
      .min(2, "State is required"),

    country: z
      .string()
      .trim()
      .min(2, "Country is required"),

    postalCode: z
      .string()
      .trim()
      .min(4, "Postal Code is required")
      .max(10, "Invalid Postal Code"),
  }),

  paymentMethod: z.enum(["COD", "RAZORPAY"]),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(ORDER_STATUSES),
});

export const updateShippingSchema = z.object({
  provider: z.string().trim().max(50).optional(),
  trackingId: z.string().trim().max(100).optional(),
  trackingUrl: z.string().trim().url("Tracking URL must be a valid URL").max(500).optional(),
  shippedAt: z.coerce.date().optional(),
});

export const orderQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),

  status: z.enum(ORDER_STATUSES).optional(),
  paymentStatus: z
    .enum(["Pending", "Paid", "Failed", "Refunded"])
    .optional(),
  paymentMethod: z.enum(["COD", "RAZORPAY"]).optional(),

  q: z.string().trim().max(100).optional(),

  from: z.string().optional(),
  to: z.string().optional(),
});
