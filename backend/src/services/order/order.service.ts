import Order from "../../models/order/order.model";
import Cart from "../../models/cart/cart.model";
import Product from "../../models/product/product.model";
import User from "../../models/auth/auth.model";

import { CreateOrderDto } from "../../dtos/order/create-order.dto";

import { NotFoundError } from "../../errors/NotFoundError";
import { ConflictError } from "../../errors/ConflictError";
import { ForbiddenError } from "../../errors/ForbiddenError";
import { BadRequestError } from "../../errors/BadRequestError";
import { escapeRegex } from "../../utils/regex.util";
import Coupon from "../../models/coupon/coupon.model";
import {
  sendOrderConfirmationEmail,
  sendOrderStatusUpdateEmail,
} from "../email/email.service";

const MAX_ORDER_AMOUNT = 500000; // Spending control: Max ₹500,000 per order

const populateOrderQuery = (query: any) =>
  query
    .populate("user", "name email phone")
    .populate({
      path: "items.product",
      populate: {
        path: "category",
        select: "name slug",
      },
    });

export const createOrder = async (
  userId: string,
  data: CreateOrderDto
) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new NotFoundError("User not found");
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

  let discount = 0;
  let activeCouponId: any = null;

  if (cart.coupon) {
    const couponDoc = await Coupon.findById(cart.coupon);
    if (
      !couponDoc ||
      !couponDoc.isActive ||
      couponDoc.expiresAt < new Date() ||
      couponDoc.usedCount >= couponDoc.usageLimit ||
      subtotal < couponDoc.minimumPurchase
    ) {
      throw new ConflictError(
        "The applied coupon is expired, exhausted, or no longer valid for this order"
      );
    }

    if (couponDoc.discountType === "PERCENTAGE") {
      discount = (subtotal * couponDoc.discountValue) / 100;
      if (couponDoc.maximumDiscount > 0 && discount > couponDoc.maximumDiscount) {
        discount = couponDoc.maximumDiscount;
      }
    } else {
      discount = couponDoc.discountValue;
    }

    if (discount > subtotal) {
      discount = subtotal;
    }
    discount = Number(discount.toFixed(2));
    activeCouponId = couponDoc._id;
  }

  const discountedSubtotal = Number(Math.max(0, subtotal - discount).toFixed(2));

  const shippingCharge =
    discountedSubtotal >= 500 ? 0 : 50;

  const tax = Number(
    (discountedSubtotal * 0.18).toFixed(2)
  );

  const totalAmount = Number(
    (discountedSubtotal + shippingCharge + tax).toFixed(2)
  );

  if (totalAmount <= 0) {
    throw new BadRequestError("Invalid order total amount");
  }

  if (totalAmount > MAX_ORDER_AMOUNT) {
    throw new BadRequestError(
      `Order total exceeds maximum transaction limit of ₹${MAX_ORDER_AMOUNT.toLocaleString()}`
    );
  }

  const order = await Order.create({
    user: userId,
    items: orderItems,
    shippingAddress: data.shippingAddress,
    paymentMethod: data.paymentMethod,
    paymentStatus: "Pending",
    orderStatus: "Pending",
    subtotal,
    discount,
    coupon: activeCouponId,
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

  const populatedOrder = await populateOrderQuery(Order.findById(order._id));

  // Asynchronously dispatch order confirmation email
  if (user.email) {
    sendOrderConfirmationEmail(user.email, populatedOrder).catch((err) => {
      console.error("[order:email] failed to send confirmation:", err);
    });
  }

  return populatedOrder;
};

export const getMyOrders = async (
  userId: string,
  page = 1,
  limit = 10,
  status?: string
) => {
  const filter: any = { user: userId };

  if (status) {
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

export const getOrderById = async (
  userId: string,
  orderId: string,
  isAdmin = false
) => {
  const order = await populateOrderQuery(Order.findById(orderId));

  if (!order) {
    throw new NotFoundError("Order not found");
  }

  const ownerId =
    typeof order.user === "object" && "_id" in order.user
      ? order.user._id.toString()
      : order.user.toString();

  // Admins may inspect any order; customers only their own.
  if (!isAdmin && ownerId !== userId) {
    throw new ForbiddenError(
      "You are not authorized to access this order"
    );
  }

  return order;
};

interface OrderFilters {
  page?: number;
  limit?: number;
  status?: string;
  paymentStatus?: string;
  paymentMethod?: string;
  q?: string;
  from?: string;
  to?: string;
}

export const getAllOrders = async (filters: OrderFilters = {}) => {
  const {
    page = 1,
    limit = 10,
    status,
    paymentStatus,
    paymentMethod,
    q,
    from,
    to,
  } = filters;

  const filter: any = {};

  if (status) {
    filter.orderStatus = status;
  }

  if (paymentStatus) {
    filter.paymentStatus = paymentStatus;
  }

  if (paymentMethod) {
    filter.paymentMethod = paymentMethod;
  }

  if (from || to) {
    filter.createdAt = {};

    if (from) {
      const fromDate = new Date(from);

      if (!isNaN(fromDate.getTime())) {
        filter.createdAt.$gte = fromDate;
      }
    }

    if (to) {
      const toDate = new Date(to);

      if (!isNaN(toDate.getTime())) {
        filter.createdAt.$lte = toDate;
      }
    }
  }

  // Search by order id, or the customer's name/email.
  if (q) {
    const isObjectId = /^[a-fA-F0-9]{24}$/.test(q);
    const escapedQ = escapeRegex(q);

    const userMatches = await User.find({
      $or: [
        { name: { $regex: escapedQ, $options: "i" } },
        { email: { $regex: escapedQ, $options: "i" } },
      ],
    }).select("_id");

    const userIds = userMatches.map((u) => u._id);

    filter.$or = [
      ...(isObjectId ? [{ _id: q }] : []),
      { user: { $in: userIds } },
    ];
  }

  const total = await Order.countDocuments(filter);

  const orders = await populateOrderQuery(Order.find(filter))
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

export const updateOrderShipping = async (
  orderId: string,
  data: {
    provider?: string;
    trackingId?: string;
    trackingUrl?: string;
    shippedAt?: Date;
  }
) => {
  const order = await Order.findById(orderId);

  if (!order) {
    throw new NotFoundError("Order not found");
  }

  const existing = order.shipping ?? ({} as any);

  order.shipping = {
    provider: data.provider ?? existing.provider ?? "",
    trackingId: data.trackingId ?? existing.trackingId ?? "",
    trackingUrl: data.trackingUrl ?? existing.trackingUrl ?? "",
    shippedAt: data.shippedAt ?? existing.shippedAt ?? null,
  };

  await order.save();

  return await populateOrderQuery(Order.findById(orderId));
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

  // Delivered is the only valid payment confirmation for COD — the order is
  // never marked paid without a real delivery confirmation.
  if (status === "Delivered") {
    order.paymentStatus = "Paid";
  }

  if (status === "Cancelled" && wasStockDeducted) {
    await restoreStockForOrder(order);
    if (order.coupon) {
      await Coupon.findByIdAndUpdate(order.coupon, {
        $inc: { usedCount: -1 },
      });
    }
  }

  await order.save();

  const updatedOrder = await populateOrderQuery(Order.findById(orderId));

  // Asynchronously dispatch status update email if Shipped or Delivered
  if (updatedOrder?.user?.email && (status === "Shipped" || status === "Delivered")) {
    sendOrderStatusUpdateEmail(updatedOrder.user.email, updatedOrder, status).catch((err) => {
      console.error("[order:email] failed to send status update:", err);
    });
  }

  return updatedOrder;
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
    if (order.coupon) {
      await Coupon.findByIdAndUpdate(order.coupon, {
        $inc: { usedCount: -1 },
      });
    }
  }

  return await populateOrderQuery(Order.findById(order._id));
};

export const generateOrderInvoiceHtml = async (
  userId: string,
  orderId: string,
  isAdmin: boolean
): Promise<string> => {
  const query: any = { _id: orderId };
  if (!isAdmin) {
    query.user = userId;
  }

  const order = await populateOrderQuery(Order.findOne(query));

  if (!order) {
    throw new NotFoundError("Order not found or access denied");
  }

  const invoiceNo = `INV-${order._id.toString().slice(-8).toUpperCase()}`;
  const orderDate = new Date(order.createdAt).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const itemsRows = order.items
    .map(
      (item: any, idx: number) => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #E8DCD0; text-align: center; color: #806E66;">${idx + 1}</td>
        <td style="padding: 12px; border-bottom: 1px solid #E8DCD0; color: #3B2924; font-weight: 600;">
          ${item.name}
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #E8DCD0; text-align: center; color: #3B2924;">${item.quantity}</td>
        <td style="padding: 12px; border-bottom: 1px solid #E8DCD0; text-align: right; color: #3B2924;">₹${item.price.toLocaleString()}</td>
        <td style="padding: 12px; border-bottom: 1px solid #E8DCD0; text-align: right; color: #3B2924; font-weight: 600;">₹${(item.price * item.quantity).toLocaleString()}</td>
      </tr>
    `
    )
    .join("");

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Invoice - ${invoiceNo} - Knottiingale</title>
  <style>
    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; background: #fff !important; }
      .no-print { display: none !important; }
      .invoice-container { box-shadow: none !important; border: none !important; padding: 0 !important; max-width: 100% !important; }
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background: #FDFBF7;
      color: #3B2924;
      margin: 0;
      padding: 32px 16px;
    }
    .invoice-container {
      max-width: 800px;
      margin: 0 auto;
      background: #FFFFFF;
      border: 1px solid #E8DCD0;
      border-radius: 16px;
      padding: 40px;
      box-shadow: 0 4px 20px rgba(59, 41, 36, 0.05);
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #B85C4A;
      padding-bottom: 24px;
      margin-bottom: 28px;
    }
    .brand-title {
      font-size: 28px;
      font-weight: 800;
      color: #B85C4A;
      margin: 0;
      letter-spacing: -0.5px;
    }
    .brand-sub {
      font-size: 13px;
      color: #806E66;
      margin-top: 4px;
    }
    .invoice-meta {
      text-align: right;
    }
    .invoice-title {
      font-size: 22px;
      font-weight: 700;
      color: #3B2924;
      margin: 0 0 6px;
    }
    .grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
      margin-bottom: 32px;
    }
    .info-box {
      background: #FFF8F0;
      border: 1px solid #F0E4D8;
      border-radius: 12px;
      padding: 18px;
    }
    .info-box h4 {
      margin: 0 0 8px;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #806E66;
    }
    .info-box p {
      margin: 0;
      font-size: 14px;
      line-height: 1.6;
      color: #3B2924;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 28px;
    }
    th {
      background: #FFF8F0;
      padding: 12px;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #806E66;
      border-bottom: 1px solid #E8DCD0;
    }
    .summary-table {
      width: 320px;
      margin-left: auto;
      margin-bottom: 32px;
    }
    .summary-table td {
      padding: 6px 12px;
      font-size: 14px;
    }
    .grand-total {
      font-size: 18px !important;
      font-weight: 800;
      color: #B85C4A;
      border-top: 2px solid #E8DCD0;
      padding-top: 10px !important;
    }
    .badge {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 9999px;
      font-size: 12px;
      font-weight: 600;
    }
    .badge-paid { background: #E7F3EF; color: #2D6A4F; }
    .badge-pending { background: #FEF3E7; color: #B25E00; }
    .footer {
      border-top: 1px solid #E8DCD0;
      padding-top: 20px;
      text-align: center;
      font-size: 13px;
      color: #806E66;
    }
    .print-btn {
      background: #B85C4A;
      color: #fff;
      border: none;
      padding: 10px 20px;
      border-radius: 10px;
      font-weight: 600;
      cursor: pointer;
      font-size: 14px;
      margin-bottom: 20px;
    }
    .print-btn:hover { background: #914536; }
  </style>
</head>
<body>
  <div class="no-print" style="max-width: 800px; margin: 0 auto 16px; text-align: right;">
    <button class="print-btn" onclick="window.print()">🖨️ Print / Save as PDF</button>
  </div>

  <div class="invoice-container">
    <div class="header">
      <div>
        <h1 class="brand-title">Knottiingale</h1>
        <div class="brand-sub">Artisanal Handmade Crochet Treasures</div>
        <div style="font-size: 12px; color: #806E66; margin-top: 6px;">
          Founder & Artisan: Shikkha Rai<br/>
          Website: https://knottiingale.com<br/>
          Support: hello@knottiingale.com | +91 7985835558
        </div>
      </div>
      <div class="invoice-meta">
        <h2 class="invoice-title">TAX INVOICE</h2>
        <p style="margin: 0; font-size: 13px; color: #806E66;">Invoice No: <strong style="color: #3B2924;">${invoiceNo}</strong></p>
        <p style="margin: 4px 0 0; font-size: 13px; color: #806E66;">Date: <strong style="color: #3B2924;">${orderDate}</strong></p>
        <p style="margin: 6px 0 0;">
          <span class="badge ${order.paymentStatus === "Paid" ? "badge-paid" : "badge-pending"}">
            Payment: ${order.paymentStatus.toUpperCase()} (${order.paymentMethod})
          </span>
        </p>
      </div>
    </div>

    <div class="grid-2">
      <div class="info-box">
        <h4>Billed / Shipped To</h4>
        <p>
          <strong>${order.shippingAddress.fullName}</strong><br/>
          ${order.shippingAddress.addressLine1}${order.shippingAddress.addressLine2 ? ", " + order.shippingAddress.addressLine2 : ""}<br/>
          ${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.postalCode}<br/>
          ${order.shippingAddress.country}<br/>
          <strong>Phone:</strong> ${order.shippingAddress.phone}
        </p>
      </div>
      <div class="info-box">
        <h4>Order Summary</h4>
        <p>
          <strong>Order ID:</strong> #${order._id.toString().toUpperCase()}<br/>
          <strong>Order Status:</strong> ${order.orderStatus}<br/>
          <strong>Payment Mode:</strong> ${order.paymentMethod}<br/>
          ${order.trackingNumber ? `<strong>Tracking:</strong> ${order.trackingNumber} (${order.courierName || "Courier"})<br/>` : ""}
          ${order.paymentId ? `<strong>Transaction Ref:</strong> ${order.paymentId}<br/>` : ""}
        </p>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th style="width: 40px; text-align: center;">#</th>
          <th style="text-align: left;">Product Description</th>
          <th style="width: 80px; text-align: center;">Qty</th>
          <th style="width: 100px; text-align: right;">Unit Price</th>
          <th style="width: 110px; text-align: right;">Total</th>
        </tr>
      </thead>
      <tbody>
        ${itemsRows}
      </tbody>
    </table>

    <table class="summary-table">
      <tr>
        <td style="color: #806E66;">Subtotal</td>
        <td style="text-align: right; color: #3B2924; font-weight: 600;">₹${order.subtotal?.toLocaleString()}</td>
      </tr>
      ${
        order.discount > 0
          ? `<tr>
              <td style="color: #7A8B68;">Coupon Discount</td>
              <td style="text-align: right; color: #7A8B68; font-weight: 600;">-₹${order.discount.toLocaleString()}</td>
            </tr>`
          : ""
      }
      <tr>
        <td style="color: #806E66;">Shipping Charges</td>
        <td style="text-align: right; color: #3B2924;">${order.shippingCharge === 0 ? "FREE" : `₹${order.shippingCharge}`}</td>
      </tr>
      <tr>
        <td style="color: #806E66;">Applicable GST (18%)</td>
        <td style="text-align: right; color: #3B2924;">₹${order.tax?.toLocaleString()}</td>
      </tr>
      <tr>
        <td class="grand-total">Total Amount</td>
        <td class="grand-total" style="text-align: right;">₹${order.totalAmount?.toLocaleString()}</td>
      </tr>
    </table>

    <div class="footer">
      <p style="margin: 0 0 6px; font-weight: 600; color: #3B2924;">Thank you for shopping with Knottiingale! 🧶</p>
      <p style="margin: 0; font-size: 12px;">This is a computer-generated tax invoice and requires no physical signature.</p>
    </div>
  </div>
</body>
</html>
  `;
};
