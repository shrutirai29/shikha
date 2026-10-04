import { Link, useLocation } from "react-router-dom";
import { Home, ShoppingBag, LayoutGrid, Heart, Package } from "lucide-react";
import { motion } from "framer-motion";
import { useWishlist } from "@/hooks/useApi";
import { cn } from "@/lib/utils";

interface NavItem {
  name: string;
  to: string;
  icon: typeof Home;
  isActive: (pathname: string) => boolean;
  badge?: number;
}

export const MobileBottomNav = () => {
  const location = useLocation();
  const { data: wishlist } = useWishlist();

  const wishlistCount = wishlist?.length ?? 0;

  const navItems: NavItem[] = [
    {
      name: "Home",
      to: "/",
      icon: Home,
      isActive: (path) => path === "/" || path === "/home",
    },
    {
      name: "Products",
      to: "/products",
      icon: ShoppingBag,
      isActive: (path) => path.startsWith("/products"),
    },
    {
      name: "Categories",
      to: "/categories",
      icon: LayoutGrid,
      isActive: (path) => path.startsWith("/categories"),
    },
    {
      name: "Orders",
      to: "/orders",
      icon: Package,
      isActive: (path) => path.startsWith("/orders"),
    },
    {
      name: "Wishlist",
      to: "/wishlist",
      icon: Heart,
      isActive: (path) => path === "/wishlist",
      badge: wishlistCount,
    },
  ];

  return (
    <nav
      aria-label="Mobile Bottom Navigation"
      className="fixed bottom-0 inset-x-0 z-50 md:hidden border-t border-white/60 bg-[#FFFCF7]/90 dark:border-white/10 dark:bg-[#140E0C]/90 backdrop-blur-xl shadow-[0_-4px_24px_rgba(59,41,36,0.08)] dark:shadow-[0_-4px_24px_rgba(0,0,0,0.5)] pb-[max(0.5rem,env(safe-area-inset-bottom))]"
    >
      <div className="mx-auto flex h-14 max-w-md items-center justify-around px-2">
        {navItems.map((item) => {
          const active = item.isActive(location.pathname);
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              to={item.to}
              aria-label={item.name}
              aria-current={active ? "page" : undefined}
              className={cn(
                "relative flex flex-1 flex-col items-center justify-center py-1 transition-all duration-200 active:scale-95 touch-manipulation select-none",
                active
                  ? "text-[#B85C4A] dark:text-[#D47763]"
                  : "text-[#806E66] hover:text-[#3B2924] dark:text-[#A89890] dark:hover:text-[#FFF4E8]"
              )}
            >
              {/* Active ambient indicator pill */}
              {active && (
                <motion.span
                  layoutId="mobileNavActivePill"
                  className="absolute inset-x-2.5 top-0.5 bottom-0.5 rounded-xl bg-[#B85C4A]/10 dark:bg-[#D47763]/15 -z-10"
                  transition={{ type: "spring", stiffness: 450, damping: 35 }}
                />
              )}

              <div className="relative flex items-center justify-center">
                <Icon
                  className={cn(
                    "size-5 transition-transform duration-200",
                    active && "scale-110 stroke-[2.35]",
                    item.name === "Wishlist" && active && "fill-current"
                  )}
                />

                {/* Badge count for wishlist */}
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 flex min-w-4 h-4 items-center justify-center rounded-full bg-[#B85C4A] px-1 text-[9px] font-bold text-white shadow-xs dark:bg-[#D47763] dark:text-[#1F1816]">
                    {item.badge > 99 ? "99+" : item.badge}
                  </span>
                )}
              </div>

              <span
                className={cn(
                  "mt-1 text-[10px] tracking-tight leading-none transition-all",
                  active ? "font-bold text-[#B85C4A] dark:text-[#D47763]" : "font-medium text-[#806E66] dark:text-[#A89890]"
                )}
              >
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileBottomNav;
