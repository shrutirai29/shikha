import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  Heart,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Package,
  Search,
  Settings,
  ShoppingBag,
  Sparkles,
  Sun,
  User as UserIcon,
  X,
} from "lucide-react";
import { Logo } from "./Logo";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { useCart, useWishlist } from "@/hooks/useApi";
import { cn, initials } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    "rounded-xl px-3.5 py-2 text-sm font-medium transition-colors",
    isActive
      ? "bg-[#B85C4A]/10 text-[#B85C4A] font-semibold dark:bg-[#D47763]/15 dark:text-[#D47763]"
      : "text-[#806E66] hover:text-[#B85C4A] hover:bg-[#F5EDE4]/60 dark:text-[#B3A198] dark:hover:text-[#FFF4E8] dark:hover:bg-[#251B18]/70"
  );

export const Header = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { data: cart } = useCart();
  const { data: wishlist } = useWishlist();
  const navigate = useNavigate();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClickOutside = (event: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", onClickOutside);

    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const cartCount =
    cart?.items?.reduce((sum, item) => sum + item.quantity, 0) ?? 0;

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();

    const term = query.trim();

    if (term) {
      navigate(`/search?q=${encodeURIComponent(term)}`);
      setSearchOpen(false);
      setQuery("");
    }
  };

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    navigate("/");
  };

  const userLinks = isAdmin
    ? [
        { to: "/admin", label: "Admin Dashboard", icon: LayoutDashboard },
        { to: "/profile", label: "Profile", icon: UserIcon },
        { to: "/orders", label: "Orders", icon: Package },
        { to: "/settings", label: "Settings", icon: Settings },
      ]
    : [
        { to: "/profile", label: "Profile", icon: UserIcon },
        { to: "/orders", label: "Orders", icon: Package },
        { to: "/settings", label: "Settings", icon: Settings },
      ];

  return (
    <header className="sticky top-0 z-50 border-b border-[#E8DCD0] bg-[#FFFCF7]/95 backdrop-blur-xl dark:border-[#382823] dark:bg-[#140E0C]/90">
      {/* Top micro-announcement bar */}
      <div className="border-b border-[#E8DCD0]/20 bg-[#3B2924] px-4 py-1.5 text-[11px] font-medium text-[#FFF4E8] dark:bg-[#0E0908] dark:border-[#382823]">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="flex size-2 rounded-full bg-[#7A8B68] animate-pulse dark:bg-[#9BAF83]" />
            <span className="font-semibold text-white">Knottiingale Studio</span>
            <span className="hidden sm:inline text-[#C7B8AE] dark:text-[#B3A198]">· Handcrafted by Shikha Rai</span>
          </div>
          <p className="flex items-center gap-1.5 text-[#F5EDE4]">
            <Sparkles className="size-3 text-[#D8A85B] dark:text-[#E0B86A]" />
            <span>Free Shipping across India on orders &gt; ₹500 · COD Available</span>
          </p>
          <a
            href="https://wa.me/917985835558"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden lg:inline-flex items-center gap-1 font-semibold text-[#D8A85B] transition-colors hover:text-[#FFF4E8] dark:text-[#E0B86A]"
          >
            Custom Orders: WhatsApp +91 7985835558 →
          </a>
        </div>
      </div>

      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="rounded-lg p-2 text-[#806E66] hover:bg-[#F5EDE4] lg:hidden dark:text-[#B3A198] dark:hover:bg-[#251B18]"
            onClick={() => setMobileOpen((open) => !open)}
            aria-label="Toggle navigation menu"
          >
            {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
          <Logo />
        </div>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Main navigation">
          <NavLink to="/" className={navLinkClass} end>
            Home
          </NavLink>
          <NavLink to="/products" className={navLinkClass}>
            Products
          </NavLink>
          <NavLink to="/categories" className={navLinkClass}>
            Categories
          </NavLink>
          <NavLink to="/contact" className={navLinkClass}>
            Contact
          </NavLink>
          {isAdmin && (
            <NavLink to="/admin" className={navLinkClass}>
              Admin
            </NavLink>
          )}
        </nav>

        <div className="flex items-center gap-1">
          {searchOpen && (
            <form onSubmit={handleSearch} className="relative mr-1 hidden sm:block">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[#806E66] dark:text-[#B3A198]" />
              <input
                autoFocus
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search handmade treasures…"
                className="h-9.5 w-60 rounded-full border border-[#E8DCD0] bg-[#F5EDE4]/70 pl-9.5 pr-4 text-sm text-[#3B2924] shadow-inner transition-all focus:w-72 focus:border-[#B85C4A] focus:bg-[#FFFCF7] focus:outline-none focus:ring-4 focus:ring-[#B85C4A]/10 dark:border-[#382823] dark:bg-[#1E1614] dark:text-[#FFF4E8] dark:focus:border-[#D47763]"
              />
            </form>
          )}

          <button
            type="button"
            onClick={() => setSearchOpen((open) => !open)}
            className="rounded-xl p-2.5 text-[#806E66] transition hover:bg-[#F5EDE4] hover:text-[#3B2924] sm:hidden dark:text-[#B3A198] dark:hover:bg-[#251B18] dark:hover:text-[#FFF4E8]"
            aria-label="Open search"
          >
            <Search className="size-5" />
          </button>

          <button
            type="button"
            onClick={toggleTheme}
            className="rounded-xl p-2.5 text-[#806E66] transition hover:bg-[#F5EDE4] hover:text-[#3B2924] dark:text-[#B3A198] dark:hover:bg-[#251B18] dark:hover:text-[#FFF4E8]"
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          >
            {theme === "dark" ? <Sun className="size-5 text-[#E0B86A]" /> : <Moon className="size-5 text-[#B85C4A]" />}
          </button>

          <Link
            to={isAuthenticated ? "/wishlist" : "/login"}
            className="relative rounded-xl p-2.5 text-[#806E66] transition hover:bg-[#F5EDE4] hover:text-[#3B2924] dark:text-[#B3A198] dark:hover:bg-[#251B18] dark:hover:text-[#FFF4E8]"
            aria-label="Wishlist"
          >
            <Heart className="size-5" />
            {isAuthenticated && (wishlist?.length ?? 0) > 0 && (
              <span className="absolute right-1 top-1 flex size-4.5 items-center justify-center rounded-full bg-[#C98F8B] text-[10px] font-bold text-white shadow-sm ring-2 ring-[#FFFCF7] dark:bg-[#D47763] dark:text-white dark:ring-[#140E0C]">
                {wishlist?.length}
              </span>
            )}
          </Link>

          <Link
            to={isAuthenticated ? "/cart" : "/login"}
            className="relative rounded-xl p-2.5 text-[#806E66] transition hover:bg-[#F5EDE4] hover:text-[#3B2924] dark:text-[#B3A198] dark:hover:bg-[#251B18] dark:hover:text-[#FFF4E8]"
            aria-label="Cart"
          >
            <ShoppingBag className="size-5" />
            {isAuthenticated && cartCount > 0 && (
              <span className="absolute right-1 top-1 flex size-4.5 items-center justify-center rounded-full bg-[#B85C4A] text-[10px] font-bold text-white shadow-sm ring-2 ring-[#FFFCF7] dark:bg-[#D47763] dark:text-white dark:ring-[#140E0C]">
                {cartCount}
              </span>
            )}
          </Link>

          {isAuthenticated ? (
            <div className="relative" ref={userMenuRef}>
              <button
                type="button"
                onClick={() => setUserMenuOpen((open) => !open)}
                className="ml-1 flex size-9 items-center justify-center rounded-full bg-[#B85C4A] text-sm font-bold text-white shadow-soft transition hover:shadow-lift dark:bg-gradient-to-r dark:from-[#D47763] dark:to-[#B85C4A]"
                aria-label="Open user menu"
              >
                {initials(user?.name ?? "U")}
              </button>

              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.98 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-12 w-60 overflow-hidden rounded-2xl border border-[#E8DCD0] bg-[#FFFCF7] shadow-xl dark:border-[#382823] dark:bg-[#1E1614]/95 dark:backdrop-blur-xl dark:shadow-[0_12px_40px_rgba(0,0,0,0.5)]"
                  >
                    <div className="border-b border-[#E8DCD0] px-4 py-3 dark:border-[#382823]">
                      <p className="text-sm font-semibold text-[#3B2924] dark:text-[#FFF4E8]">
                        {user?.name}
                      </p>
                      <p className="truncate text-xs text-[#806E66] dark:text-[#B3A198]">
                        {user?.email}
                      </p>
                    </div>
                    <div className="p-1.5">
                      {userLinks.map((link) => (
                        <Link
                          key={link.to}
                          to={link.to}
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-[#3B2924] transition hover:bg-[#F5EDE4] dark:text-[#FFF4E8] dark:hover:bg-[#251B18]"
                        >
                          <link.icon className="size-4 text-[#806E66] dark:text-[#B3A198]" />
                          {link.label}
                        </Link>
                      ))}
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-[#914536] transition hover:bg-[#B85C4A]/10 dark:text-[#E28A76] dark:hover:bg-[#D47763]/10"
                      >
                        <LogOut className="size-4" />
                        Log out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="ml-1 hidden items-center gap-2 sm:flex">
              <Link
                to="/login"
                className="rounded-xl px-3.5 py-2 text-sm font-medium text-[#3B2924] transition hover:text-[#B85C4A] hover:bg-[#F5EDE4]/60 dark:text-[#FFF4E8] dark:hover:text-[#D47763] dark:hover:bg-[#251B18]/60"
              >
                Log in
              </Link>
              <Link
                to="/register"
                className="rounded-xl bg-[#B85C4A] px-4.5 py-2 text-sm font-semibold text-white shadow-soft transition hover:bg-[#914536] hover:shadow-lift dark:bg-gradient-to-r dark:from-[#D47763] dark:to-[#B85C4A] dark:text-white"
              >
                Sign up
              </Link>
            </div>
          )}
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-[#E8DCD0] px-4 py-3 lg:hidden dark:border-[#382823] bg-[#FFFCF7] dark:bg-[#140E0C]">
          <form onSubmit={handleSearch} className="relative mb-3">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#806E66] dark:text-[#B3A198]" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search products…"
              className="h-10 w-full rounded-xl border border-[#E8DCD0] bg-[#FFFCF7] pl-9 pr-3 text-sm text-[#3B2924] shadow-sm focus:border-[#B85C4A] focus:outline-none focus:ring-2 focus:ring-[#B85C4A]/20 dark:border-[#382823] dark:bg-[#1E1614] dark:text-[#FFF4E8]"
            />
          </form>
          <nav className="flex flex-col gap-1" aria-label="Mobile navigation">
            <Link to="/" onClick={() => setMobileOpen(false)} className={cn(navLinkClass({ isActive: false }), "text-base")}>
              Home
            </Link>
            <Link to="/products" onClick={() => setMobileOpen(false)} className={cn(navLinkClass({ isActive: false }), "text-base")}>
              Products
            </Link>
            <Link to="/categories" onClick={() => setMobileOpen(false)} className={cn(navLinkClass({ isActive: false }), "text-base")}>
              Categories
            </Link>
            <Link to="/contact" onClick={() => setMobileOpen(false)} className={cn(navLinkClass({ isActive: false }), "text-base")}>
              Contact & Custom Orders
            </Link>
            {isAdmin && (
              <Link to="/admin" onClick={() => setMobileOpen(false)} className={cn(navLinkClass({ isActive: false }), "text-base")}>
                Admin Dashboard
              </Link>
            )}
            {!isAuthenticated && (
              <div className="mt-2 flex gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="flex-1 rounded-xl border border-[#E8DCD0] px-4 py-2 text-center text-sm font-medium text-[#3B2924] dark:border-[#382823] dark:text-[#FFF4E8]"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileOpen(false)}
                  className="flex-1 rounded-xl bg-[#B85C4A] px-4 py-2 text-center text-sm font-semibold text-white dark:bg-gradient-to-r dark:from-[#D47763] dark:to-[#B85C4A] dark:text-white"
                >
                  Sign up
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};
