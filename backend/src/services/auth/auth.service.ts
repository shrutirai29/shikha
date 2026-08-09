import bcrypt from "bcrypt";
import crypto from "crypto";
import User from "../../models/auth/auth.model";

import { ConflictError } from "../../errors/ConflictError";
import { UnauthorizedError } from "../../errors/UnauthorizedError";
import { ForbiddenError } from "../../errors/ForbiddenError";
import { NotFoundError } from "../../errors/NotFoundError";

import { generateAccessToken } from "../../utils/jwt";

import {
  sendVerificationEmail,
  sendOtpEmail,
  sendPasswordResetEmail,
} from "../email/email.service";
import { sendOtpSms } from "../sms/sms.service";

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

export const generateOtp = (): string =>
  String(crypto.randomInt(100000, 999999));

export const register = async (data: RegisterDto) => {
  const existingUser = await User.findOne({
    email: data.email.toLowerCase(),
  });

  if (existingUser) {
    throw new ConflictError("Email already registered");
  }

  const hashedPassword = await bcrypt.hash(data.password, 10);

  const emailOtp = generateOtp();
  const phoneOtp = generateOtp();

  const user = await User.create({
    name: data.name,
    email: data.email.toLowerCase(),
    password: hashedPassword,
    phone: data.phone,
    role: "customer",
    emailOtpCode: emailOtp,
    emailOtpExpires: new Date(Date.now() + OTP_TTL_MS),
    phoneOtpCode: phoneOtp,
    phoneOtpExpires: new Date(Date.now() + OTP_TTL_MS),
  });

  // Verify both channels: email OTP by email, phone OTP by SMS (or email fallback).
  await Promise.allSettled([
    sendOtpEmail(user.email, emailOtp),
    sendOtpSms(user.email, user.phone ?? "", phoneOtp),
  ]);

  return {
    id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    isVerified: user.isVerified,
    phoneVerified: user.phoneVerified,
    verificationRequired: getVerificationRequired(user),
  };
};

const getVerificationRequired = (user: any): string[] => {
  const required: string[] = [];

  if (!user.isVerified) {
    required.push("email");
  }

  // Accounts created before phone verification existed have no phone;
  // treat them as verified rather than locking legacy users out.
  if (user.phone && !user.phoneVerified) {
    required.push("phone");
  }

  return required;
};

export const login = async (data: LoginDto) => {
  const user = await User.findOne({
    email: data.email.toLowerCase(),
  });

  if (!user) {
    throw new UnauthorizedError("Invalid email or password");
  }

  const isMatch = await bcrypt.compare(
    data.password,
    user.password
  );

  if (!isMatch) {
    throw new UnauthorizedError("Invalid email or password");
  }

  const verificationRequired = getVerificationRequired(user);

  // Accounts are not usable until BOTH the email and phone are verified.
  // Do not issue a token — the user must verify first via /verify.
  if (verificationRequired.length > 0) {
    throw new ForbiddenError(
      "Please verify your email and phone number before logging in. We sent codes to your email and phone.",
      "ACCOUNT_NOT_VERIFIED"
    );
  }

  if (!user.isActive) {
    throw new ForbiddenError("Account is inactive");
  }

  const token = generateAccessToken(
    user._id.toString(),
    user.role
  );

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
    verificationRequired: getVerificationRequired(user),
  };
};

export const verifyCode = async (
  email: string,
  type: "email" | "phone",
  code: string
) => {
  const user = await User.findOne({
    email: email.toLowerCase(),
  });

  if (!user) {
    throw new NotFoundError("No account found with this email");
  }

  if (type === "email") {
    if (user.isVerified) {
      throw new ConflictError("Email is already verified");
    }

    if (
      !user.emailOtpCode ||
      !user.emailOtpExpires ||
      user.emailOtpExpires < new Date()
    ) {
      throw new UnauthorizedError(
        "Verification code has expired — request a new one"
      );
    }

    if (user.emailOtpCode !== code) {
      throw new UnauthorizedError("Incorrect verification code");
    }

    user.isVerified = true;
    user.emailOtpCode = null;
    user.emailOtpExpires = null;
  } else {
    if (user.phoneVerified) {
      throw new ConflictError("Phone is already verified");
    }

    if (
      !user.phoneOtpCode ||
      !user.phoneOtpExpires ||
      user.phoneOtpExpires < new Date()
    ) {
      throw new UnauthorizedError(
        "Verification code has expired — request a new one"
      );
    }

    if (user.phoneOtpCode !== code) {
      throw new UnauthorizedError("Incorrect verification code");
    }

    user.phoneVerified = true;
    user.phoneOtpCode = null;
    user.phoneOtpExpires = null;
  }

  await user.save();

  return {
    message:
      type === "email"
        ? "Email verified successfully"
        : "Phone verified successfully",
    verificationRequired: getVerificationRequired(user),
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      isVerified: user.isVerified,
      phoneVerified: user.phoneVerified,
    },
  };
};

export const resendCode = async (
  email: string,
  type: "email" | "phone"
) => {
  const user = await User.findOne({
    email: email.toLowerCase(),
  });

  if (!user) {
    // Do not reveal whether an account exists.
    return {
      message: "If the account exists, a new code has been sent",
    };
  }

  if (type === "email" && user.isVerified) {
    throw new ConflictError("Email is already verified");
  }

  if (type === "phone" && user.phoneVerified) {
    throw new ConflictError("Phone is already verified");
  }

  const code = generateOtp();

  if (type === "email") {
    user.emailOtpCode = code;
    user.emailOtpExpires = new Date(Date.now() + OTP_TTL_MS);
    await user.save();
    await sendOtpEmail(user.email, code);
  } else {
    user.phoneOtpCode = code;
    user.phoneOtpExpires = new Date(Date.now() + OTP_TTL_MS);
    await user.save();
    await sendOtpSms(user.email, user.phone ?? "", code);
  }

  return {
    message: "A new verification code has been sent",
  };
};

export const verifyEmail = async (token: string) => {
  const user = await User.findOne({
    verificationToken: token,
  });

  if (!user) {
    throw new NotFoundError("Invalid or expired verification token");
  }

  user.isVerified = true;
  user.verificationToken = null;

  await user.save();

  return {
    message: "Email verified successfully",
  };
};

export const resendVerificationEmail = async (email: string) => {
  const user = await User.findOne({
    email: email.toLowerCase(),
  });

  if (!user) {
    throw new NotFoundError("No account found with this email");
  }

  if (user.isVerified) {
    throw new ConflictError("Email is already verified");
  }

  const verificationToken = crypto.randomBytes(32).toString("hex");

  user.verificationToken = verificationToken;

  await user.save();

  await sendVerificationEmail(user.email, verificationToken);

  return {
    message: "Verification email sent",
  };
};

export const forgotPassword = async (email: string) => {
  const user = await User.findOne({
    email: email.toLowerCase(),
  });

  if (!user) {
    // Do not reveal whether an account exists
    return {
      message:
        "If an account exists for this email, a reset link has been sent",
    };
  }

  const resetToken = crypto.randomBytes(32).toString("hex");

  user.resetPasswordToken = resetToken;
  user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await user.save();

  await sendPasswordResetEmail(user.email, resetToken);

  return {
    message:
      "If an account exists for this email, a reset link has been sent",
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
