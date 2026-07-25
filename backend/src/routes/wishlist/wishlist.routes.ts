import { Router } from "express";

import * as wishlistController from "../../controllers/wishlist/wishlist.controller";

import { authenticate } from "../../middleware/auth.middleware";

const router = Router();

router.post(
  "/:productId",
  authenticate,
  wishlistController.addToWishlist
);

router.get(
  "/",
  authenticate,
  wishlistController.getWishlist
);

router.delete(
  "/:productId",
  authenticate,
  wishlistController.removeFromWishlist
);

export default router;