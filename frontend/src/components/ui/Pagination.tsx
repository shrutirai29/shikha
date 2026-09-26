import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Pagination } from "@/types";

export const PaginationBar = ({
  pagination,
  onPageChange,
  className,
}: {
  pagination?: Pagination;
  onPageChange: (page: number) => void;
  className?: string;
}) => {
  if (!pagination || pagination.totalPages <= 1) {
    return null;
  }

  const { page, totalPages } = pagination;

  const pages: number[] = [];

  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || Math.abs(i - page) <= 1) {
      pages.push(i);
    }
  }

  const items: (number | "...")[] = [];

  pages.forEach((p, index) => {
    if (index > 0 && p - pages[index - 1] > 1) {
      items.push("...");
    }

    items.push(p);
  });

  return (
    <nav
      aria-label="Pagination"
      className={cn("flex items-center justify-center gap-1.5", className)}
    >
      <button
        type="button"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        aria-label="Previous page"
        className="flex size-9 items-center justify-center rounded-xl border border-[#E8DCD0] bg-[#FFFCF7] text-[#3B2924] transition hover:bg-[#F5EDE4] disabled:pointer-events-none disabled:opacity-40 dark:border-[#493A34] dark:bg-[#2A211E] dark:text-[#FFF4E8] dark:hover:bg-[#352925]"
      >
        <ChevronLeft className="size-4" />
      </button>

      {items.map((item, index) =>
        item === "..." ? (
          <span key={`gap-${index}`} className="px-1 text-[#806E66] dark:text-[#C7B8AE]">
            …
          </span>
        ) : (
          <button
            key={item}
            type="button"
            onClick={() => onPageChange(item)}
            aria-current={item === page ? "page" : undefined}
            className={cn(
              "flex size-9 items-center justify-center rounded-xl text-sm font-semibold transition",
              item === page
                ? "bg-[#B85C4A] text-white shadow-soft dark:bg-[#D47763] dark:text-[#1F1816]"
                : "border border-[#E8DCD0] bg-[#FFFCF7] text-[#3B2924] hover:bg-[#F5EDE4] dark:border-[#493A34] dark:bg-[#2A211E] dark:text-[#FFF4E8] dark:hover:bg-[#352925]"
            )}
          >
            {item}
          </button>
        )
      )}

      <button
        type="button"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        aria-label="Next page"
        className="flex size-9 items-center justify-center rounded-xl border border-[#E8DCD0] bg-[#FFFCF7] text-[#3B2924] transition hover:bg-[#F5EDE4] disabled:pointer-events-none disabled:opacity-40 dark:border-[#493A34] dark:bg-[#2A211E] dark:text-[#FFF4E8] dark:hover:bg-[#352925]"
      >
        <ChevronRight className="size-4" />
      </button>
    </nav>
  );
};
