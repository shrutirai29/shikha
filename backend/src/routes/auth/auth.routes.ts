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
 *     summary: Register a new customer account
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name: { type: string }
 *               email: { type: string, format: email }
 *               password: { type: string, minLength: 6 }
 *               phone: { type: string }
 *     responses:
 *       201:
 *         description: User registered
 *       409:
 *         description: Email already registered
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
 * /auth/verify-email:
 *   post:
 *     summary: Verify email address with a token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [token]
 *             properties:
 *               token: { type: string }
 *     responses:
 *       200:
 *         description: Email verified
 */

/**
 * @swagger
 * /auth/resend-verification:
 *   post:
 *     summary: Resend the email verification link
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
 *         description: Verification email sent
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
  verifyEmailAddress,
  resendVerification,
  forgotPasswordRequest,
  resetPasswordRequest,
  verifyCodeRequest,
  resendCodeRequest,
} from "../../controllers/auth/auth.controller";

import { verifyCodeLimiter } from "../../middleware/rateLimit.middleware";

const router = Router();

router.post("/register", registerUser);

router.post("/login", loginUser);

router.post("/verify-email", verifyEmailAddress);

router.post("/resend-verification", resendVerification);

router.post("/verify-code", verifyCodeLimiter, verifyCodeRequest);

router.post("/resend-code", verifyCodeLimiter, resendCodeRequest);

router.post("/forgot-password", forgotPasswordRequest);

router.post("/reset-password", resetPasswordRequest);

export default router;