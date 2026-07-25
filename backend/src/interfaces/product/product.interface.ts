import { Document, Types } from "mongoose";

export interface IProduct extends Document {
  name: string;
  slug: string;
  description: string;

  price: number;
  discountPrice?: number;

  stock: number;

  images: string[];

  // 👇 Allow string while creating products
  category: Types.ObjectId | string;

  isFeatured: boolean;
  isActive: boolean;

  createdAt: Date;
  updatedAt: Date;

  averageRating: number;
totalReviews: number;
}