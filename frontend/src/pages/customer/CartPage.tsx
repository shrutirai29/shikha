import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Minus, Plus, ShoppingBag, Tag, Trash2, X } from "lucide-react";
import {
  useCart,
  useUpdateCartItem,
  useRemoveCartItem,
  useClearCart,
  useApplyCoupon,
  useRemoveCoupon,
} from "@/hooks/useApi";
import { useToast } from "@/context/ToastContext";
import { getErrorMessage } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState, ErrorState } from "@/components/ui/States";
import { ConfirmDialog } from "@/components/ui/Modal";
import { PageLayout } from "@/components/layout/PageLayout";
import { PageLoader } from "@/components/ui/Card";
import { formatCurrency } from "@/lib/utils";
import type { Product } from "@/types";

export const CartPage = () => {
  const { data: cart, isLoading, isError, error, refetch } = useCart();
  const updateItem = useUpdateCartItem();
  const removeItem = useRemoveCartItem();
  const clearCart = useClearCart();
  const applyCoupon = useApplyCoupon();
  const removeCoupon = useRemoveCoupon();
  const toast = useToast();
  const navigate = useNavigate();

  const [code, setCode] = useState("");
  const [clearOpen, setClearOpen] = useState(false);

  if (isLoading) {
    return <PageLoader />;
  }

  if (isError) {
    return (
      <PageLayout title="Cart">
        <ErrorState message={getErrorMessage(error)} onRetry={() => void refetch()} />
      </PageLayout>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <PageLayout title="Your cart">
        <EmptyState
          icon={<ShoppingBag className="size-7" />}
          title="Your cart is empty"
          description="Looks like you haven't added anything yet. Start shopping!"
          action={
            <Link to="/products">
              <Button>Start shopping</Button>
            </Link>
          }
        />
      </PageLayout>
    );
  }

  const handleQuantityChange = async (productId: string, quantity: number) => {
    try {
      await updateItem.mutateAsync({ productId, quantity });
    } catch (updateError) {
      toast.error(getErrorMessage(updateError));
    }
  };

  const handleRemove = async (productId: string) => {
    try {
      await removeItem.mutateAsync(productId);
      toast.success("Item removed from cart");
    } catch (removeError) {
      toast.error(getErrorMessage(removeError));
    }
  };

  const handleApplyCoupon = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!code.trim()) return;

    try {
      await applyCoupon.mutateAsync(code.trim());
      toast.success("Coupon applied");
      setCode("");
    } catch (couponError) {
      toast.error(getErrorMessage(couponError));
    }
  };

  const handleRemoveCoupon = async () => {
    try {
      await removeCoupon.mutateAsync();
      toast.success("Coupon removed");
    } catch (couponError) {
      toast.error(getErrorMessage(couponError));
    }
  };

  const handleClear = async () => {
    try {
      await clearCart.mutateAsync();
      toast.success("Cart cleared");
      setClearOpen(false);
    } catch (clearError) {
      toast.error(getErrorMessage(clearError));
    }
  };

  const discountedSubtotal = cart.finalAmount;
  const shipping = discountedSubtotal >= 500 ? 0 : 50;
  const tax = Number((discountedSubtotal * 0.18).toFixed(2));
  const totalAmount = discountedSubtotal + shipping + tax;

  return (
    <PageLayout
      title="Your cart"
      subtitle={`${cart.items.length} item${cart.items.length > 1 ? "s" : ""} in your cart`}
      actions={
        <Button variant="outline" onClick={() => setClearOpen(true)}>
          <Trash2 className="size-4" /> Clear cart
        </Button>
      }
    >
      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="space-y-3">
          {cart.items.map((item) => {
            const product = item.product as Product;
            const category =
              typeof product.category === "string" ? null : product.category;

            return (
              <Card key={product._id} className="flex gap-4 p-4">
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
                    className="line-clamp-1 text-sm font-semibold text-slate-900 hover:text-indigo-600 dark:text-white dark:hover:text-indigo-400"
                  >
                    {product.name}
                  </Link>
                  <p className="mt-0.5 text-sm font-bold text-slate-900 dark:text-white">
                    {formatCurrency(item.price)}
                  </p>

                  <div className="mt-auto flex items-center justify-between gap-2 pt-2">
                    <div className="flex items-center rounded-lg border border-slate-300 dark:border-slate-600">
                      <button
                        type="button"
                        onClick={() => handleQuantityChange(product._id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        className="p-2 text-slate-600 transition hover:text-slate-900 disabled:opacity-40 dark:text-slate-300 dark:hover:text-white"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="size-3.5" />
                      </button>
                      <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => handleQuantityChange(product._id, item.quantity + 1)}
                        disabled={item.quantity >= product.stock}
                        className="p-2 text-slate-600 transition hover:text-slate-900 disabled:opacity-40 dark:text-slate-300 dark:hover:text-white"
                        aria-label="Increase quantity"
                      >
                        <Plus className="size-3.5" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemove(product._id)}
                      className="rounded-lg p-2 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10"
                      aria-label={`Remove ${product.name} from cart`}
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        <div className="h-fit space-y-4 lg:sticky lg:top-24">
          <Card className="p-5">
            <h2 className="mb-4 text-base font-semibold text-slate-900 dark:text-white">
              Order summary
            </h2>

            {cart.coupon && (
              <div className="mb-4 flex items-center justify-between rounded-xl bg-emerald-50 px-3 py-2 text-sm dark:bg-emerald-500/10">
                <span className="flex items-center gap-1.5 font-medium text-emerald-700 dark:text-emerald-400">
                  <Tag className="size-4" />
                  {typeof cart.coupon === "object" && "code" in cart.coupon
                    ? cart.coupon.code
                    : "Coupon applied"}
                </span>
                <button
                  type="button"
                  onClick={handleRemoveCoupon}
                  className="text-emerald-600 hover:text-emerald-500 dark:text-emerald-400"
                  aria-label="Remove coupon"
                >
                  <X className="size-4" />
                </button>
              </div>
            )}

            <dl className="space-y-2.5 text-sm">
              <div className="flex justify-between text-slate-600 dark:text-slate-300">
                <dt>Subtotal</dt>
                <dd className="font-medium">{formatCurrency(cart.totalAmount)}</dd>
              </div>
              {cart.discount > 0 && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                  <dt>Discount</dt>
                  <dd className="font-medium">−{formatCurrency(cart.discount)}</dd>
                </div>
              )}
              <div className="flex justify-between text-slate-600 dark:text-slate-300">
                <dt>Shipping</dt>
                <dd className="font-medium">
                  {shipping === 0 ? (
                    <span className="text-emerald-600 dark:text-emerald-400">Free</span>
                  ) : (
                    formatCurrency(shipping)
                  )}
                </dd>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-300">
                <dt>Estimated GST / Tax (18%)</dt>
                <dd className="font-medium">{formatCurrency(tax)}</dd>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-2.5 text-base font-bold text-slate-900 dark:border-slate-700 dark:text-white">
                <dt>Total</dt>
                <dd>{formatCurrency(totalAmount)}</dd>
              </div>
            </dl>

            <form onSubmit={handleApplyCoupon} className="mt-4 flex gap-2">
              <input
                value={code}
                onChange={(event) => setCode(event.target.value)}
                placeholder="Coupon code"
                className="h-10 min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-3 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
              />
              <Button type="submit" variant="outline" disabled={!code.trim()} loading={applyCoupon.isPending}>
                Apply
              </Button>
            </form>

            <Button
              size="lg"
              className="mt-4 w-full"
              onClick={() => navigate("/checkout")}
            >
              Proceed to checkout <ArrowRight className="size-5" />
            </Button>
          </Card>
        </div>
      </div>

      <ConfirmDialog
        open={clearOpen}
        onClose={() => setClearOpen(false)}
        onConfirm={handleClear}
        title="Clear your cart?"
        description="All items will be removed from your cart. This cannot be undone."
        confirmLabel="Clear cart"
        danger
        loading={clearCart.isPending}
      />
    </PageLayout>
  );
};

export default CartPage;
