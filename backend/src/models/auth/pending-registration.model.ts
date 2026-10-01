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

const pendingRegistrationSchema = new Schema<IPendingRegistration>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    password: { type: String, required: true },
    otp: { type: String, required: true },
    otpExpiresAt: { type: Date, required: true },
    otpAttempts: { type: Number, default: 0 },
    lastOtpSentAt: { type: Date, default: Date.now },
    createdAt: { type: Date, default: Date.now },
  },
  {
    toJSON: {
      transform: (_doc, ret: Record<string, any>) => {
        delete ret.password;
        delete ret.otp;
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      transform: (_doc, ret: Record<string, any>) => {
        delete ret.password;
        delete ret.otp;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Auto-expire unverified registrations after 30 minutes so stale OTPs
// (and their hashed passwords) are cleaned up automatically.
pendingRegistrationSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 30 * 60 }
);

const PendingRegistration = model<IPendingRegistration>(
  "PendingRegistration",
  pendingRegistrationSchema
);

export default PendingRegistration;
