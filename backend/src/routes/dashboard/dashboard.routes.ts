/**
 * @swagger
 * tags:
 *   name: Dashboard
 *   description: Admin dashboard metrics
 */

/**
 * @swagger
 * /dashboard:
 *   get:
 *     summary: Get admin dashboard metrics (admin)
 *     tags: [Dashboard]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Dashboard metrics
 */

import { Router } from "express";
import { getAdminDashboard } from "../../controllers/dashboard/dashboard.controller";
import { authenticate } from "../../middleware/auth.middleware";
import { authorize } from "../../middleware/authorize.middleware";

const router = Router();

router.use(authenticate, authorize("admin"));

router.get("/", getAdminDashboard);

export default router;
