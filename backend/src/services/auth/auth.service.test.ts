import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("bcrypt", () => ({
  default: {
    hash: vi.fn().mockResolvedValue("hashed-password"),
    compare: vi.fn(),
  },
}));

vi.mock("../../models/auth/auth.model", () => ({
  default: {
    findOne: vi.fn(),
    create: vi.fn(),
  },
}));

vi.mock("../../models/auth/pending-registration.model", () => ({
  default: {
    findOne: vi.fn(),
    create: vi.fn(),
    deleteOne: vi.fn(),
  },
}));

vi.mock("../../utils/jwt", () => ({
  generateAccessToken: vi.fn().mockReturnValue("jwt-token"),
}));

vi.mock("../email/email.service", () => ({
  sendPasswordResetEmail: vi.fn().mockResolvedValue(undefined),
  sendVerificationOtpEmail: vi
    .fn()
    .mockResolvedValue({ delivered: true }),
}));

import bcrypt from "bcrypt";
import User from "../../models/auth/auth.model";
import PendingRegistration from "../../models/auth/pending-registration.model";
import {
  register,
  verifyOtp,
  resendOtp,
  login,
  forgotPassword,
  resetPassword,
} from "./auth.service";
import {
  sendVerificationOtpEmail,
  sendPasswordResetEmail,
} from "../email/email.service";
import { ConflictError } from "../../errors/ConflictError";
import { UnauthorizedError } from "../../errors/UnauthorizedError";
import { BadRequestError } from "../../errors/BadRequestError";

const REGISTER_INPUT = {
  name: "Test User",
  email: "TEST@EXAMPLE.COM",
  password: "secret123",
  phone: "+91 90000 00000",
};

const pendingDoc = (overrides: any = {}) => ({
  _id: "pending1",
  name: "Test User",
  email: "test@example.com",
  phone: "+91 90000 00000",
  password: "hashed-password",
  otp: "123456",
  otpExpiresAt: new Date(Date.now() + 10 * 60 * 1000),
  otpAttempts: 0,
  lastOtpSentAt: new Date(),
  save: vi.fn().mockResolvedValue(undefined),
  ...overrides,
});

