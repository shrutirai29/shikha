import { Router } from "express";
import {
  getAllUsers,
  getMe,
  getUserById,
  updateMe,
  updateUserRole,
  updateUserStatus,
} from "../../controllers/user/user.controller";
import { authenticate } from "../../middleware/auth.middleware";
import { authorize } from "../../middleware/authorize.middleware";

const router = Router();

router.use(authenticate);

router.get("/me", getMe);
router.patch("/me", updateMe);

router.get(
  "/admin/all",
  authorize("admin"),
  getAllUsers
);

router.get(
  "/admin/:id",
  authorize("admin"),
  getUserById
);

router.patch(
  "/admin/:id/status",
  authorize("admin"),
  updateUserStatus
);

router.patch(
  "/admin/:id/role",
  authorize("admin"),
  updateUserRole
);

export default router;
