import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import compression from "compression";

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
import {
  globalRateLimiter,
  authRateLimiter,
  paymentRateLimiter,
} from "./middleware/rateLimit.middleware";
import { env } from "./config/env";

const app = express();

const config = env();

// Body Parsers
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Global Middlewares
app.use(compression());
app.use(
  cors({
    origin: config.CLIENT_URL || true,
    credentials: true,
  })
);
app.use(helmet());
app.use(cookieParser());
app.use(morgan(config.NODE_ENV === "production" ? "combined" : "dev"));
app.use(globalRateLimiter);

// Health Check
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "🚀 Shikha Backend API is running successfully",
    version: "1.0.0",
  });
});

// Routes
app.use("/api/auth", authRateLimiter, authRoutes);
app.use("/api/admin", authRateLimiter, adminRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/payments", paymentRateLimiter, paymentRoutes);
app.use("/api/coupons", couponRoutes);

// Error Handler (Always Last)
app.use(errorHandler);

export default app;
