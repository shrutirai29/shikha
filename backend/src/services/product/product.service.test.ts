import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../../models/product/product.model", () => ({
  default: {
    findOne: vi.fn(),
    findById: vi.fn(),
    find: vi.fn(),
    countDocuments: vi.fn(),
    create: vi.fn(),
    findByIdAndUpdate: vi.fn(),
    findByIdAndDelete: vi.fn(),
  },
}));

vi.mock("../../models/category/category.model", () => ({
  default: {
    findOne: vi.fn(),
  },
}));

import Product from "../../models/product/product.model";
import { deleteProduct } from "./product.service";
import { NotFoundError } from "../../errors/NotFoundError";

describe("product.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("deleteProduct", () => {
    it("first delete soft-deletes an active product (deactivate)", async () => {
      (Product.findById as any).mockResolvedValue({
        _id: "p1",
        isActive: true,
      });
      (Product.findByIdAndUpdate as any).mockResolvedValue({
        _id: "p1",
        isActive: false,
      });

      const result = await deleteProduct("p1");

      expect(Product.findByIdAndUpdate).toHaveBeenCalledWith(
        "p1",
        { isActive: false },
        { new: true }
      );
      expect(Product.findByIdAndDelete).not.toHaveBeenCalled();
      expect(result.permanent).toBe(false);
      expect(result.product?.isActive).toBe(false);
    });

    it("second delete permanently removes an inactive product", async () => {
      (Product.findById as any).mockResolvedValue({
        _id: "p1",
        isActive: false,
      });
      (Product.findByIdAndDelete as any).mockResolvedValue({
        _id: "p1",
        isActive: false,
      });

      const result = await deleteProduct("p1");

      expect(Product.findByIdAndDelete).toHaveBeenCalledWith("p1");
      expect(Product.findByIdAndUpdate).not.toHaveBeenCalled();
      expect(result.permanent).toBe(true);
    });

    it("throws NotFoundError when the product does not exist", async () => {
      (Product.findById as any).mockResolvedValue(null);

      await expect(deleteProduct("p1")).rejects.toBeInstanceOf(
        NotFoundError
      );
      expect(Product.findByIdAndUpdate).not.toHaveBeenCalled();
      expect(Product.findByIdAndDelete).not.toHaveBeenCalled();
    });
  });
});
