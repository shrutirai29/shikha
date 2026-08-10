import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { usePageTitle } from "@/hooks/usePageTitle";

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
}) => {
  usePageTitle(title);

  return (
    <div className={cn("mx-auto w-full max-w-7xl px-4 py-8 sm:px-6", className)}>
    {(title || actions) && (
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          {title && (
            <h1 className="font-display text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl dark:text-slate-50">
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
};
