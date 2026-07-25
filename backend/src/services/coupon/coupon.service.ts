import Coupon from "../../models/coupon/coupon.model";
import Cart from "../../models/cart/cart.model";

import { CreateCouponDto } from "../../dtos/coupon/create-coupon.dto";
import { UpdateCouponDto } from "../../dtos/coupon/update-coupon.dto";
import { ApplyCouponDto } from "../../dtos/coupon/apply-coupon.dto";

import { NotFoundError } from "../../errors/NotFoundError";
import { ConflictError } from "../../errors/ConflictError";

const calculateDiscount = (
  total: number,
  coupon: any
) => {
  let discount = 0;

  if (coupon.discountType === "PERCENTAGE") {
    discount = (total * coupon.discountValue) / 100;

    if (
      coupon.maximumDiscount > 0 &&
      discount > coupon.maximumDiscount
    ) {
      discount = coupon.maximumDiscount;
    }
  } else {
    discount = coupon.discountValue;
  }

  if (discount > total) {
    discount = total;
  }

  return Number(discount.toFixed(2));
};

export const createCoupon = async (
  data: CreateCouponDto
) => {
  const existing = await Coupon.findOne({
    code: data.code.toUpperCase(),
  });

  if (existing) {
    throw new ConflictError("Coupon already exists");
  }

  return await Coupon.create({
    ...data,
    code: data.code.toUpperCase(),
  });
};

export const getAllCoupons = async () => {
  return await Coupon.find().sort({
    createdAt: -1,
  });
};

export const getCouponById = async (
  couponId: string
) => {
  const coupon = await Coupon.findById(couponId);

  if (!coupon) {
    throw new NotFoundError("Coupon not found");
  }

  return coupon;
};

export const updateCoupon = async (
  couponId: string,
  data: UpdateCouponDto
) => {
  const coupon = await Coupon.findById(couponId);

  if (!coupon) {
    throw new NotFoundError("Coupon not found");
  }

  if (
    data.code &&
    data.code.toUpperCase() !== coupon.code
  ) {
    const existing = await Coupon.findOne({
      code: data.code.toUpperCase(),
      _id: { $ne: couponId },
    });

    if (existing) {
      throw new ConflictError("Coupon code already exists");
    }

    data.code = data.code.toUpperCase();
  }

  Object.assign(coupon, data);

  await coupon.save();

  return coupon;
};

export const deleteCoupon = async (
  couponId: string
) => {
  const coupon = await Coupon.findById(couponId);

  if (!coupon) {
    throw new NotFoundError("Coupon not found");
  }

  await coupon.deleteOne();

  return {
    message: "Coupon deleted successfully",
  };
};

export const applyCoupon = async (
  userId: string,
  data: ApplyCouponDto
) => {
  const cart = await Cart.findOne({ user: userId });

  if (!cart) {
    throw new NotFoundError("Cart not found");
  }

  if (cart.items.length === 0) {
    throw new ConflictError("Your cart is empty");
  }

  const coupon = await Coupon.findOne({
    code: data.code.toUpperCase(),
  });

  if (!coupon) {
    throw new NotFoundError("Invalid coupon code");
  }

  if (!coupon.isActive) {
    throw new ConflictError("This coupon is inactive");
  }

  if (coupon.expiresAt < new Date()) {
    throw new ConflictError("Coupon has expired");
  }

  if (coupon.usedCount >= coupon.usageLimit) {
    throw new ConflictError("Coupon usage limit reached");
  }

  if (cart.totalAmount < coupon.minimumPurchase) {
    throw new ConflictError(
      `Minimum purchase amount is ₹${coupon.minimumPurchase}`
    );
  }

  const discount = calculateDiscount(
    cart.totalAmount,
    coupon
  );

  cart.coupon = coupon._id;
  cart.discount = discount;
  cart.finalAmount = Number(
    (cart.totalAmount - discount).toFixed(2)
  );

  await cart.save();

  return await cart.populate({
    path: "coupon",
  });
};

export const removeCoupon = async (
  userId: string
) => {
  const cart = await Cart.findOne({
    user: userId,
  });

  if (!cart) {
    throw new NotFoundError("Cart not found");
  }

  cart.coupon = null;
  cart.discount = 0;
  cart.finalAmount = cart.totalAmount;

  await cart.save();

  return cart;
};