import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { api, getErrorMessage } from "@/lib/api";
import { useAllOrders, useDeliveryAgents, useAssignAgent } from "@/hooks/useApi";
import { useToast } from "@/context/ToastContext";
import { Badge, Card } from "@/components/ui/Card";
import { ErrorState, EmptyState } from "@/components/ui/States";
import { PageLoader } from "@/components/ui/Card";
import { PaginationBar } from "@/components/ui/Pagination";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { cn, formatCurrency, formatDateTime } from "@/lib/utils";

const statuses = [
  "Pending",
  "Processing",
  "Shipped",
  "OutForDelivery",
  "Delivered",
  "Cancelled",
  "RTO",
] as const;

// Legal next states per current status — mirrors the backend transition map.
const NEXT_STATUS: Record<string, string[]> = {
  Pending: ["Processing", "Shipped", "OutForDelivery", "Delivered", "Cancelled"],
  Processing: ["Shipped", "OutForDelivery", "Delivered", "Cancelled"],
  Shipped: ["OutForDelivery", "Delivered"],
  OutForDelivery: ["Delivered", "RTO", "Cancelled"],
  Delivered: [],
  Cancelled: [],
  RTO: [],
};

const statusVariant = (status: string) => {
  switch (status) {
    case "Delivered":
      return "success" as const;
    case "Cancelled":
    case "RTO":
      return "danger" as const;
    case "Shipped":
    case "OutForDelivery":
      return "info" as const;
    case "Processing":
      return "warning" as const;
    default:
      return "default" as const;
  }
};

const inputCls =
  "w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500";

export const OrdersPage = () => {
  const toast = useToast();
  const queryClient = useQueryClient();

  const [filters, setFilters] = useState<{
    status?: "Pending" | "Processing" | "Shipped" | "OutForDelivery" | "Delivered" | "Cancelled" | "RTO";
    paymentMethod?: "COD" | "RAZORPAY";
    q?: string;
  }>({});
  const [page, setPage] = useState(1);

  const { data, isLoading, isError, error, refetch } = useAllOrders({
    ...filters,
    page,
  });

  const { data: agents } = useDeliveryAgents();
  const assignAgent = useAssignAgent();

  const [statusModal, setStatusModal] = useState<{
    id: string;
    current: string;
    orderId: string;
  } | null>(null);
  const [newStatus, setNewStatus] = useState<string>("");

  const [assignAgentId, setAssignAgentId] = useState<Record<string, string>>({});

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
    void queryClient.invalidateQueries({ queryKey: ["admin-cod"] });
  };

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

  const handleAssign = async (orderId: string) => {
    const agentId = assignAgentId[orderId];

    if (!agentId) {
      toast.error("Select a delivery agent first");
      return;
    }

    try {
      await assignAgent.mutateAsync({ orderId, agentId });
      toast.success("Delivery agent assigned");
    } catch (assignError) {
      toast.error(getErrorMessage(assignError));
    }
  };

  if (isLoading) {
    return <PageLoader />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Orders
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Manage all customer orders, assignments, and COD collections
        </p>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
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
                | "OutForDelivery"
                | "Delivered"
                | "Cancelled"
                | "RTO"
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
                  <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-400 dark:border-slate-700">
                    <th className="px-5 py-3 font-semibold">Order</th>
                    <th className="px-5 py-3 font-semibold">Customer</th>
                    <th className="px-5 py-3 font-semibold">Total</th>
                    <th className="px-5 py-3 font-semibold">Status</th>
                    <th className="px-5 py-3 font-semibold">Payment</th>
                    <th className="px-5 py-3 font-semibold">Delivery agent</th>
                    <th className="px-5 py-3 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.orders.map((order) => {
                    const customer =
                      typeof order.user === "string" ? null : order.user;
                    const assigned =
                      order.delivery &&
                      typeof order.delivery.assignedTo === "object" &&
                      order.delivery.assignedTo
                        ? order.delivery.assignedTo
                        : null;
                    const assignable =
                      !["Delivered", "Cancelled", "RTO"].includes(order.orderStatus);

                    return (
                      <tr
                        key={order._id}
                        className="border-b border-slate-100 last:border-0 dark:border-slate-700/60"
                      >
                        <td className="px-5 py-3">
                          <p className="font-semibold text-slate-900 dark:text-white">
                            #{order._id.slice(-6).toUpperCase()}
                          </p>
                          <p className="text-xs text-slate-400">
                            {formatDateTime(order.createdAt)}
                          </p>
                        </td>
                        <td className="px-5 py-3">
                          <p className="font-semibold text-slate-900 dark:text-white">
                            {customer?.name ?? "—"}
                          </p>
                          <p className="text-xs text-slate-400">{customer?.email ?? "—"}</p>
                        </td>
                        <td className="px-5 py-3 font-semibold text-slate-900 dark:text-white">
                          {formatCurrency(order.totalAmount)}
                        </td>
                        <td className="px-5 py-3">
                          <Badge variant={statusVariant(order.orderStatus)}>
                            {order.orderStatus}
                          </Badge>
                          {order.paymentMethod === "COD" &&
                            order.delivery &&
                            (order.delivery.codCollected ? (
                              <p className="mt-0.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                                COD collected
                              </p>
                            ) : (
                              order.orderStatus === "Delivered" && (
                                <p className="mt-0.5 text-[11px] font-medium text-amber-600 dark:text-amber-400">
                                  COD pending
                                </p>
                              )
                            ))}
                        </td>
                        <td className="px-5 py-3">
                          <Badge variant={order.paymentStatus === "Paid" ? "success" : "warning"}>
                            {order.paymentStatus}
                          </Badge>
                          <p className="mt-0.5 text-xs text-slate-400">{order.paymentMethod}</p>
                        </td>
                        <td className="px-5 py-3">
                          {assigned ? (
                            <div>
                              <p className="font-medium text-slate-900 dark:text-white">
                                {assigned.name}
                              </p>
                              <p className="text-xs text-slate-400">{assigned.phone}</p>
                            </div>
                          ) : assignable ? (
                            <div className="flex items-center gap-1.5">
                              <select
                                className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
                                value={assignAgentId[order._id] ?? ""}
                                onChange={(e) =>
                                  setAssignAgentId((m) => ({
                                    ...m,
                                    [order._id]: e.target.value,
                                  }))
                                }
                              >
                                <option value="">Assign…</option>
                                {(agents ?? []).map((agent) => (
                                  <option key={agent._id} value={agent._id}>
                                    {agent.name}
                                  </option>
                                ))}
                              </select>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => void handleAssign(order._id)}
                                loading={assignAgent.isPending}
                              >
                                Go
                              </Button>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400">—</span>
                          )}
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
          <p className="text-sm text-slate-500 dark:text-slate-400">
            This order is <span className="font-semibold">{statusModal.current}</span>,
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
                        ? "border-slate-200 hover:bg-slate-50 dark:border-slate-600 dark:hover:bg-slate-700"
                        : "cursor-not-allowed border-slate-200/60 opacity-50 dark:border-slate-700/60"
                    )}
                  >
                    <input
                      type="radio"
                      name="status"
                      checked={newStatus === status}
                      disabled={!allowed}
                      onChange={() => setNewStatus(status)}
                      className="size-4 text-indigo-600"
                    />
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                      {status}
                    </span>
                    {status === statusModal.current && (
                      <span className="ml-auto text-xs text-slate-400">current</span>
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
