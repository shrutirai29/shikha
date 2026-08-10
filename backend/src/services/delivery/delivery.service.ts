import crypto from "crypto";

import Order from "../../models/order/order.model";
import User from "../../models/auth/auth.model";
import Product from "../../models/product/product.model";
import Coupon from "../../models/coupon/coupon.model";

import { NotFoundError } from "../../errors/NotFoundError";
import { ConflictError } from "../../errors/ConflictError";

import { sendDeliveryOtpEmail } from "../email/email.service";

const OTP_TTL_MS = 15 * 60 * 1000;
const MAX_OTP_ATTEMPTS = 3;
const RESEND_COOLDOWN_MS = 60 * 1000;

const TERMINAL = ["Delivered", "Cancelled", "RTO"];

const hashOtp = (code: string) =>
  crypto.createHash("sha256").update(code).digest("hex");

const generateOtp = () =>
  String(crypto.randomInt(100000, 999999));

const populateOrderQuery = (query: any) =>
  query
    .populate("user", "name email phone")
    .populate("delivery.assignedTo", "name email phone")
    .populate({
      path: "items.product",
      populate: {
        path: "category",
        select: "name slug",
      },
    });

const getAssignedOrder = async (agentId: string, orderId: string) => {
  const order = await Order.findOne({
    _id: orderId,
    "delivery.assignedTo": agentId,
  });

  if (!order) {
    throw new NotFoundError(
      "Order not found or not assigned to you"
    );
  }

  return order;
};

const issueOtp = async (order: any) => {
  const otp = generateOtp();

  order.delivery.otpHash = hashOtp(otp);
  order.delivery.otpExpiresAt = new Date(Date.now() + OTP_TTL_MS);
  order.delivery.otpAttempts = 0;
  order.delivery.otpDeliveredAt = new Date();

  await order.save();

  const customer = await User.findById(order.user);

  if (customer?.email) {
    await sendDeliveryOtpEmail(customer.email, otp, order._id.toString());
  }

  return otp;
};

/** Single assigned order for the logged-in delivery agent. */
export const getAgentOrder = async (
  agentId: string,
  orderId: string
) => {
  const order = await populateOrderQuery(
    Order.findOne({
      _id: orderId,
      "delivery.assignedTo": agentId,
    })
  );

  if (!order) {
    throw new NotFoundError(
      "Order not found or not assigned to you"
    );
  }

  return order;
};

/** Assigned orders for the logged-in delivery agent. */
export const getAgentOrders = async (
  agentId: string,
  page = 1,
  limit = 10,
  status?: string
) => {
  const filter: any = { "delivery.assignedTo": agentId };

  if (status && status !== "All") {
    filter.orderStatus = status;
  }

  const total = await Order.countDocuments(filter);

  const orders = await populateOrderQuery(
    Order.find(filter)
  )
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  return {
    orders,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/** Agent marks the order as picked up and out for delivery. Issues the OTP. */
export const markOutForDelivery = async (
  agentId: string,
  orderId: string
) => {
  const order = await getAssignedOrder(agentId, orderId);

  if (TERMINAL.includes(order.orderStatus)) {
    throw new ConflictError("Order is already final");
  }

  if (order.orderStatus === "OutForDelivery") {
    return await populateOrderQuery(Order.findById(orderId));
  }

  if (!["Shipped", "Processing"].includes(order.orderStatus)) {
    throw new ConflictError(
      `Cannot start delivery from ${order.orderStatus}`
    );
  }

  order.orderStatus = "OutForDelivery";

  await issueOtp(order);

  return await populateOrderQuery(Order.findById(orderId));
};

/** Agent requests a fresh OTP (cooldown-protected, for expired/consumed codes). */
export const regenerateOtp = async (
  agentId: string,
  orderId: string
) => {
  const order = await getAssignedOrder(agentId, orderId);

  if (order.orderStatus !== "OutForDelivery") {
    throw new ConflictError(
      "A new code can only be issued while the order is out for delivery"
    );
  }

  const last = order.delivery.otpDeliveredAt;

  if (last && Date.now() - new Date(last).getTime() < RESEND_COOLDOWN_MS) {
    throw new ConflictError(
      "Please wait a minute before requesting a new code"
    );
  }

  await issueOtp(order);

  return {
    message: "A new delivery code has been sent to the customer",
  };
};

/** Agent records a failed delivery attempt (order stays out for delivery). */
export const recordAttempt = async (
  agentId: string,
  orderId: string,
  note?: string,
  refused?: boolean
) => {
  const order = await getAssignedOrder(agentId, orderId);

  if (order.orderStatus !== "OutForDelivery") {
    throw new ConflictError(
      "Delivery is not in progress for this order"
    );
  }

  order.delivery.attempts = (order.delivery.attempts || 0) + 1;
  order.delivery.lastAttemptAt = new Date();
  order.delivery.lastAttemptNote =
    note ||
    (refused
      ? "Customer refused delivery"
      : "Delivery attempt failed — no one was available");

  await order.save();

  return await populateOrderQuery(Order.findById(orderId));
};

/**
 * Agent completes the delivery. Requires the OTP the customer received by
 * email — the agent can never mark an order delivered without it.
 */
export const completeDelivery = async (
  agentId: string,
  orderId: string,
  otp: string,
  codCollected?: boolean
) => {
  const order = await getAssignedOrder(agentId, orderId);

  if (order.orderStatus !== "OutForDelivery") {
    throw new ConflictError(
      "Order is not out for delivery"
    );
  }

  if (!order.delivery.otpHash || !order.delivery.otpExpiresAt) {
    throw new ConflictError(
      "No delivery code has been issued for this order"
    );
  }

  if (new Date(order.delivery.otpExpiresAt) < new Date()) {
    throw new ConflictError(
      "Delivery code has expired — request a new one"
    );
  }

  if (order.delivery.otpAttempts >= MAX_OTP_ATTEMPTS) {
    throw new ConflictError(
      "Too many incorrect attempts — request a new code"
    );
  }

  if (hashOtp(otp) !== order.delivery.otpHash) {
    order.delivery.otpAttempts = (order.delivery.otpAttempts || 0) + 1;
    await order.save();

    throw new ConflictError("Incorrect delivery code");
  }

  order.orderStatus = "Delivered";
  order.paymentStatus = "Paid";
  order.delivery.deliveredAt = new Date();

  if (order.paymentMethod === "COD") {
    const collected = codCollected !== false;

    order.delivery.codCollected = collected;
    order.delivery.codCollectedAt = collected ? new Date() : null;
  }

  // Consume the code so it can never be reused.
  order.delivery.otpHash = null;
  order.delivery.otpExpiresAt = null;

  await order.save();

  return await populateOrderQuery(Order.findById(orderId));
};

/** Agent marks the order return-to-origin (customer refused / undeliverable). */
export const markRto = async (
  agentId: string,
  orderId: string,
  note?: string
) => {
  const order = await getAssignedOrder(agentId, orderId);

  if (order.orderStatus !== "OutForDelivery") {
    throw new ConflictError(
      "Only orders out for delivery can be marked return-to-origin"
    );
  }

  order.orderStatus = "RTO";
  order.delivery.rtoReason = note || "Return to origin";

  await order.save();

  // Restore stock + coupon usage — the goods are coming back.
  if (order.paymentMethod === "COD" || order.paymentStatus === "Paid") {
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity },
      });
    }

    if (order.coupon) {
      await Coupon.updateOne(
        { _id: order.coupon, usedCount: { $gt: 0 } },
        { $inc: { usedCount: -1 } }
      );
    }
  }

  return await populateOrderQuery(Order.findById(orderId));
};
