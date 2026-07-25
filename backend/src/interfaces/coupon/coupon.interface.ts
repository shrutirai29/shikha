import { Document } from "mongoose";

export type DiscountType = "PERCENTAGE" | "FIXED";

export interface ICoupon extends Document {
  code: string;
  description: string;

  discountType: DiscountType;
  discountValue: number;

  minimumPurchase: number;
  maximumDiscount: number;

  usageLimit: number;
  usedCount: number;

  expiresAt: Date;

  isActive: boolean;

  createdAt: Date;
  updatedAt: Date;
}