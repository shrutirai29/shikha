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
  authorize("admin"),
  validate(createCouponSchema),
  couponController.createCoupon
);

router.get(
  "/",
  authenticate,
  authorize("admin"),
  couponController.getAllCoupons
);

router.get(
  "/:couponId",
  authenticate,
  authorize("admin"),
  couponController.getCouponById
);

router.patch(
  "/:couponId",
  authenticate,
  authorize("admin"),
  validate(updateCouponSchema),
  couponController.updateCoupon
);

router.delete(
  "/:couponId",
  authenticate,
  authorize("admin"),
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