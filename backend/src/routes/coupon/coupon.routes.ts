/**
 * @swagger
 * tags:
 *   name: Coupons
 *   description: Coupon management and application
 */

/**
 * @swagger
 * /coupons:
 *   post:
 *     summary: Create a coupon (admin)
 *     tags: [Coupons]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       201:
 *         description: Coupon created
 *   get:
 *     summary: Get all coupons (admin)
 *     tags: [Coupons]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Paginated coupons
 */

/**
 * @swagger
 * /coupons/{couponId}:
 *   get:
 *     summary: Get a coupon by ID (admin)
 *     tags: [Coupons]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { name: couponId, in: path, required: true, schema: { type: string } }
 *     responses:
 *       200:
 *         description: Coupon details
 *   patch:
 *     summary: Update a coupon (admin)
 *     tags: [Coupons]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { name: couponId, in: path, required: true, schema: { type: string } }
 *     responses:
 *       200:
 *         description: Coupon updated
 *   delete:
 *     summary: Delete a coupon (admin)
 *     tags: [Coupons]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { name: couponId, in: path, required: true, schema: { type: string } }
 *     responses:
 *       200:
 *         description: Coupon deleted
 */

/**
 * @swagger
 * /coupons/apply:
 *   post:
 *     summary: Apply a coupon to the current cart
 *     tags: [Coupons]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [code]
 *             properties:
 *               code: { type: string }
 *     responses:
 *       200:
 *         description: Coupon applied to cart
 */

/**
 * @swagger
 * /coupons/remove:
 *   delete:
 *     summary: Remove the applied coupon from the cart
 *     tags: [Coupons]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Coupon removed
 */

import { Router } from "express";

import * as couponController from "../../controllers/coupon/coupon.controller";

import { authenticate } from "../../middleware/auth.middleware";
import { authorize } from "../../middleware/authorize.middleware";
import { validate } from "../../middleware/validate.middleware";
import { validateObjectId } from "../../middleware/validateObjectId.middleware";
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
  validateObjectId("couponId"),
  couponController.getCouponById
);

router.patch(
  "/:couponId",
  authenticate,
  authorize("admin"),
  validateObjectId("couponId"),
  validate(updateCouponSchema),
  couponController.updateCoupon
);

router.delete(
  "/:couponId",
  authenticate,
  authorize("admin"),
  validateObjectId("couponId"),
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