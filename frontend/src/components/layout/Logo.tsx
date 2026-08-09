import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export const Logo = ({ className }: { className?: string }) => (
  <Link
    to="/"
    className={cn("inline-flex items-center gap-2", className)}
    aria-label="Shikha home"
  >
    <span className="flex size-8 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-sm">
      <Sparkles className="size-4" />
    </span>
    <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
      Shikha
    </span>
  </Link>
);
