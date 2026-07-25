import { Router } from "express";

import {
  createReview,
  getReviews,
  editReview,
  removeReview,
} from "../../controllers/review/review.controller";

import { authenticate } from "../../middleware/auth.middleware";

const router = Router();

/*
POST    /api/reviews/:productId
GET     /api/reviews/:productId
PATCH   /api/reviews/:reviewId
DELETE  /api/reviews/:reviewId
*/

router.post(
  "/:productId",
  authenticate,
  createReview
);

router.get(
  "/:productId",
  getReviews
);

router.patch(
  "/:reviewId",
  authenticate,
  editReview
);

router.delete(
  "/:reviewId",
  authenticate,
  removeReview
);

export default router;