import { cn } from "@/lib/utils";

interface CartLoaderProps {
  label?: string;
  className?: string;
}

export const CartLoader = ({ label = "Loading", className }: CartLoaderProps) => {
  // Strip any trailing dots/ellipsis from label since animated dots are appended
  const cleanLabel = label.replace(/[.…]+$/, "").trim() || "Loading";

  return (
    <div className={cn("cart-loader", className)} role="status" aria-label={label}>
      <div className="items-container" aria-hidden="true">
        <div id="item-mobile" className="item item-mobile" />
        <div id="item-laptop" className="item item-laptop" />
        <div id="item-tab" className="item item-tab" />
        <div id="item-headphone" className="item item-headphone" />
        <div id="item-mixer" className="item item-mixer" />
      </div>

      <div id="cart-icon" className="cart-icon" aria-hidden="true" />

      <div className="loading-text">
        <span>{cleanLabel}</span>
        <span className="dot">.</span>
        <span className="dot">.</span>
        <span className="dot">.</span>
      </div>
    </div>
  );
};

export default CartLoader;
