import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api, getErrorMessage } from "@/lib/api";
import { useAllOrders } from "@/hooks/useApi";
import { useToast } from "@/context/ToastContext";
import { Badge, Card } from "@/components/ui/Card";
import { ErrorState, EmptyState } from "@/components/ui/States";
import { PageLoader } from "@/components/ui/Card";
import { PaginationBar } from "@/components/ui/Pagination";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { formatCurrency, formatDateTime } from "@/lib/utils";

const statuses = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"] as const;

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

export const OrdersPage = () => {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, error, refetch } = useAllOrders(page);

  const [statusModal, setStatusModal] = useState<{
    id: string;
    current: string;
    orderId: string;
  } | null>(null);
  const [newStatus, setNewStatus] = useState<string>("");

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
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Orders
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Manage all customer orders
        </p>
      </div>

      {isError ? (
        <ErrorState message={getErrorMessage(error)} onRetry={() => void refetch()} />
      ) : !data?.orders || data.orders.length === 0 ? (
        <EmptyState title="No orders yet" description="Orders placed by customers will appear here." />
      ) : (
        <>
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-400 dark:border-slate-700">
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
                        <td className="px-5 py-3 text-slate-600 dark:text-slate-300">
                          {order.items.reduce((sum, item) => sum + item.quantity, 0)}
                        </td>
                        <td className="px-5 py-3 font-semibold text-slate-900 dark:text-white">
                          {formatCurrency(order.totalAmount)}
                        </td>
                        <td className="px-5 py-3">
                          <Badge variant={statusVariant(order.orderStatus)}>
                            {order.orderStatus}
                          </Badge>
                        </td>
                        <td className="px-5 py-3">
                          <Badge variant={order.paymentStatus === "Paid" ? "success" : "warning"}>
                            {order.paymentStatus}
                          </Badge>
                          <p className="mt-0.5 text-xs text-slate-400">{order.paymentMethod}</p>
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex justify-end gap-2">
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
        <div className="space-y-2">
          {statuses.map((status) => (
            <label
              key={status}
              className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 p-3 transition hover:bg-slate-50 dark:border-slate-600 dark:hover:bg-slate-700"
            >
              <input
                type="radio"
                name="status"
                checked={newStatus === status}
                onChange={() => setNewStatus(status)}
                className="size-4 text-indigo-600"
              />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                {status}
              </span>
            </label>
          ))}
        </div>
      </Modal>
    </div>
  );
};

export default OrdersPage;
