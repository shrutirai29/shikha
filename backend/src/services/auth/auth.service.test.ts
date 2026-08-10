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

vi.mock("../../utils/jwt", () => ({
  generateAccessToken: vi.fn().mockReturnValue("jwt-token"),
}));

vi.mock("../email/email.service", () => ({
  sendPasswordResetEmail: vi.fn().mockResolvedValue(undefined),
}));

import bcrypt from "bcrypt";
import User from "../../models/auth/auth.model";
import {
  register,
  login,
  forgotPassword,
  resetPassword,
} from "./auth.service";
import { ConflictError } from "../../errors/ConflictError";
import { UnauthorizedError } from "../../errors/UnauthorizedError";

describe("auth.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("register", () => {
    it("creates a verified account and returns a token immediately", async () => {
      (User.findOne as any).mockResolvedValue(null);
      (User.create as any).mockResolvedValue({
        _id: "user1",
        name: "Test User",
        email: "test@example.com",
        role: "customer",
        isVerified: true,
        phoneVerified: true,
        phone: "+91 90000 00000",
      });

      const result = await register({
        name: "Test User",
        email: "TEST@EXAMPLE.COM",
        password: "secret123",
        phone: "+91 90000 00000",
      });

      expect(bcrypt.hash).toHaveBeenCalledWith("secret123", 10);
      expect(User.create).toHaveBeenCalledWith(
        expect.objectContaining({ email: "test@example.com", role: "customer" })
      );
      expect(result.token).toBe("jwt-token");
      expect(result.verificationRequired).toEqual([]);
      expect(result.user.isVerified).toBe(true);
    });

    it("rejects a duplicate email", async () => {
      (User.findOne as any).mockResolvedValue({ email: "taken@example.com" });

      await expect(
        register({
          name: "Test User",
          email: "taken@example.com",
          password: "secret123",
          phone: "+91 90000 00000",
        })
      ).rejects.toBeInstanceOf(ConflictError);
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

    it("rejects an unknown email", async () => {
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
