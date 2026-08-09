/**
 * @swagger
 * tags:
 *   name: Analytics
 *   description: Admin analytics
 */

/**
 * @swagger
 * /analytics/sales:
 *   get:
 *     summary: Get sales analytics (admin)
 *     tags: [Analytics]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Sales analytics
 */

/**
 * @swagger
 * /analytics/products:
 *   get:
 *     summary: Get product analytics (admin)
 *     tags: [Analytics]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Product analytics
 */

import { Router } from "express";
import {
  getProductAnalytics,
  getSalesAnalytics,
} from "../../controllers/analytics/analytics.controller";
import { authenticate } from "../../middleware/auth.middleware";
import { authorize } from "../../middleware/authorize.middleware";

const router = Router();

router.use(authenticate, authorize("admin"));

router.get("/sales", getSalesAnalytics);
router.get("/products", getProductAnalytics);

export default router;
