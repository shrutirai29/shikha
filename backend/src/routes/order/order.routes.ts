import { Router } from "express";

import {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
} from "../../controllers/order/order.controller";

import { authenticate } from "../../middleware/auth.middleware";
import { authorize } from "../../middleware/authorize.middleware";

const router = Router();

// All order routes require login
router.use(authenticate);

// ---------------- Customer ----------------

router.post("/", createOrder);

router.get("/", getMyOrders);

// ---------------- Admin ----------------

router.get(
  "/admin/all",
  authorize("admin"),
  getAllOrders
);

router.patch(
  "/admin/:id/status",
  authorize("admin"),
  updateOrderStatus
);

// Keep this LAST
router.get("/:id", getOrderById);

export default router;