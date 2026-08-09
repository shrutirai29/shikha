/**
 * @swagger
 * tags:
 *   name: Payments
 *   description: Razorpay payments, verification, webhooks and refunds
 */

/**
 * @swagger
 * /payments/webhook:
 *   post:
 *     summary: Razorpay webhook endpoint
 *     tags: [Payments]
 *     responses:
 *       200:
 *         description: Webhook acknowledged
 */

/**
 * @swagger
 * /payments/create-order:
 *   post:
 *     summary: Create a Razorpay order for a pending order
 *     tags: [Payments]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [orderId]
 *             properties:
 *               orderId: { type: string }
 *     responses:
 *       201:
 *         description: Razorpay order created
 */

/**
 * @swagger
 * /payments/verify:
 *   post:
 *     summary: Verify a Razorpay payment signature
 *     tags: [Payments]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [razorpayOrderId, razorpayPaymentId, razorpaySignature]
 *             properties:
 *               razorpayOrderId: { type: string }
 *               razorpayPaymentId: { type: string }
 *               razorpaySignature: { type: string }
 *     responses:
 *       200:
 *         description: Payment verified
 */

/**
 * @swagger
 * /payments/me:
 *   get:
 *     summary: Get the current user's payments
 *     tags: [Payments]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Paginated payments
 */

/**
 * @swagger
 * /payments/{paymentId}:
 *   get:
 *     summary: Get a payment by ID
 *     tags: [Payments]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { name: paymentId, in: path, required: true, schema: { type: string } }
 *     responses:
 *       200:
 *         description: Payment details
 */

/**
 * @swagger
 * /payments:
 *   get:
 *     summary: Get all payments (admin)
 *     tags: [Payments]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Paginated payments
 */

/**
 * @swagger
 * /payments/{paymentId}/refund:
 *   post:
 *     summary: Refund a paid payment (admin)
 *     tags: [Payments]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { name: paymentId, in: path, required: true, schema: { type: string } }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount: { type: number }
 *               reason: { type: string }
 *     responses:
 *       200:
 *         description: Payment refunded
 */

/**
 * @swagger
 * /payments/{razorpayOrderId}/fail:
 *   patch:
 *     summary: Mark a payment as failed (admin)
 *     tags: [Payments]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { name: razorpayOrderId, in: path, required: true, schema: { type: string } }
 *     responses:
 *       200:
 *         description: Payment marked failed
 */

import { Router } from "express";

import * as paymentController from "../../controllers/payment/payment.controller";

import { authenticate } from "../../middleware/auth.middleware";
import { authorize } from "../../middleware/authorize.middleware";
import { validate } from "../../middleware/validate.middleware";
import { validateObjectId } from "../../middleware/validateObjectId.middleware";

import {
  createPaymentSchema,
  refundPaymentSchema,
  verifyPaymentSchema,
} from "../../validators/payment/payment.validator";

const router = Router();

router.post(
  "/webhook",
  paymentController.handleWebhook
);

/* ---------------- User ---------------- */

router.post(
  "/create-order",
  authenticate,
  validate(createPaymentSchema),
  paymentController.createRazorpayOrder
);

router.post(
  "/verify",
  authenticate,
  validate(verifyPaymentSchema),
  paymentController.verifyPayment
);

router.get(
  "/me",
  authenticate,
  paymentController.getMyPayments
);

router.get(
  "/:paymentId",
  authenticate,
  validateObjectId("paymentId"),
  paymentController.getPaymentById
);

/* ---------------- Admin ---------------- */

router.get(
  "/",
  authenticate,
  authorize("admin"),
  paymentController.getAllPayments
);

router.patch(
  "/:razorpayOrderId/fail",
  authenticate,
  authorize("admin"),
  paymentController.markPaymentFailed
);

router.post(
  "/:paymentId/refund",
  authenticate,
  authorize("admin"),
  validateObjectId("paymentId"),
  validate(refundPaymentSchema),
  paymentController.refundPayment
);

export default router;
