import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search } from "lucide-react";
import { useSearch } from "@/hooks/useApi";
import { ProductGrid } from "@/components/product/ProductGrid";
import { PageLayout } from "@/components/layout/PageLayout";
import { PaginationBar } from "@/components/ui/Pagination";
import { ErrorState } from "@/components/ui/States";
import { getErrorMessage } from "@/lib/api";
import { Button } from "@/components/ui/Button";

const sortOptions = [
  { value: "-createdAt", label: "Newest first" },
  { value: "price", label: "Price: low to high" },
  { value: "-price", label: "Price: high to low" },
  { value: "-averageRating", label: "Top rated" },
];

export const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q") ?? "";
  const page = Number(searchParams.get("page") ?? "1");
  const sort = searchParams.get("sort") ?? "-createdAt";

  const [input, setInput] = useState(query);

  const { data, isLoading, isError, error, refetch } = useSearch({
    q: query,
    page,
    limit: 12,
    sort,
  });

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

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    const term = input.trim();

    if (term) {
      updateParams({ q: term });
    }
  };

  return (
    <PageLayout
      title="Search"
      subtitle={
        query ? `${data?.pagination?.total ?? 0} result${data?.pagination?.total === 1 ? "" : "s"} for "${query}"` : "Search the catalog"
      }
      actions={
        query ? (
          <select
            value={sort}
            onChange={(event) => updateParams({ sort: event.target.value })}
            aria-label="Sort results"
            className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 shadow-sm focus:border-indigo-500 focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        ) : undefined
      }
    >
      <form onSubmit={handleSubmit} className="mb-8 flex max-w-xl gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Search for products…"
            className="h-12 w-full rounded-xl border border-slate-300 bg-white pl-10 pr-3 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
          />
        </div>
        <Button type="submit" size="lg">
          Search
        </Button>
      </form>

      {isError ? (
        <ErrorState message={getErrorMessage(error)} onRetry={() => void refetch()} />
      ) : (
        <>
          <ProductGrid
            products={data?.products}
            loading={isLoading}
            emptyTitle="No results found"
            emptyDescription={`We couldn't find anything matching "${query}". Try a different search term.`}
          />
          <PaginationBar
            pagination={data?.pagination}
            onPageChange={(nextPage) => updateParams({ page: String(nextPage) })}
            className="mt-10"
          />
        </>
      )}
    </PageLayout>
  );
};

export default SearchPage;
