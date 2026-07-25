import { DiscountType } from "../../interfaces/coupon/coupon.interface";

export interface CreateCouponDto {
  code: string;
  description: string;

  discountType: DiscountType;
  discountValue: number;

  minimumPurchase: number;
  maximumDiscount: number;

  usageLimit: number;

  expiresAt: Date;
}