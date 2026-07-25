import { Document, Types } from "mongoose";

export interface IAddress extends Document {
  user: Types.ObjectId;

  fullName: string;
  phone: string;

  addressLine1: string;
  addressLine2?: string;

  city: string;
  state: string;
  country: string;
  postalCode: string;

  isDefault: boolean;
  isActive: boolean;

  createdAt: Date;
  updatedAt: Date;
}
