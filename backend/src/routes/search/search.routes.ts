/**
 * @swagger
 * tags:
 *   name: Search
 *   description: Product search
 */

/**
 * @swagger
 * /search/products:
 *   get:
 *     summary: Search products with filters, sorting and pagination
 *     tags: [Search]
 *     parameters:
 *       - { name: q, in: query, schema: { type: string }, description: Search query }
 *       - { name: page, in: query, schema: { type: integer } }
 *       - { name: limit, in: query, schema: { type: integer } }
 *       - { name: category, in: query, schema: { type: string } }
 *       - { name: minPrice, in: query, schema: { type: number } }
 *       - { name: maxPrice, in: query, schema: { type: number } }
 *       - { name: sort, in: query, schema: { type: string, enum: [createdAt, -createdAt, price, -price, name, -name, averageRating, -averageRating] } }
 *     responses:
 *       200:
 *         description: Paginated search results
 */

import { Router } from "express";
import { searchProducts } from "../../controllers/search/search.controller";

const router = Router();

router.get("/", searchProducts);
router.get("/products", searchProducts);

export default router;
