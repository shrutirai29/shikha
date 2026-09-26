import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { SlidersHorizontal, X } from "lucide-react";
import { useProducts, useCategories } from "@/hooks/useApi";
import { ProductGrid } from "@/components/product/ProductGrid";
import { PageLayout } from "@/components/layout/PageLayout";
import { PaginationBar } from "@/components/ui/Pagination";
import { ErrorState } from "@/components/ui/States";
import { getErrorMessage } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const sortOptions = [
  { value: "-createdAt", label: "Newest first" },
  { value: "price", label: "Price: low to high" },
  { value: "-price", label: "Price: high to low" },
  { value: "name", label: "Name: A to Z" },
  { value: "-averageRating", label: "Top rated" },
];

export const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filtersOpen, setFiltersOpen] = useState(false);

  const page = Number(searchParams.get("page") ?? "1");
  const category = searchParams.get("category") ?? "";
  const sort = searchParams.get("sort") ?? "-createdAt";
  const minPrice = searchParams.get("minPrice") ?? "";
  const maxPrice = searchParams.get("maxPrice") ?? "";
  const search = searchParams.get("search") ?? "";

  const [minPriceInput, setMinPriceInput] = useState(minPrice);
  const [maxPriceInput, setMaxPriceInput] = useState(maxPrice);

  const { data, isLoading, isError, error, refetch } = useProducts({
    page,
    limit: 12,
    category: category || undefined,
    sort,
    minPrice: minPrice ? Number(minPrice) : undefined,
    maxPrice: maxPrice ? Number(maxPrice) : undefined,
    search: search || undefined,
  });

  useEffect(() => {
    setMinPriceInput(minPrice);
    setMaxPriceInput(maxPrice);
  }, [minPrice, maxPrice]);

  const updateParams = (updates: Record<string, string>) => {
    const next = new URLSearchParams(searchParams);

    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        next.set(key, value);
      } else {
        next.delete(key);
      }
    });

    next.delete("page");

    setSearchParams(next);
  };

  const applyPriceFilter = () => {
    updateParams({
      minPrice: minPriceInput,
      maxPrice: maxPriceInput,
    });
    setFiltersOpen(false);
  };

  const clearFilters = () => {
    setSearchParams(new URLSearchParams());
    setMinPriceInput("");
    setMaxPriceInput("");
  };

  const hasFilters = Boolean(category || minPrice || maxPrice || search);

  const filterPanel = useMemo(
    () => (
      <div className="space-y-6">
        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-900 dark:text-white">
            Categories
          </h3>
          <CategoryFilter
            selected={category}
            onSelect={(value) => updateParams({ category: value })}
          />
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[#3B2924] dark:text-[#FFF4E8]">
            Price range (₹)
          </h3>
          <div className="space-y-2">
            <input
              type="number"
              min={0}
              placeholder="Min"
              value={minPriceInput}
              onChange={(event) => setMinPriceInput(event.target.value)}
              className="w-full rounded-xl border border-[#E8DCD0] bg-[#FFFCF7] px-3.5 py-2 text-sm text-[#3B2924] shadow-sm focus:border-[#B85C4A] focus:outline-none focus:ring-2 focus:ring-[#B85C4A]/20 dark:border-[#493A34] dark:bg-[#2A211E] dark:text-[#FFF4E8]"
            />
            <input
              type="number"
              min={0}
              placeholder="Max"
              value={maxPriceInput}
              onChange={(event) => setMaxPriceInput(event.target.value)}
              className="w-full rounded-xl border border-[#E8DCD0] bg-[#FFFCF7] px-3.5 py-2 text-sm text-[#3B2924] shadow-sm focus:border-[#B85C4A] focus:outline-none focus:ring-2 focus:ring-[#B85C4A]/20 dark:border-[#493A34] dark:bg-[#2A211E] dark:text-[#FFF4E8]"
            />
            <Button size="sm" variant="outline" className="w-full" onClick={applyPriceFilter}>
              Apply
            </Button>
          </div>
        </div>

        {hasFilters && (
          <Button variant="ghost" size="sm" className="w-full text-[#914536] hover:bg-[#B85C4A]/10" onClick={clearFilters}>
            <X className="size-4" /> Clear all filters
          </Button>
        )}
      </div>
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [category, minPrice, maxPrice, search, minPriceInput, maxPriceInput, hasFilters]
  );

  return (
    <PageLayout
      title="Products"
      subtitle={search ? `Results for "${search}"` : "Browse our full catalog"}
      actions={
        <div className="flex items-center gap-2">
          <select
            value={sort}
            onChange={(event) => updateParams({ sort: event.target.value })}
            aria-label="Sort products"
            className="h-10 rounded-xl border border-[#E8DCD0] bg-[#FFFCF7] px-3 text-sm font-medium text-[#3B2924] shadow-sm focus:border-[#B85C4A] focus:outline-none dark:border-[#493A34] dark:bg-[#2A211E] dark:text-[#FFF4E8]"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <Button
            variant="outline"
            onClick={() => setFiltersOpen((open) => !open)}
            className="lg:hidden"
          >
            <SlidersHorizontal className="size-4" /> Filters
          </Button>
        </div>
      }
    >
      <div className="flex gap-8">
        <aside className="hidden w-56 shrink-0 lg:block">
          <div className="sticky top-24">{filterPanel}</div>
        </aside>

        <div className="min-w-0 flex-1">
          {isError ? (
            <ErrorState
              message={getErrorMessage(error)}
              onRetry={() => void refetch()}
            />
          ) : (
            <>
              <ProductGrid products={data?.products} loading={isLoading} />
              <PaginationBar
                pagination={data?.pagination}
                onPageChange={(nextPage) => updateParams({ page: String(nextPage) })}
                className="mt-10"
              />
            </>
          )}
        </div>
      </div>

      {filtersOpen && (
        <div className="fixed inset-0 z-[80] lg:hidden">
          <div
            className="absolute inset-0 bg-[#1F1816]/50 backdrop-blur-sm"
            onClick={() => setFiltersOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-80 overflow-y-auto bg-[#FFFCF7] p-5 shadow-2xl dark:bg-[#2A211E]">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-base font-semibold text-[#3B2924] dark:text-[#FFF4E8]">Filters</h2>
              <button
                type="button"
                onClick={() => setFiltersOpen(false)}
                className="rounded-lg p-1.5 text-[#806E66] hover:bg-[#F5EDE4] dark:text-[#C7B8AE] dark:hover:bg-[#352925]"
                aria-label="Close filters"
              >
                <X className="size-5" />
              </button>
            </div>
            {filterPanel}
          </div>
        </div>
      )}
    </PageLayout>
  );
};

const CategoryFilter = ({
  selected,
  onSelect,
}: {
  selected: string;
  onSelect: (value: string) => void;
}) => {
  const { data: categories, isLoading } = useCategories();

  if (isLoading) {
    return <p className="text-sm text-[#806E66] dark:text-[#C7B8AE]">Loading categories…</p>;
  }

  return (
    <div className="space-y-1">
      <button
        type="button"
        onClick={() => onSelect("")}
        className={cn(
          "block w-full rounded-xl px-3 py-2 text-left text-sm transition",
          !selected
            ? "bg-[#B85C4A]/10 font-semibold text-[#B85C4A] dark:bg-[#D47763]/15 dark:text-[#D47763]"
            : "text-[#806E66] hover:bg-[#F5EDE4] hover:text-[#3B2924] dark:text-[#C7B8AE] dark:hover:bg-[#352925] dark:hover:text-[#FFF4E8]"
        )}
      >
        All categories
      </button>
      {(categories ?? []).map((category) => (
        <button
          key={category._id}
          type="button"
          onClick={() => onSelect(category._id)}
          className={cn(
            "block w-full rounded-xl px-3 py-2 text-left text-sm transition",
            selected === category._id
              ? "bg-[#B85C4A]/10 font-semibold text-[#B85C4A] dark:bg-[#D47763]/15 dark:text-[#D47763]"
              : "text-[#806E66] hover:bg-[#F5EDE4] hover:text-[#3B2924] dark:text-[#C7B8AE] dark:hover:bg-[#352925] dark:hover:text-[#FFF4E8]"
          )}
        >
          {category.name}
        </button>
      ))}
    </div>
  );
};

export default ProductsPage;
