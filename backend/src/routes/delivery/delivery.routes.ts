/**
 * @swagger
 * tags:
 *   name: Delivery
 *   description: Delivery agent operations (role: delivery_agent only)
 */

import { Router } from "express";

import {
  getMyDeliveryOrders,
  startDelivery,
  resendDeliveryOtp,
  recordDeliveryAttempt,
  completeDelivery,
  returnToOrigin,
} from "../../controllers/delivery/delivery.controller";

import { authenticate } from "../../middleware/auth.middleware";
import { authorize } from "../../middleware/authorize.middleware";
import { validateObjectId } from "../../middleware/validateObjectId.middleware";

const router = Router();

// Delivery agents only — never admins, never customers.
router.use(authenticate, authorize("delivery_agent"));

router.get("/orders", getMyDeliveryOrders);

router.post(
  "/orders/:id/out-for-delivery",
  validateObjectId("id"),
  startDelivery
);

router.post(
  "/orders/:id/otp",
  validateObjectId("id"),
  resendDeliveryOtp
);

router.post(
  "/orders/:id/attempt",
  validateObjectId("id"),
  recordDeliveryAttempt
);

router.post(
  "/orders/:id/complete",
  validateObjectId("id"),
  completeDelivery
);

router.post(
  "/orders/:id/rto",
  validateObjectId("id"),
  returnToOrigin
);

export default router;
