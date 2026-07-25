import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";

import adminRoutes from "./routes/admin/admin.routes";
import { errorHandler } from "./middleware/error.middleware";
import categoryRoutes from "./routes/category/category.routes";
import productRoutes from "./routes/product/product.routes";
import authRoutes from "./routes/auth/auth.routes";
import cartRoutes from "./routes/cart/cart.routes";
import orderRoutes from "./routes/order/order.routes";
import wishlistRoutes from "./routes/wishlist/wishlist.routes";
import reviewRoutes from "./routes/review/review.routes";
import paymentRoutes from "./routes/payment/payment.routes";
import couponRoutes from "./routes/coupon/coupon.routes";

const app = express();

// Body Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Global Middlewares
app.use(cors());
app.use(helmet());
app.use(cookieParser());
app.use(morgan("dev"));

// Health Check
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "🚀 Shikha Backend API is running successfully",
    version: "1.0.0",
  });
});

// Routes
app.use("/api/admin", adminRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/coupons", couponRoutes);

// Error Handler (Always Last)
app.use(errorHandler);

export default app;