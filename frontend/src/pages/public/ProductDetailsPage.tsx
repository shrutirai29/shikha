import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  BadgeCheck,
  ChevronRight,
  Heart,
  Minus,
  Package,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Truck,
} from "lucide-react";
import { useProductBySlug, useAddToCart, useAddToWishlist, useRemoveFromWishlist, useWishlist, useReviews, useAddReview } from "@/hooks/useApi";
import { formatCurrency, getProductPrice, discountPercent, formatDate } from "@/lib/utils";
import { TiltCard } from "@/components/ui/TiltCard";
import { Rating, StarInput } from "@/components/ui/Rating";
import { Button } from "@/components/ui/Button";
import { Badge, Skeleton } from "@/components/ui/Card";
import { PageLayout } from "@/components/layout/PageLayout";
import { EmptyState, ErrorState } from "@/components/ui/States";
import { Textarea } from "@/components/ui/Input";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { getErrorMessage } from "@/lib/api";
import { cn } from "@/lib/utils";

export const ProductDetailsPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const toast = useToast();

  const { data: product, isLoading, isError, error, refetch } = useProductBySlug(slug);
  const { data: wishlist } = useWishlist();
  const addToCart = useAddToCart();
  const addToWishlist = useAddToWishlist();
  const removeFromWishlist = useRemoveFromWishlist();
  const { data: reviews, isLoading: reviewsLoading } = useReviews(product?._id);
  const addReview = useAddReview();

  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [adding, setAdding] = useState(false);

  if (isLoading) {
    return (
      <PageLayout>
        <div className="grid gap-8 lg:grid-cols-2">
          <Skeleton className="aspect-square rounded-2xl" />
          <div className="space-y-4">
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-10 w-2/3" />
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-24 w-full" />
          </div>
        </div>
      </PageLayout>
    );
  }

  if (isError || !product) {
    return (
      <PageLayout>
        <ErrorState
          title="Product not found"
          message={getErrorMessage(error)}
          onRetry={() => void refetch()}
        />
      </PageLayout>
    );
  }

  const category = typeof product.category === "string" ? null : product.category;
  const { price, originalPrice, hasDiscount } = getProductPrice(product);
  const percentOff = discountPercent(originalPrice, product.discountPrice);
  const isInWishlist = wishlist?.some((item) => item._id === product._id) ?? false;

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.info("Please log in to add items to your cart");
      navigate("/login", { state: { from: `/products/${product.slug}` } });
      return;
    }

    setAdding(true);

    try {
      await addToCart.mutateAsync({ productId: product._id, quantity });
      toast.success(`${quantity} item${quantity > 1 ? "s" : ""} added to cart`);
    } catch (cartError) {
      toast.error(getErrorMessage(cartError));
    } finally {
      setAdding(false);
    }
  };

  const handleWishlist = async () => {
    if (!isAuthenticated) {
      toast.info("Please log in to save items to your wishlist");
      navigate("/login");
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
    } catch (wishlistError) {
      toast.error(getErrorMessage(wishlistError));
    }
  };

  const handleReview = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!isAuthenticated) {
      toast.info("Please log in to write a review");
      navigate("/login");
      return;
    }

    try {
      await addReview.mutateAsync({ productId: product._id, rating, comment });
      toast.success("Review submitted");
      setRating(0);
      setComment("");
    } catch (reviewError) {
      toast.error(getErrorMessage(reviewError));
    }
  };

  const canReview = isAuthenticated;

  return (
    <PageLayout>
      <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
        <Link to="/" className="transition hover:text-indigo-600 dark:hover:text-indigo-400">Home</Link>
        <ChevronRight className="size-4" />
        <Link to="/products" className="transition hover:text-indigo-600 dark:hover:text-indigo-400">Products</Link>
        {category && (
          <>
            <ChevronRight className="size-4" />
            <Link to={`/categories/${category.slug}`} className="transition hover:text-indigo-600 dark:hover:text-indigo-400">
              {category.name}
            </Link>
          </>
        )}
        <ChevronRight className="size-4" />
        <span className="font-medium text-slate-900 dark:text-white">{product.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2">
        {/* Gallery */}
        <div>
          <TiltCard className="relative">
          <div className="relative aspect-square overflow-hidden rounded-[2rem] border border-slate-200 bg-slate-100 shadow-soft dark:border-slate-700 dark:bg-slate-800">
            {product.images[activeImage] ? (
              <img
                src={product.images[activeImage]}
                alt={product.name}
                className="size-full object-cover"
              />
            ) : (
              <div className="flex size-full items-center justify-center text-slate-300 dark:text-slate-600">
                <ShoppingBag className="size-16" />
              </div>
            )}

            {hasDiscount && percentOff > 0 && (
              <span className="absolute left-4 top-4 rounded-full bg-rose-600 px-3 py-1 text-sm font-bold text-white shadow">
                {percentOff}% OFF
              </span>
            )}

            {product.stock <= 0 && (
              <span className="absolute inset-0 flex items-center justify-center bg-white/60 text-lg font-bold uppercase tracking-widest text-slate-500 backdrop-blur-[2px] dark:bg-slate-900/60 dark:text-slate-300">
                Out of stock
              </span>
            )}
          </div>
          </TiltCard>

          {product.images.length > 1 && (
            <div className="mt-4 flex gap-3">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setActiveImage(index)}
                  className={cn(
                    "size-20 overflow-hidden rounded-xl border-2 transition",
                    index === activeImage
                      ? "border-indigo-600"
                      : "border-transparent opacity-70 hover:opacity-100"
                  )}
                  aria-label={`View image ${index + 1}`}
                >
                  <img src={image} alt="" className="size-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="space-y-6">
          {category && (
            <Link
              to={`/categories/${category.slug}`}
              className="text-sm font-semibold uppercase tracking-wide text-indigo-600 dark:text-indigo-400"
            >
              {category.name}
            </Link>
          )}

          <h1 className="font-display text-4xl font-semibold leading-tight tracking-tight text-slate-950 dark:text-slate-50">
            {product.name}
          </h1>

          <Rating value={product.averageRating} count={product.totalReviews} />

          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold text-slate-900 dark:text-white">
              {formatCurrency(price)}
            </span>
            {hasDiscount && (
              <span className="text-lg text-slate-400 line-through">
                {formatCurrency(originalPrice)}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {product.stock > 0 ? (
              <Badge variant="success">In stock — {product.stock} available</Badge>
            ) : (
              <Badge variant="danger">Out of stock</Badge>
            )}
          </div>

          <p className="whitespace-pre-line text-slate-600 dark:text-slate-300">
            {product.description}
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center rounded-xl border border-slate-300 dark:border-slate-600">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={quantity <= 1}
                className="p-3 text-slate-600 transition hover:text-slate-900 disabled:opacity-40 dark:text-slate-300 dark:hover:text-white"
                aria-label="Decrease quantity"
              >
                <Minus className="size-4" />
              </button>
              <span className="w-12 text-center text-sm font-semibold text-slate-900 dark:text-white">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                disabled={quantity >= product.stock || product.stock <= 0}
                className="p-3 text-slate-600 transition hover:text-slate-900 disabled:opacity-40 dark:text-slate-300 dark:hover:text-white"
                aria-label="Increase quantity"
              >
                <Plus className="size-4" />
              </button>
            </div>

            <Button size="lg" onClick={handleAddToCart} loading={adding} disabled={product.stock <= 0} className="flex-1 sm:flex-none">
              <ShoppingBag className="size-5" />
              Add to cart
            </Button>

            <Button
              size="icon"
              variant={isInWishlist ? "danger" : "outline"}
              onClick={handleWishlist}
              className="size-12 rounded-xl"
              aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
            >
              <Heart className={cn("size-5", isInWishlist && "fill-current")} />
            </Button>
          </div>

          <div className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm dark:border-slate-700 dark:bg-slate-800/50 sm:grid-cols-3">
            <div className="flex items-center gap-2.5 text-slate-600 dark:text-slate-300">
              <Truck className="size-5 text-indigo-600 dark:text-indigo-400" />
              Free shipping over ₹500
            </div>
            <div className="flex items-center gap-2.5 text-slate-600 dark:text-slate-300">
              <ShieldCheck className="size-5 text-emerald-600 dark:text-emerald-400" />
              7-day returns
            </div>
            <div className="flex items-center gap-2.5 text-slate-600 dark:text-slate-300">
              <Package className="size-5 text-amber-600 dark:text-amber-400" />
              COD available
            </div>
          </div>
        </div>
      </div>

      {/* Reviews */}
      <section className="mt-16">
        <h2 className="font-display mb-6 text-3xl font-semibold tracking-tight text-slate-950 dark:text-slate-50">
          Reviews
          {product.totalReviews > 0 && (
            <span className="ml-2 text-base font-normal text-slate-400">
              ({product.totalReviews})
            </span>
          )}
        </h2>

        <div className="grid gap-8 lg:grid-cols-[1fr_2fr]">
          {canReview && (
            <form onSubmit={handleReview} className="h-fit rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800/60">
              <h3 className="mb-4 text-base font-semibold text-slate-900 dark:text-white">
                Write a review
              </h3>
              <div className="mb-4">
                <StarInput value={rating} onChange={setRating} />
              </div>
              <Textarea
                name="comment"
                label="Your review"
                placeholder="Share your experience with this product…"
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                minLength={5}
                maxLength={500}
                required
              />
              <Button type="submit" className="mt-4 w-full" loading={addReview.isPending} disabled={rating === 0}>
                Submit review
              </Button>
              <p className="mt-3 flex items-center gap-1.5 text-xs text-slate-400">
                <BadgeCheck className="size-4" />
                Only verified buyers can review products
              </p>
            </form>
          )}

          <div className="space-y-4">
            {reviewsLoading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <Skeleton key={index} className="h-28 rounded-2xl" />
              ))
            ) : !reviews || reviews.length === 0 ? (
              <EmptyState
                title="No reviews yet"
                description="Be the first to review this product."
              />
            ) : (
              reviews.map((review) => {
                const author = typeof review.user === "string" ? null : review.user;

                return (
                  <article
                    key={review._id}
                    className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800/60"
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="flex size-9 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 to-indigo-300 text-xs font-bold text-white">
                          {(author?.name ?? "U").charAt(0).toUpperCase()}
                        </span>
                        <div>
                          <p className="text-sm font-semibold text-slate-900 dark:text-white">
                            {author?.name ?? "Anonymous"}
                          </p>
                          <p className="text-xs text-slate-400">{formatDate(review.createdAt)}</p>
                        </div>
                      </div>
                      {review.verifiedPurchase && (
                        <Badge variant="success">
                          <BadgeCheck className="size-3.5" /> Verified purchase
                        </Badge>
                      )}
                    </div>
                    <Rating value={review.rating} className="mb-2" />
                    <p className="text-sm text-slate-600 dark:text-slate-300">{review.comment}</p>
                  </article>
                );
              })
            )}
          </div>
        </div>
      </section>
    </PageLayout>
  );
};

export default ProductDetailsPage;
