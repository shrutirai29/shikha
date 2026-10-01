import type { Product } from "@/types";
import { ProductCard } from "./ProductCard";
import { EmptyState } from "@/components/ui/States";
import { Skeleton } from "@/components/ui/Card";
import { ShoppingBag } from "lucide-react";

export const ProductGrid = ({
  products,
  loading,
  skeletonCount = 8,
  emptyTitle = "No products found",
  emptyDescription = "Try adjusting your filters or search terms.",
  className,
}: {
  products?: Product[];
  loading?: boolean;
  skeletonCount?: number;
  emptyTitle?: string;
  emptyDescription?: string;
  className?: string;
}) => {
  if (loading) {
    return (
      <div className={className}>
        <div className="grid grid-cols-2 gap-3 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: skeletonCount }).map((_, index) => (
            <div
              key={index}
              className="overflow-hidden rounded-2xl border border-[#E8DCD0] dark:border-[#382823]"
            >
              <Skeleton className="aspect-square w-full rounded-none" />
              <div className="space-y-2 p-3 sm:p-4">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-4 w-4/5" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-5 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <EmptyState
        icon={<ShoppingBag className="size-7" />}
        title={emptyTitle}
        description={emptyDescription}
        className={className}
      />
    );
  }

  return (
    <div
      className={`grid grid-cols-2 gap-3 sm:gap-6 md:grid-cols-3 lg:grid-cols-4 ${className ?? ""}`}
    >
      {products.map((product, index) => (
        <ProductCard key={product._id} product={product} index={index} />
      ))}
    </div>
  );
};
