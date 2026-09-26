import { useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { usePageTitle } from "@/hooks/usePageTitle";
import {
  BarChart3,
  CreditCard,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Package,
  ShoppingBag,
  Star,
  Store,
  Sun,
  Tag,
  TicketPercent,
  Users,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "./Logo";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import adminBackdrop from "@/assets/admin-backdrop.jpg";

const adminLinks = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/products", label: "Products", icon: Package },
  { to: "/admin/categories", label: "Categories", icon: Tag },
  { to: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { to: "/admin/coupons", label: "Coupons", icon: TicketPercent },
  { to: "/admin/payments", label: "Payments", icon: CreditCard },
  { to: "/admin/reviews", label: "Reviews", icon: Star },
];

const linkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-all duration-200",
    isActive
      ? "bg-[#B85C4A] text-white shadow-soft dark:bg-gradient-to-r dark:from-[#D47763] dark:to-[#B85C4A] dark:text-white dark:shadow-[0_4px_16px_rgba(212,119,99,0.35)] dark:font-bold"
      : "text-[#806E66] hover:bg-[#F5EDE4] hover:text-[#3B2924] dark:text-[#B3A198] dark:hover:bg-[#2C211D]/80 dark:hover:text-[#FFF4E8]"
  );

const ADMIN_TITLES: Record<string, string> = {
  "/admin": "Admin Dashboard",
  "/admin/analytics": "Analytics",
  "/admin/users": "Users",
  "/admin/products": "Products",
  "/admin/categories": "Categories",
  "/admin/orders": "Orders",
  "/admin/coupons": "Coupons",
  "/admin/payments": "Payments",
  "/admin/reviews": "Reviews",
};

export const AdminLayout = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  usePageTitle(
    ADMIN_TITLES[location.pathname] ??
      (location.pathname.startsWith("/admin") ? "Admin" : undefined)
  );

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center justify-between border-b border-[#E8DCD0] px-5 dark:border-[#493A34]">
        <Logo to="/admin" />
        <button
          type="button"
          onClick={() => setSidebarOpen(false)}
          className="rounded-lg p-1.5 text-[#806E66] hover:bg-[#F5EDE4] lg:hidden dark:text-[#C7B8AE] dark:hover:bg-[#352925]"
          aria-label="Close admin menu"
        >
          <X className="size-5" />
        </button>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3" aria-label="Admin navigation">
        {adminLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            onClick={() => setSidebarOpen(false)}
            className={linkClass}
          >
            <link.icon className="size-4.5" />
            {link.label}
          </NavLink>
        ))}
      </nav>

      <div className="space-y-1 border-t border-[#E8DCD0] p-4 dark:border-[#493A34]">
        <Link
          to="/"
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-[#7A8B68] transition hover:bg-[#7A8B68]/15 dark:text-[#9BAF83] dark:hover:bg-[#9BAF83]/15"
        >
          <Store className="size-4.5" />
          View Storefront
        </Link>
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-[#914536] transition hover:bg-[#B85C4A]/10 dark:text-[#E28A76] dark:hover:bg-[#D47763]/10"
        >
          <LogOut className="size-4.5" />
          Log out
        </button>
        <p className="mt-2 px-3 text-xs text-[#806E66] dark:text-[#C7B8AE]">
          Signed in as <span className="font-semibold text-[#3B2924] dark:text-[#FFF4E8]">{user?.name}</span>
        </p>
      </div>
    </div>
  );

  return (
    <div className="relative flex min-h-screen bg-[#FFF8F0] dark:bg-[#150F0D]">
      {/* Artisanal Flatlay Backdrop with subtle soft tint */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden select-none">
        <img
          src={adminBackdrop}
          alt="Crochet yarn and lace background"
          className="size-full object-cover object-center opacity-85 dark:opacity-45 transition-opacity duration-500"
        />
        {/* Warm ambient scrim: keeps admin metrics, tables and cards crisp and perfectly readable */}
        <div className="absolute inset-0 bg-[#FFF8F0]/50 dark:bg-gradient-to-br dark:from-[#150F0D]/85 dark:via-[#1B1311]/80 dark:to-[#120C0A]/90 backdrop-blur-[1px]" />
      </div>

      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-[#E8DCD0]/90 bg-[#FFFCF7]/90 backdrop-blur-xl lg:block dark:border-[#382823] dark:bg-[#1B1311]/90 shadow-soft">
        {sidebar}
      </aside>

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-[#150F0D]/60 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 w-72 bg-[#FFFCF7]/95 shadow-2xl backdrop-blur-2xl dark:border-r dark:border-[#382823] dark:bg-[#1B1311]/95">
            {sidebar}
          </aside>
        </div>
      )}

      <div className="relative z-10 flex min-h-screen flex-1 flex-col lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-[#E8DCD0]/80 bg-[#FFFCF7]/85 px-4 backdrop-blur-xl dark:border-[#382823] dark:bg-[#1B1311]/85 sm:px-6 shadow-xs">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg p-2 text-[#806E66] hover:bg-[#F5EDE4] lg:hidden dark:text-[#C7B8AE] dark:hover:bg-[#2A1E1A]"
            aria-label="Open admin menu"
          >
            <Menu className="size-5" />
          </button>
          <div className="flex items-center gap-2.5">
            <span className="flex size-2 rounded-full bg-[#B85C4A] shadow-[0_0_8px_#B85C4A] animate-pulse dark:bg-[#D47763] dark:shadow-[0_0_8px_#D47763]" />
            <h1 className="text-sm font-bold uppercase tracking-wider text-[#3B2924] dark:text-[#FFF4E8]">
              Knottiingale Studio Admin
            </h1>
          </div>

          <div className="ml-auto flex items-center gap-3">
            <Link
              to="/"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-[#7A8B68]/30 bg-[#FFFCF7]/80 px-3 py-1.5 text-xs font-semibold text-[#7A8B68] shadow-xs backdrop-blur-sm transition hover:bg-[#7A8B68]/15 dark:border-[#9BAF83]/40 dark:bg-[#221A17]/80 dark:text-[#9BAF83] dark:hover:bg-[#9BAF83]/15"
            >
              <Store className="size-3.5" />
              <span>Storefront</span>
            </Link>
            <button
              type="button"
              onClick={toggleTheme}
              className="rounded-xl border border-transparent p-2 text-[#806E66] transition hover:bg-[#F5EDE4] dark:border-[#382823] dark:bg-[#221A17]/60 dark:text-[#E0B86A] dark:hover:bg-[#2C211D]"
              aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            >
              {theme === "dark" ? <Sun className="size-5 text-[#E0B86A]" /> : <Moon className="size-5 text-[#B85C4A]" />}
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
