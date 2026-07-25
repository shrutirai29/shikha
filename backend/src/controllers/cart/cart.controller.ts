import { Response } from "express";
import { AuthRequest } from "../../middleware/auth.middleware";

import { asyncHandler } from "../../utils/asyncHandler";

import * as cartService from "../../services/cart/cart.service";

import {
  addToCartSchema,
  updateCartSchema,
} from "../../validators/cart/cart.validator";

export const getCart = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = req.user!._id.toString();

    const cart = await cartService.getCart(userId);

    res.status(200).json({
      success: true,
      message: "Cart fetched successfully",
      data: cart,
    });
  }
);

export const addToCart = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const body = addToCartSchema.parse(req.body);

    const userId = req.user!._id.toString();

    const cart = await cartService.addToCart(userId, body);

    res.status(201).json({
      success: true,
      message: "Product added to cart",
      data: cart,
    });
  }
);

export const updateQuantity = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const body = updateCartSchema.parse(req.body);

    const userId = req.user!._id.toString();

    const productId = req.params.productId as string;

    const cart = await cartService.updateQuantity(
      userId,
      productId,
      body.quantity
    );

    res.status(200).json({
      success: true,
      message: "Cart updated successfully",
      data: cart,
    });
  }
);

export const removeItem = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = req.user!._id.toString();

    const productId = req.params.productId as string;

    const cart = await cartService.removeItem(
      userId,
      productId
    );

    res.status(200).json({
      success: true,
      message: "Item removed from cart",
      data: cart,
    });
  }
);

export const clearCart = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = req.user!._id.toString();

    await cartService.clearCart(userId);

    res.status(200).json({
      success: true,
      message: "Cart cleared successfully",
    });
  }
);