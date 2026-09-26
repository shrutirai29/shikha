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
import { Button } from "@/components/ui/Button";

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

            <Button
              size="icon"
              variant="secondary"
              onClick={handleAddToCart}
              disabled={product.stock <= 0}
              aria-label={`Add ${product.name} to cart`}
              className="size-9.5 rounded-full shadow-md shadow-indigo-600/20 transition-transform duration-200 group-hover:scale-105"
            >
              <ShoppingBag className="size-4.5" />
            </Button>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};
