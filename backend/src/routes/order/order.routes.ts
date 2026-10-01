/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Order management
 */

/**
 * @swagger
 * /orders:
 *   post:
 *     summary: Create an order from the current cart
 *     tags: [Orders]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [shippingAddress, paymentMethod]
 *             properties:
 *               shippingAddress:
 *                 type: object
 *                 required: [fullName, phone, addressLine1, city, state, country, postalCode]
 *                 properties:
 *                   fullName: { type: string }
 *                   phone: { type: string }
 *                   addressLine1: { type: string }
 *                   addressLine2: { type: string }
 *                   city: { type: string }
 *                   state: { type: string }
 *                   country: { type: string }
 *                   postalCode: { type: string }
 *               paymentMethod: { type: string, enum: [COD, RAZORPAY] }
 *     responses:
 *       201:
 *         description: Order created
 *   get:
 *     summary: Get the current user's orders
 *     tags: [Orders]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { name: page, in: query, schema: { type: integer } }
 *       - { name: limit, in: query, schema: { type: integer } }
 *     responses:
 *       200:
 *         description: Paginated orders
 */

/**
 * @swagger
 * /orders/admin/all:
 *   get:
 *     summary: Get all orders (admin)
 *     tags: [Orders]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Paginated orders
 */

/**
 * @swagger
 * /orders/admin/{id}/status:
 *   patch:
 *     summary: Update order status (admin)
 *     tags: [Orders]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { name: id, in: path, required: true, schema: { type: string } }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status: { type: string, enum: [Pending, Processing, Shipped, Delivered, Cancelled] }
 *     responses:
 *       200:
 *         description: Order status updated
 */

/**
 * @swagger
 * /orders/{id}:
 *   get:
 *     summary: Get an order by ID (owner or admin)
 *     tags: [Orders]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { name: id, in: path, required: true, schema: { type: string } }
 *     responses:
 *       200:
 *         description: Order details
 */

import { Router } from "express";

import {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  updateShipping,
  cancelOrder,
} from "../../controllers/order/order.controller";

import { authenticate } from "../../middleware/auth.middleware";
import { authorize } from "../../middleware/authorize.middleware";
import { validateObjectId } from "../../middleware/validateObjectId.middleware";
import { validate } from "../../middleware/validate.middleware";
import { orderRateLimiter } from "../../middleware/rateLimit.middleware";
import {
  createOrderSchema,
  updateOrderStatusSchema,
  updateShippingSchema,
} from "../../validators/order/order.validator";

const router = Router();

// All order routes require login
router.use(authenticate);

// ---------------- Customer ----------------

router.post(
  "/",
  orderRateLimiter,
  validate(createOrderSchema),
  createOrder
);

router.get("/", getMyOrders);

// Cancel own order while Pending/Processing and unpaid
router.post(
  "/:id/cancel",
  validateObjectId("id"),
  cancelOrder
);

// ---------------- Admin ----------------

router.get(
  "/admin/all",
  authorize("admin"),
  getAllOrders
);

router.patch(
  "/admin/:id/status",
  authorize("admin"),
  validateObjectId("id"),
  validate(updateOrderStatusSchema),
  updateOrderStatus
);

router.patch(
  "/admin/:id/shipping",
  authorize("admin"),
  validateObjectId("id"),
  validate(updateShippingSchema),
  updateShipping
);

// Keep this LAST
router.get("/:id", validateObjectId("id"), getOrderById);

export default router;