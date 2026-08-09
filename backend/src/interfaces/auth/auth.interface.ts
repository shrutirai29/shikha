import { Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;

  role: "admin" | "customer";

  phone?: string;

  isVerified: boolean;
  isActive: boolean;

  phoneVerified: boolean;

  emailOtpCode?: string | null;
  emailOtpExpires?: Date | null;

  phoneOtpCode?: string | null;
  phoneOtpExpires?: Date | null;

  resetPasswordToken?: string | null;
  resetPasswordExpires?: Date | null;
  verificationToken?: string | null;

  createdAt: Date;
  updatedAt: Date;
}