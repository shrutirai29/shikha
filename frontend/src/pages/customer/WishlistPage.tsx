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
                className="flex gap-4 rounded-2xl border border-[#E8DCD0] bg-[#FFFCF7] p-4 shadow-sm dark:border-[#493A34] dark:bg-[#2A211E]"
              >
                <Link
                  to={`/products/${product.slug}`}
                  className="size-24 shrink-0 overflow-hidden rounded-xl bg-[#F5EDE4] dark:bg-[#352925]"
                >
                  {product.images[0] ? (
                    <img src={product.images[0]} alt={product.name} loading="lazy" className="size-full object-cover" />
                  ) : (
                    <div className="flex size-full items-center justify-center text-[#806E66] dark:text-[#C7B8AE]">
                      <ShoppingBag className="size-6" />
                    </div>
                  )}
                </Link>

                <div className="flex min-w-0 flex-1 flex-col">
                  {category && (
                    <p className="text-[11px] font-medium uppercase tracking-wide text-[#7A8B68] dark:text-[#9BAF83]">
                      {category.name}
                    </p>
                  )}
                  <Link
                    to={`/products/${product.slug}`}
                    className="line-clamp-2 text-sm font-semibold text-[#3B2924] transition hover:text-[#B85C4A] dark:text-[#FFF4E8] dark:hover:text-[#D47763]"
                  >
                    {product.name}
                  </Link>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="text-sm font-bold text-[#B85C4A] dark:text-[#D47763]">
                      {formatCurrency(price)}
                    </span>
                    {hasDiscount && (
                      <span className="text-xs text-[#806E66] line-through dark:text-[#C7B8AE]">
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
                      className="text-[#C98F8B] hover:text-[#B85C4A] dark:text-[#D8A09B] dark:hover:text-[#D47763]"
                      onClick={() => handleRemove(product._id, product.name)}
                      aria-label={`Remove ${product.name} from wishlist`}
                    >
                      <Heart className="size-3.5 fill-current" />
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
