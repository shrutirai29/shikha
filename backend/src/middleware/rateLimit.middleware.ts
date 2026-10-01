import rateLimit from "express-rate-limit";

// Behind Railway's proxy the X-Forwarded-For chain length can vary, which
// makes express-rate-limit's strict validation throw
// ERR_ERL_UNEXPECTED_X_FORWARDED_FOR (a 500). With app.set("trust proxy", 1)
// req.ip already resolves to the real client IP, so the header validation is
// redundant — disable it to avoid spurious errors.
const rateLimitOptions = {
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false },
} as const;

export const globalRateLimiter = rateLimit({
  ...rateLimitOptions,
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: {
    success: false,
    message: "Too many requests, please try again later.",
  },
});

export const authRateLimiter = rateLimit({
  ...rateLimitOptions,
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: {
    success: false,
    message: "Too many authentication attempts, please try again later.",
  },
});

export const otpVerifyLimiter = rateLimit({
  ...rateLimitOptions,
  windowMs: 15 * 60 * 1000,
  max: 25,
  message: {
    success: false,
    message: "Too many verification attempts, please try again later.",
  },
});

export const otpResendLimiter = rateLimit({
  ...rateLimitOptions,
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    message: "Too many code requests, please try again later.",
  },
});

export const paymentRateLimiter = rateLimit({
  ...rateLimitOptions,
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: {
    success: false,
    message: "Too many payment requests, please try again later.",
  },
});

export const forgotPasswordLimiter = rateLimit({
  ...rateLimitOptions,
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    message: "Too many password reset requests, please try again after 15 minutes.",
  },
});

export const uploadRateLimiter = rateLimit({
  ...rateLimitOptions,
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: {
    success: false,
    message: "Too many file upload requests, please try again later.",
  },
});

export const reviewRateLimiter = rateLimit({
  ...rateLimitOptions,
  windowMs: 15 * 60 * 1000,
  max: 15,
  message: {
    success: false,
    message: "Too many reviews submitted, please try again later.",
  },
});
