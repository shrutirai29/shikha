import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { useCategories } from "@/hooks/useApi";
import { PageLayout } from "@/components/layout/PageLayout";
import { Skeleton } from "@/components/ui/Card";
import { EmptyState, ErrorState } from "@/components/ui/States";
import { getErrorMessage } from "@/lib/api";
import shopBackdrop from "@/assets/shop-backdrop.jpg";

export const CategoriesPage = () => {
  const { data: categories, isLoading, isError, error, refetch } = useCategories();

  return (
    <div className="relative min-h-[calc(100vh-140px)] w-full overflow-hidden">
      {/* Handcrafted Crochet Backdrop for Categories Page */}
      <div className="pointer-events-none absolute inset-0 z-0 select-none">
        <img
          src={shopBackdrop}
          alt="Crochet yarn basket and florals background"
          loading="lazy"
          decoding="async"
          className="size-full object-cover object-center opacity-85 dark:opacity-30 transition-opacity duration-500"
        />
        {/* Soft warm ambient scrim */}
        <div className="absolute inset-0 bg-[#FFF8F0]/40 dark:bg-gradient-to-br dark:from-[#150F0D]/90 dark:via-[#1B1311]/85 dark:to-[#120C0A]/90 backdrop-blur-[1px]" />
      </div>

      <div className="relative z-10">
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
              className="group relative overflow-hidden rounded-2xl border border-[#E8DCD0] bg-[#FFFCF7] shadow-soft transition hover:shadow-lift hover:border-[#B85C4A]/50 dark:border-[#493A34] dark:bg-[#2A211E] dark:hover:border-[#D47763]/50"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-[#F5EDE4] dark:bg-[#1F1816]">
                {category.image ? (
                  <img
                    src={category.image}
                    alt={category.name}
                    loading="lazy"
                    className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex size-full items-center justify-center bg-gradient-to-br from-[#F5EDE4] to-[#E8DCD0] text-5xl font-bold text-[#B85C4A] dark:from-[#352925] dark:to-[#2A211E] dark:text-[#D47763]">
                    {category.name.charAt(0)}
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#1F1816]/60 via-transparent to-transparent" />
              </div>
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between p-4">
                <h3 className="text-base font-bold text-white drop-shadow">{category.name}</h3>
                <ChevronRight className="size-5 text-white/80 transition group-hover:translate-x-0.5" />
              </div>
              {category.description && (
                <p className="border-t border-[#E8DCD0] px-4 py-3 text-xs text-[#806E66] line-clamp-2 dark:border-[#493A34] dark:text-[#C7B8AE]">
                  {category.description}
                </p>
              )}
            </Link>
          ))}
        </div>
      )}
    </PageLayout>
      </div>
    </div>
  );
};

export default CategoriesPage;
