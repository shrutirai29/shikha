import { Types } from "mongoose";

import Review from "../../models/review/review.model";
import Product from "../../models/product/product.model";
import Order from "../../models/order/order.model";

import { CreateReviewDto } from "../../dtos/review/create-review.dto";

import { NotFoundError } from "../../errors/NotFoundError";
import { ConflictError } from "../../errors/ConflictError";
import { ForbiddenError } from "../../errors/ForbiddenError";

const updateProductRating = async (productId: string) => {
  const stats = await Review.aggregate([
    {
      $match: {
        product: new Types.ObjectId(productId),
        isActive: true,
      },
    },
    {
      $group: {
        _id: "$product",
        averageRating: {
          $avg: "$rating",
        },
        totalReviews: {
          $sum: 1,
        },
      },
    },
  ]);

  if (stats.length === 0) {
    await Product.findByIdAndUpdate(productId, {
      averageRating: 0,
      totalReviews: 0,
    });

    return;
  }

  await Product.findByIdAndUpdate(productId, {
    averageRating: Number(stats[0].averageRating.toFixed(1)),
    totalReviews: stats[0].totalReviews,
  });
};

export const addReview = async (
  userId: string,
  productId: string,
  data: CreateReviewDto
) => {
  const product = await Product.findById(productId);

  if (!product) {
    throw new NotFoundError("Product not found");
  }

  const alreadyReviewed = await Review.findOne({
    user: userId,
    product: productId,
    isActive: true,
  });

  if (alreadyReviewed) {
    throw new ConflictError(
      "You have already reviewed this product"
    );
  }

  const purchased = await Order.findOne({
    user: userId,
    "items.product": productId,
    orderStatus: "Delivered",
  });

  if (!purchased) {
    throw new ForbiddenError(
      "Only customers who purchased this product can review it"
    );
  }

  const review = await Review.create({
    user: userId,
    product: productId,
    rating: data.rating,
    comment: data.comment,
    verifiedPurchase: true,
  });

  await updateProductRating(productId);

  return await review.populate("user", "name");
};

export const getProductReviews = async (productId: string) => {
  const product = await Product.findById(productId);

  if (!product) {
    throw new NotFoundError("Product not found");
  }

  return await Review.find({
    product: productId,
    isActive: true,
  })
    .populate("user", "name")
    .sort({
      createdAt: -1,
    });
};

export const updateReview = async (
  userId: string,
  reviewId: string,
  data: CreateReviewDto
) => {
  const review = await Review.findById(reviewId);

  if (!review || !review.isActive) {
    throw new NotFoundError("Review not found");
  }

  if (review.user.toString() !== userId) {
    throw new ForbiddenError(
      "You can update only your own review"
    );
  }

  review.rating = data.rating;
  review.comment = data.comment;

  await review.save();

  await updateProductRating(review.product.toString());

  return review;
};

export const deleteReview = async (
  userId: string,
  reviewId: string
) => {
  const review = await Review.findById(reviewId);

  if (!review || !review.isActive) {
    throw new NotFoundError("Review not found");
  }

  if (review.user.toString() !== userId) {
    throw new ForbiddenError(
      "You can delete only your own review"
    );
  }

  review.isActive = false;

  await review.save();

  await updateProductRating(review.product.toString());

  return {
    message: "Review deleted successfully",
  };
};