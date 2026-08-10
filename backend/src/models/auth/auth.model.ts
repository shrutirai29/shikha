import { Schema, model } from "mongoose";
import { IUser } from "../../interfaces/auth/auth.interface";

const userSchema = new Schema<IUser>(
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

    password: {
      type: String,
      required: true,
      minlength: 6,
    },

    role: {
      type: String,
      enum: ["admin", "customer", "delivery_agent"],
      default: "customer",
    },

    phone: {
      type: String,
      default: "",
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    phoneVerified: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    emailOtpCode: {
      type: String,
      default: null,
    },

    emailOtpExpires: {
      type: Date,
      default: null,
    },

    phoneOtpCode: {
      type: String,
      default: null,
    },

    phoneOtpExpires: {
      type: Date,
      default: null,
    },

    resetPasswordToken: {
      type: String,
      default: null,
    },

    resetPasswordExpires: {
      type: Date,
      default: null,
    },

    verificationToken: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export default model<IUser>("User", userSchema);