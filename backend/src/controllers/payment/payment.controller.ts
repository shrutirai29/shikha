import { Request, Response, NextFunction } from "express";

import * as paymentService from "../../services/payment/payment.service";

import { CreatePaymentDto } from "../../dtos/payment/create-payment.dto";
import { VerifyPaymentDto } from "../../dtos/payment/verify-payment.dto";

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
        req.params.paymentId as string
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