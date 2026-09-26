import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, Truck } from "lucide-react";
import { api, getErrorMessage } from "@/lib/api";
import { useAllOrders } from "@/hooks/useApi";
import { useToast } from "@/context/ToastContext";
import { Badge, Card } from "@/components/ui/Card";
import { ErrorState, EmptyState } from "@/components/ui/States";
import { PageLoader } from "@/components/ui/Card";
import { PaginationBar } from "@/components/ui/Pagination";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { cn, formatCurrency, formatDateTime } from "@/lib/utils";

const statuses = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"] as const;

// Legal next states per current status — mirrors the backend transition map.
const NEXT_STATUS: Record<string, string[]> = {
  Pending: ["Processing", "Shipped", "Delivered", "Cancelled"],
  Processing: ["Shipped", "Delivered", "Cancelled"],
  Shipped: ["Delivered"],
  Delivered: [],
  Cancelled: [],
};

const statusVariant = (status: string) => {
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

const inputCls =
  "w-full rounded-xl border border-[#E8DCD0] bg-[#FFFCF7] px-3.5 py-2.5 text-sm text-[#3B2924] placeholder:text-[#806E66]/60 transition-colors focus:border-[#B85C4A] focus:outline-none focus:ring-2 focus:ring-[#B85C4A]/20 dark:border-[#382823] dark:bg-[#1A1210]/90 dark:text-[#FFF4E8] dark:placeholder:text-[#B3A198]/50 dark:focus:border-[#D47763] dark:focus:ring-[#D47763]/25";

export const OrdersPage = () => {
  const toast = useToast();
  const queryClient = useQueryClient();

  const [filters, setFilters] = useState<{
    status?: "Pending" | "Processing" | "Shipped" | "Delivered" | "Cancelled";
    paymentMethod?: "COD" | "RAZORPAY";
    q?: string;
  }>({});
  const [page, setPage] = useState(1);

  const { data, isLoading, isError, error, refetch } = useAllOrders({
    ...filters,
    page,
  });

  const [statusModal, setStatusModal] = useState<{
    id: string;
    current: string;
    orderId: string;
  } | null>(null);
  const [newStatus, setNewStatus] = useState<string>("");

  const [shippingModal, setShippingModal] = useState<{
    id: string;
    provider: string;
    trackingId: string;
    trackingUrl: string;
  } | null>(null);

  const updateShipping = useMutation({
    mutationFn: async () => {
      if (!shippingModal) return;
      const { data: response } = await api.patch<{ data: unknown }>(
        `/orders/admin/${shippingModal.id}/shipping`,
        {
          provider: shippingModal.provider || undefined,
          trackingId: shippingModal.trackingId || undefined,
          trackingUrl: shippingModal.trackingUrl || undefined,
        }
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success("Tracking updated");
      setShippingModal(null);
      invalidate();
    },
    onError: (shippingError) => {
      toast.error(getErrorMessage(shippingError));
    },
  });

  const invalidate = () =>
    void queryClient.invalidateQueries({ queryKey: ["admin-orders"] });

  const updateStatus = useMutation({
    mutationFn: async () => {
      if (!statusModal) return;
      const { data: response } = await api.patch<{ data: unknown }>(
        `/orders/admin/${statusModal.id}/status`,
        { status: newStatus }
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success("Order status updated");
      setStatusModal(null);
      invalidate();
    },
    onError: (statusError) => {
      toast.error(getErrorMessage(statusError));
    },
  });

  if (isLoading) {
    return <PageLoader />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#3B2924] dark:text-[#FFF4E8]">
          Orders
        </h1>
        <p className="mt-1 text-sm text-[#806E66] dark:text-[#B3A198]">
          Review and fulfill customer purchases
        </p>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#806E66] dark:text-[#B3A198]" />
            <input
              className={cn(inputCls, "pl-9")}
              placeholder="Search order # or customer…"
              value={filters.q ?? ""}
              onChange={(e) => {
                setPage(1);
                setFilters((f) => ({ ...f, q: e.target.value }));
              }}
            />
          </div>
          <select
            className={inputCls}
            value={filters.status ?? ""}
            onChange={(e) => {
              setPage(1);
              const value = e.target.value as
                | "Pending"
                | "Processing"
                | "Shipped"
                | "Delivered"
                | "Cancelled"
                | "";
              setFilters((f) => ({ ...f, status: value || undefined }));
            }}
          >
            <option value="">All statuses</option>
            {statuses.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <select
            className={inputCls}
            value={filters.paymentMethod ?? ""}
            onChange={(e) => {
              setPage(1);
              const value = e.target.value as "COD" | "RAZORPAY" | "";
              setFilters((f) => ({
                ...f,
                paymentMethod: value || undefined,
              }));
            }}
          >
            <option value="">All payment methods</option>
            <option value="COD">COD</option>
            <option value="RAZORPAY">Razorpay</option>
          </select>
          <Button variant="outline" onClick={() => { setFilters({}); setPage(1); }}>
            Clear filters
          </Button>
        </div>
      </Card>

      {isError ? (
        <ErrorState message={getErrorMessage(error)} onRetry={() => void refetch()} />
      ) : !data?.orders || data.orders.length === 0 ? (
        <EmptyState title="No orders found" description="Try adjusting your filters, or orders will appear here when customers place them." />
      ) : (
        <>
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-[#E8DCD0] text-xs uppercase tracking-wide text-[#806E66] dark:border-[#382823] dark:text-[#B3A198]">
                    <th className="px-5 py-3 font-semibold">Order</th>
                    <th className="px-5 py-3 font-semibold">Customer</th>
                    <th className="px-5 py-3 font-semibold">Items</th>
                    <th className="px-5 py-3 font-semibold">Total</th>
                    <th className="px-5 py-3 font-semibold">Status</th>
                    <th className="px-5 py-3 font-semibold">Payment</th>
                    <th className="px-5 py-3 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.orders.map((order) => {
                    const customer =
                      typeof order.user === "string" ? null : order.user;

                    return (
                      <tr
                        key={order._id}
                        className="border-b border-[#E8DCD0]/60 last:border-0 hover:bg-[#F5EDE4]/30 dark:border-[#382823]/60 dark:hover:bg-[#251B18]/40 transition-colors"
                      >
                        <td className="px-5 py-3">
                          <p className="font-semibold text-[#3B2924] dark:text-[#FFF4E8]">
                            #{order._id.slice(-6).toUpperCase()}
                          </p>
                          <p className="text-xs text-[#806E66] dark:text-[#B3A198]">
                            {formatDateTime(order.createdAt)}
                          </p>
                        </td>
                        <td className="px-5 py-3">
                          <p className="font-semibold text-[#3B2924] dark:text-[#FFF4E8]">
                            {customer?.name ?? "—"}
                          </p>
                          <p className="text-xs text-[#806E66] dark:text-[#B3A198]">{customer?.email ?? "—"}</p>
                        </td>
                        <td className="px-5 py-3 text-[#806E66] dark:text-[#B3A198]">
                          {order.items.reduce((sum, item) => sum + item.quantity, 0)}
                        </td>
                        <td className="px-5 py-3 font-semibold text-[#3B2924] dark:text-[#FFF4E8]">
                          {formatCurrency(order.totalAmount)}
                        </td>
                        <td className="px-5 py-3">
                          <Badge variant={statusVariant(order.orderStatus)}>
                            {order.orderStatus}
                          </Badge>
                          {order.shipping?.trackingId && (
                            <p className="mt-0.5 flex items-center gap-1 text-[11px] font-medium text-[#B85C4A] dark:text-[#E0B86A]">
                              <Truck className="size-3" />
                              {order.shipping.trackingId}
                            </p>
                          )}
                        </td>
                        <td className="px-5 py-3">
                          <Badge variant={order.paymentStatus === "Paid" ? "success" : "warning"}>
                            {order.paymentStatus}
                          </Badge>
                          <p className="mt-0.5 text-xs text-[#806E66] dark:text-[#B3A198]">{order.paymentMethod}</p>
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex justify-end gap-2">
                            {(NEXT_STATUS[order.orderStatus] ?? []).length > 0 && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setStatusModal({
                                    id: order._id,
                                    current: order.orderStatus,
                                    orderId: order._id,
                                  });
                                  setNewStatus(order.orderStatus);
                                }}
                              >
                                Update status
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                setShippingModal({
                                    id: order._id,
                                  provider: order.shipping?.provider ?? "",
                                  trackingId: order.shipping?.trackingId ?? "",
                                  trackingUrl: order.shipping?.trackingUrl ?? "",
                                })
                              }
                            >
                              Tracking
                            </Button>
                            <Link to={`/orders/${order._id}`}>
                              <Button size="sm" variant="ghost">
                                View
                              </Button>
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>

          <PaginationBar pagination={data.pagination} onPageChange={setPage} />
        </>
      )}

      <Modal
        open={Boolean(shippingModal)}
        onClose={() => setShippingModal(null)}
        title="Shipping tracking"
        footer={
          <>
            <Button variant="outline" onClick={() => setShippingModal(null)}>
              Cancel
            </Button>
            <Button
              onClick={() => updateShipping.mutate()}
              loading={updateShipping.isPending}
            >
              Save tracking
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <p className="text-sm text-[#806E66] dark:text-[#B3A198]">
            Optional fields for an external shipping provider (e.g. Shiprocket,
            Delhivery, FedEx). Customers see the tracking link on their order.
          </p>
          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-[#3B2924] dark:text-[#FFF4E8]">Provider</span>
            <input
              className={inputCls}
              placeholder="e.g. Shiprocket"
              value={shippingModal?.provider ?? ""}
              onChange={(e) =>
                setShippingModal((m) => (m ? { ...m, provider: e.target.value } : m))
              }
            />
          </label>
          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-[#3B2924] dark:text-[#FFF4E8]">Tracking ID</span>
            <input
              className={inputCls}
              placeholder="e.g. SHK-123456789"
              value={shippingModal?.trackingId ?? ""}
              onChange={(e) =>
                setShippingModal((m) => (m ? { ...m, trackingId: e.target.value } : m))
              }
            />
          </label>
          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-[#3B2924] dark:text-[#FFF4E8]">Tracking URL</span>
            <input
              className={inputCls}
              placeholder="https://…"
              value={shippingModal?.trackingUrl ?? ""}
              onChange={(e) =>
                setShippingModal((m) => (m ? { ...m, trackingUrl: e.target.value } : m))
              }
            />
          </label>
        </div>
      </Modal>

      <Modal
        open={Boolean(statusModal)}
        onClose={() => setStatusModal(null)}
        title={`Update status — #${statusModal?.orderId.slice(-6).toUpperCase() ?? ""}`}
        footer={
          <>
            <Button variant="outline" onClick={() => setStatusModal(null)}>
              Cancel
            </Button>
            <Button
              onClick={() => updateStatus.mutate()}
              loading={updateStatus.isPending}
              disabled={newStatus === statusModal?.current}
            >
              Save status
            </Button>
          </>
        }
      >
        {statusModal && (NEXT_STATUS[statusModal.current] ?? []).length === 0 ? (
          <p className="text-sm text-[#806E66] dark:text-[#B3A198]">
            This order is <span className="font-semibold text-[#3B2924] dark:text-[#FFF4E8]">{statusModal.current}</span>,
            which is a final state and cannot be changed.
          </p>
        ) : (
          <div className="space-y-2">
            {statusModal &&
              statuses.map((status) => {
                const allowed = (NEXT_STATUS[statusModal.current] ?? []).includes(status);

                return (
                  <label
                    key={status}
                    className={cn(
                      "flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition",
                      allowed
                        ? "border-[#E8DCD0] hover:bg-[#F5EDE4] dark:border-[#382823] dark:hover:bg-[#251B18]"
                        : "cursor-not-allowed border-[#E8DCD0]/40 opacity-40 dark:border-[#382823]/40"
                    )}
                  >
                    <input
                      type="radio"
                      name="status"
                      checked={newStatus === status}
                      disabled={!allowed}
                      onChange={() => setNewStatus(status)}
                      className="size-4 accent-[#B85C4A]"
                    />
                    <span className="text-sm font-medium text-[#3B2924] dark:text-[#FFF4E8]">
                      {status}
                    </span>
                    {status === statusModal.current && (
                      <span className="ml-auto text-xs text-[#806E66] dark:text-[#B3A198]">current</span>
                    )}
                  </label>
                );
              })}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default OrdersPage;
