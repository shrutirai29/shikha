/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User profiles and admin user management
 */

/**
 * @swagger
 * /users/me:
 *   get:
 *     summary: Get the current user's profile
 *     tags: [Users]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Profile details
 *   patch:
 *     summary: Update the current user's profile
 *     tags: [Users]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               phone: { type: string }
 *     responses:
 *       200:
 *         description: Profile updated
 */

/**
 * @swagger
 * /users/admin/all:
 *   get:
 *     summary: Get all users (admin)
 *     tags: [Users]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Paginated users
 */

/**
 * @swagger
 * /users/admin/{id}:
 *   get:
 *     summary: Get a user by ID (admin)
 *     tags: [Users]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { name: id, in: path, required: true, schema: { type: string } }
 *     responses:
 *       200:
 *         description: User details
 */

/**
 * @swagger
 * /users/admin/{id}/status:
 *   patch:
 *     summary: Activate/deactivate a user (admin)
 *     tags: [Users]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { name: id, in: path, required: true, schema: { type: string } }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [isActive]
 *             properties:
 *               isActive: { type: boolean }
 *     responses:
 *       200:
 *         description: User status updated
 */

/**
 * @swagger
 * /users/admin/{id}/role:
 *   patch:
 *     summary: Change a user's role (admin)
 *     tags: [Users]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { name: id, in: path, required: true, schema: { type: string } }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [role]
 *             properties:
 *               role: { type: string, enum: [admin, customer] }
 *     responses:
 *       200:
 *         description: User role updated
 */

import { Router } from "express";
import {
  getAllUsers,
  getMe,
  getUserById,
  updateMe,
  updateUserRole,
  updateUserStatus,
  changePassword,
  createAgent,
  listAgents,
} from "../../controllers/user/user.controller";
import { authenticate } from "../../middleware/auth.middleware";
import { authorize } from "../../middleware/authorize.middleware";
import { validateObjectId } from "../../middleware/validateObjectId.middleware";

const router = Router();

router.use(authenticate);

router.get("/me", getMe);
router.patch("/me", updateMe);
router.patch("/me/password", changePassword);

router.get(
  "/admin/all",
  authorize("admin"),
  getAllUsers
);

// Delivery agent management — keep before /admin/:id so "agents" is not
// swallowed by the :id parameter route.
router.get(
  "/admin/agents",
  authorize("admin"),
  listAgents
);

router.post(
  "/admin/agents",
  authorize("admin"),
  createAgent
);

router.get(
  "/admin/:id",
  authorize("admin"),
  validateObjectId("id"),
  getUserById
);

router.patch(
  "/admin/:id/status",
  authorize("admin"),
  validateObjectId("id"),
  updateUserStatus
);

router.patch(
  "/admin/:id/role",
  authorize("admin"),
  validateObjectId("id"),
  updateUserRole
);

export default router;
