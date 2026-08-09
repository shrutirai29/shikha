import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Package } from "lucide-react";
import { useMyOrders } from "@/hooks/useApi";
import { PageLayout } from "@/components/layout/PageLayout";
import { PaginationBar } from "@/components/ui/Pagination";
import { Badge, Card } from "@/components/ui/Card";
import { EmptyState, ErrorState } from "@/components/ui/States";
import { PageLoader } from "@/components/ui/Card";
import { getErrorMessage } from "@/lib/api";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

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

export const OrdersPage = () => {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, error, refetch } = useMyOrders(page);

  if (isLoading) {
    return <PageLoader />;
  }

  return (
    <PageLayout title="My orders" subtitle="Track and manage your orders">
      {isError ? (
        <ErrorState message={getErrorMessage(error)} onRetry={() => void refetch()} />
      ) : !data?.orders || data.orders.length === 0 ? (
        <EmptyState
          icon={<Package className="size-7" />}
          title="No orders yet"
          description="When you place an order, it will show up here."
          action={
            <Link to="/products">
              <Button>Start shopping</Button>
            </Link>
          }
        />
      ) : (
        <>
          <div className="space-y-3">
            {data.orders.map((order) => (
              <Link key={order._id} to={`/orders/${order._id}`} className="block">
                <Card className="group flex flex-wrap items-center gap-4 p-5 transition hover:shadow-md">
                  <div className="flex -space-x-3">
                    {order.items.slice(0, 3).map((item, index) => (
                      <div
                        key={index}
                        className="size-12 overflow-hidden rounded-xl border-2 border-white bg-slate-100 dark:border-slate-800 dark:bg-slate-700/40"
                      >
                        {item.image ? (
                          <img src={item.image} alt="" className="size-full object-cover" />
                        ) : null}
                      </div>
                    ))}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      Order #{order._id.slice(-6).toUpperCase()}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {formatDateTime(order.createdAt)} ·{" "}
                      {order.items.reduce((sum, item) => sum + item.quantity, 0)} items
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="hidden flex-col items-end gap-1 sm:flex">
                      <Badge variant={orderStatusVariant(order.orderStatus)}>
                        {order.orderStatus}
                      </Badge>
                      <Badge variant={paymentStatusVariant(order.paymentStatus)}>
                        {order.paymentStatus}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <p className="text-base font-bold text-slate-900 dark:text-white">
                        {formatCurrency(order.totalAmount)}
                      </p>
                      <p className="text-xs text-slate-400">{order.paymentMethod}</p>
                    </div>
                    <ChevronRight className="size-5 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-indigo-500" />
                  </div>
                </Card>
              </Link>
            ))}
          </div>

          <PaginationBar
            pagination={data?.pagination}
            onPageChange={setPage}
            className="mt-8"
          />
        </>
      )}
    </PageLayout>
  );
};

export default OrdersPage;
