/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin management
 */

/**
 * @swagger
 * /admin/register:
 *   post:
 *     summary: Register a new admin (admin only)
 *     tags: [Admin]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       201:
 *         description: Admin registered
 */

import { Router } from "express";
import { register } from "../../controllers/admin/admin.controller";
import { authenticate } from "../../middleware/auth.middleware";
import { authorize } from "../../middleware/authorize.middleware";

const router = Router();

router.post(
  "/register",
  authenticate,
  authorize("admin"),
  register
);

export default router;
