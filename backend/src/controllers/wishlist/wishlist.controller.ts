import { Request, Response, NextFunction } from "express";

import * as wishlistService from "../../services/wishlist/wishlist.service";

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

    const wishlist = await wishlistService.getWishlist(userId);

    res.status(200).json({
      success: true,
      message: "Wishlist fetched successfully",
      data: wishlist,
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