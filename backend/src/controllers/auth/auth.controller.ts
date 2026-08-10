import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";

import {
  register,
  login,
  forgotPassword,
  resetPassword,
} from "../../services/auth/auth.service";

import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "../../validators/auth/auth.validator";

export const registerUser = asyncHandler(async (req: Request, res: Response) => {
  const validatedData = registerSchema.parse(req.body);

  const result = await register(validatedData);

  res.status(201).json({
    success: true,
    message: "Registration successful — welcome to Shikha!",
    data: result,
  });
});

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
