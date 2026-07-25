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
