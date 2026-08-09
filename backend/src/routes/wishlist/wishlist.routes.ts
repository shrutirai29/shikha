/**
 * @swagger
 * tags:
 *   name: Wishlist
 *   description: Wishlist management
 */

/**
 * @swagger
 * /wishlist:
 *   get:
 *     summary: Get the current user's wishlist
 *     tags: [Wishlist]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Paginated wishlist products
 */

/**
 * @swagger
 * /wishlist/{productId}:
 *   post:
 *     summary: Add a product to the wishlist
 *     tags: [Wishlist]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { name: productId, in: path, required: true, schema: { type: string } }
 *     responses:
 *       200:
 *         description: Product added
 *   delete:
 *     summary: Remove a product from the wishlist
 *     tags: [Wishlist]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { name: productId, in: path, required: true, schema: { type: string } }
 *     responses:
 *       200:
 *         description: Product removed
 */

import { Router } from "express";

import * as wishlistController from "../../controllers/wishlist/wishlist.controller";

import { authenticate } from "../../middleware/auth.middleware";
import { validateObjectId } from "../../middleware/validateObjectId.middleware";

const router = Router();

router.post(
  "/:productId",
  authenticate,
  validateObjectId("productId"),
  wishlistController.addToWishlist
);

router.get(
  "/",
  authenticate,
  wishlistController.getWishlist
);

router.delete(
  "/:productId",
  authenticate,
  validateObjectId("productId"),
  wishlistController.removeFromWishlist
);

export default router;