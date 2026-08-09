import { z } from "zod";

export const registerSchema = z.object({
  name: z
    .string()
    .min(3, "Name must be at least 3 characters"),

  email: z
    .string()
    .email("Invalid email address"),

  password: z
    .string()
    .min(6, "Password must be at least 6 characters"),

  phone: z
    .string()
    .regex(
      /^[0-9+\-\s]{10,15}$/,
      "A valid phone number is required (10-15 digits)"
    ),
});

export const loginSchema = z.object({
  email: z
    .string()
    .email("Invalid email address"),

  password: z
    .string()
    .min(6, "Password must be at least 6 characters"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token is required"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters"),
});

export const verifyEmailSchema = z.object({
  token: z.string().min(1, "Token is required"),
});

export const resendVerificationSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const verifyCodeSchema = z.object({
  email: z.string().email("Invalid email address"),
  type: z.enum(["email", "phone"]),
  code: z
    .string()
    .regex(/^\d{6}$/, "Verification code must be 6 digits"),
});

export const resendCodeSchema = z.object({
  email: z.string().email("Invalid email address"),
  type: z.enum(["email", "phone"]),
});

export const verifyStatusSchema = z.object({
  email: z.string().email("Invalid email address"),
});