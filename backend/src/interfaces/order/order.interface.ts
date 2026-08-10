import { Document, Types } from "mongoose";

export interface IShippingAddress {
  fullName: string;
  phone: string;

  addressLine1: string;
  addressLine2?: string;

  city: string;
  state: string;
  country: string;

  postalCode: string;
}

export interface IOrderItem {
  product: Types.ObjectId | string;

  name: string;
  image: string;

  quantity: number;
  price: number;
}

export type OrderStatus =
  | "Pending"
  | "Processing"
  | "Shipped"
  | "OutForDelivery"
  | "Delivered"
  | "Cancelled"
  | "RTO";

export interface IDelivery {
  /** Delivery agent assigned to this order. */
  assignedTo?: Types.ObjectId | string | null;
  assignedAt?: Date | null;

  /** Number of physical delivery attempts made. */
  attempts: number;
  lastAttemptAt?: Date | null;
  lastAttemptNote?: string;

  /** COD collection tracking. */
  codCollected: boolean;
  codCollectedAt?: Date | null;
  deliveredAt?: Date | null;

  /** Delivery-confirmation OTP (stored hashed, never plain text). */
  otpHash?: string | null;
  otpExpiresAt?: Date | null;
  otpAttempts: number;
  otpDeliveredAt?: Date | null;

  rtoReason?: string;
}

export interface IOrder extends Document {
  user: Types.ObjectId | string;

  items: IOrderItem[];

  shippingAddress: IShippingAddress;

  paymentMethod: "COD" | "RAZORPAY";

  paymentStatus: "Pending" | "Paid" | "Failed" | "Refunded";

  orderStatus: OrderStatus;

  delivery: IDelivery;

  subtotal: number;

  discount: number;

  coupon?: Types.ObjectId | null;

  shippingCharge: number;

  tax: number;

  totalAmount: number;

  createdAt: Date;
  updatedAt: Date;
}
