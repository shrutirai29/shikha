import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { useCategories } from "@/hooks/useApi";
import { PageLayout } from "@/components/layout/PageLayout";
import { Skeleton } from "@/components/ui/Card";
import { EmptyState, ErrorState } from "@/components/ui/States";
import { getErrorMessage } from "@/lib/api";

export const CategoriesPage = () => {
  const { data: categories, isLoading, isError, error, refetch } = useCategories();

  return (
    <PageLayout
      title="Categories"
      subtitle="Explore products by category"
    >
      {isError ? (
        <ErrorState message={getErrorMessage(error)} onRetry={() => void refetch()} />
      ) : isLoading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <Skeleton key={index} className="aspect-[4/3] rounded-2xl" />
          ))}
        </div>
      ) : !categories || categories.length === 0 ? (
        <EmptyState title="No categories yet" description="Categories will appear here once the store is set up." />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4">
          {categories.map((category) => (
            <Link
              key={category._id}
              to={`/categories/${category.slug}`}
              className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-lg dark:border-slate-700 dark:bg-slate-800"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-slate-100 dark:bg-slate-700/40">
                {category.image ? (
                  <img
                    src={category.image}
                    alt={category.name}
                    loading="lazy"
                    className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex size-full items-center justify-center bg-gradient-to-br from-indigo-100 to-violet-100 text-5xl font-bold text-indigo-300 dark:from-indigo-950 dark:to-violet-950 dark:text-indigo-700">
                    {category.name.charAt(0)}
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/50 via-transparent to-transparent" />
              </div>
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between p-4">
                <h3 className="text-base font-bold text-white drop-shadow">{category.name}</h3>
                <ChevronRight className="size-5 text-white/80 transition group-hover:translate-x-0.5" />
              </div>
              {category.description && (
                <p className="border-t border-slate-100 px-4 py-3 text-xs text-slate-500 line-clamp-2 dark:border-slate-700 dark:text-slate-400">
                  {category.description}
                </p>
              )}
            </Link>
          ))}
        </div>
      )}
    </PageLayout>
  );
};

export default CategoriesPage;
