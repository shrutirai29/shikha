import { forwardRef, type HTMLAttributes } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export const Card = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-2xl border border-slate-200 bg-white shadow-soft dark:border-slate-700/60 dark:bg-slate-900/70",
        className
      )}
      {...props}
    />
  )
);

Card.displayName = "Card";

export const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-5", className)} {...props} />
  )
);

CardContent.displayName = "CardContent";

type BadgeVariant = "default" | "success" | "warning" | "danger" | "info" | "outline";

export const Badge = ({
  variant = "default",
  className,
  children,
}: {
  variant?: BadgeVariant;
  className?: string;
  children: React.ReactNode;
}) => {
  const variants: Record<BadgeVariant, string> = {
    default: "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200",
    success: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400",
    warning: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400",
    danger: "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400",
    info: "bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-400",
    outline: "border border-slate-300 text-slate-600 dark:border-slate-600 dark:text-slate-300",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
};

export const Skeleton = ({ className }: { className?: string }) => (
  <div
    aria-hidden="true"
    className={cn(
      "animate-pulse rounded-lg bg-slate-200 dark:bg-slate-700/60",
      className
    )}
  />
);

export const Spinner = ({ className }: { className?: string }) => (
  <Loader2 className={cn("size-6 animate-spin text-indigo-600 dark:text-indigo-400", className)} />
);

export const PageLoader = ({ label = "Loading…" }: { label?: string }) => (
  <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3" role="status">
    <Spinner className="size-8" />
    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
  </div>
);
