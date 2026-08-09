import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

export const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);

export const formatDate = (date?: string | Date): string => {
  if (!date) return "—";

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
};

export const formatDateTime = (date?: string | Date): string => {
  if (!date) return "—";

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(date));
};

export const slugify = (value: string): string =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");

export const truncate = (value: string, length: number): string =>
  value.length > length ? `${value.slice(0, length)}…` : value;

export const getProductPrice = (product: {
  price: number;
  discountPrice?: number;
}): { price: number; originalPrice: number; hasDiscount: boolean } => {
  const originalPrice = product.price;
  const price =
    product.discountPrice && product.discountPrice > 0
      ? product.discountPrice
      : product.price;

  return {
    price,
    originalPrice,
    hasDiscount: price < originalPrice,
  };
};

export const discountPercent = (
  price: number,
  discountPrice?: number
): number => {
  if (!discountPrice || discountPrice >= price || price <= 0) return 0;

  return Math.round(((price - discountPrice) / price) * 100);
};

export const formatRating = (value: number): string => value.toFixed(1);

export const initials = (name: string): string =>
  name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
