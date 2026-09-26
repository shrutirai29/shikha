import { forwardRef, type ButtonHTMLAttributes } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Variant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "danger"
  | "gradient"
  | "glass";
type Size = "sm" | "md" | "lg" | "icon";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

const variants: Record<Variant, string> = {
  primary:
    "bg-[#B85C4A] text-white shadow-soft hover:bg-[#914536] hover:shadow-lift active:scale-[0.98] focus-visible:outline-[#B85C4A] disabled:bg-[#C7B8AE] dark:bg-[#D47763] dark:text-[#1F1816] dark:hover:bg-[#E28A76] dark:focus-visible:outline-[#D47763] dark:disabled:bg-[#493A34]",
  secondary:
    "bg-[#7A8B68] text-white shadow-soft hover:bg-[#687757] hover:shadow-lift active:scale-[0.98] focus-visible:outline-[#7A8B68] disabled:bg-[#C7B8AE] dark:bg-[#9BAF83] dark:text-[#1F1816] dark:hover:bg-[#adc096] dark:focus-visible:outline-[#9BAF83]",
  outline:
    "border border-[#E8DCD0] bg-[#FFFCF7] text-[#3B2924] shadow-sm hover:bg-[#F5EDE4] hover:border-[#C7B8AE] active:scale-[0.98] dark:border-[#493A34] dark:bg-[#2A211E] dark:text-[#FFF4E8] dark:hover:bg-[#352925]",
  ghost:
    "text-[#806E66] hover:bg-[#F5EDE4] hover:text-[#3B2924] active:scale-[0.98] dark:text-[#C7B8AE] dark:hover:bg-[#352925] dark:hover:text-[#FFF4E8]",
  danger:
    "bg-[#914536] text-white shadow-sm hover:bg-[#78372A] hover:shadow-lift active:scale-[0.98] focus-visible:outline-[#914536] disabled:opacity-50",
  gradient:
    "relative overflow-hidden bg-gradient-to-r from-[#B85C4A] via-[#C98F8B] to-[#D8A85B] text-white shadow-lift hover:opacity-95 active:scale-[0.98] transition-all duration-300 focus-visible:outline-[#B85C4A] disabled:opacity-50",
  glass:
    "border border-white/20 bg-white/10 text-white backdrop-blur-md hover:bg-white/20 hover:border-white/40 shadow-sm active:scale-[0.98] transition-all dark:border-white/15 dark:bg-white/5 dark:hover:bg-white/10",
};

const sizes: Record<Size, string> = {
  sm: "h-8.5 px-3.5 text-xs gap-1.5 rounded-lg",
  md: "h-10.5 px-4.5 text-sm gap-2 rounded-xl",
  lg: "h-12.5 px-6.5 text-base gap-2 rounded-2xl",
  icon: "size-10 rounded-xl",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant = "primary", size = "md", loading, disabled, children, ...props },
    ref
  ) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center font-medium transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-60",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {loading && <Loader2 className="size-4 animate-spin" />}
      {children}
    </button>
  )
);

Button.displayName = "Button";

export { AddToCartButton } from "./AddToCartButton";
export type { AddToCartButtonProps } from "./AddToCartButton";
export { ProductShareButton } from "./ProductShareButton";
