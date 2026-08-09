import { Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;

  role: "admin" | "customer";

  phone?: string;

  isVerified: boolean;
  isActive: boolean;

  resetPasswordToken?: string | null;
  resetPasswordExpires?: Date | null;
  verificationToken?: string | null;

  createdAt: Date;
  updatedAt: Date;
}