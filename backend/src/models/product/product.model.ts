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
  {
    timestamps: true,
  }
);

// Search optimization
productSchema.index({
  name: "text",
  description: "text",
});

// Catalog listing/filtering
productSchema.index({
  category: 1,
  isActive: 1,
});

productSchema.index({
  price: 1,
});

productSchema.index({
  isActive: 1,
  isFeatured: 1,
});

export default model<IProduct>("Product", productSchema);