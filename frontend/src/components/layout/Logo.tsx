import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export const Logo = ({
  className,
  to = "/",
  inverted = false,
}: {
  className?: string;
  to?: string;
  inverted?: boolean;
}) => (
  <Link
    to={to}
    className={cn("inline-flex items-center gap-2 sm:gap-2.5 shrink-0", className)}
    aria-label={to === "/admin" ? "Knottiingale admin panel" : "Knottiingale home"}
  >
    <span className="flex size-8 sm:size-9 shrink-0 items-center justify-center rounded-xl bg-[#B85C4A] text-[#FFF8F0] shadow-soft transition-transform group-hover:scale-105 dark:bg-[#D47763] dark:text-[#1F1816]">
      <Sparkles className="size-4 sm:size-4.5 text-[#D8A85B] dark:text-[#1F1816]" />
    </span>
    <span
      className={cn(
        "font-display text-base sm:text-xl font-bold tracking-tight transition-colors",
        inverted ? "text-white" : "text-[#3B2924] dark:text-[#FFF4E8]"
      )}
    >
      Knottiingale
    </span>
  </Link>
);
