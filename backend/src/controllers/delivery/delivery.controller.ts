import { Response } from "express";

import { AuthRequest } from "../../middleware/auth.middleware";

import { asyncHandler } from "../../utils/asyncHandler";

import * as deliveryService from "../../services/delivery/delivery.service";

import {
  orderQuerySchema,
  deliveryAttemptSchema,
  completeDeliverySchema,
  markRtoSchema,
} from "../../validators/order/order.validator";

export const getMyDeliveryOrders = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { page, limit, status } = orderQuerySchema.parse(req.query);

    const result = await deliveryService.getAgentOrders(
      req.user!._id.toString(),
      page,
      limit,
      status
    );

    res.status(200).json({
      success: true,
      ...result,
    });
  }
);

export const startDelivery = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const order = await deliveryService.markOutForDelivery(
      req.user!._id.toString(),
      req.params.id as string
    );

    res.status(200).json({
      success: true,
      message: "Order is out for delivery — a delivery code was sent to the customer",
      data: order,
    });
  }
);

export const resendDeliveryOtp = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const result = await deliveryService.regenerateOtp(
      req.user!._id.toString(),
      req.params.id as string
    );

    res.status(200).json({
      success: true,
      ...result,
    });
  }
);

export const recordDeliveryAttempt = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { note, refused } = deliveryAttemptSchema.parse(req.body);

    const order = await deliveryService.recordAttempt(
      req.user!._id.toString(),
      req.params.id as string,
      note,
      refused
    );

    res.status(200).json({
      success: true,
      message: "Delivery attempt recorded",
      data: order,
    });
  }
);

export const completeDelivery = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { otp, codCollected } = completeDeliverySchema.parse(req.body);

    const order = await deliveryService.completeDelivery(
      req.user!._id.toString(),
      req.params.id as string,
      otp,
      codCollected
    );

    res.status(200).json({
      success: true,
      message: "Delivery completed — order marked as delivered",
      data: order,
    });
  }
);

export const returnToOrigin = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { note } = markRtoSchema.parse(req.body);

    const order = await deliveryService.markRto(
      req.user!._id.toString(),
      req.params.id as string,
      note
    );

    res.status(200).json({
      success: true,
      message: "Order marked as return-to-origin",
      data: order,
    });
  }
);
