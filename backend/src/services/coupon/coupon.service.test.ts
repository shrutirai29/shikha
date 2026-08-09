import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../../models/coupon/coupon.model", () => ({
  default: {
    findOne: vi.fn(),
    countDocuments: vi.fn(),
    find: vi.fn(),
    findById: vi.fn(),
    create: vi.fn(),
  },
}));

vi.mock("../../models/cart/cart.model", () => ({
  default: {
    findOne: vi.fn(),
  },
}));

import Coupon from "../../models/coupon/coupon.model";
import Cart from "../../models/cart/cart.model";
import {
  applyCoupon,
  createCoupon,
  removeCoupon,
} from "./coupon.service";
import { ConflictError } from "../../errors/ConflictError";
import { NotFoundError } from "../../errors/NotFoundError";

describe("coupon.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createCoupon", () => {
    it("uppercases the coupon code", async () => {
      (Coupon.findOne as any).mockResolvedValue(null);
      (Coupon.create as any).mockResolvedValue({ code: "SAVE10" });

      const result = await createCoupon({
        code: "save10",
        description: "Save 10 percent",
        discountType: "PERCENTAGE",
        discountValue: 10,
        minimumPurchase: 0,
        maximumDiscount: 0,
        usageLimit: 5,
        expiresAt: new Date(),
      });

      expect(Coupon.create).toHaveBeenCalledWith(
        expect.objectContaining({ code: "SAVE10" })
      );
      expect(result).toEqual({ code: "SAVE10" });
    });

    it("throws when the coupon code already exists", async () => {
      (Coupon.findOne as any).mockResolvedValue({ code: "SAVE10" });

      await expect(
        createCoupon({
          code: "SAVE10",
          description: "Save 10 percent",
          discountType: "PERCENTAGE",
          discountValue: 10,
          minimumPurchase: 0,
          maximumDiscount: 0,
          usageLimit: 5,
          expiresAt: new Date(),
        })
      ).rejects.toBeInstanceOf(ConflictError);
    });
  });

  describe("applyCoupon", () => {
    const cart = {
      user: "user1",
      items: [{ product: "p1", quantity: 1 }],
      totalAmount: 1000,
      coupon: null,
      discount: 0,
      finalAmount: 1000,
      save: vi.fn(),
      populate: vi.fn().mockResolvedValue({}),
    };

    const validCoupon = {
      code: "SAVE10",
      isActive: true,
      expiresAt: new Date(Date.now() + 86400000),
      usedCount: 0,
      usageLimit: 5,
      minimumPurchase: 500,
      discountType: "PERCENTAGE",
      discountValue: 10,
      maximumDiscount: 0,
      _id: "coupon1",
    };

    it("applies a percentage discount capped by maximumDiscount", async () => {
      (Cart.findOne as any).mockResolvedValue(cart);
      (Coupon.findOne as any).mockResolvedValue({
        ...validCoupon,
        maximumDiscount: 50,
      });

      const result = await applyCoupon("user1", { code: "SAVE10" });

      expect(cart.discount).toBe(50);
      expect(cart.finalAmount).toBe(950);
      expect(result).toEqual({});
    });

    it("rejects an expired coupon", async () => {
      (Cart.findOne as any).mockResolvedValue(cart);
      (Coupon.findOne as any).mockResolvedValue({
        ...validCoupon,
        expiresAt: new Date(Date.now() - 1000),
      });

      await expect(
        applyCoupon("user1", { code: "SAVE10" })
      ).rejects.toBeInstanceOf(ConflictError);
    });

    it("rejects when the usage limit is reached", async () => {
      (Cart.findOne as any).mockResolvedValue(cart);
      (Coupon.findOne as any).mockResolvedValue({
        ...validCoupon,
        usedCount: 5,
      });

      await expect(
        applyCoupon("user1", { code: "SAVE10" })
      ).rejects.toBeInstanceOf(ConflictError);
    });

    it("rejects when the cart is below the minimum purchase", async () => {
      (Cart.findOne as any).mockResolvedValue(cart);
      (Coupon.findOne as any).mockResolvedValue({
        ...validCoupon,
        minimumPurchase: 2000,
      });

      await expect(
        applyCoupon("user1", { code: "SAVE10" })
      ).rejects.toBeInstanceOf(ConflictError);
    });

    it("throws when the coupon does not exist", async () => {
      (Cart.findOne as any).mockResolvedValue(cart);
      (Coupon.findOne as any).mockResolvedValue(null);

      await expect(
        applyCoupon("user1", { code: "NOPE" })
      ).rejects.toBeInstanceOf(NotFoundError);
    });
  });

  describe("removeCoupon", () => {
    it("clears the coupon and restores the total", async () => {
      const cart = {
        coupon: "coupon1",
        discount: 100,
        finalAmount: 900,
        totalAmount: 1000,
        save: vi.fn(),
      };

      (Cart.findOne as any).mockResolvedValue(cart);

      const result = await removeCoupon("user1");

      expect(cart.coupon).toBeNull();
      expect(cart.discount).toBe(0);
      expect(cart.finalAmount).toBe(1000);
      expect(result).toBe(cart);
    });

    it("throws when the cart does not exist", async () => {
      (Cart.findOne as any).mockResolvedValue(null);

      await expect(removeCoupon("user1")).rejects.toBeInstanceOf(
        NotFoundError
      );
    });
  });
});
