import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../../models/order/order.model", () => ({
  default: {
    create: vi.fn(),
    findById: vi.fn(),
    countDocuments: vi.fn(),
    find: vi.fn(),
    findOne: vi.fn(),
    findOneAndUpdate: vi.fn(),
  },
}));

vi.mock("../../models/cart/cart.model", () => ({
  default: {
    findOne: vi.fn(),
    findOneAndUpdate: vi.fn(),
  },
}));

vi.mock("../../models/product/product.model", () => ({
  default: {
    findById: vi.fn(),
    findByIdAndUpdate: vi.fn(),
  },
}));

vi.mock("../../models/auth/auth.model", () => ({
  default: {
    findById: vi.fn(),
  },
}));

vi.mock("../../models/coupon/coupon.model", () => ({
  default: {
    findByIdAndUpdate: vi.fn(),
    updateOne: vi.fn(),
  },
}));

import Order from "../../models/order/order.model";
import Cart from "../../models/cart/cart.model";
import Product from "../../models/product/product.model";
import User from "../../models/auth/auth.model";
import Coupon from "../../models/coupon/coupon.model";

import {
  createOrder,
  cancelOrder,
  getOrderById,
} from "./order.service";
import { ForbiddenError } from "../../errors/ForbiddenError";
import { ConflictError } from "../../errors/ConflictError";

const populated = (order: any) => ({
  ...order,
  populate: vi.fn().mockReturnThis(),
});

// Mimics a mongoose query: every chain method returns the query, and awaiting
// the query resolves to `result`.
const chainable = (result: any) => {
  const query: any = {
    populate: vi.fn(function () {
      return query;
    }),
    sort: vi.fn(function () {
      return query;
    }),
    skip: vi.fn(function () {
      return query;
    }),
    limit: vi.fn(function () {
      return query;
    }),
  };

  query.then = (resolve: any) => resolve(result);

  return query;
};

describe("order.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createOrder", () => {
    const product = {
      _id: "p1",
      name: "Tote Bag",
      price: 500,
      discountPrice: 0,
      stock: 10,
      isActive: true,
      images: ["img.jpg"],
    };

    const cart = {
      user: "u1",
      items: [{ product: "p1", quantity: 2 }],
      totalAmount: 1000,
      discount: 0,
      finalAmount: 1000,
      coupon: null,
    };

    const shippingAddress = {
      fullName: "Test User",
      phone: "+91 90000 00000",
      addressLine1: "Test Street",
      city: "Delhi",
      state: "Delhi",
      country: "India",
      postalCode: "110001",
    };

    it("creates a COD order and deducts stock", async () => {
      (User.findById as any).mockResolvedValue({ _id: "u1" });
      (Cart.findOne as any).mockResolvedValue(cart);
      (Product.findById as any).mockResolvedValue(product);
      (Order.create as any).mockResolvedValue({ _id: "o1" });
      (Cart.findOneAndUpdate as any).mockResolvedValue({});
      (Order.findById as any).mockReturnValue(chainable({ _id: "o1" }));

      const order = await createOrder("u1", {
        shippingAddress,
        paymentMethod: "COD",
      });

      expect(Product.findByIdAndUpdate).toHaveBeenCalledWith("p1", {
        $inc: { stock: -2 },
      });
      expect(Order.create).toHaveBeenCalledWith(
        expect.objectContaining({
          user: "u1",
          paymentMethod: "COD",
          totalAmount: expect.any(Number),
        })
      );
      expect(order._id).toBe("o1");
    });

    it("throws when a product is out of stock", async () => {
      (User.findById as any).mockResolvedValue({ _id: "u1" });
      (Cart.findOne as any).mockResolvedValue(cart);
      (Product.findById as any).mockResolvedValue({
        ...product,
        stock: 1,
      });

      await expect(
        createOrder("u1", { shippingAddress, paymentMethod: "COD" })
      ).rejects.toBeInstanceOf(ConflictError);
    });

    it("throws when the cart is empty", async () => {
      (User.findById as any).mockResolvedValue({ _id: "u1" });
      (Cart.findOne as any).mockResolvedValue({ items: [] });

      await expect(
        createOrder("u1", { shippingAddress, paymentMethod: "COD" })
      ).rejects.toThrow(/cart is empty/i);
    });
  });

  describe("getOrderById", () => {
    it("denies access to another user's order", async () => {
      const order = {
        _id: "o1",
        user: { _id: "other-user", name: "Someone" },
        items: [],
      };

      (Order.findById as any).mockReturnValue(chainable(order));

      await expect(getOrderById("u1", "o1")).rejects.toBeInstanceOf(
        ForbiddenError
      );
    });

    it("allows the owner to read their order", async () => {
      const order = {
        _id: "o1",
        user: { _id: "u1", name: "Owner" },
        items: [],
      };

      (Order.findById as any).mockReturnValue(chainable(order));

      const result = await getOrderById("u1", "o1");

      expect(result._id).toBe("o1");
    });
  });

  describe("cancelOrder", () => {
    it("restores stock and coupon usage for a COD order", async () => {
      const cancelled = populated({
        _id: "o1",
        paymentMethod: "COD",
        coupon: "c1",
        items: [{ product: "p1", quantity: 2 }],
      });

      (Order.findOneAndUpdate as any).mockResolvedValue(cancelled);
      (Order.findById as any).mockReturnValue(chainable(cancelled));

      const result = await cancelOrder("u1", "o1");

      expect(Product.findByIdAndUpdate).toHaveBeenCalledWith("p1", {
        $inc: { stock: 2 },
      });
      expect(Coupon.updateOne).toHaveBeenCalledWith(
        { _id: "c1", usedCount: { $gt: 0 } },
        { $inc: { usedCount: -1 } }
      );
      expect(result).toBe(cancelled);
    });

    it("blocks cancellation of a paid or shipped order", async () => {
      (Order.findOneAndUpdate as any).mockResolvedValue(null);

      await expect(cancelOrder("u1", "o1")).rejects.toBeInstanceOf(
        ConflictError
      );
    });
  });
});
