import { Router } from "express";

import * as couponController from "../../controllers/coupon/coupon.controller";

import { authenticate } from "../../middleware/auth.middleware";
import { authorize } from "../../middleware/authorize.middleware";
import { validate } from "../../middleware/validate.middleware";
import {
  createCouponSchema,
  updateCouponSchema,
  applyCouponSchema,
} from "../../validators/coupon/coupon.validator";

const router = Router();

/* ---------------- Admin ---------------- */

router.post(
  "/",
  authenticate,
  authorize("ADMIN"),
  validate(createCouponSchema),
  couponController.createCoupon
);

router.get(
  "/",
  authenticate,
  authorize("ADMIN"),
  couponController.getAllCoupons
);

router.get(
  "/:couponId",
  authenticate,
  authorize("ADMIN"),
  couponController.getCouponById
);

router.patch(
  "/:couponId",
  authenticate,
  authorize("ADMIN"),
  validate(updateCouponSchema),
  couponController.updateCoupon
);

router.delete(
  "/:couponId",
  authenticate,
  authorize("ADMIN"),
  couponController.deleteCoupon
);

/* ---------------- User ---------------- */

router.post(
  "/apply",
  authenticate,
  validate(applyCouponSchema),
  couponController.applyCoupon
);

router.delete(
  "/remove",
  authenticate,
  couponController.removeCoupon
);

export default router;