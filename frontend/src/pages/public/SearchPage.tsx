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
            className="h-10 rounded-xl border border-[#E8DCD0] bg-[#FFFCF7] px-3 text-sm font-medium text-[#3B2924] shadow-sm focus:border-[#B85C4A] focus:outline-none dark:border-[#382823] dark:bg-[#1E1614] dark:text-[#FFF4E8]"
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
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#806E66] dark:text-[#B3A198]" />
          <input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Search for products…"
            className="h-12 w-full rounded-2xl border border-[#E8DCD0] bg-[#FFFCF7] pl-10 pr-3 text-sm text-[#3B2924] placeholder-[#806E66]/60 shadow-sm focus:border-[#B85C4A] focus:outline-none focus:ring-2 focus:ring-[#B85C4A]/20 dark:border-[#382823] dark:bg-[#1E1614] dark:text-[#FFF4E8] dark:placeholder-[#B3A198]/60"
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
