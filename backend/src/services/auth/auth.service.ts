import bcrypt from "bcrypt";
import crypto from "crypto";
import User from "../../models/auth/auth.model";

import { ConflictError } from "../../errors/ConflictError";
import { UnauthorizedError } from "../../errors/UnauthorizedError";
import { ForbiddenError } from "../../errors/ForbiddenError";

import { generateAccessToken } from "../../utils/jwt";

import { sendPasswordResetEmail } from "../email/email.service";

interface RegisterDto {
  name: string;
  email: string;
  password: string;
  phone: string;
}

interface LoginDto {
  email: string;
  password: string;
}

/**
 * Register a new customer account. The account is created immediately and is
 * fully usable — no email/phone verification required.
 */
export const register = async (data: RegisterDto) => {
  const email = data.email.toLowerCase();

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new ConflictError("Email already registered");
  }

  const hashedPassword = await bcrypt.hash(data.password, 10);

  const user = await User.create({
    name: data.name,
    email,
    password: hashedPassword,
    phone: data.phone,
    role: "customer",
    isVerified: true,
    phoneVerified: true,
    isActive: true,
  });

  const token = generateAccessToken(user._id.toString(), user.role);

  return {
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
      phoneVerified: user.phoneVerified,
      phone: user.phone,
    },
    verificationRequired: [],
  };
};

export const login = async (data: LoginDto) => {
  const user = await User.findOne({
    email: data.email.toLowerCase(),
  });

  if (!user) {
    throw new UnauthorizedError("Invalid email or password");
  }

  const isMatch = await bcrypt.compare(data.password, user.password);

  if (!isMatch) {
    throw new UnauthorizedError("Invalid email or password");
  }

  if (!user.isActive) {
    throw new ForbiddenError("Account is inactive");
  }

  const token = generateAccessToken(user._id.toString(), user.role);

  return {
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
      phoneVerified: user.phoneVerified,
      phone: user.phone,
    },
    verificationRequired: [],
  };
};

export const forgotPassword = async (email: string) => {
  const user = await User.findOne({
    email: email.toLowerCase(),
  });

  if (!user) {
    return {
      message: "If an account exists for this email, a reset link has been sent",
    };
  }

  const resetToken = crypto.randomBytes(32).toString("hex");

  user.resetPasswordToken = resetToken;
  user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000);

  await user.save();

  await sendPasswordResetEmail(user.email, resetToken);

  return {
    message: "If an account exists for this email, a reset link has been sent",
  };
};

export const resetPassword = async (token: string, newPassword: string) => {
  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: new Date() },
  });

  if (!user) {
    throw new UnauthorizedError("Invalid or expired reset token");
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  user.password = hashedPassword;
  user.resetPasswordToken = null;
  user.resetPasswordExpires = null;

  await user.save();

  return {
    message: "Password reset successfully",
  };
};
