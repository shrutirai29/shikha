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
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-900 dark:text-white">
            Price range (₹)
          </h3>
          <div className="space-y-2">
            <input
              type="number"
              min={0}
              placeholder="Min"
              value={minPriceInput}
              onChange={(event) => setMinPriceInput(event.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
            />
            <input
              type="number"
              min={0}
              placeholder="Max"
              value={maxPriceInput}
              onChange={(event) => setMaxPriceInput(event.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
            />
            <Button size="sm" variant="outline" className="w-full" onClick={applyPriceFilter}>
              Apply
            </Button>
          </div>
        </div>

        {hasFilters && (
          <Button variant="ghost" size="sm" className="w-full text-rose-600" onClick={clearFilters}>
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
            className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 shadow-sm focus:border-indigo-500 focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
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
            className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm"
            onClick={() => setFiltersOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-80 overflow-y-auto bg-white p-5 shadow-2xl dark:bg-slate-900">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">Filters</h2>
              <button
                type="button"
                onClick={() => setFiltersOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
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
    return <p className="text-sm text-slate-400">Loading categories…</p>;
  }

  return (
    <div className="space-y-1">
      <button
        type="button"
        onClick={() => onSelect("")}
        className={cn(
          "block w-full rounded-lg px-3 py-2 text-left text-sm transition",
          !selected
            ? "bg-indigo-50 font-semibold text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400"
            : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
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
            "block w-full rounded-lg px-3 py-2 text-left text-sm transition",
            selected === category._id
              ? "bg-indigo-50 font-semibold text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400"
              : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
          )}
        >
          {category.name}
        </button>
      ))}
    </div>
  );
};

export default ProductsPage;
