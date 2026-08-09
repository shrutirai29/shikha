import Order from "../../models/order/order.model";
import Cart from "../../models/cart/cart.model";
import Product from "../../models/product/product.model";
import User from "../../models/auth/auth.model";

import { CreateOrderDto } from "../../dtos/order/create-order.dto";

import { NotFoundError } from "../../errors/NotFoundError";
import { ConflictError } from "../../errors/ConflictError";
import { ForbiddenError } from "../../errors/ForbiddenError";
import Coupon from "../../models/coupon/coupon.model";

export const createOrder = async (
  userId: string,
  data: CreateOrderDto
) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new NotFoundError("User not found");
  }

  // Purchasing requires a verified account: email always, phone when provided.
  if (!user.isVerified) {
    throw new ForbiddenError(
      "Please verify your email address before placing an order"
    );
  }

  if (user.phone && !user.phoneVerified) {
    throw new ForbiddenError(
      "Please verify your phone number before placing an order"
    );
  }

  const cart = await Cart.findOne({ user: userId });

  if (!cart || cart.items.length === 0) {
    throw new NotFoundError("Cart is empty");
  }

  const orderItems = [];
  let subtotal = 0;

  for (const item of cart.items) {
    const product = await Product.findById(item.product);

    if (!product || !product.isActive) {
      throw new NotFoundError(
        "One or more products no longer exist"
      );
    }

    if (product.stock < item.quantity) {
      throw new ConflictError(
        `${product.name} is out of stock`
      );
    }

    const price =
      (product.discountPrice ?? 0) > 0
        ? product.discountPrice!
        : product.price!;

    subtotal += price * item.quantity;

    orderItems.push({
      product: product._id,
      name: product.name,
      image:
        product.images.length > 0
          ? product.images[0]
          : "",
      quantity: item.quantity,
      price,
    });
  }

const discountedSubtotal =
  cart.finalAmount > 0
    ? cart.finalAmount
    : subtotal;

const shippingCharge =
  discountedSubtotal >= 500 ? 0 : 50;

const tax = Number(
  (discountedSubtotal * 0.18).toFixed(2)
);

const totalAmount =
  discountedSubtotal +
  shippingCharge +
  tax;

  const order = await Order.create({
    user: userId,
    items: orderItems,
    shippingAddress: data.shippingAddress,
    paymentMethod: data.paymentMethod,
    paymentStatus: "Pending",
    orderStatus: "Pending",
subtotal,

discount: cart.discount,

coupon: cart.coupon,

shippingCharge,

tax,

totalAmount,
  });

  // Reduce stock immediately for COD; Razorpay orders deduct on payment verify
  if (data.paymentMethod === "COD") {
    for (const item of cart.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: {
          stock: -item.quantity,
        },
      });
    }
  }

  if (cart.coupon && data.paymentMethod === "COD") {
  await Coupon.findByIdAndUpdate(cart.coupon, {
    $inc: {
      usedCount: 1,
    },
  });
}
  // Clear Cart (DB update)
  await Cart.findOneAndUpdate(
    { user: userId },
    {
$set: {
  items: [],
  totalAmount: 0,
  discount: 0,
  finalAmount: 0,
  coupon: null,
},
    },
    { new: true }
  );

  return await Order.findById(order._id)
    .populate("user", "name email")
    .populate({
      path: "items.product",
      populate: {
        path: "category",
        select: "name slug",
      },
    });
};

export const getMyOrders = async (
  userId: string,
  page = 1,
  limit = 10
) => {
  const total = await Order.countDocuments({
    user: userId,
  });

  const orders = await Order.find({ user: userId })
    .populate("user", "name email")
    .populate({
      path: "items.product",
      populate: {
        path: "category",
        select: "name slug",
      },
    })
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

export const getOrderById = async (
  userId: string,
  orderId: string
) => {
  const order = await Order.findById(orderId)
    .populate("user", "name email")
    .populate({
      path: "items.product",
      populate: {
        path: "category",
        select: "name slug",
      },
    });

  if (!order) {
    throw new NotFoundError("Order not found");
  }

  const ownerId =
    typeof order.user === "object" && "_id" in order.user
      ? order.user._id.toString()
      : order.user.toString();

  if (ownerId !== userId) {
    throw new ForbiddenError(
      "You are not authorized to access this order"
    );
  }

  return order;
};

export const getAllOrders = async (
  page = 1,
  limit = 10
) => {
  const total = await Order.countDocuments();

  const orders = await Order.find()
    .populate("user", "name email")
    .populate({
      path: "items.product",
      populate: {
        path: "category",
        select: "name slug",
      },
    })
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

type OrderStatus =
  | "Pending"
  | "Processing"
  | "Shipped"
  | "Delivered"
  | "Cancelled";

// Admins may move an order forward along the lifecycle and may skip
// intermediate steps (e.g. a COD order delivered on the spot can go
// straight Pending -> Delivered). Delivered and Cancelled are terminal.
const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  Pending: ["Processing", "Shipped", "Delivered", "Cancelled"],
  Processing: ["Shipped", "Delivered", "Cancelled"],
  Shipped: ["Delivered"],
  Delivered: [],
  Cancelled: [],
};

const restoreStockForOrder = async (order: any) => {
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
};

export const updateOrderStatus = async (
  orderId: string,
  status: OrderStatus
) => {
  const order = await Order.findById(orderId);

  if (!order) {
    throw new NotFoundError("Order not found");
  }

  if (order.orderStatus === status) {
    return order;
  }

  const allowed = VALID_TRANSITIONS[order.orderStatus] ?? [];

  if (!allowed.includes(status)) {
    throw new ConflictError(
      `Cannot change order status from ${order.orderStatus} to ${status}`
    );
  }

  const wasStockDeducted =
    order.paymentMethod === "COD" ||
    order.paymentStatus === "Paid";

  order.orderStatus = status;

  if (status === "Delivered") {
    order.paymentStatus = "Paid";
  }

  if (status === "Cancelled" && wasStockDeducted) {
    await restoreStockForOrder(order);
  }

  await order.save();

  return await Order.findById(orderId)
    .populate("user", "name email")
    .populate({
      path: "items.product",
      populate: {
        path: "category",
        select: "name slug",
      },
    });
};

export const cancelOrder = async (
  userId: string,
  orderId: string
) => {
  // Atomic: only the owner can cancel, only while Pending/Processing,
  // and never once the order has been paid.
  const order = await Order.findOneAndUpdate(
    {
      _id: orderId,
      user: userId,
      orderStatus: { $in: ["Pending", "Processing"] },
      paymentStatus: { $ne: "Paid" },
    },
    { orderStatus: "Cancelled" },
    { new: true }
  );

  if (!order) {
    throw new ConflictError(
      "Order cannot be cancelled at this stage"
    );
  }

  // COD orders deducted stock at creation; Razorpay orders only
  // deduct on successful payment, so nothing to restore there.
  if (order.paymentMethod === "COD") {
    await restoreStockForOrder(order);
  }

  return await Order.findById(order._id)
    .populate("user", "name email")
    .populate({
      path: "items.product",
      populate: {
        path: "category",
        select: "name slug",
      },
    });
};