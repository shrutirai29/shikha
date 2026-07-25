import { Schema, model } from "mongoose";
import { ICart } from "../../interfaces/cart/cart.interface";

const cartItemSchema = new Schema(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    price: {
      type: Number,
      required: true,
    },
  },
  {
    _id: false,
  }
);

const cartSchema = new Schema<ICart>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    items: [cartItemSchema],

    totalAmount: {
      type: Number,
      default: 0,
    },
    coupon: {
  type: Schema.Types.ObjectId,
  ref: "Coupon",
  default: null,
},

discount: {
  type: Number,
  default: 0,
  min: 0,
},

finalAmount: {
  type: Number,
  default: 0,
  min: 0,
},
  },
  {
    timestamps: true,
  }
);

export default model<ICart>("Cart", cartSchema);