import { useParams, useSearchParams } from "react-router-dom";
import { useCategories, useProducts } from "@/hooks/useApi";
import { ProductGrid } from "@/components/product/ProductGrid";
import { PageLayout } from "@/components/layout/PageLayout";
import { PaginationBar } from "@/components/ui/Pagination";
import { ErrorState } from "@/components/ui/States";
import { getErrorMessage } from "@/lib/api";
import { PageLoader } from "@/components/ui/Card";

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
  );
};

export default CategoryProductsPage;
