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
    {
      label: "Revenue",
      value: formatCurrency(data.totals.revenue),
      icon: IndianRupee,
      color: "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30",
    },
    {
      label: "Orders",
      value: String(data.totals.orders),
      icon: ShoppingBag,
      color: "bg-[#B85C4A]/10 text-[#B85C4A] border border-[#B85C4A]/20 dark:bg-[#D47763]/15 dark:text-[#E28A76] dark:border-[#D47763]/30",
    },
    {
      label: "Products",
      value: String(data.totals.products),
      icon: Package,
      color: "bg-[#D8A85B]/15 text-[#8e6827] border border-[#D8A85B]/20 dark:bg-[#E0B86A]/15 dark:text-[#E0B86A] dark:border-[#E0B86A]/30",
    },
    {
      label: "Customers",
      value: String(data.totals.users),
      icon: Users,
      color: "bg-sky-500/10 text-sky-600 border border-sky-500/20 dark:bg-sky-500/15 dark:text-sky-300 dark:border-sky-500/30",
    },
    {
      label: "Pending orders",
      value: String(data.totals.pendingOrders),
      icon: ShoppingBag,
      color: "bg-amber-500/10 text-amber-600 border border-amber-500/20 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30",
    },
    {
      label: "Reviews",
      value: String(data.totals.reviews),
      icon: Banknote,
      color: "bg-rose-500/10 text-rose-600 border border-rose-500/20 dark:bg-rose-500/15 dark:text-rose-300 dark:border-rose-500/30",
    },
    {
      label: "Active coupons",
      value: String(data.totals.activeCoupons),
      icon: TicketPercent,
      color: "bg-teal-500/10 text-teal-600 border border-teal-500/20 dark:bg-teal-500/15 dark:text-teal-300 dark:border-teal-500/30",
    },
    {
      label: "Categories",
      value: String(data.totals.categories),
      icon: Package,
      color: "bg-[#7A8B68]/15 text-[#7A8B68] border border-[#7A8B68]/20 dark:bg-[#9BAF83]/15 dark:text-[#9BAF83] dark:border-[#9BAF83]/30",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#3B2924] sm:text-3xl dark:text-[#FFF4E8]">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-[#806E66] dark:text-[#B3A198]">
          Overview of your store performance & artisan sales
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="group p-5 transition-all duration-300 hover:-translate-y-1">
            <div className={`mb-3.5 flex size-11 items-center justify-center rounded-2xl shadow-xs transition group-hover:scale-105 ${stat.color}`}>
              <stat.icon className="size-5" />
            </div>
            <p className="text-2xl font-bold tracking-tight text-[#3B2924] dark:text-[#FFF4E8]">{stat.value}</p>
            <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-[#806E66] dark:text-[#B3A198]">{stat.label}</p>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between border-b border-[#E8DCD0]/60 pb-3 dark:border-[#382823]">
            <h2 className="text-base font-bold text-[#3B2924] dark:text-[#FFF4E8]">
              Recent orders
            </h2>
            <Link
              to="/admin/orders"
              className="text-xs font-semibold text-[#B85C4A] hover:text-[#914536] dark:text-[#D47763] dark:hover:text-[#E28A76]"
            >
              View all →
            </Link>
          </div>

          {data.recentOrders.length === 0 ? (
            <EmptyState title="No orders yet" />
          ) : (
            <div className="space-y-2.5">
              {data.recentOrders.map((order) => (
                <Link
                  key={order._id}
                  to={`/admin/orders`}
                  className="flex items-center justify-between rounded-xl border border-[#E8DCD0]/80 bg-[#FFFCF7] px-3.5 py-3 transition hover:bg-[#F5EDE4]/70 dark:border-[#382823] dark:bg-[#1A1210]/60 dark:hover:bg-[#251B18]/90"
                >
                  <div>
                    <p className="font-mono text-sm font-bold text-[#3B2924] dark:text-[#FFF4E8]">
                      #{order._id.slice(-6).toUpperCase()}
                    </p>
                    <p className="text-xs text-[#806E66] dark:text-[#8E7E76]">{formatDateTime(order.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={statusVariant(order.orderStatus)}>{order.orderStatus}</Badge>
                    <span className="text-sm font-bold text-[#B85C4A] dark:text-[#D47763]">
                      {formatCurrency(order.totalAmount)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between border-b border-[#E8DCD0]/60 pb-3 dark:border-[#382823]">
            <h2 className="text-base font-bold text-[#3B2924] dark:text-[#FFF4E8]">
              Low stock alerts
            </h2>
            <Link
              to="/admin/products"
              className="text-xs font-semibold text-[#B85C4A] hover:text-[#914536] dark:text-[#D47763] dark:hover:text-[#E28A76]"
            >
              Manage products →
            </Link>
          </div>

          {data.lowStockProducts.length === 0 ? (
            <EmptyState title="All products well stocked" />
          ) : (
            <div className="space-y-2.5">
              {data.lowStockProducts.map((product) => (
                <div
                  key={product._id}
                  className="flex items-center gap-3 rounded-xl border border-[#E8DCD0]/80 bg-[#FFFCF7] px-3.5 py-3 dark:border-[#382823] dark:bg-[#1A1210]/60"
                >
                  <div className="size-11 shrink-0 overflow-hidden rounded-xl bg-[#F5EDE4] dark:bg-[#251B18]">
                    {product.images[0] ? (
                      <img src={product.images[0]} alt="" className="size-full object-cover" />
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-[#3B2924] dark:text-[#FFF4E8]">
                      {product.name}
                    </p>
                    <p className="text-xs text-[#806E66] dark:text-[#8E7E76]">{product.slug}</p>
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
