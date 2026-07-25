import { Schema, model } from "mongoose";
import { IProduct } from "../../interfaces/product/product.interface";

const productSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    discountPrice: {
      type: Number,
      default: 0,
      min: 0,
    },

    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    images: [
      {
        type: String,
      },
    ],

    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },

    isFeatured: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
},

totalReviews: {
    type: Number,
    default: 0,
},
  },
);

export default model<IProduct>("Product", productSchema);