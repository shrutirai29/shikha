/**
 * @swagger
 * tags:
 *   name: Categories
 *   description: Product categories
 */

/**
 * @swagger
 * /categories:
 *   get:
 *     summary: List categories with pagination and search
 *     tags: [Categories]
 *     parameters:
 *       - { name: page, in: query, schema: { type: integer } }
 *       - { name: limit, in: query, schema: { type: integer } }
 *       - { name: search, in: query, schema: { type: string } }
 *       - { name: sort, in: query, schema: { type: string, enum: [createdAt, -createdAt, name, -name] } }
 *     responses:
 *       200:
 *         description: Paginated category list
 *   post:
 *     summary: Create a category (admin)
 *     tags: [Categories]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       201:
 *         description: Category created
 */

/**
 * @swagger
 * /categories/{id}:
 *   get:
 *     summary: Get a category by ID
 *     tags: [Categories]
 *     parameters:
 *       - { name: id, in: path, required: true, schema: { type: string } }
 *     responses:
 *       200:
 *         description: Category details
 *   patch:
 *     summary: Update a category (admin)
 *     tags: [Categories]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { name: id, in: path, required: true, schema: { type: string } }
 *     responses:
 *       200:
 *         description: Category updated
 *   delete:
 *     summary: Soft-delete a category (admin)
 *     tags: [Categories]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { name: id, in: path, required: true, schema: { type: string } }
 *     responses:
 *       200:
 *         description: Category deleted
 */

/**
 * @swagger
 * /categories/slug/{slug}:
 *   get:
 *     summary: Get a category by slug
 *     tags: [Categories]
 *     parameters:
 *       - { name: slug, in: path, required: true, schema: { type: string } }
 *     responses:
 *       200:
 *         description: Category details
 */

/**
 * @swagger
 * /categories/{id}/image:
 *   post:
 *     summary: Upload a category image (admin, multipart/form-data)
 *     tags: [Categories]
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
 *               image: { type: string, format: binary }
 *     responses:
 *       200:
 *         description: Category image updated
 */

import { Router } from "express";

import {
  create,
  getAll,
  getOne,
  getBySlug,
  update,
  remove,
  uploadCategoryImage,
} from "../../controllers/category/category.controller";

import { uploadImages } from "../../middleware/upload.middleware";
import { uploadRateLimiter } from "../../middleware/rateLimit.middleware";

import { authenticate } from "../../middleware/auth.middleware";
import { authorize } from "../../middleware/authorize.middleware";
import { validateObjectId } from "../../middleware/validateObjectId.middleware";

const router = Router();

// =======================
// Public Routes
// =======================

router.get("/", getAll);

router.get("/slug/:slug", getBySlug);

router.get("/:id", validateObjectId("id"), getOne);

// =======================
// Admin Routes
// =======================

router.post(
  "/",
  authenticate,
  authorize("admin"),
  create
);

router.patch(
  "/:id",
  authenticate,
  authorize("admin"),
  validateObjectId("id"),
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
  "/:id/image",
  authenticate,
  authorize("admin"),
  validateObjectId("id"),
  uploadRateLimiter,
  uploadImages.single("image"),
  uploadCategoryImage
);

export default router;