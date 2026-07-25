import { z } from "zod";

export const addressSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Full name is required")
    .max(80, "Full name cannot exceed 80 characters"),

  phone: z
    .string()
    .trim()
    .min(10, "Phone number must be at least 10 digits")
    .max(15, "Phone number is too long"),

  addressLine1: z
    .string()
    .trim()
    .min(5, "Address Line 1 is required")
    .max(150, "Address Line 1 cannot exceed 150 characters"),

  addressLine2: z
    .string()
    .trim()
    .max(150, "Address Line 2 cannot exceed 150 characters")
    .optional(),

  city: z
    .string()
    .trim()
    .min(2, "City is required")
    .max(80, "City cannot exceed 80 characters"),

  state: z
    .string()
    .trim()
    .min(2, "State is required")
    .max(80, "State cannot exceed 80 characters"),

  country: z
    .string()
    .trim()
    .min(2, "Country is required")
    .max(80, "Country cannot exceed 80 characters"),

  postalCode: z
    .string()
    .trim()
    .min(4, "Postal Code is required")
    .max(10, "Invalid Postal Code"),

  isDefault: z.boolean().optional(),
});

export const createAddressSchema = addressSchema;

export const updateAddressSchema = addressSchema.partial();
