import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../../models/review/review.model", () => ({
  default: {
    aggregate: vi.fn(),
    findOne: vi.fn(),
    countDocuments: vi.fn(),
    find: vi.fn(),
    findById: vi.fn(),
    create: vi.fn(),
  },
}));

vi.mock("../../models/product/product.model", () => ({
  default: {
    findById: vi.fn(),
    findByIdAndUpdate: vi.fn(),
  },
}));

vi.mock("../../models/order/order.model", () => ({
  default: {
    findOne: vi.fn(),
  },
}));

import Review from "../../models/review/review.model";
import Product from "../../models/product/product.model";
import Order from "../../models/order/order.model";

import { addReview, deleteReview, updateReview } from "./review.service";
import { ForbiddenError } from "../../errors/ForbiddenError";
import { ConflictError } from "../../errors/ConflictError";

describe("review.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("addReview", () => {
    it("rejects a review without a delivered purchase", async () => {
      (Product.findById as any).mockResolvedValue({ _id: "64b000000000000000000001" });
      (Review.findOne as any).mockResolvedValue(null);
      (Order.findOne as any).mockResolvedValue(null);

      await expect(
        addReview("64b000000000000000000002", "64b000000000000000000001", {
          rating: 5,
          comment: "Great product!",
        })
      ).rejects.toBeInstanceOf(ForbiddenError);
    });

    it("rejects a duplicate review", async () => {
      (Product.findById as any).mockResolvedValue({ _id: "64b000000000000000000001" });
      (Review.findOne as any).mockResolvedValue({ _id: "64b000000000000000000003" });

      await expect(
        addReview("64b000000000000000000002", "64b000000000000000000001", {
          rating: 5,
          comment: "Great product!",
        })
      ).rejects.toBeInstanceOf(ConflictError);
    });

    it("creates a verified review after a delivered order and updates the rating", async () => {
      (Product.findById as any).mockResolvedValue({ _id: "64b000000000000000000001" });
      (Review.findOne as any).mockResolvedValue(null);
      (Order.findOne as any).mockResolvedValue({
        _id: "64b000000000000000000004",
        orderStatus: "Delivered",
      });
      const review = {
        _id: "64b000000000000000000003",
        user: "64b000000000000000000002",
        product: "64b000000000000000000001",
        rating: 5,
        comment: "Great product!",
        verifiedPurchase: true,
        populate: vi.fn().mockResolvedValue({}),
      };
      (Review.create as any).mockResolvedValue(review);
      (Review.aggregate as any).mockResolvedValue([
        { averageRating: 5, totalReviews: 1 },
      ]);

      const result = await addReview(
        "64b000000000000000000002",
        "64b000000000000000000001",
        { rating: 5, comment: "Great product!" }
      );

      expect(Review.create).toHaveBeenCalledWith(
        expect.objectContaining({ verifiedPurchase: true })
      );
      expect(Product.findByIdAndUpdate).toHaveBeenCalledWith(
        "64b000000000000000000001",
        expect.objectContaining({ averageRating: 5, totalReviews: 1 })
      );
      expect(result).toEqual({});
    });
  });

  describe("updateReview", () => {
    it("blocks updating another user's review", async () => {
      (Review.findById as any).mockResolvedValue({
        _id: "64b000000000000000000003",
        user: { toString: () => "64b000000000000000000005" },
        isActive: true,
        product: { toString: () => "64b000000000000000000001" },
      });

      await expect(
        updateReview("64b000000000000000000002", "64b000000000000000000003", {
          rating: 3,
          comment: "Updated",
        })
      ).rejects.toBeInstanceOf(ForbiddenError);
    });

    it("updates the review and recalculates the rating", async () => {
      const review = {
        _id: "64b000000000000000000003",
        user: { toString: () => "64b000000000000000000002" },
        product: { toString: () => "64b000000000000000000001" },
        isActive: true,
        rating: 5,
        comment: "Great product!",
        save: vi.fn(),
      };

      (Review.findById as any).mockResolvedValue(review);
      (Review.aggregate as any).mockResolvedValue([
        { averageRating: 4, totalReviews: 2 },
      ]);

      const result = await updateReview("64b000000000000000000002", "64b000000000000000000003", {
        rating: 4,
        comment: "Still great",
      });

      expect(review.rating).toBe(4);
      expect(Product.findByIdAndUpdate).toHaveBeenCalledWith(
        "64b000000000000000000001",
        expect.objectContaining({ averageRating: 4 })
      );
      expect(result).toBe(review);
    });
  });

  describe("deleteReview", () => {
    it("blocks deleting another user's review", async () => {
      (Review.findById as any).mockResolvedValue({
        _id: "64b000000000000000000003",
        user: { toString: () => "64b000000000000000000005" },
        isActive: true,
      });

      await expect(deleteReview("64b000000000000000000002", "64b000000000000000000003")).rejects.toBeInstanceOf(
        ForbiddenError
      );
    });

    it("soft-deletes the owner's review", async () => {
      const review = {
        _id: "64b000000000000000000003",
        user: { toString: () => "64b000000000000000000002" },
        product: { toString: () => "64b000000000000000000001" },
        isActive: true,
        save: vi.fn(),
      };

      (Review.findById as any).mockResolvedValue(review);
      (Review.aggregate as any).mockResolvedValue([]);

      await deleteReview("64b000000000000000000002", "64b000000000000000000003");

      expect(review.isActive).toBe(false);
      expect(Product.findByIdAndUpdate).toHaveBeenCalledWith(
        "64b000000000000000000001",
        expect.objectContaining({ averageRating: 0, totalReviews: 0 })
      );
    });
  });
});
