import express from "express";
import { Request } from "express";
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
import userRoutes from "./routes/user/user.routes";
import addressRoutes from "./routes/address/address.routes";
import dashboardRoutes from "./routes/dashboard/dashboard.routes";
import analyticsRoutes from "./routes/analytics/analytics.routes";
import searchRoutes from "./routes/search/search.routes";
import {
  globalRateLimiter,
  authRateLimiter,
  paymentRateLimiter,
} from "./middleware/rateLimit.middleware";
import { env } from "./config/env";
import { requestIdMiddleware } from "./middleware/requestId.middleware";
import { notFoundHandler } from "./middleware/notFound.middleware";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger";

const app = express();

// Behind a single proxy hop (Railway ingress) — needed so req.ip resolves
// to the real client IP and express-rate-limit works correctly.
app.set("trust proxy", 1);

const config = env();

// Body Parsers
app.use(
  express.json({
    limit: "10mb",
    verify: (req, _res, buf) => {
      (req as Request).rawBody = Buffer.from(buf);
    },
  })
);
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Request ID / correlation ID
app.use(requestIdMiddleware);

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
app.use(
  morgan(
    config.NODE_ENV === "production" ? "combined" : "dev",
    {
      skip: (req, res) => res.statusCode >= 400,
    }
  )
);
app.use((req, res, next) => {
  morgan(
    ":method :url :status :response-time ms - :res[x-request-id]",
    {
      skip: (_, r) => r.statusCode < 400,
    }
  )(req, res, next);
});
app.use(globalRateLimiter);

// Health Check
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "🚀 Shikha Backend API is running successfully",
    version: "1.0.0",
  });
});

// API Documentation
app.use(
  "/api/docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customSiteTitle: "Shikha API Docs",
  })
);

// Routes
app.use("/api/auth", authRateLimiter, authRoutes);
app.use("/api/admin", authRateLimiter, adminRoutes);
app.use("/api/users", userRoutes);
app.use("/api/addresses", addressRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/payments", paymentRateLimiter, paymentRoutes);
app.use("/api/coupons", couponRoutes);

// 404 Handler
app.use(notFoundHandler);

// Error Handler (Always Last)
app.use(errorHandler);

export default app;
