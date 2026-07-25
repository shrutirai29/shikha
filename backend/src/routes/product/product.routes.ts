import { Router } from "express";

import {
  create,
  getAll,
  getBySlug,
  getOne,
  update,
  remove,
} from "../../controllers/product/product.controller";

import { authenticate } from "../../middleware/auth.middleware";
import { authorize } from "../../middleware/authorize.middleware";

const router = Router();

// =======================
// Public Routes
// =======================

router.get("/", getAll);

router.get("/slug/:slug", getBySlug);

router.get("/:id", getOne);

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
  update
);

router.delete(
  "/:id",
  authenticate,
  authorize("admin"),
  remove
);

export default router;
