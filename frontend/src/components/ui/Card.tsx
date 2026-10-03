import { forwardRef, type HTMLAttributes } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export const Card = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-2xl border border-white/80 bg-[#FFFCF7]/80 backdrop-blur-md text-[#3B2924] shadow-soft transition-all duration-300 dark:border-white/10 dark:bg-[#1E1614]/80 dark:text-[#FFF4E8] dark:shadow-[0_8px_30px_rgb(0,0,0,0.35)] dark:backdrop-blur-xl dark:ring-1 dark:ring-white/[0.04] dark:hover:border-[#D47763]/30",
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
    default:
      "bg-[#F5EDE4] text-[#3B2924] border border-[#E8DCD0] dark:bg-[#251B18] dark:text-[#FFF4E8] dark:border-[#382823]",
    success:
      "bg-[#7A8B68]/15 text-[#5e6c50] border border-[#7A8B68]/20 dark:bg-[#7A8B68]/20 dark:text-[#A7BA90] dark:border-[#7A8B68]/30",
    warning:
      "bg-[#D8A85B]/20 text-[#8e6827] border border-[#D8A85B]/20 dark:bg-[#D8A85B]/20 dark:text-[#E8C27E] dark:border-[#D8A85B]/30",
    danger:
      "bg-[#B85C4A]/15 text-[#914536] border border-[#B85C4A]/20 dark:bg-[#B85C4A]/20 dark:text-[#E28A76] dark:border-[#B85C4A]/30",
    info:
      "bg-[#C98F8B]/20 text-[#8c5652] border border-[#C98F8B]/20 dark:bg-[#C98F8B]/20 dark:text-[#E2A6A2] dark:border-[#C98F8B]/30",
    outline:
      "border border-[#E8DCD0] text-[#806E66] dark:border-[#382823] dark:text-[#C7B8AE]",
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
