/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication and account management
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Start registration — sends a 6-digit OTP to the email. No account is created until the OTP is verified.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password, phone]
 *             properties:
 *               name: { type: string }
 *               email: { type: string, format: email }
 *               password: { type: string, minLength: 6 }
 *               phone: { type: string }
 *     responses:
 *       201:
 *         description: OTP sent — verify with /auth/verify-otp to create the account
 *       409:
 *         description: Email already registered or an OTP is already pending
 */

/**
 * @swagger
 * /auth/verify-otp:
 *   post:
 *     summary: Verify the emailed code and create the account
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, code]
 *             properties:
 *               email: { type: string, format: email }
 *               code: { type: string, minLength: 6, maxLength: 6 }
 *     responses:
 *       200:
 *         description: Account created, returns token and user
 *       400:
 *         description: Invalid code or too many attempts
 *       401:
 *         description: No pending registration or expired code
 */

/**
 * @swagger
 * /auth/resend-otp:
 *   post:
 *     summary: Resend the verification code (60s cooldown)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email: { type: string, format: email }
 *     responses:
 *       200:
 *         description: New code sent
 *       409:
 *         description: Resend cooldown still active
 */

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Log in and receive a JWT
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, format: email }
 *               password: { type: string, minLength: 6 }
 *     responses:
 *       200:
 *         description: Login successful, returns token and user
 */

/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     summary: Request a password reset link
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email: { type: string, format: email }
 *     responses:
 *       200:
 *         description: Reset link sent if the account exists
 */

/**
 * @swagger
 * /auth/reset-password:
 *   post:
 *     summary: Set a new password using a reset token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [token, password]
 *             properties:
 *               token: { type: string }
 *               password: { type: string, minLength: 6 }
 *     responses:
 *       200:
 *         description: Password reset successfully
 */

import { Router } from "express";

import {
  registerUser,
  loginUser,
  verifyOtpRequest,
  resendOtpRequest,
  forgotPasswordRequest,
  resetPasswordRequest,
} from "../../controllers/auth/auth.controller";

import { validate } from "../../middleware/validate.middleware";

import {
  registerSchema,
  loginSchema,
  verifyOtpSchema,
  resendOtpSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "../../validators/auth/auth.validator";

import {
  authRateLimiter,
  otpVerifyLimiter,
  otpResendLimiter,
} from "../../middleware/rateLimit.middleware";

const router = Router();

router.post("/register", authRateLimiter, validate(registerSchema), registerUser);

router.post("/verify-otp", otpVerifyLimiter, validate(verifyOtpSchema), verifyOtpRequest);

router.post("/resend-otp", otpResendLimiter, validate(resendOtpSchema), resendOtpRequest);

router.post("/login", authRateLimiter, validate(loginSchema), loginUser);

router.post("/forgot-password", authRateLimiter, validate(forgotPasswordSchema), forgotPasswordRequest);

router.post("/reset-password", authRateLimiter, validate(resetPasswordSchema), resetPasswordRequest);

export default router;
