import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export const PageLayout = ({
  title,
  subtitle,
  actions,
  children,
  className,
}: {
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}) => (
  <div className={cn("mx-auto w-full max-w-7xl px-4 py-8 sm:px-6", className)}>
    {(title || actions) && (
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          {title && (
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
              {title}
            </h1>
          )}
          {subtitle && (
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>
          )}
        </div>
        {actions}
      </div>
    )}
    {children}
  </div>
);
