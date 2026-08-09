import { Request, Response } from "express";

import { AuthRequest } from "../../middleware/auth.middleware";

import * as orderService from "../../services/order/order.service";

import { asyncHandler } from "../../utils/asyncHandler";

import {
  createOrderSchema,
  updateOrderStatusSchema,
  orderQuerySchema,
} from "../../validators/order/order.validator";

export const createOrder = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const data = createOrderSchema.parse(req.body);

    const order = await orderService.createOrder(
      req.user!._id.toString(),
      data
    );

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      data: order,
    });
  }
);

export const getMyOrders = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { page, limit } = orderQuerySchema.parse(
      req.query
    );

    const result = await orderService.getMyOrders(
      req.user!._id.toString(),
      page,
      limit
    );

    res.status(200).json({
      success: true,
      ...result,
    });
  }
);

export const getOrderById = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const order = await orderService.getOrderById(
      req.user!._id.toString(),
      req.params.id as string
    );

    res.status(200).json({
      success: true,
      data: order,
    });
  }
);

export const getAllOrders = asyncHandler(
  async (_req: AuthRequest, res: Response) => {
    const { page, limit } = orderQuerySchema.parse(
      _req.query
    );

    const result = await orderService.getAllOrders(
      page,
      limit
    );

    res.status(200).json({
      success: true,
      ...result,
    });
  }
);

export const updateOrderStatus = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { status } = updateOrderStatusSchema.parse(
      req.body
    );

    const order = await orderService.updateOrderStatus(
      req.params.id as string,
      status
    );

    res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      data: order,
    });
  }
);