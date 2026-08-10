import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";

import {
  register,
  login,
  verifyOtp,
  resendOtp,
  forgotPassword,
  resetPassword,
} from "../../services/auth/auth.service";

import {
  registerSchema,
  loginSchema,
  verifyOtpSchema,
  resendOtpSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "../../validators/auth/auth.validator";

export const registerUser = asyncHandler(async (req: Request, res: Response) => {
  const validatedData = registerSchema.parse(req.body);

  const result = await register(validatedData);

  res.status(201).json({
    success: true,
    message: "OTP sent — verify your email to create your account",
    data: result,
  });
});

export const verifyOtpRequest = asyncHandler(
  async (req: Request, res: Response) => {
    const { email, code } = verifyOtpSchema.parse(req.body);

    const result = await verifyOtp(email, code);

    res.status(200).json({
      success: true,
      message: "Email verified — your account is ready",
      data: result,
    });
  }
);

export const resendOtpRequest = asyncHandler(
  async (req: Request, res: Response) => {
    const { email } = resendOtpSchema.parse(req.body);

    const result = await resendOtp(email);

    res.status(200).json({
      success: true,
      message: "A new code has been sent to your email",
      data: result,
    });
  }
);

export const loginUser = asyncHandler(async (req: Request, res: Response) => {
  const validatedData = loginSchema.parse(req.body);

  const result = await login(validatedData);

  res.status(200).json({
    success: true,
    message: "Login successful",
    data: result,
  });
});

export const forgotPasswordRequest = asyncHandler(
  async (req: Request, res: Response) => {
    const { email } = forgotPasswordSchema.parse(req.body);

    const result = await forgotPassword(email);

    res.status(200).json({
      success: true,
      ...result,
    });
  }
);

export const resetPasswordRequest = asyncHandler(
  async (req: Request, res: Response) => {
    const { token, password } = resetPasswordSchema.parse(req.body);

    const result = await resetPassword(token, password);

    res.status(200).json({
      success: true,
      ...result,
    });
  }
);
