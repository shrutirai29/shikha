import { z } from "zod";

export const createPaymentSchema = z.object({
  orderId: z.string().trim().min(1, "Order ID is required"),
});

export const verifyPaymentSchema = z.object({
  razorpayOrderId: z.string().trim().min(1, "Razorpay Order ID is required"),

  razorpayPaymentId: z.string().trim().min(1, "Razorpay Payment ID is required"),

  razorpaySignature: z.string().trim().min(1, "Razorpay Signature is required"),
});