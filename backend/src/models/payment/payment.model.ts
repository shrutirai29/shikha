import { Schema, model } from "mongoose";
import { IPayment } from "../../interfaces/payment/payment.interface";

const paymentSchema = new Schema<IPayment>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    order: {
      type: Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    currency: {
      type: String,
      default: "INR",
    },

    razorpayOrderId: {
      type: String,
      required: true,
    },

    razorpayPaymentId: {
      type: String,
      default: "",
    },

    razorpaySignature: {
      type: String,
      default: "",
    },

    refundId: {
      type: String,
      default: "",
    },

    refundAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    refundReason: {
      type: String,
      default: "",
      trim: true,
    },

    refundedAt: {
      type: Date,
      default: null,
    },

    status: {
      type: String,
      enum: [
        "Pending",
        "Authorized",
        "Paid",
        "Failed",
        "Refunded",
      ],
      default: "Pending",
    },
  },
  {
    timestamps: true,
  }
);

paymentSchema.index({
  user: 1,
});

paymentSchema.index({
  order: 1,
});

paymentSchema.index({
  razorpayOrderId: 1,
});

export default model<IPayment>(
  "Payment",
  paymentSchema
);
