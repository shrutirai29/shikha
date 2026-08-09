import { Link } from "react-router-dom";
import { Heart, ShoppingBag } from "lucide-react";
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
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: Math.min(index * 0.04, 0.4) }}
    >
      <Link
        to={`/products/${product.slug}`}
        className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft transition duration-300 hover:-translate-y-1 hover:shadow-lift dark:border-slate-700/60 dark:bg-slate-900/70"
      >
        <div className="relative aspect-square overflow-hidden bg-slate-100 dark:bg-slate-700/40">
          {image ? (
            <img
              src={image}
              alt={product.name}
              loading="lazy"
              className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex size-full items-center justify-center text-slate-300 dark:text-slate-600">
              <ShoppingBag className="size-10" />
            </div>
          )}

          {hasDiscount && percentOff > 0 && (
            <span className="absolute left-3 top-3 rounded-full bg-rose-600 px-2.5 py-0.5 text-xs font-bold text-white shadow-sm">
              {percentOff}% OFF
            </span>
          )}

          <button
            type="button"
            onClick={handleWishlist}
            aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
            className={cn(
              "absolute right-3 top-3 rounded-full bg-white/90 p-2 shadow-sm backdrop-blur transition hover:scale-110 dark:bg-slate-800/90",
              isInWishlist
                ? "text-rose-500"
                : "text-slate-400 hover:text-rose-500"
            )}
          >
            <Heart className={cn("size-4", isInWishlist && "fill-current")} />
          </button>

          {product.stock <= 0 && (
            <span className="absolute inset-0 flex items-center justify-center bg-white/60 text-sm font-bold uppercase tracking-wide text-slate-500 backdrop-blur-[2px] dark:bg-slate-900/60 dark:text-slate-300">
              Out of stock
            </span>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-2 p-4">
          {category && (
            <Link
              to={`/categories/${category.slug}`}
              onClick={(event) => event.stopPropagation()}
              className="text-xs font-medium uppercase tracking-wide text-indigo-600 dark:text-indigo-400"
            >
              {category.name}
            </Link>
          )}

          <h3 className="line-clamp-2 text-sm font-semibold text-slate-900 transition group-hover:text-indigo-700 dark:text-slate-50 dark:group-hover:text-indigo-200">
            {truncate(product.name, 60)}
          </h3>

          <Rating value={product.averageRating} count={product.totalReviews} />

          <div className="mt-auto flex items-end justify-between gap-2">
            <div className="space-y-0.5">
              <div className="flex items-baseline gap-2">
                <span className="text-base font-bold text-slate-900 dark:text-white">
                  {formatCurrency(price)}
                </span>
                {hasDiscount && (
                  <span className="text-xs text-slate-400 line-through">
                    {formatCurrency(originalPrice)}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                {product.stock > 0 ? `${product.stock} in stock` : "Sold out"}
              </p>
            </div>

            <Button
              size="icon"
              variant="secondary"
              onClick={handleAddToCart}
              disabled={product.stock <= 0}
              aria-label={`Add ${product.name} to cart`}
              className="size-9 rounded-full"
            >
              <ShoppingBag className="size-4" />
            </Button>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};
