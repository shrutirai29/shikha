import { forwardRef, type HTMLAttributes } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export const Card = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-2xl border border-[#E8DCD0] bg-[#FFFCF7] shadow-soft text-[#3B2924] dark:border-[#493A34] dark:bg-[#2A211E] dark:text-[#FFF4E8]",
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
    default: "bg-[#F5EDE4] text-[#3B2924] dark:bg-[#352925] dark:text-[#FFF4E8]",
    success: "bg-[#7A8B68]/15 text-[#5e6c50] dark:bg-[#9BAF83]/20 dark:text-[#9BAF83]",
    warning: "bg-[#D8A85B]/20 text-[#8e6827] dark:bg-[#E0B86A]/20 dark:text-[#E0B86A]",
    danger: "bg-[#B85C4A]/15 text-[#914536] dark:bg-[#D47763]/20 dark:text-[#E28A76]",
    info: "bg-[#C98F8B]/20 text-[#8c5652] dark:bg-[#D8A09B]/20 dark:text-[#D8A09B]",
    outline: "border border-[#E8DCD0] text-[#806E66] dark:border-[#493A34] dark:text-[#C7B8AE]",
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
      "animate-pulse rounded-xl bg-[#F5EDE4] dark:bg-[#352925]",
      className
    )}
  />
);

export const Spinner = ({ className }: { className?: string }) => (
  <Loader2 className={cn("size-6 animate-spin text-[#B85C4A] dark:text-[#D47763]", className)} />
);

import { CartLoader } from "./CartLoader";

export { CartLoader };

export const PageLoader = ({ label = "Loading…" }: { label?: string }) => (
  <div className="flex min-h-[50vh] flex-col items-center justify-center p-6" role="status">
    <CartLoader label={label} />
  </div>
);
