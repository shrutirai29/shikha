import { Request, Response, NextFunction } from "express";

import * as paymentService from "../../services/payment/payment.service";
import { verifyWebhookSignature } from "../../services/payment/payment.utils";

import { CreatePaymentDto } from "../../dtos/payment/create-payment.dto";
import { VerifyPaymentDto } from "../../dtos/payment/verify-payment.dto";
import { RefundPaymentDto } from "../../dtos/payment/refund-payment.dto";
import { ConflictError } from "../../errors/ConflictError";

export const createRazorpayOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!._id.toString();

    const data = req.body as CreatePaymentDto;

    const payment =
      await paymentService.createRazorpayOrder(
        userId,
        data
      );

    res.status(201).json({
      success: true,
      message: "Razorpay order created successfully",
      data: payment,
    });
  } catch (error) {
    next(error);
  }
};

export const verifyPayment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = req.body as VerifyPaymentDto;

    const payment =
      await paymentService.verifyPayment(
        data,
        req.user!._id.toString()
      );

    res.status(200).json({
      success: true,
      message: "Payment verified successfully",
      data: payment,
    });
  } catch (error) {
    next(error);
  }
};

export const getPaymentById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const payment =
      await paymentService.getPaymentById(
        req.params.paymentId as string,
        req.user!._id.toString(),
        req.user?.role === "admin"
      );

    res.status(200).json({
      success: true,
      data: payment,
    });
  } catch (error) {
    next(error);
  }
};

export const getMyPayments = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const payments =
      await paymentService.getUserPayments(
        req.user!._id.toString()
      );

    res.status(200).json({
      success: true,
      data: payments,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllPayments = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const payments =
      await paymentService.getAllPayments();

    res.status(200).json({
      success: true,
      data: payments,
    });
  } catch (error) {
    next(error);
  }
};

export const markPaymentFailed = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const payment =
      await paymentService.markPaymentFailed(
        req.params.razorpayOrderId as string
      );

    res.status(200).json({
      success: true,
      message: "Payment marked as failed",
      data: payment,
    });
  } catch (error) {
    next(error);
  }
};

export const refundPayment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = req.body as RefundPaymentDto;

    const payment =
      await paymentService.refundPayment(
        req.params.paymentId as string,
        data
      );

    res.status(200).json({
      success: true,
      message: "Payment refunded successfully",
      data: payment,
    });
  } catch (error) {
    next(error);
  }
};

export const handleWebhook = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const signature =
      req.headers["x-razorpay-signature"];

    if (
      typeof signature !== "string" ||
      !req.rawBody ||
      !verifyWebhookSignature(req.rawBody, signature)
    ) {
      throw new ConflictError("Invalid webhook signature");
    }

    const result =
      await paymentService.handleRazorpayWebhook(req.body);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
