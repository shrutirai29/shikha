import { Request, Response } from "express";

import { AuthRequest } from "../../middleware/auth.middleware";

import * as orderService from "../../services/order/order.service";

import { asyncHandler } from "../../utils/asyncHandler";

import {
  createOrderSchema,
  updateOrderStatusSchema,
  updateShippingSchema,
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
    const { page, limit, status } = orderQuerySchema.parse(
      req.query
    );

    const result = await orderService.getMyOrders(
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

export const getOrderById = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const order = await orderService.getOrderById(
      req.user!._id.toString(),
      req.params.id as string,
      req.user!.role === "admin"
    );

    res.status(200).json({
      success: true,
      data: order,
    });
  }
);

export const getAllOrders = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const query = orderQuerySchema.parse(req.query);

    const result = await orderService.getAllOrders(query);

    res.status(200).json({
      success: true,
      ...result,
    });
  }
);

export const updateShipping = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const data = updateShippingSchema.parse(req.body);

    const order = await orderService.updateOrderShipping(
      req.params.id as string,
      data
    );

    res.status(200).json({
      success: true,
      message: "Shipping tracking updated",
      data: order,
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

export const cancelOrder = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const order = await orderService.cancelOrder(
      req.user!._id.toString(),
      req.params.id as string
    );

    res.status(200).json({
      success: true,
      message: "Order cancelled successfully",
      data: order,
    });
  }
);

export const getOrderInvoice = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const html = await orderService.generateOrderInvoiceHtml(
      req.user!._id.toString(),
      req.params.id as string,
      req.user!.role === "admin"
    );

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.status(200).send(html);
  }
);
