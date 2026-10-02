import dns from "node:dns";
dns.setServers(["8.8.8.8", "8.8.4.4"]);

import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import connectDatabase from "../src/database/database";
import Category from "../src/models/category/category.model";
import Product from "../src/models/product/product.model";
import Coupon from "../src/models/coupon/coupon.model";
import Review from "../src/models/review/review.model";
import Order from "../src/models/order/order.model";
import Payment from "../src/models/payment/payment.model";
import Cart from "../src/models/cart/cart.model";

const cleanStoreData = async () => {
  try {
    console.log("Connecting to database...");
    await connectDatabase();

    console.log("\n--- Cleaning Dummy Store Data ---");

    const deletedProducts = await Product.deleteMany({});
    console.log(`✅ Removed ${deletedProducts.deletedCount} dummy products.`);

    const deletedCategories = await Category.deleteMany({});
    console.log(`✅ Removed ${deletedCategories.deletedCount} dummy categories.`);

    const deletedOrders = await Order.deleteMany({});
    console.log(`✅ Removed ${deletedOrders.deletedCount} dummy orders.`);

    const deletedPayments = await Payment.deleteMany({});
    console.log(`✅ Removed ${deletedPayments.deletedCount} dummy payments.`);

    const deletedCarts = await Cart.deleteMany({});
    console.log(`✅ Removed ${deletedCarts.deletedCount} dummy carts.`);

    const deletedCoupons = await Coupon.deleteMany({});
    console.log(`✅ Removed ${deletedCoupons.deletedCount} dummy coupons.`);

    const deletedReviews = await Review.deleteMany({});
    console.log(`✅ Removed ${deletedReviews.deletedCount} dummy reviews.`);

    console.log("\n🎉 Clean slate ready! All user accounts have been preserved.");
    console.log("You can now log in to the admin panel and add your own categories and products.");

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error cleaning store data:", error);
    process.exit(1);
  }
};

cleanStoreData();
