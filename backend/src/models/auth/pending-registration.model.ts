import { Schema, model, Document } from "mongoose";

export interface IPendingRegistration extends Document {
  name: string;
  email: string;
  phone: string;
  password: string; // bcrypt hash
  otp: string; // 6-digit code, expires with the document
  otpExpiresAt: Date;
  otpAttempts: number;
  lastOtpSentAt: Date;
  createdAt: Date;
}

const pendingRegistrationSchema = new Schema<IPendingRegistration>({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone: { type: String, required: true, trim: true },
  password: { type: String, required: true },
  otp: { type: String, required: true },
  otpExpiresAt: { type: Date, required: true },
  otpAttempts: { type: Number, default: 0 },
  lastOtpSentAt: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
});

// Auto-expire unverified registrations after 30 minutes so stale OTPs
// (and their hashed passwords) are cleaned up automatically.
pendingRegistrationSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 30 * 60 }
);

pendingRegistrationSchema.index({ email: 1 });

const PendingRegistration = model<IPendingRegistration>(
  "PendingRegistration",
  pendingRegistrationSchema
);

export default PendingRegistration;
