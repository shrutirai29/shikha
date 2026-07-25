import User from "../../models/auth/auth.model";
import Product from "../../models/product/product.model";
import Category from "../../models/category/category.model";
import Order from "../../models/order/order.model";
import Payment from "../../models/payment/payment.model";
import Review from "../../models/review/review.model";
import Coupon from "../../models/coupon/coupon.model";

export const getAdminDashboard = async () => {
  const [
    totalUsers,
    totalProducts,
    totalCategories,
    totalOrders,
    pendingOrders,
    paidPayments,
    totalReviews,
    activeCoupons,
    recentOrders,
    lowStockProducts,
  ] = await Promise.all([
    User.countDocuments({ role: "customer" }),
    Product.countDocuments({ isActive: true }),
    Category.countDocuments({ isActive: true }),
    Order.countDocuments(),
    Order.countDocuments({ orderStatus: "Pending" }),
    Payment.find({ status: "Paid" }).select("amount"),
    Review.countDocuments({ isActive: true }),
    Coupon.countDocuments({
      isActive: true,
      expiresAt: {
        $gt: new Date(),
      },
    }),
    Order.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .limit(5),
    Product.find({
      isActive: true,
      stock: {
        $lte: 5,
      },
    })
      .select("name slug stock images")
      .sort({ stock: 1 })
      .limit(10),
  ]);

  const totalRevenue = paidPayments.reduce(
    (sum, payment) => sum + payment.amount,
    0
  );

  return {
    totals: {
      users: totalUsers,
      products: totalProducts,
      categories: totalCategories,
      orders: totalOrders,
      pendingOrders,
      reviews: totalReviews,
      activeCoupons,
      revenue: Number(totalRevenue.toFixed(2)),
    },
    recentOrders,
    lowStockProducts,
  };
};
