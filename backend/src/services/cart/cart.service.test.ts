import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../../models/cart/cart.model", () => ({
  default: {
    findOne: vi.fn(),
    create: vi.fn(),
  },
}));

vi.mock("../../models/product/product.model", () => ({
  default: {
    findById: vi.fn(),
  },
}));

import Cart from "../../models/cart/cart.model";
import Product from "../../models/product/product.model";

import { addToCart, updateQuantity, removeItem, clearCart } from "./cart.service";
import { ConflictError } from "../../errors/ConflictError";

const cart = (items: any[] = []) => ({
  user: "u1",
  items,
  totalAmount: 0,
  discount: 0,
  finalAmount: 0,
  coupon: null,
  save: vi.fn().mockResolvedValue(undefined),
  populate: vi.fn().mockResolvedValue({}),
});

const product = {
  _id: "p1",
  name: "Tote Bag",
  price: 500,
  discountPrice: 400,
  stock: 5,
  isActive: true,
};

describe("cart.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("addToCart", () => {
    it("creates a cart when none exists and prices from discountPrice", async () => {
      const createdCart = cart();

      (Cart.findOne as any).mockResolvedValue(null);
      (Cart.create as any).mockResolvedValue(createdCart);
      (Product.findById as any).mockResolvedValue(product);

      await addToCart("u1", { productId: "p1", quantity: 2 });

      expect(Cart.create).toHaveBeenCalled();
      expect(createdCart.items).toHaveLength(1);
      expect(createdCart.items[0].price).toBe(400);
    });

    it("rejects a quantity above available stock", async () => {
      (Cart.findOne as any).mockResolvedValue(cart());
      (Product.findById as any).mockResolvedValue(product);

      await expect(
        addToCart("u1", { productId: "p1", quantity: 99 })
      ).rejects.toBeInstanceOf(ConflictError);
    });

    it("rejects when the product is out of stock", async () => {
      (Product.findById as any).mockResolvedValue({ ...product, stock: 0 });

      await expect(
        addToCart("u1", { productId: "p1", quantity: 1 })
      ).rejects.toBeInstanceOf(ConflictError);
    });

    it("accumulates quantity for an existing item", async () => {
      const existing = cart([
        { product: { toString: () => "p1" }, quantity: 1, price: 400 },
      ]);
      (Cart.findOne as any).mockResolvedValue(existing);
      (Product.findById as any).mockResolvedValue(product);

      await addToCart("u1", { productId: "p1", quantity: 2 });

      expect(existing.items[0].quantity).toBe(3);
    });
  });

  describe("updateQuantity", () => {
    it("updates the item quantity and recomputes totals", async () => {
      const c = cart([
        { product: { toString: () => "p1" }, quantity: 1, price: 400 },
      ]);
      (Cart.findOne as any).mockResolvedValue(c);
      (Product.findById as any).mockResolvedValue(product);

      const result = await updateQuantity("u1", "p1", 3);

      expect(c.items[0].quantity).toBe(3);
      expect(c.totalAmount).toBe(1200);
      expect(result).toEqual({});
    });

    it("rejects exceeding stock", async () => {
      const c = cart([
        { product: { toString: () => "p1" }, quantity: 1, price: 400 },
      ]);
      (Cart.findOne as any).mockResolvedValue(c);
      (Product.findById as any).mockResolvedValue(product);

      await expect(updateQuantity("u1", "p1", 99)).rejects.toBeInstanceOf(
        ConflictError
      );
    });
  });

  describe("removeItem", () => {
    it("removes the item from the cart", async () => {
      const c = cart([
        { product: { toString: () => "p1" }, quantity: 1, price: 400 },
      ]);
      (Cart.findOne as any).mockResolvedValue(c);

      const result = await removeItem("u1", "p1");

      expect(c.items).toHaveLength(0);
      expect(c.totalAmount).toBe(0);
      expect(result).toEqual({});
    });
  });

  describe("clearCart", () => {
    it("empties the cart and resets pricing", async () => {
      const c = cart([
        { product: { toString: () => "p1" }, quantity: 1, price: 400 },
      ]);
      c.totalAmount = 400;
      c.discount = 50;
      c.finalAmount = 350;
      (c as any).coupon = "coupon1";
      (Cart.findOne as any).mockResolvedValue(c);

      await clearCart("u1");

      expect(c.items).toHaveLength(0);
      expect(c.totalAmount).toBe(0);
      expect(c.discount).toBe(0);
      expect(c.finalAmount).toBe(0);
      expect(c.coupon).toBeNull();
    });
  });
});
