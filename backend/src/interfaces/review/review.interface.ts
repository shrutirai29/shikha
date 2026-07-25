import { Document, Types } from "mongoose";

export interface IReview extends Document {
  user: Types.ObjectId;
  product: Types.ObjectId;

  rating: number;
  comment: string;

  verifiedPurchase: boolean;
  isActive: boolean;

  createdAt: Date;
  updatedAt: Date;
}