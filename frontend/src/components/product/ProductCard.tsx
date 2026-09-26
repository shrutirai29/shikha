import { Link } from "react-router-dom";
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
        className="collect-card group relative flex h-full flex-col overflow-hidden rounded-[1.5rem] border border-slate-200/80 bg-white shadow-soft transition-all duration-300 dark:border-slate-800/90 dark:bg-slate-900/90 hover:border-indigo-400/40 dark:hover:border-indigo-500/30"
      >
        {/* Image & Floating Tags */}
        <div className="relative aspect-square overflow-hidden bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-800/40 dark:to-slate-800/80 ring-1 ring-inset ring-black/5 dark:ring-white/5">
          {image ? (
            <img
              src={image}
              alt={product.name}
              loading="lazy"
              className="size-full object-cover transition-transform duration-500 ease-out group-hover:scale-108"
            />
          ) : (
            <div className="flex size-full items-center justify-center text-slate-300 dark:text-slate-600">
              <ShoppingBag className="size-12 stroke-[1.5]" />
            </div>
          )}

          {/* Uiverse-style discount tag */}
          {hasDiscount && percentOff > 0 && (
            <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-rose-500 to-amber-500 px-2.5 py-0.5 text-[11px] font-bold text-white shadow-lg shadow-rose-500/25">
              <Sparkles className="size-3" />
              {percentOff}% OFF
            </span>
          )}

          {/* Floating Heart Button */}
          <button
            type="button"
            onClick={handleWishlist}
            aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
            className={cn(
              "absolute right-3 top-3 flex size-9 items-center justify-center rounded-full border border-white/40 bg-white/85 shadow-md backdrop-blur-md transition-all duration-200 hover:scale-110 active:scale-90 dark:border-slate-700/60 dark:bg-slate-900/85",
              isInWishlist
                ? "text-rose-500"
                : "text-slate-400 hover:text-rose-500"
            )}
          >
            <Heart className={cn("size-4.5 transition-transform", isInWishlist && "fill-current scale-110")} />
          </button>

          {/* Out of Stock overlay */}
          {product.stock <= 0 && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-950/50 backdrop-blur-[2px]">
              <span className="rounded-full bg-slate-900/90 px-3 py-1 text-xs font-bold uppercase tracking-wider text-slate-100 shadow-md">
                Sold Out
              </span>
            </div>
          )}
        </div>

        {/* Content Body */}
        <div className="flex flex-1 flex-col gap-2 p-4.5">
          {category && (
            <span className="w-fit rounded-md bg-indigo-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300">
              {category.name}
            </span>
          )}

          <h3 className="line-clamp-2 text-sm font-semibold text-slate-900 transition-colors duration-200 group-hover:text-indigo-600 dark:text-slate-100 dark:group-hover:text-indigo-300">
            {truncate(product.name, 55)}
          </h3>

          <div className="pt-0.5">
            <Rating value={product.averageRating} count={product.totalReviews} />
          </div>

          <div className="mt-auto flex items-end justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
            <div className="space-y-0.5">
              <div className="flex items-baseline gap-2">
                <span className="font-display text-lg font-bold text-slate-950 dark:text-white">
                  {formatCurrency(price)}
                </span>
                {hasDiscount && (
                  <span className="text-xs text-slate-400 line-through">
                    {formatCurrency(originalPrice)}
                  </span>
                )}
              </div>
              <p className="text-[11px] font-medium text-slate-400">
                {product.stock > 0 ? (
                  <span className="text-emerald-600 dark:text-emerald-400">In stock</span>
                ) : (
                  <span className="text-rose-500">Out of stock</span>
                )}
              </p>
            </div>

            <button
              type="button"
              onClick={handleAddToCart}
              disabled={product.stock <= 0}
              aria-label={`Add ${product.name} to cart`}
              className="cartBtn !min-w-0 !w-10 !h-10 !p-0 !rounded-full shadow-md shadow-indigo-600/20 transition-transform duration-200 hover:scale-110 active:scale-95"
            >
              <span className="cartBtn-icon-wrap" aria-hidden="true">
                <svg
                  className="cart text-sm"
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
