import { Request, Response } from "express";

import {
  addReview,
  getProductReviews,
  updateReview,
  deleteReview,
} from "../../services/review/review.service";

import {
  createReviewSchema,
  reviewQuerySchema,
} from "../../validators/review/review.validator";
import { AuthRequest } from "../../middleware/auth.middleware";
import { asyncHandler } from "../../utils/asyncHandler";

export const createReview = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = req.user!._id.toString();
    const productId = req.params.productId as string;

    const data = createReviewSchema.parse(req.body);

    const review = await addReview(userId, productId, data);

    res.status(201).json({
      success: true,
      message: "Review added successfully",
      data: review,
    });
  }
);

export const getReviews = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const productId = req.params.productId as string;
    const { page, limit } = reviewQuerySchema.parse(
      req.query
    );

    const result = await getProductReviews(
      productId,
      page,
      limit
    );

    res.status(200).json({
      success: true,
      ...result,
    });
  }
);

export const editReview = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = req.user!._id.toString();
    const reviewId = req.params.reviewId as string;

    const data = createReviewSchema.parse(req.body);

    const review = await updateReview(userId, reviewId, data);

    res.status(200).json({
      success: true,
      message: "Review updated successfully",
      data: review,
    });
  }
);

export const removeReview = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = req.user!._id.toString();
    const reviewId = req.params.reviewId as string;

    const result = await deleteReview(userId, reviewId);

    res.status(200).json({
      success: true,
      ...result,
    });
  }
);
