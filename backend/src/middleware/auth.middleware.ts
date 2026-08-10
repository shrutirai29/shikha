import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../models/auth/auth.model";
import { AppError } from "../errors/AppError";
import { IUser } from "../interfaces/auth/auth.interface";

export interface AuthRequest extends Request {
  user?: IUser;
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new AppError("Access denied. No token provided.", 401);
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as { id: string };

    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      throw new AppError("User not found.", 404);
    }

    if (!user.isActive) {
      throw new AppError("Account is inactive.", 403);
    }

    req.user = user;

    next();
  } catch (error) {
    // Expired sessions should be a clean 401, not a 500 — the frontend
    // relies on this to log the user out and send them to /login.
    if (error instanceof jwt.TokenExpiredError) {
      next(new AppError("Session expired. Please log in again.", 401, "TOKEN_EXPIRED"));
      return;
    }

    if (error instanceof jwt.JsonWebTokenError) {
      next(new AppError("Invalid token. Please log in again.", 401));
      return;
    }

    next(error);
  }
};
