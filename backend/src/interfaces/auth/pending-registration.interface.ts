import { Document } from "mongoose";

/**
 * A registration that has started (email + password + phone captured) but is
 * NOT yet an account. It holds the OTP codes needed to verify the email and
 * phone; the real User document is only created once both channels verify.
 */
export interface IPendingRegistration extends Document {
  name: string;
  email: string;
  passwordHash: string;
  phone: string;

  emailOtpCode?: string | null;
  emailOtpExpires?: Date | null;
  emailVerified: boolean;

  phoneOtpCode?: string | null;
  phoneOtpExpires?: Date | null;
  phoneVerified: boolean;

  /** Hard expiry (24h) — the pending registration is deleted by TTL index. */
  expiresAt: Date;

  createdAt: Date;
  updatedAt: Date;
}
