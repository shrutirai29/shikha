import { useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
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
    "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-colors",
    isActive
      ? "bg-[#B85C4A] text-white shadow-soft dark:bg-[#D47763] dark:text-[#1F1816]"
      : "text-[#806E66] hover:bg-[#F5EDE4] hover:text-[#3B2924] dark:text-[#C7B8AE] dark:hover:bg-[#352925] dark:hover:text-[#FFF4E8]"
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

      <div className="border-t border-[#E8DCD0] p-4 dark:border-[#493A34]">
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
    <div className="flex min-h-screen bg-[#FFF8F0] dark:bg-[#1F1816]">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-[#E8DCD0] bg-[#FFFCF7] lg:block dark:border-[#493A34] dark:bg-[#2A211E]">
        {sidebar}
      </aside>

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-[#1F1816]/50 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 w-72 bg-[#FFFCF7] shadow-2xl dark:bg-[#2A211E]">
            {sidebar}
          </aside>
        </div>
      )}

      <div className="flex min-h-screen flex-1 flex-col lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-[#E8DCD0] bg-[#FFFCF7]/85 px-4 backdrop-blur-lg dark:border-[#493A34] dark:bg-[#2A211E]/85 sm:px-6">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg p-2 text-[#806E66] hover:bg-[#F5EDE4] lg:hidden dark:text-[#C7B8AE] dark:hover:bg-[#352925]"
            aria-label="Open admin menu"
          >
            <Menu className="size-5" />
          </button>
          <h1 className="text-sm font-semibold uppercase tracking-wide text-[#806E66] dark:text-[#C7B8AE]">
            Admin Panel
          </h1>

          <div className="ml-auto">
            <button
              type="button"
              onClick={toggleTheme}
              className="rounded-xl p-2 text-[#806E66] hover:bg-[#F5EDE4] dark:text-[#C7B8AE] dark:hover:bg-[#352925]"
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
