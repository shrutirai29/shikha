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
