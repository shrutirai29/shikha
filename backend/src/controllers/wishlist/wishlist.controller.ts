import { Request, Response, NextFunction } from "express";

import * as wishlistService from "../../services/wishlist/wishlist.service";

import { wishlistQuerySchema } from "../../validators/wishlist/wishlist.validator";

export const addToWishlist = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!._id.toString();

    const wishlist = await wishlistService.addToWishlist(
      userId,
      req.params.productId as string
    );

    res.status(200).json({
      success: true,
      message: "Product added to wishlist successfully",
      data: wishlist,
    });
  } catch (error) {
    next(error);
  }
};

export const getWishlist = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!._id.toString();
    const { page, limit } = wishlistQuerySchema.parse(
      req.query
    );

    const result = await wishlistService.getWishlist(
      userId,
      page,
      limit
    );

    res.status(200).json({
      success: true,
      message: "Wishlist fetched successfully",
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

export const removeFromWishlist = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!._id.toString();

    const wishlist = await wishlistService.removeFromWishlist(
      userId,
      req.params.productId as string
    );

    res.status(200).json({
      success: true,
      message: "Product removed from wishlist successfully",
      data: wishlist,
    });
  } catch (error) {
    next(error);
  }
};