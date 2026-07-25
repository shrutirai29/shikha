import Order from "../../models/order/order.model";
import Payment from "../../models/payment/payment.model";
import Product from "../../models/product/product.model";
import { AnalyticsQuery } from "../../interfaces/analytics/analytics.interface";

const buildDateFilter = ({ from, to }: AnalyticsQuery) => {
  if (!from && !to) {
    return {};
  }

  const createdAt: Record<string, Date> = {};

  if (from) {
    createdAt.$gte = from;
  }

  if (to) {
    createdAt.$lte = to;
  }

  return {
    createdAt,
  };
};

export const getSalesAnalytics = async (
  query: AnalyticsQuery
) => {
  const dateFilter = buildDateFilter(query);

  const [salesByDay, paymentStatus, orderStatus] =
    await Promise.all([
      Payment.aggregate([
        {
          $match: {
            status: "Paid",
            ...dateFilter,
          },
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: "%Y-%m-%d",
                date: "$createdAt",
              },
            },
            revenue: {
              $sum: "$amount",
            },
            payments: {
              $sum: 1,
            },
          },
        },
        {
          $sort: {
            _id: 1,
          },
        },
      ]),
      Payment.aggregate([
        {
          $match: dateFilter,
        },
        {
          $group: {
            _id: "$status",
            count: {
              $sum: 1,
            },
          },
        },
      ]),
      Order.aggregate([
        {
          $match: dateFilter,
        },
        {
          $group: {
            _id: "$orderStatus",
            count: {
              $sum: 1,
            },
          },
        },
      ]),
    ]);

  return {
    salesByDay: salesByDay.map((item) => ({
      date: item._id,
      revenue: Number(item.revenue.toFixed(2)),
      payments: item.payments,
    })),
    paymentStatus,
    orderStatus,
  };
};

export const getProductAnalytics = async () => {
  const [topRatedProducts, lowStockProducts] =
    await Promise.all([
      Product.find({
        isActive: true,
        totalReviews: {
          $gt: 0,
        },
      })
        .select("name slug images averageRating totalReviews")
        .sort({
          averageRating: -1,
          totalReviews: -1,
        })
        .limit(10),
      Product.find({
        isActive: true,
        stock: {
          $lte: 5,
        },
      })
        .select("name slug stock images")
        .sort({
          stock: 1,
        })
        .limit(10),
    ]);

  return {
    topRatedProducts,
    lowStockProducts,
  };
};
