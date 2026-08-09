import { useSalesAnalytics, useProductAnalytics } from "@/hooks/useApi";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Card";
import { ErrorState, EmptyState } from "@/components/ui/States";
import { PageLoader } from "@/components/ui/Card";
import { getErrorMessage } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";

const barColors: Record<string, string> = {
  Paid: "bg-emerald-500",
  Pending: "bg-amber-500",
  Failed: "bg-rose-500",
  Refunded: "bg-sky-500",
  Delivered: "bg-emerald-500",
  Processing: "bg-indigo-500",
  Shipped: "bg-violet-500",
  Cancelled: "bg-rose-500",
};

export const AnalyticsPage = () => {
  const {
    data: sales,
    isLoading: salesLoading,
    isError: salesError,
    error: salesErrorObj,
    refetch: refetchSales,
  } = useSalesAnalytics();

  const {
    data: products,
    isLoading: productsLoading,
    isError: productsError,
    error: productsErrorObj,
    refetch: refetchProducts,
  } = useProductAnalytics();

  if (salesLoading || productsLoading) {
    return <PageLoader label="Loading analytics…" />;
  }

  const maxRevenue = Math.max(
    ...(sales?.salesByDay.map((day) => day.revenue) ?? [0]),
    1
  );
  const maxStatusCount = Math.max(
    ...(sales?.paymentStatus.map((item) => item.count) ?? [0]),
    1
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Analytics
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Sales and product performance insights
        </p>
      </div>

      {salesError && (
        <ErrorState message={getErrorMessage(salesErrorObj)} onRetry={() => void refetchSales()} />
      )}

      {productsError && (
        <ErrorState message={getErrorMessage(productsErrorObj)} onRetry={() => void refetchProducts()} />
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-5">
          <h2 className="mb-4 text-base font-semibold text-slate-900 dark:text-white">
            Revenue by day
          </h2>
          {!sales?.salesByDay || sales.salesByDay.length === 0 ? (
            <EmptyState title="No sales data yet" />
          ) : (
            <div className="flex h-48 items-end gap-1.5">
              {sales.salesByDay.slice(-14).map((day) => (
                <div key={day.date} className="group flex flex-1 flex-col items-center gap-1">
                  <span className="text-[10px] font-semibold text-slate-500 opacity-0 transition group-hover:opacity-100 dark:text-slate-300">
                    {formatCurrency(day.revenue)}
                  </span>
                  <div
                    className="w-full rounded-t-md bg-indigo-500 transition group-hover:bg-indigo-400"
                    style={{ height: `${Math.max((day.revenue / maxRevenue) * 100, 2)}%` }}
                    title={`${day.date}: ${formatCurrency(day.revenue)}`}
                  />
                  <span className="text-[10px] text-slate-400">
                    {day.date.slice(5)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-5">
          <h2 className="mb-4 text-base font-semibold text-slate-900 dark:text-white">
            Payment status breakdown
          </h2>
          {!sales?.paymentStatus || sales.paymentStatus.length === 0 ? (
            <EmptyState title="No payment data yet" />
          ) : (
            <div className="space-y-3">
              {sales.paymentStatus.map((item) => (
                <div key={item._id}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="font-medium text-slate-700 dark:text-slate-200">
                      {item._id}
                    </span>
                    <span className="text-slate-500 dark:text-slate-400">{item.count}</span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
                    <div
                      className={`h-full rounded-full ${barColors[item._id] ?? "bg-slate-500"}`}
                      style={{ width: `${(item.count / maxStatusCount) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-5">
          <h2 className="mb-4 text-base font-semibold text-slate-900 dark:text-white">
            Top rated products
          </h2>
          {!products?.topRatedProducts || products.topRatedProducts.length === 0 ? (
            <EmptyState title="No product ratings yet" />
          ) : (
            <div className="space-y-2">
              {products.topRatedProducts.map((product, index) => (
                <div
                  key={product._id}
                  className="flex items-center gap-3 rounded-xl border border-slate-100 px-3 py-2.5 dark:border-slate-700"
                >
                  <span className="w-6 text-center text-sm font-bold text-slate-400">
                    {index + 1}
                  </span>
                  <div className="size-10 shrink-0 overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-700/40">
                    {product.images[0] ? (
                      <img src={product.images[0]} alt="" className="size-full object-cover" />
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                      {product.name}
                    </p>
                    <p className="text-xs text-slate-400">{product.totalReviews} reviews</p>
                  </div>
                  <Badge variant="success">{product.averageRating.toFixed(1)} ★</Badge>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-5">
          <h2 className="mb-4 text-base font-semibold text-slate-900 dark:text-white">
            Low stock products
          </h2>
          {!products?.lowStockProducts || products.lowStockProducts.length === 0 ? (
            <EmptyState title="All products well stocked" />
          ) : (
            <div className="space-y-2">
              {products.lowStockProducts.map((product) => (
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

export default AnalyticsPage;
