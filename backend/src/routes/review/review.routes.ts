/**
 * @swagger
 * tags:
 *   name: Reviews
 *   description: Product reviews
 */

/**
 * @swagger
 * /reviews/{productId}:
 *   post:
 *     summary: Add a review for a purchased product
 *     tags: [Reviews]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { name: productId, in: path, required: true, schema: { type: string } }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [rating, comment]
 *             properties:
 *               rating: { type: integer, minimum: 1, maximum: 5 }
 *               comment: { type: string, minLength: 5, maxLength: 500 }
 *     responses:
 *       201:
 *         description: Review added
 *   get:
 *     summary: Get reviews for a product
 *     tags: [Reviews]
 *     parameters:
 *       - { name: productId, in: path, required: true, schema: { type: string } }
 *       - { name: page, in: query, schema: { type: integer } }
 *       - { name: limit, in: query, schema: { type: integer } }
 *     responses:
 *       200:
 *         description: Paginated reviews
 */

/**
 * @swagger
 * /reviews/{reviewId}:
 *   patch:
 *     summary: Update your own review
 *     tags: [Reviews]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { name: reviewId, in: path, required: true, schema: { type: string } }
 *     responses:
 *       200:
 *         description: Review updated
 *   delete:
 *     summary: Delete your own review
 *     tags: [Reviews]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { name: reviewId, in: path, required: true, schema: { type: string } }
 *     responses:
 *       200:
 *         description: Review deleted
 */

import { Router } from "express";

import {
  createReview,
  getReviews,
  editReview,
  removeReview,
} from "../../controllers/review/review.controller";

import { authenticate } from "../../middleware/auth.middleware";
import { validateObjectId } from "../../middleware/validateObjectId.middleware";

const router = Router();

/*
POST    /api/reviews/:productId
GET     /api/reviews/:productId
PATCH   /api/reviews/:reviewId
DELETE  /api/reviews/:reviewId
*/

router.post(
  "/:productId",
  authenticate,
  validateObjectId("productId"),
  createReview
);

router.get(
  "/:productId",
  validateObjectId("productId"),
  getReviews
);

router.patch(
  "/:reviewId",
  authenticate,
  validateObjectId("reviewId"),
  editReview
);

router.delete(
  "/:reviewId",
  authenticate,
  validateObjectId("reviewId"),
  removeReview
);

export default router;