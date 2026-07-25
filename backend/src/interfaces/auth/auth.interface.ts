import { Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;

  role: "admin" | "customer";

  phone?: string;

  isVerified: boolean;
  isActive: boolean;

  createdAt: Date;
  updatedAt: Date;
}