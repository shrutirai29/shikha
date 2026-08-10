import bcrypt from "bcrypt";
import crypto from "crypto";
import User from "../../models/auth/auth.model";
import PendingRegistration from "../../models/auth/pending-registration.model";

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
import { env } from "../../config/env";

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

const OTP_TTL_MS = 10 * 60 * 1000;

const getVerificationRequired = (user: any): string[] => {
  const required: string[] = [];

  if (!user.isVerified) {
    required.push("email");
  }

  if (user.phone && !user.phoneVerified) {
    required.push("phone");
  }

  return required;
};

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
    verificationRequired: getVerificationRequired(user),
  };
};

export const generateOtp = (): string =>
  String(crypto.randomInt(100000, 999999));

const getPendingVerificationRequired = (pending: any): string[] => {
  const required: string[] = [];

  if (!pending.emailVerified) {
    required.push("email");
  }

  if (!pending.phoneVerified) {
    required.push("phone");
  }

  return required;
};

/**
 * Verify a 6-digit code for the email or phone channel. Kept for legacy
 * pending registrations / accounts created before verification was removed.
 */
export const verifyCode = async (
  email: string,
  type: "email" | "phone",
  code: string
) => {
  const normalizedEmail = email.toLowerCase();

  const pending = await PendingRegistration.findOne({
    email: normalizedEmail,
  });

  if (pending) {
    if (type === "email") {
      if (pending.emailVerified) {
        throw new ConflictError("Email is already verified");
      }

      if (
        !pending.emailOtpCode ||
        !pending.emailOtpExpires ||
        pending.emailOtpExpires < new Date()
      ) {
        throw new UnauthorizedError(
          "Verification code has expired — request a new one"
        );
      }

      if (pending.emailOtpCode !== code) {
        throw new UnauthorizedError("Incorrect verification code");
      }

      pending.emailVerified = true;
      pending.emailOtpCode = null;
      pending.emailOtpExpires = null;
    } else {
      if (pending.phoneVerified) {
        throw new ConflictError("Phone is already verified");
      }

      if (
        !pending.phoneOtpCode ||
        !pending.phoneOtpExpires ||
        pending.phoneOtpExpires < new Date()
      ) {
        throw new UnauthorizedError(
          "Verification code has expired — request a new one"
        );
      }

      if (pending.phoneOtpCode !== code) {
        throw new UnauthorizedError("Incorrect verification code");
      }

      pending.phoneVerified = true;
      pending.phoneOtpCode = null;
      pending.phoneOtpExpires = null;
    }

    const verificationRequired = getPendingVerificationRequired(pending);

    if (verificationRequired.length === 0) {
      const user = await User.create({
        name: pending.name,
        email: pending.email,
        password: pending.passwordHash,
        phone: pending.phone,
        role: "customer",
        isVerified: true,
        phoneVerified: true,
        isActive: true,
      });

      await PendingRegistration.deleteOne({ _id: pending._id });

      return {
        message: "Account verified — welcome to Shikha!",
        verificationRequired: [],
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          isVerified: user.isVerified,
          phoneVerified: user.phoneVerified,
        },
      };
    }

    await pending.save();

    return {
      message:
        type === "email"
          ? "Email verified — now verify your phone"
          : "Phone verified — now verify your email",
      verificationRequired,
      pending: true,
    };
  }

  // Legacy path: the account already exists as a User.
  const user = await User.findOne({
    email: normalizedEmail,
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
  const normalizedEmail = email.toLowerCase();

  const pending = await PendingRegistration.findOne({
    email: normalizedEmail,
  });

  if (pending) {
    if (type === "email" && pending.emailVerified) {
      throw new ConflictError("Email is already verified");
    }

    if (type === "phone" && pending.phoneVerified) {
      throw new ConflictError("Phone is already verified");
    }

    const code = generateOtp();
    const devCodes: { email?: string; phone?: string } = {};

    if (type === "email") {
      pending.emailOtpCode = code;
      pending.emailOtpExpires = new Date(Date.now() + OTP_TTL_MS);
      await pending.save();

      const result = await sendOtpEmail(pending.email, code);

      if (!result.delivered) {
        devCodes.email = code;
      }
    } else {
      pending.phoneOtpCode = code;
      pending.phoneOtpExpires = new Date(Date.now() + OTP_TTL_MS);
      await pending.save();

      const result = await sendOtpSms(pending.email, pending.phone, code);

      if (!result.delivered) {
        devCodes.phone = code;
      }
    }

    return {
      message: "A new verification code has been sent",
      ...(Object.keys(devCodes).length > 0 ? { devCodes } : {}),
    };
  }

  const user = await User.findOne({
    email: normalizedEmail,
  });

  if (!user) {
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
  const devCodes: { email?: string; phone?: string } = {};

  if (type === "email") {
    user.emailOtpCode = code;
    user.emailOtpExpires = new Date(Date.now() + OTP_TTL_MS);
    await user.save();

    const result = await sendOtpEmail(user.email, code);

    if (!result.delivered) {
      devCodes.email = code;
    }
  } else {
    user.phoneOtpCode = code;
    user.phoneOtpExpires = new Date(Date.now() + OTP_TTL_MS);
    await user.save();

    const result = await sendOtpSms(user.email, user.phone ?? "", code);

    if (!result.delivered) {
      devCodes.phone = code;
    }
  }

  return {
    message: "A new verification code has been sent",
    ...(Object.keys(devCodes).length > 0 ? { devCodes } : {}),
  };
};

/**
 * Whether email delivery is configured. Email can be sent via an HTTPS email
 * API (EMAIL_API_KEY, e.g. Brevo) or SMTP. Phone codes fall back to email, so
 * dev codes for both channels are only exposed when no provider is set.
 */
const isEmailDeliveryConfigured = (): boolean => {
  const config = env();

  return Boolean(
    config.EMAIL_API_KEY ||
      (config.SMTP_HOST && config.SMTP_USER && config.SMTP_PASS)
  );
};

export const getVerifyStatus = async (email: string) => {
  const normalizedEmail = email.toLowerCase();

  const pending = await PendingRegistration.findOne({
    email: normalizedEmail,
  });

  if (pending) {
    const devCodes: { email?: string; phone?: string } = {};

    if (!isEmailDeliveryConfigured()) {
      if (!pending.emailVerified && pending.emailOtpCode) {
        devCodes.email = pending.emailOtpCode;
      }

      if (!pending.phoneVerified && pending.phoneOtpCode) {
        devCodes.phone = pending.phoneOtpCode;
      }
    }

    return {
      pending: true,
      email: pending.email,
      verificationRequired: getPendingVerificationRequired(pending),
      ...(Object.keys(devCodes).length > 0 ? { devCodes } : {}),
    };
  }

  const user = await User.findOne({ email: normalizedEmail });

  if (user) {
    const devCodes: { email?: string; phone?: string } = {};

    if (!isEmailDeliveryConfigured()) {
      if (!user.isVerified && user.emailOtpCode) {
        devCodes.email = user.emailOtpCode;
      }

      if (!user.phoneVerified && user.phoneOtpCode) {
        devCodes.phone = user.phoneOtpCode;
      }
    }

    return {
      pending: false,
      email: user.email,
      verificationRequired: getVerificationRequired(user),
      ...(Object.keys(devCodes).length > 0 ? { devCodes } : {}),
    };
  }

  return {
    pending: false,
    email: normalizedEmail,
    verificationRequired: ["email", "phone"],
    notFound: true,
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
