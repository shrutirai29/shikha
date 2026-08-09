import { Star } from "lucide-react";
import { cn, formatRating } from "@/lib/utils";

export const Rating = ({
  value,
  count,
  className,
}: {
  value: number;
  count?: number;
  className?: string;
}) => (
  <div className={cn("flex items-center gap-1.5", className)}>
    <div className="flex items-center gap-0.5" aria-label={`Rated ${formatRating(value)} out of 5`}>
      {Array.from({ length: 5 }).map((_, index) => (
        <Star
          key={index}
          className={cn(
            "size-4",
            index < Math.round(value)
              ? "fill-amber-400 text-amber-400"
              : "fill-slate-200 text-slate-200 dark:fill-slate-600 dark:text-slate-600"
          )}
        />
      ))}
    </div>
    <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
      {formatRating(value)}
      {count !== undefined && count > 0 && (
        <span className="ml-1 font-normal text-slate-400">({count})</span>
      )}
    </span>
  </div>
);

export const StarInput = ({
  value,
  onChange,
}: {
  value: number;
  onChange: (value: number) => void;
}) => (
  <div className="flex items-center gap-1" role="radiogroup" aria-label="Rating">
    {Array.from({ length: 5 }).map((_, index) => {
      const starValue = index + 1;

      return (
        <button
          key={starValue}
          type="button"
          role="radio"
          aria-checked={value === starValue}
          aria-label={`${starValue} star${starValue > 1 ? "s" : ""}`}
          onClick={() => onChange(starValue)}
          className="rounded p-0.5 transition hover:scale-110"
        >
          <Star
            className={cn(
              "size-7",
              starValue <= value
                ? "fill-amber-400 text-amber-400"
                : "fill-slate-200 text-slate-200 dark:fill-slate-600 dark:text-slate-600"
            )}
          />
        </button>
      );
    })}
  </div>
);
