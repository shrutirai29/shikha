import { Link, useParams } from "react-router-dom";
import {
  ChevronLeft,
  CreditCard,
  MapPin,
  Package,
  ShoppingBag,
} from "lucide-react";
import { useOrder } from "@/hooks/useApi";
import { PageLayout } from "@/components/layout/PageLayout";
import { Badge, Card, PageLoader } from "@/components/ui/Card";
import { ErrorState } from "@/components/ui/States";
import { Button } from "@/components/ui/Button";
import { getErrorMessage } from "@/lib/api";
import { formatCurrency, formatDateTime } from "@/lib/utils";

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

export const OrderDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const { data: order, isLoading, isError, error, refetch } = useOrder(id);

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

  return (
    <PageLayout>
      <Link
        to="/orders"
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
      >
        <ChevronLeft className="size-4" /> Back to orders
      </Link>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
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

            <div className="mt-4 rounded-xl bg-slate-50 px-3 py-2.5 text-sm dark:bg-slate-700/40">
              <p className="font-medium text-slate-700 dark:text-slate-200">
                Payment method: {order.paymentMethod === "COD" ? "Cash on Delivery" : "Razorpay (online)"}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Status: {order.paymentStatus}
              </p>
            </div>

            {isRazorpayPending && (
              <Link to={`/payment/${order._id}`} className="mt-4 block">
                <Button className="w-full">Complete payment</Button>
              </Link>
            )}
          </Card>
        </div>
      </div>
    </PageLayout>
  );
};

export default OrderDetailsPage;
