import { Router } from "express";
import {
  postContactMessage,
  getContactMessages,
  patchContactMessageStatus,
  removeContactMessage,
} from "../../controllers/contact/contact.controller";
import { authenticate } from "../../middleware/auth.middleware";
import { authorize } from "../../middleware/authorize.middleware";
import { validate } from "../../middleware/validate.middleware";
import { validateObjectId } from "../../middleware/validateObjectId.middleware";
import {
  createContactSchema,
  updateContactStatusSchema,
} from "../../validators/contact/contact.validator";
import { searchRateLimiter } from "../../middleware/rateLimit.middleware";

const router = Router();

// Public: Submit inquiry
router.post(
  "/",
  searchRateLimiter,
  validate(createContactSchema),
  postContactMessage
);

// Admin: Manage inquiries
router.get("/", authenticate, authorize("admin"), getContactMessages);

router.patch(
  "/:id/status",
  authenticate,
  authorize("admin"),
  validateObjectId("id"),
  validate(updateContactStatusSchema),
  patchContactMessageStatus
);

router.delete(
  "/:id",
  authenticate,
  authorize("admin"),
  validateObjectId("id"),
  removeContactMessage
);

export default router;
