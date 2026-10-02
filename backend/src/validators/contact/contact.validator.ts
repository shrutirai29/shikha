import { z } from "zod";

export const createContactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Please provide a valid email address"),
  phone: z.string().max(20).optional(),
  subject: z.string().min(2, "Subject must be at least 2 characters").max(150),
  message: z.string().min(5, "Message must be at least 5 characters").max(2000),
});

export const updateContactStatusSchema = z.object({
  status: z.enum(["New", "In Progress", "Resolved"]),
  notes: z.string().max(1000).optional(),
});
