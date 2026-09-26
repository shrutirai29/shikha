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
      "flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-[#E8DCD0] bg-[#FFFCF7]/60 px-6 py-14 text-center dark:border-[#382823] dark:bg-[#1A1210]/60 dark:backdrop-blur-md",
      className
    )}
  >
    <div className="flex size-14 items-center justify-center rounded-full bg-[#F5EDE4] text-[#806E66] dark:border dark:border-[#D47763]/20 dark:bg-[#251B18] dark:text-[#D47763] dark:shadow-inner">
      {icon ?? <Inbox className="size-7" />}
    </div>
    <div className="space-y-1">
      <h3 className="text-base font-semibold text-[#3B2924] dark:text-[#FFF4E8]">{title}</h3>
      {description && (
        <p className="mx-auto max-w-sm text-sm text-[#806E66] dark:text-[#B3A198]">{description}</p>
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
      "flex flex-col items-center justify-center gap-3 rounded-2xl border border-[#B85C4A]/30 bg-[#B85C4A]/5 px-6 py-14 text-center dark:border-[#D47763]/30 dark:bg-[#D47763]/5",
      className
    )}
  >
    <div className="flex size-14 items-center justify-center rounded-full bg-[#B85C4A]/10 text-[#914536] dark:bg-[#D47763]/15 dark:text-[#E28A76]">
      <TriangleAlert className="size-7" />
    </div>
    <div className="space-y-1">
      <h3 className="text-base font-semibold text-[#914536] dark:text-[#E28A76]">{title}</h3>
      {message && (
        <p className="mx-auto max-w-sm text-sm text-[#806E66] dark:text-[#C7B8AE]">{message}</p>
      )}
    </div>
    {onRetry && (
      <button
        type="button"
        onClick={onRetry}
        className="rounded-xl border border-[#B85C4A] px-4 py-2 text-sm font-semibold text-[#B85C4A] transition hover:bg-[#B85C4A]/10 dark:border-[#D47763] dark:text-[#D47763] dark:hover:bg-[#D47763]/10"
      >
        Try again
      </button>
    )}
  </div>
);
