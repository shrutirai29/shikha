import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export const Logo = ({
  className,
  to = "/",
}: {
  className?: string;
  to?: string;
}) => (
  <Link
    to={to}
    className={cn("inline-flex items-center gap-2.5", className)}
    aria-label={to === "/admin" ? "Knottiingale admin panel" : "Knottiingale home"}
  >
    <span className="flex size-9 items-center justify-center rounded-xl bg-[#B85C4A] text-[#FFF8F0] shadow-soft transition-transform group-hover:scale-105 dark:bg-[#D47763] dark:text-[#1F1816]">
      <Sparkles className="size-4.5 text-[#D8A85B] dark:text-[#1F1816]" />
    </span>
    <span className="font-display text-lg sm:text-xl font-bold tracking-tight text-[#3B2924] transition-colors dark:text-[#FFF4E8]">
      Knottiingale
    </span>
  </Link>
);
