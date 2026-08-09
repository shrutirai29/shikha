import { Heart, ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";
import { useWishlist, useRemoveFromWishlist, useAddToCart } from "@/hooks/useApi";
import { useToast } from "@/context/ToastContext";
import { getErrorMessage } from "@/lib/api";
import { PageLayout } from "@/components/layout/PageLayout";
import { EmptyState, ErrorState } from "@/components/ui/States";
import { Button } from "@/components/ui/Button";
import { PageLoader } from "@/components/ui/Card";
import { formatCurrency, getProductPrice } from "@/lib/utils";

export const WishlistPage = () => {
  const { data: products, isLoading, isError, error, refetch } = useWishlist();
  const removeFromWishlist = useRemoveFromWishlist();
  const addToCart = useAddToCart();
  const toast = useToast();

  const handleRemove = async (productId: string, name: string) => {
    try {
      await removeFromWishlist.mutateAsync(productId);
      toast.success(`${name} removed from wishlist`);
    } catch (removeError) {
      toast.error(getErrorMessage(removeError));
    }
  };

  const handleAddToCart = async (productId: string, name: string) => {
    try {
      await addToCart.mutateAsync({ productId, quantity: 1 });
      toast.success(`${name} added to cart`);
    } catch (cartError) {
      toast.error(getErrorMessage(cartError));
    }
  };

  if (isLoading) {
    return <PageLoader />;
  }

  return (
    <PageLayout title="My wishlist" subtitle="Items you've saved for later">
      {isError ? (
        <ErrorState message={getErrorMessage(error)} onRetry={() => void refetch()} />
      ) : !products || products.length === 0 ? (
        <EmptyState
          icon={<Heart className="size-7" />}
          title="Your wishlist is empty"
          description="Save products you love and find them here anytime."
          action={
            <Link to="/products">
              <Button>Browse products</Button>
            </Link>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => {
            const { price, originalPrice, hasDiscount } = getProductPrice(product);
            const category =
              typeof product.category === "string" ? null : product.category;

            return (
              <div
                key={product._id}
                className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800/60"
              >
                <Link
                  to={`/products/${product.slug}`}
                  className="size-24 shrink-0 overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-700/40"
                >
                  {product.images[0] ? (
                    <img src={product.images[0]} alt={product.name} loading="lazy" className="size-full object-cover" />
                  ) : (
                    <div className="flex size-full items-center justify-center text-slate-300 dark:text-slate-600">
                      <ShoppingBag className="size-6" />
                    </div>
                  )}
                </Link>

                <div className="flex min-w-0 flex-1 flex-col">
                  {category && (
                    <p className="text-[11px] font-medium uppercase tracking-wide text-indigo-600 dark:text-indigo-400">
                      {category.name}
                    </p>
                  )}
                  <Link
                    to={`/products/${product.slug}`}
                    className="line-clamp-2 text-sm font-semibold text-slate-900 transition hover:text-indigo-600 dark:text-white dark:hover:text-indigo-400"
                  >
                    {product.name}
                  </Link>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                      {formatCurrency(price)}
                    </span>
                    {hasDiscount && (
                      <span className="text-xs text-slate-400 line-through">
                        {formatCurrency(originalPrice)}
                      </span>
                    )}
                  </div>

                  <div className="mt-auto flex gap-2 pt-2">
                    <Button
                      size="sm"
                      className="flex-1"
                      disabled={product.stock <= 0}
                      onClick={() => handleAddToCart(product._id, product.name)}
                    >
                      <ShoppingBag className="size-3.5" />
                      Add to cart
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRemove(product._id, product.name)}
                      aria-label={`Remove ${product.name} from wishlist`}
                    >
                      <Heart className="size-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </PageLayout>
  );
};

export default WishlistPage;
