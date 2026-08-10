import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Banknote,
  Check,
  ChevronLeft,
  CreditCard,
  MapPin,
  Package,
  ShoppingBag,
  X,
} from "lucide-react";
import { useCancelOrder, useOrder } from "@/hooks/useApi";
import { PageLayout } from "@/components/layout/PageLayout";
import { Badge, Card, PageLoader } from "@/components/ui/Card";
import { ErrorState } from "@/components/ui/States";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/Modal";
import { useToast } from "@/context/ToastContext";
import { getErrorMessage } from "@/lib/api";
import { cn, formatCurrency, formatDateTime } from "@/lib/utils";

const orderStatusVariant = (status: string) => {
  switch (status) {
    case "Delivered":
      return "success" as const;
    case "Cancelled":
      return "danger" as const;
    case "Shipped":
      return "info" as const;
    case "Processing":
      return "warning" as const;
    default:
      return "default" as const;
  }
};

const paymentStatusVariant = (status: string) => {
  switch (status) {
    case "Paid":
      return "success" as const;
    case "Failed":
    case "Refunded":
      return "danger" as const;
    default:
      return "warning" as const;
  }
};

const LIFECYCLE = ["Pending", "Processing", "Shipped", "Delivered"] as const;

const STEP_LABELS: Record<string, string> = {
  Pending: "Order placed",
  Processing: "Confirmed",
  Shipped: "Shipped",
  Delivered: "Delivered",
};

const StatusTimeline = ({ status }: { status: string }) => {
  if (status === "Cancelled") {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50/70 px-5 py-4 dark:border-rose-500/25 dark:bg-rose-500/10">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-rose-600 text-white">
          <X className="size-5" />
        </span>
        <div>
          <p className="text-sm font-semibold text-rose-800 dark:text-rose-200">
            Order cancelled
          </p>
          <p className="text-xs text-rose-600/80 dark:text-rose-300/70">
            Any reserved stock has been returned to inventory.
          </p>
        </div>
      </div>
    );
  }

  const current = LIFECYCLE.indexOf(status as (typeof LIFECYCLE)[number]);

  return (
    <ol className="flex items-center" aria-label="Order status">
      {LIFECYCLE.map((step, index) => {
        const complete = index <= current;

        return (
          <li
            key={step}
            className={cn(
              "flex items-center",
              index < LIFECYCLE.length - 1 && "flex-1"
            )}
          >
            <div className="flex flex-col items-center gap-2">
              <span
                className={cn(
                  "flex size-9 items-center justify-center rounded-full border-2 transition",
                  complete
                    ? "border-indigo-600 bg-indigo-600 text-white shadow-glow"
                    : "border-slate-300 bg-white text-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-500"
                )}
              >
                {complete ? <Check className="size-4" /> : index + 1}
              </span>
              <span
                className={cn(
                  "whitespace-nowrap text-xs font-medium",
                  complete
                    ? "text-slate-900 dark:text-slate-100"
                    : "text-slate-400 dark:text-slate-500"
                )}
              >
                {STEP_LABELS[step] ?? step}
              </span>
            </div>
            {index < LIFECYCLE.length - 1 && (
              <span
                className={cn(
                  "mx-2 mb-6 h-0.5 flex-1 rounded-full transition",
                  index < current
                    ? "bg-indigo-600"
                    : "bg-slate-200 dark:bg-slate-700"
                )}
                aria-hidden="true"
              />
            )}
          </li>
        );
      })}
    </ol>
  );
};

