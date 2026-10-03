import { Link, useNavigate } from "react-router-dom";
import { Heart, ShoppingBag, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import type { Product } from "@/types";
import { cn, discountPercent, formatCurrency, getProductPrice, truncate } from "@/lib/utils";
import { Rating } from "@/components/ui/Rating";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { getErrorMessage } from "@/lib/api";
import {
  useAddToCart,
  useAddToWishlist,
  useRemoveFromWishlist,
  useWishlist,
} from "@/hooks/useApi";

export const ProductCard = ({
  product,
  index = 0,
}: {
  product: Product;
  index?: number;
}) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const toast = useToast();
  const { data: wishlist } = useWishlist();
  const addToCart = useAddToCart();
  const addToWishlist = useAddToWishlist();
  const removeFromWishlist = useRemoveFromWishlist();

  const category =
    typeof product.category === "string" ? null : product.category;
  const { price, originalPrice, hasDiscount } = getProductPrice(product);
  const percentOff = discountPercent(originalPrice, product.discountPrice);
  const image = product.images[0];

  const isInWishlist =
    wishlist?.some((item) => item._id === product._id) ?? false;

  const handleWishlist = async (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    if (!isAuthenticated) {
      toast.info("Please log in to save items to your wishlist");
      navigate("/login", { state: { from: `/products/${product.slug}` } });
      return;
    }

    try {
      if (isInWishlist) {
        await removeFromWishlist.mutateAsync(product._id);
        toast.success("Removed from wishlist");
      } else {
        await addToWishlist.mutateAsync(product._id);
        toast.success("Added to wishlist");
      }
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleAddToCart = async (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    if (!isAuthenticated) {
      toast.info("Please log in to add items to your cart");
      navigate("/login", { state: { from: `/products/${product.slug}` } });
      return;
    }

    if (product.stock <= 0) {
      toast.error("This product is out of stock");
      return;
    }

    try {
      await addToCart.mutateAsync({ productId: product._id, quantity: 1 });
      toast.success("Added to cart");
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.04, 0.4) }}
      className="h-full"
    >
      <Link
        to={`/products/${product.slug}`}
        className="collect-card group relative flex h-full flex-col overflow-hidden rounded-[24px] sm:rounded-[28px] border border-white/20 bg-[#261814]/75 backdrop-blur-2xl shadow-lift transition-all duration-300 hover:-translate-y-1 hover:border-white/40 hover:bg-[#2F1D18]/85"
      >
        {/* Image & Floating Tags */}
        <div className="relative aspect-square overflow-hidden bg-gradient-to-b from-black/20 to-black/40 ring-1 ring-inset ring-white/10">
          {image ? (
            <img
              src={image}
              alt={product.name}
              loading="lazy"
              className="size-full object-cover transition-transform duration-500 ease-out group-hover:scale-108"
            />
          ) : (
            <div className="flex size-full items-center justify-center text-white/40">
              <ShoppingBag className="size-12 stroke-[1.5]" />
            </div>
          )}

          {/* Uiverse-style discount tag */}
          {hasDiscount && percentOff > 0 && (
            <span className="absolute left-2.5 top-2.5 sm:left-3 sm:top-3 inline-flex items-center gap-1 rounded-full bg-[#C26550] px-2 sm:px-2.5 py-0.5 text-[10px] sm:text-[11px] font-bold text-white shadow-md">
              <Sparkles className="size-2.5 sm:size-3 text-[#FFC77D]" />
              {percentOff}% OFF
            </span>
          )}

          {/* Floating Heart Button */}
          <button
            type="button"
            onClick={handleWishlist}
            aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
            className={cn(
              "absolute right-2.5 top-2.5 sm:right-3 sm:top-3 flex size-8 sm:size-9 items-center justify-center rounded-full border border-white/25 bg-black/40 shadow-xs backdrop-blur-md transition-all duration-200 hover:scale-110 active:scale-90",
              isInWishlist
                ? "text-[#FF9E90]"
                : "text-white/80 hover:text-[#FF9E90]"
            )}
          >
            <Heart className={cn("size-4 sm:size-4.5 transition-transform", isInWishlist && "fill-current scale-110")} />
          </button>

          {/* Out of Stock overlay */}
          {product.stock <= 0 && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-[2px]">
              <span className="rounded-full bg-black/80 border border-white/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white shadow-md">
                Sold Out
              </span>
            </div>
          )}
        </div>

        {/* Content Body */}
        <div className="flex flex-1 flex-col gap-1.5 sm:gap-2 p-3.5 sm:p-4.5">
          {category && (
            <span className="w-fit rounded-full border border-white/15 bg-white/10 px-2 py-0.5 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-[#FFC77D]">
              {category.name}
            </span>
          )}

          <h3 className="line-clamp-2 text-xs sm:text-sm font-semibold text-white transition-colors duration-200 group-hover:text-[#FFC77D]">
            {truncate(product.name, 55)}
          </h3>

          <div className="pt-0.5">
            <Rating value={product.averageRating} count={product.totalReviews} />
          </div>

          <div className="mt-auto flex items-end justify-between gap-1.5 sm:gap-2 pt-2.5 border-t border-white/15">
            <div className="space-y-0.5 min-w-0">
              <div className="flex items-baseline gap-1.5 sm:gap-2 flex-wrap">
                <span className="font-display text-base sm:text-lg font-bold text-[#FFC77D]">
                  {formatCurrency(price)}
                </span>
                {hasDiscount && (
                  <span className="text-[11px] sm:text-xs text-white/50 line-through">
                    {formatCurrency(originalPrice)}
                  </span>
                )}
              </div>
              <p className="text-[10px] sm:text-[11px] font-medium text-white/70">
                {product.stock > 0 ? (
                  <span className="text-[#B4E09E]">In stock</span>
                ) : (
                  <span className="text-[#FF9E90]">Out of stock</span>
                )}
              </p>
            </div>

            <button
              type="button"
              onClick={handleAddToCart}
              disabled={product.stock <= 0}
              aria-label={`Add ${product.name} to cart`}
              className="cartBtn !min-w-0 !size-8 sm:!size-10 !p-0 !rounded-full shrink-0 shadow-md shadow-[#B85C4A]/20 transition-transform duration-200 hover:scale-110 active:scale-95"
            >
              <span className="cartBtn-icon-wrap" aria-hidden="true">
                <svg
                  className="cart text-xs sm:text-sm"
                  fill="currentColor"
                  viewBox="0 0 576 512"
                  height="1.1em"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M0 24C0 10.7 10.7 0 24 0H69.5c22 0 41.5 12.8 50.6 32h411c26.3 0 45.5 25 38.6 50.4l-41 152.3c-8.5 31.4-37 53.3-69.5 53.3H170.7l5.4 28.5c2.2 11.3 12.1 19.5 23.6 19.5H488c13.3 0 24 10.7 24 24s-10.7 24-24 24H199.7c-34.6 0-64.3-24.6-70.7-58.5L77.4 54.5c-.7-3.8-4-6.5-7.9-6.5H24C10.7 48 0 37.3 0 24zM128 464a48 48 0 1 1 96 0 48 48 0 1 1 -96 0zm336-48a48 48 0 1 1 0 96 48 48 0 1 1 0-96z" />
                </svg>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height="0.9em"
                  viewBox="0 0 640 512"
                  className="product"
                >
                  <path d="M211.8 0c7.8 0 14.3 5.7 16.7 13.2C240.8 51.9 277.1 80 320 80s79.2-28.1 91.5-66.8C413.9 5.7 420.4 0 428.2 0h12.6c22.5 0 44.2 7.9 61.5 22.3L628.5 127.4c6.6 5.5 10.7 13.5 11.4 22.1s-2.1 17.1-7.8 23.6l-56 64c-11.4 13.1-31.2 14.6-44.6 3.5L480 197.7V448c0 35.3-28.7 64-64 64H224c-35.3 0-64-28.7-64-64V197.7l-51.5 42.9c-13.3 11.1-33.1 9.6-44.6-3.5l-56-64c-5.7-6.5-8.5-15-7.8-23.6s4.8-16.6 11.4-22.1L137.7 22.3C155 7.9 176.7 0 199.2 0h12.6z" />
                </svg>
              </span>
            </button>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};
