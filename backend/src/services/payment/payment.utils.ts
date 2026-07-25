import crypto from "crypto";

import Payment from "../../models/payment/payment.model";
import Order from "../../models/order/order.model";

import { NotFoundError } from "../../errors/NotFoundError";

export const getOrderById = async (
  orderId: string
) => {
  const order = await Order.findById(orderId);

  if (!order) {
    throw new NotFoundError("Order not found");
  }

  return order;
};

export const getPaymentByRazorpayOrderId =
  async (razorpayOrderId: string) => {
    const payment = await Payment.findOne({
      razorpayOrderId,
    });

    if (!payment) {
      throw new NotFoundError(
        "Payment not found"
      );
    }

    return payment;
  };

export const generatePaymentSignature =
  (
    razorpayOrderId: string,
    razorpayPaymentId: string
  ) => {
    return crypto
      .createHmac(
        "sha256",
        process.env.RAZORPAY_KEY_SECRET!
      )
      .update(
        `${razorpayOrderId}|${razorpayPaymentId}`
      )
      .digest("hex");
  };

export const verifyPaymentSignature =
  (
    razorpayOrderId: string,
    razorpayPaymentId: string,
    razorpaySignature: string
  ) => {
    const generatedSignature =
      generatePaymentSignature(
        razorpayOrderId,
        razorpayPaymentId
      );

    return (
      generatedSignature ===
      razorpaySignature
    );
  };

export const verifyWebhookSignature = (
  rawBody: Buffer,
  razorpaySignature: string
) => {
  const webhookSecret =
    process.env.RAZORPAY_WEBHOOK_SECRET;

  if (!webhookSecret) {
    return false;
  }

  const generatedSignature = crypto
    .createHmac("sha256", webhookSecret)
    .update(rawBody)
    .digest("hex");

  return generatedSignature === razorpaySignature;
};
