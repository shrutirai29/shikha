import { Schema, model } from "mongoose";
import { IOrder } from "../../interfaces/order/order.interface";

const shippingAddressSchema = new Schema(
  {
    fullName: {
      type: String,
      required: true,
    },

    phone: {
      type: String,
      required: true,
    },

    addressLine1: {
      type: String,
      required: true,
    },

    addressLine2: {
      type: String,
      default: "",
    },

    city: {
      type: String,
      required: true,
    },

    state: {
      type: String,
      required: true,
    },

    country: {
      type: String,
      required: true,
    },

    postalCode: {
      type: String,
      required: true,
    },
  },
  {
    _id: false,
  }
);

const orderItemSchema = new Schema(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    name: {
      type: String,
      required: true,
    },

    image: {
      type: String,
      default: "",
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

const deliverySchema = new Schema(
  {
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    assignedAt: {
      type: Date,
      default: null,
    },

    attempts: {
      type: Number,
      default: 0,
    },

    lastAttemptAt: {
      type: Date,
      default: null,
    },

    lastAttemptNote: {
      type: String,
      default: "",
    },

    codCollected: {
      type: Boolean,
      default: false,
    },

    codCollectedAt: {
      type: Date,
      default: null,
    },

    deliveredAt: {
      type: Date,
      default: null,
    },

    otpHash: {
      type: String,
      default: null,
    },

    otpExpiresAt: {
      type: Date,
      default: null,
    },

    otpAttempts: {
      type: Number,
      default: 0,
    },

    otpDeliveredAt: {
      type: Date,
      default: null,
    },

    rtoReason: {
      type: String,
      default: "",
    },
  },
  {
    _id: false,
    // Never expose the OTP hash (or its timestamps) in API responses.
    toJSON: {
      transform: (_doc, ret: Record<string, unknown>) => {
        delete ret.otpHash;
        delete ret.otpExpiresAt;
        delete ret.otpAttempts;
        delete ret.otpDeliveredAt;
        return ret;
      },
    },
    toObject: {
      transform: (_doc, ret: Record<string, unknown>) => {
        delete ret.otpHash;
        delete ret.otpExpiresAt;
        delete ret.otpAttempts;
        delete ret.otpDeliveredAt;
        return ret;
      },
    },
  }
);

const orderSchema = new Schema<IOrder>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    items: {
      type: [orderItemSchema],
      required: true,
    },

    shippingAddress: {
      type: shippingAddressSchema,
      required: true,
    },

    paymentMethod: {
      type: String,
      enum: ["COD", "RAZORPAY"],
      default: "COD",
    },

    paymentStatus: {
      type: String,
      enum: [
        "Pending",
        "Paid",
        "Failed",
        "Refunded",
      ],
      default: "Pending",
    },

    orderStatus: {
      type: String,
      enum: [
        "Pending",
        "Processing",
        "Shipped",
        "OutForDelivery",
        "Delivered",
        "Cancelled",
        "RTO",
      ],
      default: "Pending",
    },

    delivery: {
      type: deliverySchema,
      default: () => ({}),
    },

    subtotal: {
      type: Number,
      required: true,
    },
    discount: {
  type: Number,
  default: 0,
},

coupon: {
  type: Schema.Types.ObjectId,
  ref: "Coupon",
  default: null,
},

    shippingCharge: {
      type: Number,
      default: 0,
    },

    tax: {
      type: Number,
      default: 0,
    },

    totalAmount: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

orderSchema.index({
  user: 1,
  createdAt: -1,
});

orderSchema.index({
  orderStatus: 1,
});

orderSchema.index({
  paymentStatus: 1,
});

orderSchema.index({
  "delivery.assignedTo": 1,
  orderStatus: 1,
});

orderSchema.index({
  paymentMethod: 1,
  "delivery.codCollected": 1,
});

export default model<IOrder>("Order", orderSchema);
