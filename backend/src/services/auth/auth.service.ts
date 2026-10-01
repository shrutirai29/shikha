import bcrypt from "bcrypt";
import crypto from "crypto";
import User from "../../models/auth/auth.model";
import PendingRegistration from "../../models/auth/pending-registration.model";

import { ConflictError } from "../../errors/ConflictError";
import { UnauthorizedError } from "../../errors/UnauthorizedError";
import { ForbiddenError } from "../../errors/ForbiddenError";
import { BadRequestError } from "../../errors/BadRequestError";

import { generateAccessToken } from "../../utils/jwt";
import { env } from "../../config/env";

import {
  sendPasswordResetEmail,
  sendVerificationOtpEmail,
} from "../email/email.service";

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

const OTP_TTL_MS = 10 * 60 * 1000; // 10 minutes
const MAX_OTP_ATTEMPTS = 5;
const RESEND_COOLDOWN_MS = 60 * 1000; // 1 minute

const generateOtp = (): string =>
  crypto.randomInt(100000, 1000000).toString();

/**
 * Register a new customer. No account is created yet — a 6-digit OTP is sent
 * to the email, and the account is only created once it is verified via
 * verifyOtp(). A pending registration is stored (auto-expires after 30 min).
 */
export const register = async (data: RegisterDto) => {
  const email = data.email.toLowerCase();

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new ConflictError("Email already registered");
  }

  // Allow re-registering after the previous OTP expired, but reject an active
  // pending registration to avoid OTP spam.
  const existingPending = await PendingRegistration.findOne({ email });

  if (existingPending && existingPending.otpExpiresAt > new Date()) {
    throw new ConflictError(
      "An OTP was already sent to this email. Check your inbox or wait for it to expire."
    );
  }

  if (existingPending) {
    await PendingRegistration.deleteOne({ email });
  }

  const hashedPassword = await bcrypt.hash(data.password, 10);
  const otp = generateOtp();
  const now = new Date();

  await PendingRegistration.create({
    name: data.name,
    email,
    phone: data.phone,
    password: hashedPassword,
    otp,
    otpExpiresAt: new Date(now.getTime() + OTP_TTL_MS),
    otpAttempts: 0,
    lastOtpSentAt: now,
  });

  const { delivered } = await sendVerificationOtpEmail(email, otp);

  return {
    message: "OTP sent to your email — verify it to create your account",
    email,
    delivered,
  };
};

export const verifyOtp = async (email: string, code: string) => {
  const normalizedEmail = email.toLowerCase();

  const pending = await PendingRegistration.findOne({
    email: normalizedEmail,
  });

  if (!pending) {
    throw new UnauthorizedError(
      "No pending registration found for this email"
    );
  }

  if (pending.otpExpiresAt < new Date()) {
    await PendingRegistration.deleteOne({ email: normalizedEmail });
    throw new UnauthorizedError(
      "This code has expired. Please register again to receive a new one."
    );
  }

  if (pending.otpAttempts >= MAX_OTP_ATTEMPTS) {
    throw new BadRequestError(
      "Too many incorrect attempts. Please request a new code."
    );
  }

  if (pending.otp !== code) {
    pending.otpAttempts += 1;
    await pending.save();
    throw new BadRequestError("Invalid verification code");
  }

  const user = await User.create({
    name: pending.name,
    email: pending.email,
    password: pending.password,
    phone: pending.phone,
    role: "customer",
    isVerified: true,
    phoneVerified: true,
    isActive: true,
  });

  await PendingRegistration.deleteOne({ email: normalizedEmail });

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
  };
};

export const resendOtp = async (email: string) => {
  const normalizedEmail = email.toLowerCase();

  const pending = await PendingRegistration.findOne({
    email: normalizedEmail,
  });

  if (!pending) {
    throw new UnauthorizedError(
      "No pending registration found for this email"
    );
  }

  const waitMs =
    RESEND_COOLDOWN_MS -
    (Date.now() - new Date(pending.lastOtpSentAt).getTime());

  if (waitMs > 0) {
    throw new ConflictError(
      `Please wait ${Math.ceil(waitMs / 1000)} seconds before requesting a new code`
    );
  }

  const otp = generateOtp();

  pending.otp = otp;
  pending.otpAttempts = 0;
  pending.otpExpiresAt = new Date(Date.now() + OTP_TTL_MS);
  pending.lastOtpSentAt = new Date();

  await pending.save();

  const { delivered } = await sendVerificationOtpEmail(
    normalizedEmail,
    otp
  );

  return {
    message: "A new code has been sent to your email",
    email: normalizedEmail,
    delivered,
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
      _id: user._id,
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
      delivered: false,
    };
  }

  const resetToken = crypto.randomBytes(32).toString("hex");

  user.resetPasswordToken = resetToken;
  user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000);

  await user.save();

  const emailResult = await sendPasswordResetEmail(user.email, resetToken);
  const delivered = Boolean(emailResult?.delivered);

  const clientUrl = env().CLIENT_URL ?? "http://localhost:5173";
  const resetLink = `${clientUrl}/reset-password?token=${resetToken}`;

  const isDevOrLocal = process.env.NODE_ENV !== "production";

  return {
    message: delivered
      ? "Password reset link has been sent to your email"
      : "If an account exists for this email, a reset link has been generated",
    delivered,
    resetLink: !delivered || isDevOrLocal ? resetLink : undefined,
    resetToken: !delivered || isDevOrLocal ? resetToken : undefined,
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
