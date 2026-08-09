import Order from "../../models/order/order.model";
import Cart from "../../models/cart/cart.model";
import Product from "../../models/product/product.model";

import { CreateOrderDto } from "../../dtos/order/create-order.dto";

import { NotFoundError } from "../../errors/NotFoundError";
import { ConflictError } from "../../errors/ConflictError";
import Coupon from "../../models/coupon/coupon.model";

export const createOrder = async (
  userId: string,
  data: CreateOrderDto
) => {
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

  if (order.user.toString() !== userId) {
    throw new ConflictError(
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

export const updateOrderStatus = async (
  orderId: string,
  status:
    | "Pending"
    | "Processing"
    | "Shipped"
    | "Delivered"
    | "Cancelled"
) => {
  const order = await Order.findById(orderId);

  if (!order) {
    throw new NotFoundError("Order not found");
  }

  order.orderStatus = status;

  if (status === "Delivered") {
    order.paymentStatus = "Paid";
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