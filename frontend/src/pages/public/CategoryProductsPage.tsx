import { useParams, useSearchParams } from "react-router-dom";
import { useCategories, useProducts } from "@/hooks/useApi";
import { ProductGrid } from "@/components/product/ProductGrid";
import { PageLayout } from "@/components/layout/PageLayout";
import { PaginationBar } from "@/components/ui/Pagination";
import { ErrorState } from "@/components/ui/States";
import { getErrorMessage } from "@/lib/api";
import { PageLoader } from "@/components/ui/Card";
import shopBackdrop from "@/assets/shop-backdrop.jpg";

export const CategoryProductsPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Number(searchParams.get("page") ?? "1");

  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const category = categories?.find((item) => item.slug === slug);

  const { data, isLoading, isError, error, refetch } = useProducts({
    page,
    limit: 12,
    category: category?._id,
  });

  if (categoriesLoading) {
    return <PageLoader />;
  }

  if (!category) {
    return (
      <PageLayout>
        <ErrorState title="Category not found" message={`No category named "${slug}" exists.`} />
      </PageLayout>
    );
  }

  const setPage = (nextPage: number) => {
    const next = new URLSearchParams(searchParams);
    next.set("page", String(nextPage));
    setSearchParams(next);
  };

  return (
    <div className="relative min-h-[calc(100vh-140px)] w-full overflow-hidden">
      {/* Handcrafted Crochet Backdrop for Category Products Page */}
      <div className="pointer-events-none absolute inset-0 z-0 select-none">
        <img
          src={shopBackdrop}
          alt="Crochet yarn basket and florals background"
          className="size-full object-cover object-center opacity-85 dark:opacity-30 transition-opacity duration-500"
        />
        {/* Soft warm ambient scrim */}
        <div className="absolute inset-0 bg-[#FFF8F0]/40 dark:bg-gradient-to-br dark:from-[#150F0D]/90 dark:via-[#1B1311]/85 dark:to-[#120C0A]/90 backdrop-blur-[1px]" />
      </div>

      <div className="relative z-10">
        <PageLayout
          title={category.name}
          subtitle={category.description || `Browse products in ${category.name}`}
        >
          {isError ? (
            <ErrorState message={getErrorMessage(error)} onRetry={() => void refetch()} />
          ) : (
            <>
              <ProductGrid products={data?.products} loading={isLoading} />
              <PaginationBar
                pagination={data?.pagination}
                onPageChange={setPage}
                className="mt-10"
              />
            </>
          )}
        </PageLayout>
      </div>
    </div>
  );
};

export default CategoryProductsPage;
