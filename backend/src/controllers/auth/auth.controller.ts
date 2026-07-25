import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";

import {
  register,
  login,
} from "../../services/auth/auth.service";

import {
  registerSchema,
  loginSchema,
} from "../../validators/auth/auth.validator";

export const registerUser = asyncHandler(async (req: Request, res: Response) => {
  const validatedData = registerSchema.parse(req.body);

  const user = await register(validatedData);

  res.status(201).json({
    success: true,
    message: "User registered successfully",
    data: user,
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