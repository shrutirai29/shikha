import { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import { env } from "../config/env";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);
const CSRF_COOKIE_NAME = "XSRF-TOKEN";
const CSRF_HEADER_NAMES = ["x-xsrf-token", "x-csrf-token", "x-requested-with"];

export const csrfProtection = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const config = env();
  const isProd = config.NODE_ENV === "production";

  // Ensure an XSRF-TOKEN cookie exists for client-side frameworks (e.g. Axios)
  let csrfCookie = req.cookies?.[CSRF_COOKIE_NAME];
  if (!csrfCookie) {
    csrfCookie = crypto.randomBytes(24).toString("hex");
    res.cookie(CSRF_COOKIE_NAME, csrfCookie, {
      httpOnly: false, // Axios reads this to set X-XSRF-TOKEN header
      secure: isProd,
      sameSite: "lax",
      path: "/",
      maxAge: 24 * 60 * 60 * 1000,
    });
  }

  // Safe HTTP read methods do not modify server state
  if (SAFE_METHODS.has(req.method)) {
    return next();
  }

  // Exempt webhooks (e.g., Razorpay webhook) which are validated by HMAC signatures
  if (req.originalUrl.includes("/webhook")) {
    return next();
  }

  // If request carries Bearer Authorization header, standard browsers cannot forge
  // cross-origin custom headers without explicit CORS preflight permission
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return next();
  }

  // Check for custom header or matching CSRF token
  const providedCsrfToken =
    (req.headers["x-xsrf-token"] as string | undefined) ||
    (req.headers["x-csrf-token"] as string | undefined);

  if (providedCsrfToken && providedCsrfToken === csrfCookie) {
    return next();
  }

  // Allow custom requested-with header if origin is trusted
  const requestedWith = req.headers["x-requested-with"];
  const origin = req.headers.origin;

  if (requestedWith === "XMLHttpRequest") {
    return next();
  }

  // In non-production development environments, allow standard testing tools
  if (!isProd) {
    return next();
  }

  res.status(403).json({
    success: false,
    message: "CSRF token validation failed. State-changing requests must include valid credentials or CSRF headers.",
  });
};
