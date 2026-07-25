import Review from "../models/review/review.model";

export const calculateProductRating = async (
  productId: string
) => {
  const stats = await Review.aggregate([
    {
      $match: {
        product: productId,
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

  return stats.length > 0
    ? {
        averageRating: Number(
          stats[0].averageRating.toFixed(1)
        ),
        totalReviews: stats[0].totalReviews,
      }
    : {
        averageRating: 0,
        totalReviews: 0,
      };
};