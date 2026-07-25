import { z } from "zod";

export const createPaymentSchema = z.object({
  orderId: z.string().trim().min(1, "Order ID is required"),
});

export const verifyPaymentSchema = z.object({
  razorpayOrderId: z.string().trim().min(1, "Razorpay Order ID is required"),

  razorpayPaymentId: z.string().trim().min(1, "Razorpay Payment ID is required"),

  razorpaySignature: z.string().trim().min(1, "Razorpay Signature is required"),
});

export const refundPaymentSchema = z.object({
  amount: z.coerce
    .number()
    .positive("Refund amount must be greater than 0")
    .optional(),

  reason: z
    .string()
    .trim()
    .max(200, "Refund reason cannot exceed 200 characters")
    .optional(),
});
