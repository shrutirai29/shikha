import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Banknote,
  Check,
  ChevronLeft,
  MapPin,
  RefreshCw,
  ShoppingBag,
  Truck,
  X,
} from "lucide-react";
import { useDeliveryAction, useDeliveryOrder } from "@/hooks/useApi";
import { useToast } from "@/context/ToastContext";
import { Badge, Card, PageLoader } from "@/components/ui/Card";
import { ErrorState } from "@/components/ui/States";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { getErrorMessage } from "@/lib/api";
import { formatCurrency, formatDateTime } from "@/lib/utils";

const statusVariant = (status: string) => {
  switch (status) {
    case "Delivered":
      return "success" as const;
    case "Cancelled":
    case "RTO":
      return "danger" as const;
    case "OutForDelivery":
      return "info" as const;
    default:
      return "default" as const;
  }
};

export const DeliveryOrderDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { data: order, isLoading, isError, error, refetch } = useDeliveryOrder(id);
  const action = useDeliveryAction();
  const toast = useToast();

  const [attemptOpen, setAttemptOpen] = useState(false);
  const [completeOpen, setCompleteOpen] = useState(false);
  const [rtoOpen, setRtoOpen] = useState(false);

  const [note, setNote] = useState("");
  const [otp, setOtp] = useState("");
  const [codCollected, setCodCollected] = useState(true);
  const [rtoNote, setRtoNote] = useState("");

  const runAction = async (
    actionName: "out-for-delivery" | "otp" | "attempt" | "complete" | "rto",
    body?: Record<string, unknown>,
    successMessage?: string
  ) => {
    try {
      await action.mutateAsync({ orderId: id!, action: actionName, body });
      toast.success(successMessage ?? "Action completed");
      setAttemptOpen(false);
      setCompleteOpen(false);
      setRtoOpen(false);
      setOtp("");
      setNote("");
    } catch (actionError) {
      toast.error(getErrorMessage(actionError));
    }
  };

  if (isLoading) {
    return <PageLoader />;
  }

  if (isError || !order) {
    return (
      <ErrorState message={getErrorMessage(error)} onRetry={() => void refetch()} />
    );
  }

  const isCod = order.paymentMethod === "COD";
  const isOut = order.orderStatus === "OutForDelivery";
  const isShipped = ["Shipped", "Processing"].includes(order.orderStatus);
  const isFinal = ["Delivered", "Cancelled", "RTO"].includes(order.orderStatus);

  return (
    <div className="space-y-6">
      <Link
        to="/delivery"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
      >
        <ChevronLeft className="size-4" /> Back to assigned orders
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            <Truck className="size-6 text-indigo-600 dark:text-indigo-400" />
            Order #{order._id.slice(-6).toUpperCase()}
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Placed on {formatDateTime(order.createdAt)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={statusVariant(order.orderStatus)}>
            {order.orderStatus}
          </Badge>
          <Badge variant={isCod ? "warning" : "info"}>
            {order.paymentMethod}
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
              {order.items.map((item, index) => (
                <div key={`${item.name}-${index}`} className="flex items-center gap-4">
                  <div className="size-14 shrink-0 overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-700/40">
                    {item.image && (
                      <img src={item.image} alt={item.name} loading="lazy" className="size-full object-cover" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{item.name}</p>
                    <p className="text-xs text-slate-400">
                      {formatCurrency(item.price)} × {item.quantity}
                    </p>
                  </div>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">
                    {formatCurrency(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="mb-3 flex items-center gap-2 text-base font-semibold text-slate-900 dark:text-white">
              <MapPin className="size-4.5 text-indigo-600 dark:text-indigo-400" />
              Delivery address
            </h2>
            <div className="text-sm text-slate-600 dark:text-slate-300">
              <p className="font-semibold text-slate-900 dark:text-white">
                {order.shippingAddress.fullName}
              </p>
              <p>{order.shippingAddress.phone}</p>
              <p>
                {order.shippingAddress.addressLine1}
                {order.shippingAddress.addressLine2 ? `, ${order.shippingAddress.addressLine2}` : ""}
              </p>
              <p>
                {order.shippingAddress.city}, {order.shippingAddress.state} —{" "}
                {order.shippingAddress.postalCode}
              </p>
            </div>
          </Card>
        </div>

        <div className="h-fit space-y-4">
          <Card className="p-5">
            <h2 className="mb-4 text-base font-semibold text-slate-900 dark:text-white">
              Amount
            </h2>
            <dl className="space-y-2 text-sm">
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
              <div className="flex justify-between border-t border-slate-200 pt-2 text-base font-bold text-slate-900 dark:border-slate-700 dark:text-white">
                <dt>Total</dt>
                <dd>{formatCurrency(order.totalAmount)}</dd>
              </div>
            </dl>

            {isCod && order.orderStatus !== "Delivered" && (
              <div className="mt-3 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm dark:border-emerald-500/25 dark:bg-emerald-500/10">
                <Banknote className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <p className="text-emerald-800 dark:text-emerald-200">
                  Collect <span className="font-bold">{formatCurrency(order.totalAmount)}</span> cash
                  on delivery.
                </p>
              </div>
            )}
          </Card>

          {/* Actions */}
          <Card className="p-5">
            <h2 className="mb-3 text-base font-semibold text-slate-900 dark:text-white">
              Delivery actions
            </h2>

            {isShipped && (
              <Button
                className="w-full"
                loading={action.isPending}
                onClick={() => runAction("out-for-delivery", undefined, "Order is out for delivery — a delivery code was sent to the customer")}
              >
                <Truck className="size-4" />
                Start delivery (send code)
              </Button>
            )}

            {isOut && (
              <div className="space-y-3">
                <div className="rounded-xl bg-slate-100 px-3 py-2.5 text-sm dark:bg-slate-700/40">
                  <p className="font-medium text-slate-700 dark:text-slate-200">
                    Delivery code sent to the customer
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Ask the customer for the 6-digit code to confirm delivery.
                  </p>
                </div>
                <Button
                  variant="outline"
                  className="w-full"
                  loading={action.isPending}
                  onClick={() => runAction("otp", undefined, "A new delivery code has been sent")}
                >
                  <RefreshCw className="size-4" />
                  Resend code
                </Button>
                <Button variant="outline" className="w-full" onClick={() => setAttemptOpen(true)}>
                  Record failed attempt
                </Button>
                <Button className="w-full" onClick={() => setCompleteOpen(true)}>
                  <Check className="size-4" />
                  Complete delivery (enter code)
                </Button>
                <Button
                  variant="outline"
                  className="w-full border-amber-300 text-amber-700 hover:bg-amber-50 dark:border-amber-500/40 dark:text-amber-300 dark:hover:bg-amber-500/10"
                  onClick={() => setRtoOpen(true)}
                >
                  Mark return to origin
                </Button>
              </div>
            )}

            {isFinal && (
              <div className="space-y-2 text-sm">
                {order.orderStatus === "Delivered" && (
                  <>
                    <p className="flex items-center gap-2 font-medium text-emerald-600 dark:text-emerald-400">
                      <Check className="size-4" /> Delivered
                      {order.delivery?.deliveredAt
                        ? ` on ${formatDateTime(order.delivery.deliveredAt)}`
                        : ""}
                    </p>
                    {isCod && (
                      <p className="text-slate-600 dark:text-slate-300">
                        COD:{" "}
                        {order.delivery?.codCollected
                          ? "collected"
                          : "not collected"}
                      </p>
                    )}
                  </>
                )}
                {(order.orderStatus === "Cancelled" || order.orderStatus === "RTO") && (
                  <p className="flex items-center gap-2 font-medium text-rose-600 dark:text-rose-400">
                    <X className="size-4" /> {order.orderStatus}
                    {order.delivery?.rtoReason && (
                      <span className="font-normal text-slate-500">
                        — {order.delivery.rtoReason}
                      </span>
                    )}
                  </p>
                )}
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Failed attempt modal */}
      <Modal
        open={attemptOpen}
        onClose={() => setAttemptOpen(false)}
        title="Record failed delivery attempt"
        footer={
          <>
            <Button variant="outline" onClick={() => setAttemptOpen(false)}>Cancel</Button>
            <Button
              onClick={() =>
                runAction("attempt", { note: note || undefined, refused: note.includes("refus") || undefined }, "Attempt recorded")
              }
              loading={action.isPending}
            >
              Save
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Note why the delivery could not be completed (e.g. customer refused, no one
            available). The order stays out for delivery.
          </p>
          <textarea
            className="min-h-24 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. Customer refused delivery"
          />
        </div>
      </Modal>

      {/* Complete delivery modal */}
      <Modal
        open={completeOpen}
        onClose={() => setCompleteOpen(false)}
        title="Complete delivery"
        footer={
          <>
            <Button variant="outline" onClick={() => setCompleteOpen(false)}>Cancel</Button>
            <Button
              disabled={otp.length !== 6}
              onClick={() =>
                runAction("complete", { otp, codCollected }, "Delivery completed")
              }
              loading={action.isPending}
            >
              Confirm delivery
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Enter the 6-digit code the customer received. The order cannot be marked
            delivered without it.
          </p>
          <input
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-center text-2xl font-bold tracking-[0.5em] text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
            placeholder="••••••"
            inputMode="numeric"
            autoFocus
          />
          {isCod && (
            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 p-3 dark:border-slate-600">
              <input
                type="checkbox"
                checked={codCollected}
                onChange={(e) => setCodCollected(e.target.checked)}
                className="size-4 text-indigo-600"
              />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                COD amount collected ({formatCurrency(order.totalAmount)})
              </span>
            </label>
          )}
        </div>
      </Modal>

      {/* RTO modal */}
      <Modal
        open={rtoOpen}
        onClose={() => setRtoOpen(false)}
        title="Mark return to origin"
        footer={
          <>
            <Button variant="outline" onClick={() => setRtoOpen(false)}>Cancel</Button>
            <Button
              variant="danger"
              onClick={() => runAction("rto", { note: rtoNote || undefined }, "Order marked return-to-origin")}
              loading={action.isPending}
            >
              Confirm RTO
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            The package will come back to the warehouse and stock will be restored. This
            cannot be undone.
          </p>
          <textarea
            className="min-h-20 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
            value={rtoNote}
            onChange={(e) => setRtoNote(e.target.value)}
            placeholder="Reason (e.g. customer refused, undeliverable address)"
          />
        </div>
      </Modal>
    </div>
  );
};

export default DeliveryOrderDetailPage;
