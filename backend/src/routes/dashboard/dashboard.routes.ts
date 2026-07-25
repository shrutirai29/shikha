import { Router } from "express";
import { getAdminDashboard } from "../../controllers/dashboard/dashboard.controller";
import { authenticate } from "../../middleware/auth.middleware";
import { authorize } from "../../middleware/authorize.middleware";

const router = Router();

router.use(authenticate, authorize("admin"));

router.get("/", getAdminDashboard);

export default router;
