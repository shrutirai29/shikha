import Wishlist from "../../models/wishlist/wishlist.model";
import Product from "../../models/product/product.model";

import { NotFoundError } from "../../errors/NotFoundError";
import { ConflictError } from "../../errors/ConflictError";

export const addToWishlist = async (
  userId: string,
  productId: string
) => {
  const product = await Product.findById(productId);

  if (!product || !product.isActive) {
    throw new NotFoundError("Product not found");
  }

  let wishlist = await Wishlist.findOne({ user: userId });

  if (!wishlist) {
    wishlist = await Wishlist.create({
      user: userId,
      products: [productId],
    });
  } else {
    const exists = wishlist.products.some(
      (id) => id.toString() === productId
    );

    if (exists) {
      throw new ConflictError(
        "Product already exists in wishlist"
      );
    }

    wishlist.products.push(product._id);
    await wishlist.save();
  }

  return await Wishlist.findById(wishlist._id).populate({
    path: "products",
    populate: {
      path: "category",
      select: "name slug",
    },
  });
};

export const getWishlist = async (
  userId: string,
  page = 1,
  limit = 10
) => {
  const wishlist = await Wishlist.findOne({
    user: userId,
  }).populate({
    path: "products",
    populate: {
      path: "category",
      select: "name slug",
    },
  });

  const products = wishlist?.products || [];
  const total = products.length;

  const paginatedProducts = products.slice(
    (page - 1) * limit,
    page * limit
  );

  return {
    products: paginatedProducts,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const removeFromWishlist = async (
  userId: string,
  productId: string
) => {
  const wishlist = await Wishlist.findOne({
    user: userId,
  });

  if (!wishlist) {
    throw new NotFoundError("Wishlist not found");
  }

  wishlist.products = wishlist.products.filter(
    (id) => id.toString() !== productId
  );

  await wishlist.save();

  return await Wishlist.findById(wishlist._id).populate({
    path: "products",
    populate: {
      path: "category",
      select: "name slug",
    },
  });
};