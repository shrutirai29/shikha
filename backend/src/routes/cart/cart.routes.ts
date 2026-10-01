/**
 * @swagger
 * tags:
 *   name: Cart
 *   description: Shopping cart operations
 */

/**
 * @swagger
 * /cart:
 *   get:
 *     summary: Get the current user's cart
 *     tags: [Cart]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Cart with items and totals
 *   post:
 *     summary: Add a product to the cart
 *     tags: [Cart]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [productId, quantity]
 *             properties:
 *               productId: { type: string }
 *               quantity: { type: integer, minimum: 1 }
 *     responses:
 *       200:
 *         description: Updated cart
 *   delete:
 *     summary: Clear the cart
 *     tags: [Cart]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Cart cleared
 */

/**
 * @swagger
 * /cart/{productId}:
 *   patch:
 *     summary: Update the quantity of a cart item
 *     tags: [Cart]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { name: productId, in: path, required: true, schema: { type: string } }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [quantity]
 *             properties:
 *               quantity: { type: integer, minimum: 1 }
 *     responses:
 *       200:
 *         description: Updated cart
 *   delete:
 *     summary: Remove a product from the cart
 *     tags: [Cart]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { name: productId, in: path, required: true, schema: { type: string } }
 *     responses:
 *       200:
 *         description: Item removed
 */

import { Router } from "express";

import {
  getCart,
  addToCart,
  updateQuantity,
  removeItem,
  clearCart,
} from "../../controllers/cart/cart.controller";

import { authenticate } from "../../middleware/auth.middleware";
import { validateObjectId } from "../../middleware/validateObjectId.middleware";
import { validate } from "../../middleware/validate.middleware";
import {
  addToCartSchema,
  updateCartSchema,
} from "../../validators/cart/cart.validator";

const router = Router();

// All cart routes require login
router.use(authenticate);

router.get("/", getCart);

router.post("/", validate(addToCartSchema), addToCart);

router.patch(
  "/:productId",
  validateObjectId("productId"),
  validate(updateCartSchema),
  updateQuantity
);

router.delete(
  "/:productId",
  validateObjectId("productId"),
  removeItem
);

router.delete("/", clearCart);

export default router;