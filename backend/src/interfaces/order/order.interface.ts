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

export interface IOrder extends Document {
  user: Types.ObjectId | string;

  items: IOrderItem[];

  shippingAddress: IShippingAddress;

  paymentMethod: "COD" | "RAZORPAY";

  paymentStatus:
    | "Pending"
    | "Paid"
    | "Failed"
    | "Refunded";

  orderStatus:
    | "Pending"
    | "Processing"
    | "Shipped"
    | "Delivered"
    | "Cancelled";

  subtotal: number;

  discount: number;

  coupon?: Types.ObjectId | null;

  shippingCharge: number;

  tax: number;

  totalAmount: number;

  createdAt: Date;
  updatedAt: Date;
}
