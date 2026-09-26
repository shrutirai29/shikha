import { useState } from "react";
import { BadgeCheck, Star, Trash2 } from "lucide-react";
import { useAdminReviews, useDeleteReviewAdmin } from "@/hooks/useApi";
import { Badge, Card, Skeleton } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/States";
import { PaginationBar } from "@/components/ui/Pagination";
import { Rating } from "@/components/ui/Rating";
import { ConfirmDialog } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/context/ToastContext";
import { getErrorMessage } from "@/lib/api";
import { cn, formatDate } from "@/lib/utils";

export const AdminReviewsPage = () => {
  const [page, setPage] = useState(1);
  const [rating, setRating] = useState<number | undefined>(undefined);
  const [search, setSearch] = useState("");
  const [toDelete, setToDelete] = useState<string | null>(null);
  const deleteReview = useDeleteReviewAdmin();
  const toast = useToast();

  const { data, isLoading, isError } = useAdminReviews({
    page,
    limit: 10,
    rating,
    search: search || undefined,
  });

  const handleDelete = async () => {
    if (!toDelete) return;

    try {
      await deleteReview.mutateAsync(toDelete);
      toast.success("Review removed");
      setToDelete(null);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const ratings = [5, 4, 3, 2, 1];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-semibold tracking-tight text-[#3B2924] dark:text-[#FFF4E8]">
            Reviews
          </h2>
          <p className="mt-1 text-sm text-[#806E66] dark:text-[#B3A198]">
            Moderate customer reviews across the boutique
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 rounded-full border border-[#E8DCD0] bg-[#FFFCF7] p-1 dark:border-[#382823] dark:bg-[#1A1210]/80">
            <button
              type="button"
              onClick={() => setRating(undefined)}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-semibold transition",
                rating === undefined
                  ? "bg-[#B85C4A] text-white dark:bg-gradient-to-r dark:from-[#D47763] dark:to-[#B85C4A] dark:text-white dark:shadow-[0_2px_10px_rgba(212,119,99,0.35)]"
                  : "text-[#806E66] hover:text-[#3B2924] dark:text-[#B3A198] dark:hover:text-[#FFF4E8]"
              )}
            >
              All
            </button>
            {ratings.map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setRating(rating === value ? undefined : value)}
                className={cn(
                  "flex items-center gap-0.5 rounded-full px-2.5 py-1 text-xs font-semibold transition",
                  rating === value
                    ? "bg-[#B85C4A] text-white dark:bg-gradient-to-r dark:from-[#D47763] dark:to-[#B85C4A] dark:text-white dark:shadow-[0_2px_10px_rgba(212,119,99,0.35)]"
                    : "text-[#806E66] hover:text-[#3B2924] dark:text-[#B3A198] dark:hover:text-[#FFF4E8]"
                )}
                aria-label={`Filter ${value} star reviews`}
              >
                <Star className="size-3 fill-current" />
                {value}
              </button>
            ))}
          </div>

          <input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="Search comments…"
            className="h-10 w-52 rounded-full border border-[#E8DCD0] bg-[#FFFCF7] px-4 text-sm text-[#3B2924] shadow-sm placeholder:text-[#806E66]/60 focus:border-[#B85C4A] focus:outline-none focus:ring-2 focus:ring-[#B85C4A]/20 dark:border-[#382823] dark:bg-[#1A1210]/90 dark:text-[#FFF4E8] dark:placeholder:text-[#B3A198]/50 dark:focus:border-[#D47763] dark:focus:ring-[#D47763]/25"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-28 rounded-2xl" />
          ))}
        </div>
      ) : isError || !data?.reviews.length ? (
        <EmptyState
          title={isError ? "Couldn't load reviews" : "No reviews yet"}
          description={
            isError
              ? "Something went wrong while fetching reviews."
              : "Reviews from customers will appear here."
          }
        />
      ) : (
        <div className="space-y-3">
          {data.reviews.map((review) => {
            const author = typeof review.user === "string" ? null : review.user;
            const product =
              typeof review.product === "string" ? null : review.product;

            return (
              <Card key={review._id} className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex flex-wrap items-center gap-3">
                      <span className="flex size-9 items-center justify-center rounded-full bg-gradient-to-br from-[#D47763] to-[#B85C4A] text-xs font-bold text-white shadow-sm">
                        {(author?.name ?? "U").charAt(0).toUpperCase()}
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-[#3B2924] dark:text-[#FFF4E8]">
                          {author?.name ?? "Unknown user"}
                        </p>
                        <p className="text-xs text-[#806E66] dark:text-[#B3A198]">
                          {author?.email ?? ""} · {formatDate(review.createdAt)}
                        </p>
                      </div>
                      {review.verifiedPurchase && (
                        <Badge variant="success">
                          <BadgeCheck className="size-3.5" /> Verified
                        </Badge>
                      )}
                    </div>

                    <Rating value={review.rating} className="mb-2" />

                    <p className="text-sm text-[#3B2924]/90 dark:text-[#FFF4E8]/90">
                      “{review.comment}”
                    </p>
                  </div>

                  <div className="flex shrink-0 flex-col items-end gap-3">
                    {product ? (
                      <div className="flex items-center gap-2">
                        {product.images?.[0] ? (
                          <img
                            src={product.images[0]}
                            alt=""
                            className="size-8 rounded-lg object-cover border border-[#E8DCD0] dark:border-[#382823]"
                          />
                        ) : null}
                        <span className="max-w-40 truncate text-xs font-medium text-[#806E66] dark:text-[#B3A198]">
                          {product.name}
                        </span>
                      </div>
                    ) : null}

                    <Button
                      variant="outline"
                      size="sm"
                      className="border-rose-300 text-rose-700 hover:bg-rose-50 hover:border-rose-400 dark:border-rose-500/40 dark:text-rose-300 dark:hover:bg-rose-500/10"
                      onClick={() => setToDelete(review._id)}
                    >
                      <Trash2 className="size-3.5" /> Remove
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}

          {data.pagination.totalPages > 1 && (
            <div className="pt-2">
              <PaginationBar
                pagination={data.pagination}
                onPageChange={setPage}
              />
            </div>
          )}
        </div>
      )}

      <ConfirmDialog
        open={Boolean(toDelete)}
        onClose={() => setToDelete(null)}
        onConfirm={() => void handleDelete()}
        title="Remove this review?"
        description="The review will be hidden from the product and its rating will be recalculated."
        confirmLabel="Remove review"
        danger
        loading={deleteReview.isPending}
      />
    </div>
  );
};

export default AdminReviewsPage;
