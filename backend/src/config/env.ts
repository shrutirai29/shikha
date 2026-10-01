import dotenv from "dotenv";
import { z } from "zod";

// Load .env before any validation so import order never matters.
dotenv.config();

const envSchema = z
  .object({
    NODE_ENV: z
      .enum(["development", "production", "test"])
      .default("development"),
    PORT: z.coerce.number().default(5000),
    MONGODB_URI: z.string().min(1, "MONGODB_URI is required"),
    JWT_SECRET: z.string().min(8, "JWT_SECRET must be at least 8 characters"),
    JWT_REFRESH_SECRET: z
      .string()
      .min(8, "JWT_REFRESH_SECRET must be at least 8 characters"),
    CLIENT_URL: z.string().optional(),
    COOKIE_SECRET: z.string().optional(),
    ENABLE_SWAGGER: z.enum(["true", "false"]).optional().default("false"),
    CLOUDINARY_CLOUD_NAME: z.string().optional(),
    CLOUDINARY_API_KEY: z.string().optional(),
    CLOUDINARY_API_SECRET: z.string().optional(),
    RAZORPAY_KEY_ID: z.string().optional(),
    RAZORPAY_KEY_SECRET: z.string().optional(),
    RAZORPAY_WEBHOOK_SECRET: z.string().optional(),
    SMTP_HOST: z.string().optional(),
    SMTP_PORT: z.coerce.number().optional(),
    SMTP_USER: z.string().optional(),
    SMTP_PASS: z.string().optional(),
    EMAIL_FROM: z.string().optional(),
    EMAIL_API_URL: z.string().optional(),
    EMAIL_API_KEY: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.NODE_ENV === "production") {
      if (!data.CLIENT_URL) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "CLIENT_URL is required in production environment",
          path: ["CLIENT_URL"],
        });
      }

      const weakSecrets = new Set(["secret", "jwt_secret", "test-secret", "12345678", "password"]);
      if (weakSecrets.has(data.JWT_SECRET.toLowerCase()) || data.JWT_SECRET.length < 16) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "JWT_SECRET must be at least 16 characters and not a trivial default in production",
          path: ["JWT_SECRET"],
        });
      }
    }
  });

export type Env = z.infer<typeof envSchema>;

let cachedEnv: Env | null = null;

export const validateEnv = (): Env => {
  if (cachedEnv) {
    return cachedEnv;
  }

  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    console.error("Invalid environment configuration:");
    console.error(parsed.error.flatten().fieldErrors);
    process.exit(1);
  }

  cachedEnv = parsed.data;
  return cachedEnv;
};

export const env = (): Env => validateEnv();
