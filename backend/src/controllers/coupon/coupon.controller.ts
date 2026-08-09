import { Request, Response } from "express";

import * as couponService from "../../services/coupon/coupon.service";

import { asyncHandler } from "../../utils/asyncHandler";

import { couponQuerySchema } from "../../validators/coupon/coupon.validator";

export const createCoupon = asyncHandler(
  async (req: Request, res: Response) => {
    const coupon = await couponService.createCoupon(req.body);

    res.status(201).json({
      success: true,
      message: "Coupon created successfully",
      data: coupon,
    });
  }
);

export const getAllCoupons = asyncHandler(
  async (req: Request, res: Response) => {
    const { page, limit } = couponQuerySchema.parse(
      req.query
    );

    const result = await couponService.getAllCoupons(
      page,
      limit
    );

    res.status(200).json({
      success: true,
      ...result,
    });
  }
);

export const getCouponById = asyncHandler(
  async (req: Request, res: Response) => {
    const coupon = await couponService.getCouponById(
      req.params.couponId as string
    );

    res.status(200).json({
      success: true,
      data: coupon,
    });
  }
);

export const updateCoupon = asyncHandler(
  async (req: Request, res: Response) => {
    const coupon = await couponService.updateCoupon(
      req.params.couponId as string,
      req.body
    );

    res.status(200).json({
      success: true,
      message: "Coupon updated successfully",
      data: coupon,
    });
  }
);

export const deleteCoupon = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await couponService.deleteCoupon(
      req.params.couponId as string
    );

    res.status(200).json({
      success: true,
      message: result.message,
    });
  }
);

export const applyCoupon = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user!._id.toString();

    const cart = await couponService.applyCoupon(
      userId,
      req.body
    );

    res.status(200).json({
      success: true,
      message: "Coupon applied successfully",
      data: cart,
    });
  }
);

export const removeCoupon = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user!._id.toString();

    const cart = await couponService.removeCoupon(userId);

    res.status(200).json({
      success: true,
      message: "Coupon removed successfully",
      data: cart,
    });
  }
);