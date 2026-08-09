import { Link } from "react-router-dom";
import {
  Banknote,
  IndianRupee,
  Package,
  ShoppingBag,
  TicketPercent,
  Users,
} from "lucide-react";
import { useDashboard } from "@/hooks/useApi";
import { Card } from "@/components/ui/Card";
import { ErrorState, EmptyState } from "@/components/ui/States";
import { PageLoader } from "@/components/ui/Card";
import { getErrorMessage } from "@/lib/api";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { Badge } from "@/components/ui/Card";

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

export const DashboardPage = () => {
  const { data, isLoading, isError, error, refetch } = useDashboard();

  if (isLoading) {
    return <PageLoader label="Loading dashboard…" />;
  }

  if (isError || !data) {
    return <ErrorState message={getErrorMessage(error)} onRetry={() => void refetch()} />;
  }

  const stats = [
    { label: "Revenue", value: formatCurrency(data.totals.revenue), icon: IndianRupee, color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
    { label: "Orders", value: String(data.totals.orders), icon: ShoppingBag, color: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400" },
    { label: "Products", value: String(data.totals.products), icon: Package, color: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-300" },
    { label: "Customers", value: String(data.totals.users), icon: Users, color: "bg-sky-500/10 text-sky-600 dark:text-sky-400" },
    { label: "Pending orders", value: String(data.totals.pendingOrders), icon: ShoppingBag, color: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
    { label: "Reviews", value: String(data.totals.reviews), icon: Banknote, color: "bg-rose-500/10 text-rose-600 dark:text-rose-400" },
    { label: "Active coupons", value: String(data.totals.activeCoupons), icon: TicketPercent, color: "bg-teal-500/10 text-teal-600 dark:text-teal-400" },
    { label: "Categories", value: String(data.totals.categories), icon: Package, color: "bg-slate-500/10 text-slate-600 dark:text-slate-300" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Overview of your store performance
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="p-5">
            <div className={`mb-3 flex size-10 items-center justify-center rounded-xl ${stat.color}`}>
              <stat.icon className="size-5" />
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
            <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">{stat.label}</p>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
              Recent orders
            </h2>
            <Link
              to="/admin/orders"
              className="text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
            >
              View all
            </Link>
          </div>

          {data.recentOrders.length === 0 ? (
            <EmptyState title="No orders yet" />
          ) : (
            <div className="space-y-2">
              {data.recentOrders.map((order) => (
                <Link
                  key={order._id}
                  to={`/admin/orders`}
                  className="flex items-center justify-between rounded-xl border border-slate-100 px-3 py-2.5 transition hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-700/40"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      #{order._id.slice(-6).toUpperCase()}
                    </p>
                    <p className="text-xs text-slate-400">{formatDateTime(order.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={statusVariant(order.orderStatus)}>{order.orderStatus}</Badge>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                      {formatCurrency(order.totalAmount)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
              Low stock alerts
            </h2>
            <Link
              to="/admin/products"
              className="text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
            >
              Manage products
            </Link>
          </div>

          {data.lowStockProducts.length === 0 ? (
            <EmptyState title="All products well stocked" />
          ) : (
            <div className="space-y-2">
              {data.lowStockProducts.map((product) => (
                <div
                  key={product._id}
                  className="flex items-center gap-3 rounded-xl border border-slate-100 px-3 py-2.5 dark:border-slate-700"
                >
                  <div className="size-10 shrink-0 overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-700/40">
                    {product.images[0] ? (
                      <img src={product.images[0]} alt="" className="size-full object-cover" />
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                      {product.name}
                    </p>
                    <p className="text-xs text-slate-400">{product.slug}</p>
                  </div>
                  <Badge variant={product.stock === 0 ? "danger" : "warning"}>
                    {product.stock} left
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;
