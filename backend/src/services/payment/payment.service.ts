

import Payment from "../../models/payment/payment.model";
import Order from "../../models/order/order.model";
import Product from "../../models/product/product.model";
import Coupon from "../../models/coupon/coupon.model";

import getRazorpay from "../../config/razorpay";

import { CreatePaymentDto } from "../../dtos/payment/create-payment.dto";
import { VerifyPaymentDto } from "../../dtos/payment/verify-payment.dto";
import { RefundPaymentDto } from "../../dtos/payment/refund-payment.dto";

import { NotFoundError } from "../../errors/NotFoundError";
import { ConflictError } from "../../errors/ConflictError";
import { BadRequestError } from "../../errors/BadRequestError";
import {
  getOrderById,
  getPaymentByRazorpayOrderId,
  verifyPaymentSignature,
} from "./payment.utils";

const markOrderPaid = async (payment: any) => {
  const order = await Order.findById(payment.order);

  if (!order) {
    throw new NotFoundError(
      "Order not found"
    );
  }

  if (order.paymentStatus === "Paid") {
    return order;
  }

  order.paymentStatus = "Paid";

  await order.save();

  if (order.paymentMethod === "RAZORPAY") {
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity },
      });
    }

    if (order.coupon) {
      await Coupon.findByIdAndUpdate(order.coupon, {
        $inc: { usedCount: 1 },
      });
    }
  }

  return order;
};

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

  const razorpay = getRazorpay();

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
  data: VerifyPaymentDto,
  userId?: string
) => {
  const payment =
    await getPaymentByRazorpayOrderId(
      data.razorpayOrderId
    );

  if (userId && payment.user.toString() !== userId) {
    throw new ConflictError(
      "You are not authorized to verify this payment"
    );
  }

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
  await markOrderPaid(payment);

  return {
    message:
      "Payment verified successfully",

    payment,
  };
};

export const getPaymentById =
  async (
    paymentId: string,
    userId?: string,
    isAdmin = false
  ) => {
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

    if (
      userId &&
      !isAdmin &&
      payment.user._id.toString() !== userId
    ) {
      throw new ConflictError(
        "You are not authorized to access this payment"
      );
    }

    return payment;
  };

export const refundPayment =
  async (
    paymentId: string,
    data: RefundPaymentDto
  ) => {
    const payment =
      await Payment.findById(paymentId);

    if (!payment) {
      throw new NotFoundError(
        "Payment not found"
      );
    }

    if (payment.status !== "Paid") {
      throw new ConflictError(
        "Only paid payments can be refunded"
      );
    }

    if (!payment.razorpayPaymentId) {
      throw new ConflictError(
        "Razorpay payment ID is missing"
      );
    }

    const refundAmount =
      data.amount ?? payment.amount;

    if (refundAmount > payment.amount) {
      throw new BadRequestError(
        "Refund amount cannot exceed payment amount"
      );
    }

    const razorpay = getRazorpay();

    const refund =
      await razorpay.payments.refund(
        payment.razorpayPaymentId,
        {
          amount: Math.round(refundAmount * 100),
          notes: {
            reason: data.reason || "Refund requested",
          },
        }
      );

    payment.status = "Refunded";
    payment.refundId = refund.id;
    payment.refundAmount = refundAmount;
    payment.refundReason = data.reason || "";
    payment.refundedAt = new Date();

    await payment.save();

    await Order.findByIdAndUpdate(payment.order, {
      $set: {
        paymentStatus: "Refunded",
      },
    });

    return payment;
  };

export const handleRazorpayWebhook =
  async (payload: any) => {
    const event = payload.event as string;
    const paymentEntity =
      payload.payload?.payment?.entity;

    if (!paymentEntity) {
      return {
        received: true,
      };
    }

    const payment =
      await Payment.findOne({
        razorpayOrderId:
          paymentEntity.order_id,
      });

    if (!payment) {
      return {
        received: true,
      };
    }

    if (event === "payment.captured") {
      if (payment.status !== "Paid") {
        payment.status = "Paid";
        payment.razorpayPaymentId =
          paymentEntity.id;

        await payment.save();
        await markOrderPaid(payment);
      }
    }

    if (event === "payment.failed") {
      if (payment.status !== "Paid") {
        payment.status = "Failed";
        payment.razorpayPaymentId =
          paymentEntity.id;

        await payment.save();
      }
    }

    if (event === "refund.processed") {
      payment.status = "Refunded";
      await payment.save();
    }

    return {
      received: true,
    };
  };

export const getUserPayments =
  async (
    userId: string,
    page = 1,
    limit = 10
  ) => {
    const total = await Payment.countDocuments({
      user: userId,
    });

    const payments = await Payment.find({
      user: userId,
    })
      .populate("order")
      .sort({
        createdAt: -1,
      })
      .skip((page - 1) * limit)
      .limit(limit);

    return {
      payments,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  };

export const getAllPayments =
  async (
    page = 1,
    limit = 10
  ) => {
    const total = await Payment.countDocuments();

    const payments = await Payment.find()
      .populate(
        "user",
        "name email"
      )
      .populate("order")
      .sort({
        createdAt: -1,
      })
      .skip((page - 1) * limit)
      .limit(limit);

    return {
      payments,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
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
