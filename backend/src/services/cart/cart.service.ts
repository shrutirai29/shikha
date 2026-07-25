import Cart from "../../models/cart/cart.model";
import Product from "../../models/product/product.model";

import { AddCartDto } from "../../dtos/cart/add-cart.dto";

import { NotFoundError } from "../../errors/NotFoundError";
import { ConflictError } from "../../errors/ConflictError";

const populateCart = {
  path: "items.product",
  select:
    "name slug description price discountPrice stock images category isFeatured isActive",
  populate: {
    path: "category",
    select: "name slug",
  },
};

const calculateTotal = (items: any[]) => {
  return Number(
    items
      .reduce((sum, item) => {
        return sum + item.price * item.quantity;
      }, 0)
      .toFixed(2)
  );
};

const resetCartPricing = (cart: any) => {
  cart.totalAmount = calculateTotal(cart.items);
  cart.discount = 0;
  cart.finalAmount = cart.totalAmount;
  cart.coupon = null;
};

export const getCart = async (userId: string) => {
  const cart = await Cart.findOne({ user: userId }).populate(populateCart);

  if (!cart) {
    return {
      items: [],
      totalAmount: 0,
      discount: 0,
      finalAmount: 0,
      coupon: null,
    };
  }

  return cart;
};

export const addToCart = async (
  userId: string,
  data: AddCartDto
) => {
  const { productId, quantity } = data;

  if (quantity <= 0) {
    throw new ConflictError("Quantity must be greater than zero");
  }

  const product = await Product.findById(productId);

  if (!product || !product.isActive) {
    throw new NotFoundError("Product not found");
  }

  if (product.stock <= 0) {
    throw new ConflictError("Product is out of stock");
  }

  if (quantity > product.stock) {
    throw new ConflictError("Insufficient stock available");
  }

  let cart = await Cart.findOne({ user: userId });

  if (!cart) {
    cart = await Cart.create({
      user: userId,
      items: [],
      totalAmount: 0,
      discount: 0,
      finalAmount: 0,
      coupon: null,
    });
  }

  const existingItem = cart.items.find(
    (item) => item.product.toString() === productId
  );

  if (existingItem) {
    const updatedQuantity = existingItem.quantity + quantity;

    if (updatedQuantity > product.stock) {
      throw new ConflictError(
        "Requested quantity exceeds available stock"
      );
    }

    existingItem.quantity = updatedQuantity;

    existingItem.price =
      (product.discountPrice ?? 0) > 0
        ? product.discountPrice!
        : product.price!;
  } else {
    cart.items.push({
      product: product._id,
      quantity,
      price:
        (product.discountPrice ?? 0) > 0
          ? product.discountPrice!
          : product.price!,
    });
  }

  resetCartPricing(cart);

  await cart.save();

  return await cart.populate(populateCart);
};
export const updateQuantity = async (
  userId: string,
  productId: string,
  quantity: number
) => {
  if (quantity <= 0) {
    throw new ConflictError("Quantity must be greater than zero");
  }

  const cart = await Cart.findOne({ user: userId });

  if (!cart) {
    throw new NotFoundError("Cart not found");
  }

  const item = cart.items.find(
    (item) => item.product.toString() === productId
  );

  if (!item) {
    throw new NotFoundError("Item not found in cart");
  }

  const product = await Product.findById(productId);

  if (!product || !product.isActive) {
    throw new NotFoundError("Product not found");
  }

  if (quantity > product.stock) {
    throw new ConflictError("Insufficient stock available");
  }

  item.quantity = quantity;

  item.price =
    (product.discountPrice ?? 0) > 0
      ? product.discountPrice!
      : product.price!;

  resetCartPricing(cart);

  await cart.save();

  return await cart.populate(populateCart);
};

export const removeItem = async (
  userId: string,
  productId: string
) => {
  const cart = await Cart.findOne({ user: userId });

  if (!cart) {
    throw new NotFoundError("Cart not found");
  }

  const itemExists = cart.items.some(
    (item) => item.product.toString() === productId
  );

  if (!itemExists) {
    throw new NotFoundError("Item not found in cart");
  }

  cart.items = cart.items.filter(
    (item) => item.product.toString() !== productId
  );

  resetCartPricing(cart);

  await cart.save();

  return await cart.populate(populateCart);
};

export const clearCart = async (userId: string) => {
  const cart = await Cart.findOne({ user: userId });

  if (!cart) {
    throw new NotFoundError("Cart not found");
  }

  cart.items = [];
  cart.totalAmount = 0;
  cart.discount = 0;
  cart.finalAmount = 0;
  cart.coupon = null;

  await cart.save();

  return cart;
};