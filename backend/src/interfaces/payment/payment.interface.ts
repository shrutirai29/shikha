import { Document, Types } from "mongoose";

export interface IPayment extends Document {
  user: Types.ObjectId;

  order: Types.ObjectId;

  amount: number;

  currency: string;

  razorpayOrderId: string;

  razorpayPaymentId?: string;

  razorpaySignature?: string;

status:
  | "Pending"
  | "Authorized"
  | "Paid"
  | "Failed"
  | "Refunded";

  createdAt: Date;
  updatedAt: Date;
}