describe("auth.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("register", () => {
    it("sends an OTP and does NOT create an account", async () => {
      (User.findOne as any).mockResolvedValue(null);
      (PendingRegistration.findOne as any).mockResolvedValue(null);
      (PendingRegistration.create as any).mockResolvedValue({});

      const result = await register(REGISTER_INPUT);

      expect(bcrypt.hash).toHaveBeenCalledWith("secret123", 10);
      expect(User.create).not.toHaveBeenCalled();
      expect(PendingRegistration.create).toHaveBeenCalledWith(
        expect.objectContaining({
          email: "test@example.com",
          otp: expect.stringMatching(/^\d{6}$/),
        })
      );
      expect(sendVerificationOtpEmail).toHaveBeenCalledWith(
        "test@example.com",
        expect.stringMatching(/^\d{6}$/)
      );
      expect(result.delivered).toBe(true);
      expect(result.email).toBe("test@example.com");
    });

    it("rejects an email that already has an account", async () => {
      (User.findOne as any).mockResolvedValue({ email: "taken@example.com" });

      await expect(register(REGISTER_INPUT)).rejects.toBeInstanceOf(
        ConflictError
      );
    });

    it("rejects a second registration while the first OTP is still valid", async () => {
      (User.findOne as any).mockResolvedValue(null);
      (PendingRegistration.findOne as any).mockResolvedValue(
        pendingDoc({ otpExpiresAt: new Date(Date.now() + 60 * 1000) })
      );

      await expect(register(REGISTER_INPUT)).rejects.toBeInstanceOf(
        ConflictError
      );
    });

    it("replaces an expired pending registration", async () => {
      (User.findOne as any).mockResolvedValue(null);
      (PendingRegistration.findOne as any).mockResolvedValue(
        pendingDoc({ otpExpiresAt: new Date(Date.now() - 1000) })
      );

      await register(REGISTER_INPUT);

      expect(PendingRegistration.deleteOne).toHaveBeenCalledWith({
        email: "test@example.com",
      });
      expect(PendingRegistration.create).toHaveBeenCalled();
    });
  });

  describe("verifyOtp", () => {
    it("creates the account and returns a token for the correct code", async () => {
      (PendingRegistration.findOne as any).mockResolvedValue(pendingDoc());
      (User.create as any).mockResolvedValue({
        _id: "user1",
        name: "Test User",
        email: "test@example.com",
        role: "customer",
        isVerified: true,
        phoneVerified: true,
        phone: "+91 90000 00000",
      });

      const result = await verifyOtp("test@example.com", "123456");

      expect(User.create).toHaveBeenCalledWith(
        expect.objectContaining({
          email: "test@example.com",
          password: "hashed-password",
          isVerified: true,
        })
      );
      expect(PendingRegistration.deleteOne).toHaveBeenCalledWith({
        email: "test@example.com",
      });
      expect(result.token).toBe("jwt-token");
      expect(result.user.isVerified).toBe(true);
    });

    it("rejects an unknown pending registration", async () => {
      (PendingRegistration.findOne as any).mockResolvedValue(null);

      await expect(
        verifyOtp("nobody@example.com", "123456")
      ).rejects.toBeInstanceOf(UnauthorizedError);
    });

    it("rejects an expired code and clears the pending registration", async () => {
      (PendingRegistration.findOne as any).mockResolvedValue(
        pendingDoc({ otpExpiresAt: new Date(Date.now() - 1000) })
      );

      await expect(
        verifyOtp("test@example.com", "123456")
      ).rejects.toBeInstanceOf(UnauthorizedError);

      expect(PendingRegistration.deleteOne).toHaveBeenCalled();
      expect(User.create).not.toHaveBeenCalled();
    });

    it("rejects a wrong code and increments the attempt counter", async () => {
      const pending = pendingDoc();
      (PendingRegistration.findOne as any).mockResolvedValue(pending);

      await expect(
        verifyOtp("test@example.com", "000000")
      ).rejects.toBeInstanceOf(BadRequestError);

      expect(pending.otpAttempts).toBe(1);
      expect(pending.save).toHaveBeenCalled();
      expect(User.create).not.toHaveBeenCalled();
    });

    it("blocks verification after too many failed attempts", async () => {
      (PendingRegistration.findOne as any).mockResolvedValue(
        pendingDoc({ otpAttempts: 5 })
      );

      await expect(
        verifyOtp("test@example.com", "123456")
      ).rejects.toBeInstanceOf(BadRequestError);

      expect(User.create).not.toHaveBeenCalled();
    });
  });

  describe("resendOtp", () => {
    it("sends a new code after the cooldown", async () => {
      (PendingRegistration.findOne as any).mockResolvedValue(
        pendingDoc({ lastOtpSentAt: new Date(Date.now() - 120 * 1000) })
      );

      const result = await resendOtp("test@example.com");

      expect(sendVerificationOtpEmail).toHaveBeenCalled();
      expect(result.delivered).toBe(true);
    });

    it("blocks resending during the 60s cooldown", async () => {
      (PendingRegistration.findOne as any).mockResolvedValue(pendingDoc());

      await expect(
        resendOtp("test@example.com")
      ).rejects.toBeInstanceOf(ConflictError);

      expect(sendVerificationOtpEmail).not.toHaveBeenCalled();
    });

    it("rejects resending for an email with no pending registration", async () => {
      (PendingRegistration.findOne as any).mockResolvedValue(null);

      await expect(
        resendOtp("nobody@example.com")
      ).rejects.toBeInstanceOf(UnauthorizedError);
    });
  });

  describe("login", () => {
    const user = {
      _id: "user1",
      name: "Test User",
      email: "test@example.com",
      password: "hashed-password",
      role: "customer",
      isVerified: true,
      phoneVerified: true,
      isActive: true,
      phone: "+91 90000 00000",
    };

    it("returns a token for valid credentials", async () => {
      (User.findOne as any).mockResolvedValue(user);
      (bcrypt.compare as any).mockResolvedValue(true);

      const result = await login({
        email: "test@example.com",
        password: "secret123",
      });

      expect(result.token).toBe("jwt-token");
      expect(result.verificationRequired).toEqual([]);
    });

    it("rejects an invalid password", async () => {
      (User.findOne as any).mockResolvedValue(user);
      (bcrypt.compare as any).mockResolvedValue(false);

      await expect(
        login({ email: "test@example.com", password: "wrong" })
      ).rejects.toBeInstanceOf(UnauthorizedError);
    });

    it("rejects an unknown email (account not verified yet)", async () => {
      (User.findOne as any).mockResolvedValue(null);

      await expect(
        login({ email: "nobody@example.com", password: "secret123" })
      ).rejects.toBeInstanceOf(UnauthorizedError);
    });

    it("rejects an inactive account", async () => {
      (User.findOne as any).mockResolvedValue({ ...user, isActive: false });
      (bcrypt.compare as any).mockResolvedValue(true);

      await expect(
        login({ email: "test@example.com", password: "secret123" })
      ).rejects.toThrow(/inactive/i);
    });
  });

  describe("forgotPassword / resetPassword", () => {
    it("returns a generic message even when the email is unknown", async () => {
      (User.findOne as any).mockResolvedValue(null);

      const result = await forgotPassword("nobody@example.com");

      expect(result.message).toContain("reset link");
    });

    it("stores a reset token and expires at on the user", async () => {
      const user = {
        email: "test@example.com",
        resetPasswordToken: null,
        resetPasswordExpires: null,
        save: vi.fn(),
      };

      (User.findOne as any).mockResolvedValue(user);

      await forgotPassword("test@example.com");

      expect(user.resetPasswordToken).toBeTruthy();
      expect(user.resetPasswordExpires).toBeInstanceOf(Date);
      expect(user.save).toHaveBeenCalled();
    });

    it("rejects an expired or unknown reset token", async () => {
      (User.findOne as any).mockResolvedValue(null);

      await expect(
        resetPassword("bad-token", "newpass123")
      ).rejects.toBeInstanceOf(UnauthorizedError);
    });

    it("re-hashes the password on a valid token", async () => {
      const user = {
        password: "old",
        resetPasswordToken: null,
        resetPasswordExpires: null,
        save: vi.fn(),
      };

      (User.findOne as any).mockResolvedValue(user);

      await resetPassword("good-token", "newpass123");

      expect(bcrypt.hash).toHaveBeenCalledWith("newpass123", 10);
      expect(user.password).toBe("hashed-password");
      expect(user.save).toHaveBeenCalled();
    });
  });
});
