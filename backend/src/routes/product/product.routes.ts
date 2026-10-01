/**
 * @swagger
 * tags:
 *   name: Products
 *   description: Product catalog management
 */

/**
 * @swagger
 * /products:
 *   get:
 *     summary: List products with pagination, filtering and sorting
 *     tags: [Products]
 *     parameters:
 *       - { name: page, in: query, schema: { type: integer }, description: Page number }
 *       - { name: limit, in: query, schema: { type: integer }, description: Items per page }
 *       - { name: search, in: query, schema: { type: string }, description: Search by name or description }
 *       - { name: category, in: query, schema: { type: string }, description: Category ID }
 *       - { name: minPrice, in: query, schema: { type: number } }
 *       - { name: maxPrice, in: query, schema: { type: number } }
 *       - { name: sort, in: query, schema: { type: string, enum: [createdAt, -createdAt, price, -price, name, -name, averageRating, -averageRating] } }
 *       - { name: isFeatured, in: query, schema: { type: boolean } }
 *     responses:
 *       200:
 *         description: Paginated product list
 */

/**
 * @swagger
 * /products/{id}:
 *   get:
 *     summary: Get a product by ID
 *     tags: [Products]
 *     parameters:
 *       - { name: id, in: path, required: true, schema: { type: string } }
 *     responses:
 *       200:
 *         description: Product details
 *       404:
 *         description: Product not found
 */

/**
 * @swagger
 * /products/slug/{slug}:
 *   get:
 *     summary: Get a product by slug
 *     tags: [Products]
 *     parameters:
 *       - { name: slug, in: path, required: true, schema: { type: string } }
 *     responses:
 *       200:
 *         description: Product details
 */

/**
 * @swagger
 * /products:
 *   post:
 *     summary: Create a product (admin)
 *     tags: [Products]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, description, price, stock, images, category]
 *             properties:
 *               name: { type: string }
 *               description: { type: string }
 *               price: { type: number }
 *               discountPrice: { type: number }
 *               stock: { type: integer }
 *               images: { type: array, items: { type: string } }
 *               category: { type: string }
 *               isFeatured: { type: boolean }
 *     responses:
 *       201:
 *         description: Product created
 */

/**
 * @swagger
 * /products/{id}:
 *   patch:
 *     summary: Update a product (admin)
 *     tags: [Products]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { name: id, in: path, required: true, schema: { type: string } }
 *     responses:
 *       200:
 *         description: Product updated
 *   delete:
 *     summary: Delete a product (admin) - first call deactivates it, second call permanently deletes it
 *     tags: [Products]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { name: id, in: path, required: true, schema: { type: string } }
 *     responses:
 *       200:
 *         description: Product deactivated or permanently deleted
 */

/**
 * @swagger
 * /products/{id}/images:
 *   post:
 *     summary: Upload product images (admin, multipart/form-data)
 *     tags: [Products]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { name: id, in: path, required: true, schema: { type: string } }
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               images: { type: array, items: { type: string, format: binary } }
 *     responses:
 *       200:
 *         description: Images uploaded
 *   delete:
 *     summary: Remove a product image by URL (admin)
 *     tags: [Products]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { name: id, in: path, required: true, schema: { type: string } }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [url]
 *             properties:
 *               url: { type: string }
 *     responses:
 *       200:
 *         description: Image removed
 */

import { Router } from "express";

import {
  create,
  getAll,
  getAllAdmin,
  getBySlug,
  getOne,
  update,
  remove,
  uploadProductImages,
  deleteProductImage,
} from "../../controllers/product/product.controller";

import { uploadImages } from "../../middleware/upload.middleware";
import { uploadRateLimiter } from "../../middleware/rateLimit.middleware";

import { authenticate } from "../../middleware/auth.middleware";
import { authorize } from "../../middleware/authorize.middleware";
import { validateObjectId } from "../../middleware/validateObjectId.middleware";
import { validate } from "../../middleware/validate.middleware";
import {
  createProductSchema,
  updateProductSchema,
} from "../../validators/product/product.validator";

const router = Router();

// =======================
// Public Routes
// =======================

router.get("/", getAll);

router.get("/slug/:slug", getBySlug);

// =======================
// Admin Routes
// =======================

// Admin-only list that includes soft-deleted products (registered before :id)
router.get(
  "/admin/all",
  authenticate,
  authorize("admin"),
  getAllAdmin
);

router.get("/:id", validateObjectId("id"), getOne);

router.post(
  "/",
  authenticate,
  authorize("admin"),
  validate(createProductSchema),
  create
);

router.patch(
  "/:id",
  authenticate,
  authorize("admin"),
  validateObjectId("id"),
  validate(updateProductSchema),
  update
);

router.delete(
  "/:id",
  authenticate,
  authorize("admin"),
  validateObjectId("id"),
  remove
);

router.post(
  "/:id/images",
  authenticate,
  authorize("admin"),
  validateObjectId("id"),
  uploadRateLimiter,
  uploadImages.array("images", 5),
  uploadProductImages
);

router.delete(
  "/:id/images",
  authenticate,
  authorize("admin"),
  validateObjectId("id"),
  deleteProductImage
);

export default router;
