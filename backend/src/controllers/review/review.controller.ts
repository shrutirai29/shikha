import { Request, Response } from "express";

import {
  addReview,
  getProductReviews,
  updateReview,
  deleteReview,
} from "../../services/review/review.service";

import { createReviewSchema } from "../../validators/review/review.validator";

export const createReview = async (
  req: Request,
  res: Response
): Promise<void> => {
  const userId = req.user!._id.toString();
  const productId = req.params.productId as string;

  const data = createReviewSchema.parse(req.body);

  const review = await addReview(userId, productId, data);

  res.status(201).json({
    success: true,
    message: "Review added successfully",
    data: review,
  });
};

export const getReviews = async (
  req: Request,
  res: Response
): Promise<void> => {
  const productId = req.params.productId as string;

  const reviews = await getProductReviews(productId);

  res.status(200).json({
    success: true,
    count: reviews.length,
    data: reviews,
  });
};

export const editReview = async (
  req: Request,
  res: Response
): Promise<void> => {
  const userId = req.user!._id.toString();
  const reviewId = req.params.reviewId as string;

  const data = createReviewSchema.parse(req.body);

  const review = await updateReview(
    userId,
    reviewId,
    data
  );

  res.status(200).json({
    success: true,
    message: "Review updated successfully",
    data: review,
  });
};

export const removeReview = async (
  req: Request,
  res: Response
): Promise<void> => {
  const userId = req.user!._id.toString();
  const reviewId = req.params.reviewId as string;

  const result = await deleteReview(
    userId,
    reviewId
  );

  res.status(200).json({
    success: true,
    ...result,
  });
};