export const OrderDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const { data: order, isLoading, isError, error, refetch } = useOrder(id);
  const cancelOrder = useCancelOrder();
  const toast = useToast();
  const [cancelOpen, setCancelOpen] = useState(false);

  if (isLoading) {
    return <PageLoader />;
  }

  if (isError || !order) {
    return (
      <PageLayout>
        <ErrorState
          title="Order not found"
          message={getErrorMessage(error)}
          onRetry={() => void refetch()}
        />
      </PageLayout>
    );
  }

  const shippingAddress = order.shippingAddress;
  const isRazorpayPending =
    order.paymentMethod === "RAZORPAY" && order.paymentStatus === "Pending";
  const isCodPending =
    order.paymentMethod === "COD" && order.paymentStatus !== "Paid";

  const canCancel =
    (order.orderStatus === "Pending" || order.orderStatus === "Processing") &&
    order.paymentStatus !== "Paid";

  const handleCancel = async () => {
    try {
      await cancelOrder.mutateAsync(order._id);
      toast.success("Order cancelled successfully");
      setCancelOpen(false);
    } catch (cancelError) {
      toast.error(getErrorMessage(cancelError));
    }
  };

  return (
    <PageLayout>
      <Link
        to="/orders"
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
      >
        <ChevronLeft className="size-4" /> Back to orders
      </Link>

      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-slate-950 dark:text-slate-50">
            Order #{order._id.slice(-6).toUpperCase()}
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Placed on {formatDateTime(order.createdAt)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={orderStatusVariant(order.orderStatus)}>
            <Package className="size-3.5" /> {order.orderStatus}
          </Badge>
          <Badge variant={paymentStatusVariant(order.paymentStatus)}>
            <CreditCard className="size-3.5" /> {order.paymentStatus}
          </Badge>
        </div>
      </div>

      <Card className="mb-6 p-6">
        <StatusTimeline status={order.orderStatus} />
      </Card>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <Card className="p-5">
            <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-slate-900 dark:text-white">
              <ShoppingBag className="size-4.5 text-indigo-600 dark:text-indigo-400" />
              Items ({order.items.length})
            </h2>

            <div className="space-y-3">
              {order.items.map((item, index) => {
                const productId =
                  typeof item.product === "string" ? item.product : item.product._id;

                return (
                  <div key={`${productId}-${index}`} className="flex items-center gap-4">
                    <div className="size-16 shrink-0 overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-700/40">
                      {item.image ? (
                        <img src={item.image} alt={item.name} loading="lazy" className="size-full object-cover" />
                      ) : null}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">
                        {item.name}
                      </p>
                      <p className="text-xs text-slate-400">
                        {formatCurrency(item.price)} × {item.quantity}
                      </p>
                    </div>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                      {formatCurrency(item.price * item.quantity)}
                    </span>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="mb-3 flex items-center gap-2 text-base font-semibold text-slate-900 dark:text-white">
              <MapPin className="size-4.5 text-indigo-600 dark:text-indigo-400" />
              Delivery address
            </h2>
            <div className="text-sm text-slate-600 dark:text-slate-300">
              <p className="font-semibold text-slate-900 dark:text-white">
                {shippingAddress.fullName}
              </p>
              <p>{shippingAddress.phone}</p>
              <p>
                {shippingAddress.addressLine1}
                {shippingAddress.addressLine2 ? `, ${shippingAddress.addressLine2}` : ""}
              </p>
              <p>
                {shippingAddress.city}, {shippingAddress.state} — {shippingAddress.postalCode}
              </p>
              <p>{shippingAddress.country}</p>
            </div>
          </Card>
        </div>

        <div className="h-fit space-y-4">
          <Card className="p-5">
            <h2 className="mb-4 text-base font-semibold text-slate-900 dark:text-white">
              Payment summary
            </h2>

            <dl className="space-y-2.5 text-sm">
              <div className="flex justify-between text-slate-600 dark:text-slate-300">
                <dt>Subtotal</dt>
                <dd>{formatCurrency(order.subtotal)}</dd>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                  <dt>Discount</dt>
                  <dd>−{formatCurrency(order.discount)}</dd>
                </div>
              )}
              <div className="flex justify-between text-slate-600 dark:text-slate-300">
                <dt>Shipping</dt>
                <dd>
                  {order.shippingCharge === 0 ? "Free" : formatCurrency(order.shippingCharge)}
                </dd>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-300">
                <dt>Tax (18%)</dt>
                <dd>{formatCurrency(order.tax)}</dd>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-2.5 text-base font-bold text-slate-900 dark:border-slate-700 dark:text-white">
                <dt>Total</dt>
                <dd>{formatCurrency(order.totalAmount)}</dd>
              </div>
            </dl>

            <div className="mt-4 rounded-xl bg-slate-100 px-3 py-2.5 text-sm dark:bg-slate-700/40">
              <p className="font-medium text-slate-700 dark:text-slate-200">
                Payment method: {order.paymentMethod === "COD" ? "Cash on Delivery" : "Razorpay (online)"}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Status: {order.paymentStatus}
              </p>
            </div>

            {isCodPending && order.orderStatus !== "Cancelled" && (
              <div className="mt-3 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm dark:border-emerald-500/25 dark:bg-emerald-500/10">
                <Banknote className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <p className="text-emerald-800 dark:text-emerald-200">
                  Pay <span className="font-bold">{formatCurrency(order.totalAmount)}</span> cash
                  on delivery.
                </p>
              </div>
            )}

            {isRazorpayPending && (
              <Link to={`/payment/${order._id}`} className="mt-4 block">
                <Button className="w-full">Complete payment</Button>
              </Link>
            )}

            {canCancel && (
              <Button
                variant="outline"
                className="mt-3 w-full border-rose-300 text-rose-700 hover:bg-rose-50 hover:border-rose-400 dark:border-rose-500/40 dark:text-rose-300 dark:hover:bg-rose-500/10"
                onClick={() => setCancelOpen(true)}
                loading={cancelOrder.isPending}
              >
                Cancel order
              </Button>
            )}
          </Card>
        </div>
      </div>

      <ConfirmDialog
        open={cancelOpen}
        onClose={() => setCancelOpen(false)}
        onConfirm={() => void handleCancel()}
        title="Cancel this order?"
        description="You can only cancel an order that hasn't been shipped or paid for. Reserved stock will be returned to inventory."
        confirmLabel="Cancel order"
        danger
        loading={cancelOrder.isPending}
      />
    </PageLayout>
  );
};

export default OrderDetailsPage;
