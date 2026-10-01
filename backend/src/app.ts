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
import seoRoutes from "./routes/seo/seo.routes";
import {
  globalRateLimiter,
  authRateLimiter,
  paymentRateLimiter,
  searchRateLimiter,
} from "./middleware/rateLimit.middleware";
import { sanitizeMiddleware } from "./middleware/sanitize.middleware";
import { xssMiddleware } from "./middleware/xss.middleware";
import { csrfProtection } from "./middleware/csrf.middleware";
import { env } from "./config/env";
import { requestIdMiddleware } from "./middleware/requestId.middleware";
import { notFoundHandler } from "./middleware/notFound.middleware";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger";

const app = express();

// Disable x-powered-by to prevent framework fingerprinting
app.disable("x-powered-by");

// Behind a single proxy hop (Railway, Render, Vercel) — needed so req.ip resolves
// to the real client IP and express-rate-limit works correctly.
app.set("trust proxy", 1);

const config = env();
const isProd = config.NODE_ENV === "production";

// Enforce HTTPS in production behind reverse proxies
app.use((req, res, next) => {
  if (
    isProd &&
    req.headers["x-forwarded-proto"] &&
    req.headers["x-forwarded-proto"] !== "https"
  ) {
    return res.redirect(301, `https://${req.hostname}${req.originalUrl}`);
  }
  next();
});

// Parse client URLs (supports comma-separated list and strips trailing slashes)
const configuredClientOrigins = (config.CLIENT_URL || "")
  .split(",")
  .map((url) => url.trim().replace(/\/$/, ""))
  .filter(Boolean);

// Comprehensive security headers with Helmet
const allowedOrigins = [
  ...configuredClientOrigins,
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:3000",
  "http://127.0.0.1:5173",
];

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        imgSrc: [
          "'self'",
          "data:",
          "blob:",
          "https://res.cloudinary.com",
          "https://images.unsplash.com",
          "https://*",
        ],
        fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
        connectSrc: [
          "'self'",
          ...allowedOrigins,
          "https://api.razorpay.com",
          "https://*.razorpay.com",
          "https://api.cloudinary.com",
        ],
        frameAncestors: ["'none'"],
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
      },
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
    hsts: isProd
      ? {
          maxAge: 31536000,
          includeSubDomains: true,
          preload: true,
        }
      : false,
    frameguard: { action: "deny" },
    noSniff: true,
  })
);

// Standard Permissions-Policy header
app.use((_req, res, next) => {
  res.setHeader(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), payment=(self 'https://api.razorpay.com')"
  );
  next();
});

// Strict CORS with credentials: preserve client URLs, allow localhost development
app.use(
  cors({
    origin: (requestOrigin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
      if (!requestOrigin) return callback(null, true);

      // In development or test, allow local dev origins
      if (!isProd) {
        return callback(null, true);
      }

      const normalizedOrigin = requestOrigin.replace(/\/$/, "");

      // In production, enforce origin allowlist
      if (
        allowedOrigins.includes(normalizedOrigin) ||
        configuredClientOrigins.includes(normalizedOrigin) ||
        configuredClientOrigins.some((u) => {
          try {
            const parsedHost = new URL(u).hostname;
            const reqHost = new URL(normalizedOrigin).hostname;
            return (
              reqHost === parsedHost ||
              (parsedHost.includes("vercel.app") && reqHost.endsWith(".vercel.app")) ||
              (parsedHost.includes("netlify.app") && reqHost.endsWith(".netlify.app")) ||
              (parsedHost.includes("onrender.com") && reqHost.endsWith(".onrender.com"))
            );
          } catch {
            return false;
          }
        })
      ) {
        return callback(null, true);
      }

      return callback(new Error("CORS policy violation: origin not allowed"));
    },
    credentials: true,
  })
);

// Body Parsers with 10mb limit and rawBody buffer preservation for webhook signature verification
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

// Defensive NoSQL injection sanitizer (strips $ and . keys)
app.use(sanitizeMiddleware);

// Defensive XSS sanitizer (neutralizes scripts and malicious handlers)
app.use(xssMiddleware);

// Cookie parser with optional signing key
app.use(cookieParser(config.COOKIE_SECRET));

// CSRF Protection (defends state-changing requests, integrates with Axios XSRF)
app.use(csrfProtection);

// Global Middlewares
app.use(compression());

app.use(
  morgan(isProd ? "combined" : "dev", {
    skip: (req, res) => res.statusCode >= 400,
  })
);
app.use((req, res, next) => {
  morgan(":method :url :status :response-time ms - :res[x-request-id]", {
    skip: (_, r) => r.statusCode < 400,
  })(req, res, next);
});

// Global Rate Limiter
app.use(globalRateLimiter);

// Health Check
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "🚀 Knottiingale Backend API is running successfully",
    version: "1.0.0",
  });
});

// API Documentation (Available in dev or when explicitly enabled in prod)
if (!isProd || config.ENABLE_SWAGGER === "true") {
  app.use(
    "/api/docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
      customSiteTitle: "Knottiingale API Docs",
    })
  );
}

// SEO, Sitemap and Search Engine Verification routes
app.use(seoRoutes);

// Routes
app.use("/api/auth", authRateLimiter, authRoutes);
app.use("/api/admin", authRateLimiter, adminRoutes);
app.use("/api/users", userRoutes);
app.use("/api/addresses", addressRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/search", searchRateLimiter, searchRoutes);
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
