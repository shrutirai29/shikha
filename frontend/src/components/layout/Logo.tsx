import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export const Logo = ({ className }: { className?: string }) => (
  <Link
    to="/"
    className={cn("inline-flex items-center gap-2.5", className)}
    aria-label="Shikha home"
  >
    <span className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-300 text-white shadow-soft">
      <Sparkles className="size-4.5" />
    </span>
    <span className="font-display text-xl font-semibold tracking-tight text-slate-950 dark:text-slate-50">
      Shikha
    </span>
  </Link>
);
