import { Inbox, TriangleAlert } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export const EmptyState = ({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) => (
  <div
    className={cn(
      "flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 px-6 py-14 text-center dark:border-slate-600 dark:bg-slate-800/40",
      className
    )}
  >
    <div className="flex size-14 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-slate-700/60 dark:text-slate-400">
      {icon ?? <Inbox className="size-7" />}
    </div>
    <div className="space-y-1">
      <h3 className="text-base font-semibold text-slate-900 dark:text-white">{title}</h3>
      {description && (
        <p className="mx-auto max-w-sm text-sm text-slate-500 dark:text-slate-400">{description}</p>
      )}
    </div>
    {action}
  </div>
);

export const ErrorState = ({
  title = "Something went wrong",
  message,
  onRetry,
  className,
}: {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}) => (
  <div
    className={cn(
      "flex flex-col items-center justify-center gap-3 rounded-2xl border border-rose-200 bg-rose-50/60 px-6 py-14 text-center dark:border-rose-500/30 dark:bg-rose-500/5",
      className
    )}
  >
    <div className="flex size-14 items-center justify-center rounded-full bg-rose-100 text-rose-500 dark:bg-rose-500/15">
      <TriangleAlert className="size-7" />
    </div>
    <div className="space-y-1">
      <h3 className="text-base font-semibold text-rose-900 dark:text-rose-200">{title}</h3>
      {message && (
        <p className="mx-auto max-w-sm text-sm text-rose-700 dark:text-rose-300/80">{message}</p>
      )}
    </div>
    {onRetry && (
      <button
        type="button"
        onClick={onRetry}
        className="rounded-lg border border-rose-300 px-4 py-2 text-sm font-medium text-rose-700 transition hover:bg-rose-100 dark:border-rose-500/40 dark:text-rose-300 dark:hover:bg-rose-500/10"
      >
        Try again
      </button>
    )}
  </div>
);
