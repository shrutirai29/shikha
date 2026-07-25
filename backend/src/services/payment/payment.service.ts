

import Payment from "../../models/payment/payment.model";
import Order from "../../models/order/order.model";

import razorpay from "../../config/razorpay";

import { CreatePaymentDto } from "../../dtos/payment/create-payment.dto";
import { VerifyPaymentDto } from "../../dtos/payment/verify-payment.dto";

import { NotFoundError } from "../../errors/NotFoundError";
import { ConflictError } from "../../errors/ConflictError";
import {
  getOrderById,
  getPaymentByRazorpayOrderId,
  verifyPaymentSignature,
} from "./payment.utils";



export const createRazorpayOrder = async (
  userId: string,
  data: CreatePaymentDto
) => {
  const order = await getOrderById(data.orderId);

  if (order.user.toString() !== userId) {
    throw new ConflictError(
      "You are not authorized to access this order"
    );
  }

  if (order.paymentMethod !== "RAZORPAY") {
    throw new ConflictError(
      "Selected payment method is not Razorpay"
    );
  }

  if (order.paymentStatus === "Paid") {
    throw new ConflictError(
      "Order has already been paid"
    );
  }

  const existingPayment =
    await Payment.findOne({
      order: order._id,
      status: {
        $in: [
          "Pending",
          "Authorized",
          "Paid",
        ],
      },
    });

  if (existingPayment) {
    return {
      payment: existingPayment,

      key: process.env.RAZORPAY_KEY_ID,

      razorpayOrderId:
        existingPayment.razorpayOrderId,

      amount:
        Math.round(
          existingPayment.amount * 100
        ),

      currency:
        existingPayment.currency,
    };
  }

  const razorpayOrder =
    await razorpay.orders.create({
      amount: Math.round(
        order.totalAmount * 100
      ),

      currency: "INR",

      receipt: order._id.toString(),
    });

  const payment =
    await Payment.create({
      user: userId,

      order: order._id,

      amount: order.totalAmount,

      currency: "INR",

      razorpayOrderId:
        razorpayOrder.id,

      status: "Pending",
    });

  return {
    payment,

    key: process.env.RAZORPAY_KEY_ID,

    razorpayOrderId:
      razorpayOrder.id,

    amount: razorpayOrder.amount,

    currency:
      razorpayOrder.currency,
  };
};

export const verifyPayment = async (
  data: VerifyPaymentDto
) => {
  const payment =
    await getPaymentByRazorpayOrderId(
      data.razorpayOrderId
    );

  if (payment.status === "Paid") {
    throw new ConflictError(
      "Payment has already been verified"
    );
  }

const isValidSignature =
  verifyPaymentSignature(
    data.razorpayOrderId,
    data.razorpayPaymentId,
    data.razorpaySignature
  );

if (!isValidSignature) {
    payment.status = "Failed";
    payment.razorpayPaymentId =
      data.razorpayPaymentId;
    payment.razorpaySignature =
      data.razorpaySignature;

    await payment.save();

    throw new ConflictError(
      "Invalid payment signature"
    );
  }

  payment.status = "Paid";

  payment.razorpayPaymentId =
    data.razorpayPaymentId;

  payment.razorpaySignature =
    data.razorpaySignature;

  await payment.save();

  const order = await Order.findById(
    payment.order
  );

  if (!order) {
    throw new NotFoundError(
      "Order not found"
    );
  }

  order.paymentStatus = "Paid";

  await order.save();

  return {
    message:
      "Payment verified successfully",

    payment,
  };
};

export const getPaymentById =
  async (paymentId: string) => {
    const payment =
      await Payment.findById(paymentId)
        .populate(
          "user",
          "name email"
        )
        .populate("order");

    if (!payment) {
      throw new NotFoundError(
        "Payment not found"
      );
    }

    return payment;
  };

export const getUserPayments =
  async (userId: string) => {
    return await Payment.find({
      user: userId,
    })
      .populate("order")
      .sort({
        createdAt: -1,
      });
  };

export const getAllPayments =
  async () => {
    return await Payment.find()
      .populate(
        "user",
        "name email"
      )
      .populate("order")
      .sort({
        createdAt: -1,
      });
  };

export const markPaymentFailed =
  async (
    razorpayOrderId: string
  ) => {
    const payment =
      await getPaymentByRazorpayOrderId(
        razorpayOrderId
      );

    if (
      payment.status === "Paid"
    ) {
      throw new ConflictError(
        "Cannot mark a successful payment as failed"
      );
    }

    payment.status = "Failed";

    await payment.save();

    return payment;
  };