import { Schema, model } from "mongoose";
import { IPendingRegistration } from "../../interfaces/auth/pending-registration.interface";

const pendingRegistrationSchema = new Schema<IPendingRegistration>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    passwordHash: {
      type: String,
      required: true,
    },

    phone: {
      type: String,
      required: true,
    },

    emailOtpCode: {
      type: String,
      default: null,
    },

    emailOtpExpires: {
      type: Date,
      default: null,
    },

    emailVerified: {
      type: Boolean,
      default: false,
    },

    phoneOtpCode: {
      type: String,
      default: null,
    },

    phoneOtpExpires: {
      type: Date,
      default: null,
    },

    phoneVerified: {
      type: Boolean,
      default: false,
    },

    expiresAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Auto-delete pending registrations that were never completed after 24 hours.
pendingRegistrationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default model<IPendingRegistration>(
  "PendingRegistration",
  pendingRegistrationSchema
);
