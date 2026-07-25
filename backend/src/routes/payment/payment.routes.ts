import { Router } from "express";

import * as paymentController from "../../controllers/payment/payment.controller";

import { authenticate } from "../../middleware/auth.middleware";
import { authorize } from "../../middleware/authorize.middleware";
import { validate } from "../../middleware/validate.middleware";

import {
  createPaymentSchema,
  verifyPaymentSchema,
} from "../../validators/payment/payment.validator";

const router = Router();

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
  paymentController.getPaymentById
);

/* ---------------- Admin ---------------- */

router.get(
  "/",
  authenticate,
  authorize("ADMIN"),
  paymentController.getAllPayments
);

router.patch(
  "/:razorpayOrderId/fail",
  authenticate,
  authorize("ADMIN"),
  paymentController.markPaymentFailed
);

export default router;