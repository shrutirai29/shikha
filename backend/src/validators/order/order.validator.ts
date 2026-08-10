import { z } from "zod";

export const ORDER_STATUSES = [
  "Pending",
  "Processing",
  "Shipped",
  "OutForDelivery",
  "Delivered",
  "Cancelled",
  "RTO",
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

export const orderQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),

  status: z.enum(ORDER_STATUSES).optional(),
  paymentStatus: z
    .enum(["Pending", "Paid", "Failed", "Refunded"])
    .optional(),
  paymentMethod: z.enum(["COD", "RAZORPAY"]).optional(),

  q: z.string().trim().max(100).optional(),

  collected: z.enum(["true", "false"]).optional(),

  from: z.string().optional(),
  to: z.string().optional(),
});

export const assignDeliveryAgentSchema = z.object({
  agentId: z.string().min(1, "Agent is required"),
});

export const deliveryAttemptSchema = z.object({
  note: z.string().trim().max(300).optional(),
  refused: z.boolean().optional(),
});

export const completeDeliverySchema = z.object({
  otp: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "Delivery code must be 6 digits"),
  codCollected: z.boolean().optional(),
});

export const markRtoSchema = z.object({
  note: z.string().trim().max(300).optional(),
});
