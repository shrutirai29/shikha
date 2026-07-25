import { Router } from "express";

import {
  getCart,
  addToCart,
  updateQuantity,
  removeItem,
  clearCart,
} from "../../controllers/cart/cart.controller";

import { authenticate } from "../../middleware/auth.middleware";

const router = Router();

// All cart routes require login
router.use(authenticate);

router.get("/", getCart);

router.post("/", addToCart);

router.patch("/:productId", updateQuantity);

router.delete("/:productId", removeItem);

router.delete("/", clearCart);

export default router;