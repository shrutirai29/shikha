import { useState } from "react";
import { Link } from "react-router-dom";
import { Truck } from "lucide-react";
import { useDeliveryOrders } from "@/hooks/useApi";
import { Badge, Card, PageLoader } from "@/components/ui/Card";
import { EmptyState, ErrorState } from "@/components/ui/States";
import { PaginationBar } from "@/components/ui/Pagination";
import { Button } from "@/components/ui/Button";
import { getErrorMessage } from "@/lib/api";
import { formatCurrency, formatDateTime } from "@/lib/utils";

const statuses = [
  "Pending",
  "Processing",
  "Shipped",
  "OutForDelivery",
  "Delivered",
  "Cancelled",
  "RTO",
];

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

const inputCls =
  "w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-white";

export const DeliveryOrdersPage = () => {
  const [status, setStatus] = useState<string>("");
  const [page, setPage] = useState(1);

  const { data, isLoading, isError, error, refetch } = useDeliveryOrders({
    status: status || undefined,
    page,
  });

  if (isLoading) {
    return <PageLoader />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            <Truck className="size-6 text-indigo-600 dark:text-indigo-400" />
            Assigned orders
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Orders assigned to you for pickup and delivery
          </p>
        </div>
        <select
          className={inputCls}
          value={status}
          onChange={(e) => {
            setPage(1);
            setStatus(e.target.value);
          }}
          aria-label="Filter by status"
        >
          <option value="">All statuses</option>
          {statuses.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {isError ? (
        <ErrorState message={getErrorMessage(error)} onRetry={() => void refetch()} />
      ) : !data?.orders || data.orders.length === 0 ? (
        <EmptyState
          icon={<Truck className="size-7" />}
          title="No assigned orders"
          description="Orders assigned to you by the admin will appear here."
        />
      ) : (
        <>
          <div className="space-y-3">
            {data.orders.map((order) => {
              const customer =
                typeof order.user === "string" ? null : order.user;

              return (
                <Card key={order._id} className="p-4">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-3">
                        <p className="font-bold text-slate-900 dark:text-white">
                          #{order._id.slice(-6).toUpperCase()}
                        </p>
                        <Badge variant={statusVariant(order.orderStatus)}>
                          {order.orderStatus}
                        </Badge>
                        <Badge variant={order.paymentMethod === "COD" ? "warning" : "info"}>
                          {order.paymentMethod}
                        </Badge>
                      </div>
                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        {customer?.name} · {order.shippingAddress.city},{" "}
                        {order.shippingAddress.state} ·{" "}
                        {formatDateTime(order.createdAt)}
                      </p>
                      {order.delivery?.lastAttemptNote && (
                        <p className="mt-0.5 text-xs text-amber-600 dark:text-amber-400">
                          Last attempt: {order.delivery.lastAttemptNote}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm font-bold text-slate-900 dark:text-white">
                          {formatCurrency(order.totalAmount)}
                        </p>
                        <p className="text-xs text-slate-400">
                          {order.items.reduce((s, i) => s + i.quantity, 0)} items
                        </p>
                      </div>
                      <Link to={`/delivery/orders/${order._id}`}>
                        <Button size="sm">Open</Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          <PaginationBar pagination={data.pagination} onPageChange={setPage} />
        </>
      )}
    </div>
  );
};

export default DeliveryOrdersPage;
