import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Banknote,
  Check,
  ChevronLeft,
  CreditCard,
  FileText,
  MapPin,
  Package,
  ShoppingBag,
  Truck,
  X,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { downloadOrderInvoice, useCancelOrder, useOrder } from "@/hooks/useApi";
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
      <div className="flex items-center gap-3 rounded-2xl border border-[#B85C4A]/30 bg-[#B85C4A]/10 px-5 py-4 dark:border-[#D47763]/30 dark:bg-[#D47763]/10">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#B85C4A] text-white dark:bg-[#D47763] dark:text-[#1F1816]">
          <X className="size-5" />
        </span>
        <div>
          <p className="text-sm font-semibold text-[#914536] dark:text-[#E28A76]">
            Order cancelled
          </p>
          <p className="text-xs text-[#806E66] dark:text-[#C7B8AE]">
            Any reserved stock has been returned to inventory.
          </p>
        </div>
      </div>
    );
  }

  const current = LIFECYCLE.indexOf(status as (typeof LIFECYCLE)[number]);

  return (
    <ol className="flex items-center min-w-full overflow-x-auto pb-2 scrollbar-none touch-pan-x [-webkit-overflow-scrolling:touch]" aria-label="Order status">
      {LIFECYCLE.map((step, index) => {
        const complete = index <= current;

        return (
          <li
            key={step}
            className={cn(
              "flex items-center shrink-0 sm:shrink",
              index < LIFECYCLE.length - 1 && "flex-1 min-w-[70px] sm:min-w-0"
            )}
          >
            <div className="flex flex-col items-center gap-1.5 sm:gap-2">
              <span
                className={cn(
                  "flex size-7 sm:size-9 items-center justify-center rounded-full border-2 text-xs sm:text-sm transition",
                  complete
                    ? "border-[#B85C4A] bg-[#B85C4A] text-white shadow-soft"
                    : "border-[#E8DCD0] bg-[#FFFCF7] text-[#806E66] dark:border-[#382823] dark:bg-[#1E1614] dark:text-[#C7B8AE]"
                )}
              >
                {complete ? <Check className="size-3.5 sm:size-4" /> : index + 1}
              </span>
              <span
                className={cn(
                  "whitespace-nowrap text-[10px] sm:text-xs font-medium",
                  complete
                    ? "text-[#3B2924] dark:text-[#FFF4E8]"
                    : "text-[#806E66] dark:text-[#C7B8AE]"
                )}
              >
                {STEP_LABELS[step] ?? step}
              </span>
            </div>
            {index < LIFECYCLE.length - 1 && (
              <span
                className={cn(
                  "mx-1.5 sm:mx-2 mb-5 sm:mb-6 h-0.5 flex-1 rounded-full transition min-w-[20px]",
                  index < current
                    ? "bg-[#B85C4A] dark:bg-[#D47763]"
                    : "bg-[#E8DCD0] dark:bg-[#382823]"
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
  const { user } = useAuth();
  const cancelOrder = useCancelOrder();
  const toast = useToast();
  const [cancelOpen, setCancelOpen] = useState(false);
  const [downloadingInvoice, setDownloadingInvoice] = useState(false);

  // Admins can open any order from the admin panel, but must not be able to
  // cancel or pay on the customer's behalf from this view.
  const isAdminViewer = user?.role === "admin";

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

  const handleDownloadInvoice = async () => {
    try {
      setDownloadingInvoice(true);
      await downloadOrderInvoice(order._id);
      toast.success("Tax Invoice generated!");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDownloadingInvoice(false);
    }
  };

  return (
    <PageLayout>
      <Link
        to="/orders"
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-[#806E66] transition hover:text-[#3B2924] dark:text-[#C7B8AE] dark:hover:text-[#FFF4E8]"
      >
        <ChevronLeft className="size-4" /> Back to orders
      </Link>

      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-[#3B2924] dark:text-[#FFF4E8]">
            Order #{order._id.slice(-6).toUpperCase()}
          </h1>
          <p className="mt-1 text-sm text-[#806E66] dark:text-[#C7B8AE]">
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
            <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-[#3B2924] dark:text-[#FFF4E8]">
              <ShoppingBag className="size-4.5 text-[#B85C4A] dark:text-[#D47763]" />
              Items ({order.items.length})
            </h2>

            <div className="space-y-3">
              {order.items.map((item, index) => {
                const productId =
                  typeof item.product === "string" ? item.product : item.product._id;

                return (
                  <div key={`${productId}-${index}`} className="flex items-center gap-4">
                    <div className="size-16 shrink-0 overflow-hidden rounded-xl bg-[#F5EDE4] dark:bg-[#352925]">
                      {item.image ? (
                        <img src={item.image} alt={item.name} loading="lazy" className="size-full object-cover" />
                      ) : null}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-[#3B2924] dark:text-[#FFF4E8]">
                        {item.name}
                      </p>
                      <p className="text-xs text-[#806E66] dark:text-[#C7B8AE]">
                        {formatCurrency(item.price)} × {item.quantity}
                      </p>
                    </div>
                    <span className="text-sm font-bold text-[#3B2924] dark:text-[#FFF4E8]">
                      {formatCurrency(item.price * item.quantity)}
                    </span>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="mb-3 flex items-center gap-2 text-base font-semibold text-[#3B2924] dark:text-[#FFF4E8]">
              <MapPin className="size-4.5 text-[#B85C4A] dark:text-[#D47763]" />
              Delivery address
            </h2>
            <div className="text-sm text-[#806E66] dark:text-[#C7B8AE]">
              <p className="font-semibold text-[#3B2924] dark:text-[#FFF4E8]">
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
            <h2 className="mb-4 text-base font-semibold text-[#3B2924] dark:text-[#FFF4E8]">
              Payment summary
            </h2>

            <dl className="space-y-2.5 text-sm">
              <div className="flex justify-between text-[#806E66] dark:text-[#C7B8AE]">
                <dt>Subtotal</dt>
                <dd>{formatCurrency(order.subtotal)}</dd>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-[#7A8B68] dark:text-[#9BAF83]">
                  <dt>Discount</dt>
                  <dd>−{formatCurrency(order.discount)}</dd>
                </div>
              )}
              <div className="flex justify-between text-[#806E66] dark:text-[#C7B8AE]">
                <dt>Shipping</dt>
                <dd>
                  {order.shippingCharge === 0 ? "Free" : formatCurrency(order.shippingCharge)}
                </dd>
              </div>
              <div className="flex justify-between text-[#806E66] dark:text-[#C7B8AE]">
                <dt>Tax (18%)</dt>
                <dd>{formatCurrency(order.tax)}</dd>
              </div>
              <div className="flex justify-between border-t border-[#E8DCD0] pt-2.5 text-base font-bold text-[#3B2924] dark:border-[#493A34] dark:text-[#FFF4E8]">
                <dt>Total</dt>
                <dd>{formatCurrency(order.totalAmount)}</dd>
              </div>
            </dl>

            <div className="mt-4 rounded-xl bg-[#F5EDE4] px-3 py-2.5 text-sm dark:bg-[#352925]">
              <p className="font-medium text-[#3B2924] dark:text-[#FFF4E8]">
                Payment method: {order.paymentMethod === "COD" ? "Cash on Delivery" : "Razorpay (online)"}
              </p>
              <p className="text-xs text-[#806E66] dark:text-[#C7B8AE]">
                Status: {order.paymentStatus}
              </p>
            </div>

            {isCodPending && order.orderStatus !== "Cancelled" && (
              <div className="mt-3 flex items-center gap-2 rounded-xl border border-[#7A8B68]/30 bg-[#7A8B68]/10 px-3 py-2.5 text-sm dark:border-[#9BAF83]/30 dark:bg-[#9BAF83]/20">
                <Banknote className="size-4 shrink-0 text-[#7A8B68] dark:text-[#9BAF83]" />
                <p className="text-[#3B2924] dark:text-[#FFF4E8]">
                  Pay <span className="font-bold">{formatCurrency(order.totalAmount)}</span> cash
                  on delivery.
                </p>
              </div>
            )}

            {order.shipping?.trackingUrl && (
              <a
                href={order.shipping.trackingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 flex items-center gap-2 rounded-xl border border-[#B85C4A]/25 bg-[#B85C4A]/10 px-3 py-2.5 text-sm text-[#B85C4A] transition hover:bg-[#B85C4A]/15 dark:border-[#D47763]/25 dark:bg-[#D47763]/10 dark:text-[#D47763] dark:hover:bg-[#D47763]/20"
              >
                <Truck className="size-4 shrink-0" />
                <span>
                  Track shipment
                  {order.shipping.trackingId
                    ? ` (${[order.shipping.provider, order.shipping.trackingId]
                        .filter(Boolean)
                        .join(" ")})`
                    : ""}
                </span>
              </a>
            )}

            {isRazorpayPending && !isAdminViewer && (
              <Link to={`/payment/${order._id}`} className="mt-4 block">
                <Button className="w-full">Complete payment</Button>
              </Link>
            )}

            <Button
              variant="outline"
              className="mt-3 w-full"
              onClick={handleDownloadInvoice}
              loading={downloadingInvoice}
            >
              <FileText className="size-4" /> Download Tax Invoice
            </Button>

            {canCancel && !isAdminViewer && (
              <Button
                variant="outline"
                className="mt-3 w-full border-[#B85C4A]/35 text-[#914536] hover:bg-[#B85C4A]/10 hover:border-[#B85C4A]/50 dark:border-[#D47763]/35 dark:text-[#E28A76] dark:hover:bg-[#D47763]/15"
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
