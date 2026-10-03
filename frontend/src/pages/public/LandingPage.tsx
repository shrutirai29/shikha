import { useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import { usePageTitle } from "@/hooks/usePageTitle";
import {
  ArrowRight,
  BadgeCheck,
  ChevronLeft,
  ChevronRight,
  Flame,
  Heart,
  MessageCircle,
  PlusCircle,
  RefreshCcw,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  Tag,
  Truck,
} from "lucide-react";
import { motion } from "framer-motion";
import { useFeaturedProducts, useAddToCart, useCategories } from "@/hooks/useApi";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { ProductGrid } from "@/components/product/ProductGrid";
import { Skeleton } from "@/components/ui/Card";
import type { Category, Product } from "@/types";
import { formatCurrency } from "@/lib/utils";
import heroBackdrop from "@/assets/hero-backdrop.jpg";

// Category style & icon palettes for dynamically mapped categories
const CATEGORY_STYLES = [
  { bg: "bg-[#C98F8B]/15 text-[#B85C4A] dark:bg-[#D8A09B]/20 dark:text-[#D47763]", icon: "✨" },
  { bg: "bg-[#D8A85B]/20 text-[#D8A85B] dark:bg-[#E0B86A]/20 dark:text-[#E0B86A]", icon: "🌸" },
  { bg: "bg-[#B85C4A]/15 text-[#B85C4A] dark:bg-[#D47763]/20 dark:text-[#D47763]", icon: "🐰" },
  { bg: "bg-[#7A8B68]/15 text-[#7A8B68] dark:bg-[#9BAF83]/20 dark:text-[#9BAF83]", icon: "👜" },
  { bg: "bg-[#9B7A68]/15 text-[#9B7A68] dark:bg-[#BFA597]/20 dark:text-[#BFA597]", icon: "💐" },
  { bg: "bg-[#7A8B68]/15 text-[#7A8B68] dark:bg-[#9BAF83]/20 dark:text-[#9BAF83]", icon: "🏡" },
  { bg: "bg-[#C98F8B]/15 text-[#B85C4A] dark:bg-[#D8A09B]/20 dark:text-[#D47763]", icon: "🧣" },
  { bg: "bg-[#D8A85B]/20 text-[#D8A85B] dark:bg-[#E0B86A]/20 dark:text-[#E0B86A]", icon: "🎧" },
];

const perks = [
  {
    icon: Truck,
    title: "Free Express Shipping",
    description: "On all prepaid & COD orders over ₹500 across India",
  },
  {
    icon: ShieldCheck,
    title: "Secure Checkout",
    description: "Razorpay-encrypted payments & Cash on Delivery",
  },
  {
    icon: RefreshCcw,
    title: "7-Day Easy Returns",
    description: "Guaranteed satisfaction with hassle-free returns",
  },
  {
    icon: BadgeCheck,
    title: "Pure Artisan Craft",
    description: "Crafted slowly, stitch by stitch by Shikha Rai",
  },
];

export const LandingPage = () => {
  usePageTitle("Handmade Crochet Treasures");
  const { data: featured, isLoading: productsLoading } = useFeaturedProducts(24);
  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const { isAdmin } = useAuth();
  const heroProduct = featured?.[0];
  const addToCart = useAddToCart();
  const toast = useToast();

  const trendingRailRef = useRef<HTMLDivElement>(null);
  const budgetRailRef = useRef<HTMLDivElement>(null);

  // Derived real product rails
  const trendingProducts = useMemo(() => {
    return (featured ?? []).filter((p) => p.isFeatured || p.stock > 0).slice(0, 10);
  }, [featured]);

  const budgetProducts = useMemo(() => {
    return (featured ?? []).filter((p) => (p.discountPrice || p.price) <= 499).slice(0, 10);
  }, [featured]);

  const scrollRail = (ref: React.RefObject<HTMLDivElement | null>, direction: "left" | "right") => {
    if (ref.current) {
      const scrollAmount = direction === "left" ? -340 : 340;
      ref.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  const handleQuickAdd = async (product: { _id: string; name: string }) => {
    try {
      await addToCart.mutateAsync({ productId: product._id, quantity: 1 });
      toast.success(`${product.name} added to cart!`);
    } catch {
      toast.info(`Please click to view ${product.name}`);
    }
  };

  // Group the featured picks by their category
  const categoryGroups = useMemo(() => {
    const map = new Map<string, { category: Category; products: Product[] }>();

    for (const product of featured ?? []) {
      const category =
        typeof product.category === "string" ? null : product.category;

      if (!category) continue;

      const entry = map.get(category._id) ?? { category, products: [] };
      entry.products.push(product);
      map.set(category._id, entry);
    }

    return Array.from(map.values());
  }, [featured]);

  const showGrouped = categoryGroups.length > 0;

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* ============================================================
          STICKY FULL-PAGE ARTISANAL BACKDROP
          Fixed across the entire scroll - no bottom fade, stays constant throughout
          ============================================================ */}
      <div className="pointer-events-none fixed inset-0 z-0 select-none overflow-hidden">
        <img
          src={heroBackdrop}
          alt="Handmade crochet flowers, bunny and natural yarn flatlay"
          fetchPriority="high"
          decoding="async"
          className="size-full object-cover object-[78%_center] sm:object-[70%_center] lg:object-center opacity-100 dark:opacity-35 transition-opacity duration-500"
        />

        {/* Subtle, soft ambient layer allowing the full artisanal flatlay to shine through constant across the entire scroll, while faded-glass divs handle contrast */}
        <div className="absolute inset-0 bg-[#FFF8F0]/15 dark:bg-[#140E0C]/65" />
      </div>

      <div className="relative z-10">
      {/* ============================================================
          TOP E-COMMERCE CATEGORY RAIL (Dynamic)
          ============================================================ */}
      <nav aria-label="Quick Categories" className="border-b border-white/20 bg-gradient-to-b from-[#261A16]/85 to-[#18100E]/85 backdrop-blur-2xl shadow-md w-full max-w-full overflow-hidden">
        <div className="mx-auto flex max-w-7xl items-center justify-start xl:justify-between gap-2.5 sm:gap-3 overflow-x-auto px-3 py-3 sm:px-6 scrollbar-none touch-pan-x [-webkit-overflow-scrolling:touch]">
          {categoriesLoading ? (
            <div className="flex gap-3 py-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex flex-col items-center gap-1.5 shrink-0 px-2">
                  <Skeleton className="size-12 sm:size-14 rounded-2xl" />
                  <Skeleton className="h-3 w-14" />
                </div>
              ))}
            </div>
          ) : categories && categories.length > 0 ? (
            <>
              {categories.map((cat, idx) => {
                const style = CATEGORY_STYLES[idx % CATEGORY_STYLES.length];
                return (
                  <Link
                    key={cat._id}
                    to={`/products?category=${cat.slug}`}
                    className="group flex flex-col items-center gap-1.5 shrink-0 px-2 py-1 rounded-2xl transition hover:-translate-y-0.5"
                  >
                    <div className="relative">
                      {cat.image ? (
                        <img
                          src={cat.image}
                          alt={cat.name}
                          className="size-12 sm:size-14 rounded-2xl object-cover shadow-xs border border-white/20 transition group-hover:scale-108 group-hover:shadow-md"
                        />
                      ) : (
                        <span
                          className={`flex size-12 sm:size-14 items-center justify-center rounded-2xl text-2xl sm:text-3xl shadow-xs border border-white/20 transition group-hover:scale-108 group-hover:shadow-md ${style.bg}`}
                        >
                          {style.icon}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] sm:text-xs font-semibold text-white/90 transition group-hover:text-[#FFC77D] whitespace-nowrap">
                      {cat.name}
                    </span>
                  </Link>
                );
              })}
              <Link
                to="/products"
                className="group flex flex-col items-center gap-1.5 shrink-0 px-2 py-1 rounded-2xl transition hover:-translate-y-0.5"
              >
                <span className="flex size-12 sm:size-14 items-center justify-center rounded-2xl text-2xl sm:text-3xl shadow-xs transition group-hover:scale-108 group-hover:shadow-md bg-white/15 border border-white/20 text-white">
                  ✨
                </span>
                <span className="text-[11px] sm:text-xs font-semibold text-white/90 transition group-hover:text-[#FFC77D] whitespace-nowrap">
                  All Products
                </span>
              </Link>
            </>
          ) : isAdmin ? (
            <div className="flex w-full items-center justify-between py-1 text-xs text-white/80">
              <span className="font-medium">
                Store catalog is clean & ready for your creations!
              </span>
              <Link
                to="/admin/categories"
                className="inline-flex items-center gap-1 rounded-lg bg-[#B85C4A] px-3 py-1 text-xs font-bold text-white shadow-xs transition hover:bg-[#914536]"
              >
                <PlusCircle className="size-3.5" />
                Add Categories
              </Link>
            </div>
          ) : (
            <div className="flex w-full items-center justify-center gap-4 py-1 text-xs font-semibold text-white/80">
              <Link to="/products" className="hover:text-[#FFC77D] transition">
                ✨ Browse All Creations
              </Link>
              <span>•</span>
              <Link to="/contact" className="hover:text-[#FFC77D] transition">
                💌 Custom Crochet Orders
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* ============================================================
          PROMOTIONAL OFFER STRIP
          ============================================================ */}
      <div className="bg-gradient-to-r from-[#B85C4A]/95 via-[#8F3E30]/95 to-[#B85C4A]/95 backdrop-blur-md border-b border-white/10 px-3 sm:px-4 py-1.5 sm:py-2 text-center text-[11px] sm:text-xs font-semibold tracking-wide text-white shadow-xs">
        <span className="inline-flex flex-wrap items-center justify-center gap-x-2 gap-y-0.5">
          <span>🎟️ <strong>FLAT 10% OFF</strong> on your 1st order with code <span className="underline decoration-white/60 font-mono font-bold tracking-wider">KNOTTY10</span></span>
          <span className="hidden sm:inline">•</span>
          <span className="hidden sm:inline">📦 Free Express Shipping Over ₹500 across India</span>
        </span>
      </div>

      {/* ============================================================
          1. HERO SECTION (Artisanal Photography Backdrop & Editorial Layout)
          ============================================================ */}
      <section className="relative min-h-[540px] sm:min-h-[640px] lg:min-h-[700px] overflow-hidden bg-transparent">
        {/* Hero Content Container */}
        <div className="relative mx-auto grid max-w-7xl items-center gap-8 sm:gap-10 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-12 lg:gap-6 xl:gap-8 lg:py-24 overflow-hidden w-full max-w-full">
          {/* Left Column: Brand Story & Call-to-actions in Liquid Smoked Glass Card */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="min-w-0 lg:col-span-7 xl:col-span-7 max-w-2xl rounded-[32px] faded-glass p-7 sm:p-9 lg:p-10"
          >
            {/* Pill: Hand-Stitched by Shikha Rai */}
            <div className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/12 px-3.5 sm:px-4 py-1.5 text-[11px] sm:text-xs font-bold text-white shadow-xs backdrop-blur-md">
              <span className="relative flex size-2 shrink-0">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-[#E28A76] opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-[#E28A76]" />
              </span>
              <span>Pure Artisan Craft · Hand-Stitched by Shikha Rai</span>
            </div>

            {/* Display Headline */}
            <h1 className="font-display mt-4 sm:mt-5 text-3xl sm:text-4xl md:text-5xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-bold leading-[1.15] sm:leading-[1.1] tracking-tight text-white">
              Handmade with love,{" "}
              <span className="block font-medium italic text-[#FFC77D]">
                one stitch at a time.
              </span>
            </h1>

            {/* Narrative description */}
            <p className="mt-4 sm:mt-5 max-w-xl text-sm sm:text-lg leading-relaxed text-white/85 font-normal">
              Welcome to <strong className="font-bold text-white">Knottiingale</strong>. Soft plush toys, cozy
              home décor, torans, bags, and heartfelt handcrafted gifts — carefully crocheted with natural cotton yarn
              by <strong className="font-bold text-white">Shikha Rai</strong> and delivered across India.
            </p>

            {/* Action buttons */}
            <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <Link
                to="/products"
                className="group relative inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-[#B85C4A] hover:bg-[#D47763] px-7 text-sm font-bold text-white shadow-lift transition active:scale-98"
              >
                Explore Collection
                <ArrowRight className="size-4.5 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                to="/contact"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-white/30 bg-white/12 hover:bg-white/22 px-6 text-sm font-bold text-white shadow-xs backdrop-blur-md transition active:scale-98"
              >
                Custom Order Inquiry
              </Link>
            </div>

            {/* Craft Highlights */}
            <div className="mt-8 sm:mt-10 flex flex-wrap items-center gap-2.5 sm:gap-4 border-t border-white/20 pt-5 sm:pt-6 text-xs font-semibold text-white">
              <span className="flex items-center gap-1.5 sm:gap-2 rounded-full bg-white/12 px-3.5 py-1.5 shadow-xs border border-white/20 backdrop-blur-md">
                <span className="flex size-5 sm:size-6 items-center justify-center rounded-full bg-white/20 text-[#A7BA90]">✓</span>
                100% Handcrafted
              </span>
              <span className="flex items-center gap-1.5 sm:gap-2 rounded-full bg-white/12 px-3.5 py-1.5 shadow-xs border border-white/20 backdrop-blur-md">
                <span className="flex size-5 sm:size-6 items-center justify-center rounded-full bg-white/20 text-[#FFD166]">
                  <Star className="size-3 sm:size-3.5 fill-current" />
                </span>
                5.0 Rated by Buyers
              </span>
              <span className="flex items-center gap-1.5 sm:gap-2 rounded-full bg-white/12 px-3.5 py-1.5 shadow-xs border border-white/20 backdrop-blur-md">
                <span className="flex size-5 sm:size-6 items-center justify-center rounded-full bg-white/20 text-[#FFC77D]">⚡</span>
                Fast Pan-India Dispatch
              </span>
            </div>
          </motion.div>


          {/* Right Column: Floating Boutique Spotlight Card in Liquid Smoked Glass */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="min-w-0 lg:col-span-5 xl:col-span-5 flex flex-col justify-end lg:items-end w-full"
          >
            <div className="w-full max-w-[340px] sm:max-w-sm rounded-[28px] faded-glass p-5 sm:p-6">
              <div className="flex items-center justify-between border-b border-white/20 pb-3">
                <div className="flex items-center gap-2">
                  <span className="flex size-7 items-center justify-center rounded-lg bg-white/15 text-[#FFC77D]">
                    <Sparkles className="size-4" />
                  </span>
                  <div>
                    <p className="text-xs font-bold text-white">
                      Artisan Spotlight
                    </p>
                    <p className="text-[10px] text-white/70">
                      Limited batch pieces
                    </p>
                  </div>
                </div>
                <span className="rounded-full bg-white/20 border border-white/25 px-2.5 py-0.5 text-[11px] font-bold text-white">
                  {heroProduct ? "In Stock" : "Handcrafted"}
                </span>
              </div>

              {heroProduct ? (
                <div className="mt-4 flex items-center gap-3.5">
                  <div className="size-16 shrink-0 overflow-hidden rounded-2xl bg-white/15 ring-1 ring-white/20">
                    {heroProduct.images?.[0] ? (
                      <img
                        src={heroProduct.images[0]}
                        alt={heroProduct.name}
                        loading="lazy"
                        decoding="async"
                        className="size-full object-cover"
                      />
                    ) : (
                      <div className="flex size-full items-center justify-center text-2xl">🧶</div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-white">
                      {heroProduct.name}
                    </p>
                    <p className="text-xs font-bold text-[#FFC77D]">
                      {formatCurrency(heroProduct.discountPrice || heroProduct.price)}
                    </p>
                    <p className="mt-0.5 text-[11px] text-white/70 line-clamp-1">
                      Made slowly with 100% cotton
                    </p>
                  </div>
                  <Link
                    to={`/products/${heroProduct.slug}`}
                    className="shrink-0 rounded-xl bg-white/20 hover:bg-white/30 border border-white/25 p-2 text-white shadow-soft transition"
                    aria-label={`View ${heroProduct.name}`}
                  >
                    <ArrowRight className="size-4" />
                  </Link>
                </div>
              ) : (
                <div className="mt-4 flex items-center gap-3">
                  <span className="text-3xl">🧶</span>
                  <div>
                    <p className="text-sm font-bold text-white">
                      Artisan Workshop
                    </p>
                    <p className="text-xs text-white/70">
                      Handmade crochet creations crafted to order
                    </p>
                  </div>
                </div>
              )}

              {/* Quick Explore chips */}
              <div className="mt-4 border-t border-white/20 pt-3">
                <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-white/70">
                  Quick Explore
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {categories && categories.length > 0 ? (
                    categories.slice(0, 4).map((c) => (
                      <Link
                        key={c._id}
                        to={`/categories/${c.slug}`}
                        className="rounded-xl bg-white/12 hover:bg-white/25 border border-white/20 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-md transition"
                      >
                        {c.name}
                      </Link>
                    ))
                  ) : (
                    <>
                      <Link
                        to="/products"
                        className="rounded-xl bg-white/12 hover:bg-white/25 border border-white/20 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-md transition"
                      >
                        ✨ All Products
                      </Link>
                      <Link
                        to="/contact"
                        className="rounded-xl bg-white/12 hover:bg-white/25 border border-white/20 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-md transition"
                      >
                        💌 Custom Orders
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ============================================================
          DYNAMIC SPECIALTIES GRID: "Explore What We Make" (Shown when categories exist)
          ============================================================ */}
      {(categoriesLoading || (categories && categories.length > 0)) && (
        <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.2em] text-[#B85C4A] dark:text-[#D47763]">
                <Sparkles className="size-3.5" />
                Handmade Specialties
              </div>
              <h2 className="font-display mt-1 text-2xl font-semibold tracking-tight text-[#3B2924] sm:text-3xl dark:text-[#FFF4E8]">
                Explore What We Make
              </h2>
              <p className="mt-1 text-xs text-[#806E66] sm:text-sm dark:text-[#C7B8AE]">
                Tap any category to explore authentic crochet pieces hand-stitched by Shikha Rai
              </p>
            </div>
            <Link
              to="/categories"
              className="group inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-[#B85C4A] transition hover:text-[#914536] dark:text-[#D47763] dark:hover:text-[#E28A76]"
            >
              <span>See All Collections</span>
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          {categoriesLoading ? (
            <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-6 sm:gap-4">
              {Array.from({ length: 6 }).map((_, idx) => (
                <Skeleton key={idx} className="aspect-[4/3] rounded-2xl" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-6 sm:gap-4">
              {categories!.map((cat, idx) => (
                <motion.div
                  key={cat._id}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: idx * 0.05 }}
                >
                  <Link
                    to={`/categories/${cat.slug}`}
                    className="group flex h-full flex-col overflow-hidden rounded-[26px] faded-glass faded-glass-interactive p-3.5"
                  >
                    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[18px] bg-black/20 ring-1 ring-white/15">
                      {cat.image ? (
                        <img
                          src={cat.image}
                          alt={cat.name}
                          className="size-full object-cover transition-transform duration-500 group-hover:scale-108"
                          loading="lazy"
                          decoding="async"
                        />
                      ) : (
                        <div className="flex size-full items-center justify-center bg-white/10 text-3xl font-bold text-[#FFC77D]">
                          {cat.name.slice(0, 1)}
                        </div>
                      )}
                    </div>

                    <div className="mt-3 flex flex-1 flex-col justify-between">
                      <div>
                        <h3 className="text-sm font-bold text-white transition group-hover:text-[#FFC77D] line-clamp-1">
                          {cat.name}
                        </h3>
                        {cat.description && (
                          <p className="mt-0.5 text-[11px] leading-snug text-white/75 line-clamp-2">
                            {cat.description}
                          </p>
                        )}
                      </div>
                      <div className="mt-3 flex items-center justify-between border-t border-white/20 pt-2.5">
                        <span className="text-xs font-bold text-[#FFC77D]">
                          Explore
                        </span>
                        <span className="flex size-6 items-center justify-center rounded-full bg-white/20 text-white transition group-hover:bg-[#FFC77D] group-hover:text-[#1F1816]">
                          <ArrowRight className="size-3.5" />
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </section>
      )}


      {/* ============================================================
          HORIZONTAL RAIL 1: TRENDING BESTSELLERS (Dynamic - only shown when products exist)
          ============================================================ */}
      {trendingProducts.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 overflow-hidden w-full max-w-full">
          <div className="rounded-[32px] faded-glass p-5 sm:p-7">
            {/* Header with Title and Scroll Controls */}
            <div className="mb-5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-[#FFC77D]">
                  <Flame className="size-5" />
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-white">
                      Trending Right Now
                    </h2>
                    <span className="hidden sm:inline-block rounded-full bg-white/20 border border-white/25 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                      Top Sellers
                    </span>
                  </div>
                  <p className="text-xs text-white/75">
                    Most loved pieces crocheted this week
                  </p>
                </div>
              </div>

              {/* Carousel Navigation */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => scrollRail(trendingRailRef, "left")}
                  aria-label="Scroll left"
                  className="flex size-9 items-center justify-center rounded-xl border border-white/25 bg-white/15 text-white shadow-xs backdrop-blur-md transition hover:bg-white/25 active:scale-95"
                >
                  <ChevronLeft className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={() => scrollRail(trendingRailRef, "right")}
                  aria-label="Scroll right"
                  className="flex size-9 items-center justify-center rounded-xl border border-white/25 bg-white/15 text-white shadow-xs backdrop-blur-md transition hover:bg-white/25 active:scale-95"
                >
                  <ChevronRight className="size-4" />
                </button>
              </div>
            </div>

            {/* Horizontal Snap Scroll Track */}
            <div
              ref={trendingRailRef}
              className="flex gap-3 sm:gap-4 overflow-x-auto pb-2 scrollbar-none snap-x snap-mandatory touch-pan-x [-webkit-overflow-scrolling:touch]"
            >
              {trendingProducts.map((item) => {
                const discountPrice = item.discountPrice;
                const originalPrice = discountPrice ? item.price : undefined;
                const currentPrice = discountPrice || item.price;
                const discountPercent = originalPrice
                  ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
                  : 0;

                const categoryName =
                  typeof item.category === "string"
                    ? "Crochet"
                    : item.category?.name || "Handmade";

                return (
                  <div
                    key={item._id}
                    className="group relative flex w-[195px] sm:w-[260px] shrink-0 snap-start flex-col justify-between overflow-hidden rounded-[22px] faded-glass-subtle faded-glass-interactive p-3.5"
                  >
                    <Link to={`/products/${item.slug}`} className="block">
                      <div className="relative aspect-square w-full overflow-hidden rounded-[16px] bg-black/20 ring-1 ring-white/15">
                        {item.images?.[0] ? (
                          <img
                            src={item.images[0]}
                            alt={item.name}
                            className="size-full object-cover transition-transform duration-500 group-hover:scale-108"
                            loading="lazy"
                            decoding="async"
                          />
                        ) : (
                          <div className="flex size-full items-center justify-center text-4xl">🧶</div>
                        )}
                        {item.isFeatured && (
                          <span className="absolute top-2 left-2 rounded-full bg-[#B85C4A] px-2 py-0.5 text-[10px] font-bold text-white shadow-xs">
                            Featured
                          </span>
                        )}
                        {discountPercent > 0 && (
                          <span className="absolute bottom-2 right-2 rounded-full bg-black/70 px-1.5 py-0.5 text-[10px] font-bold text-white backdrop-blur-xs">
                            {discountPercent}% OFF
                          </span>
                        )}
                      </div>

                      <div className="mt-3">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-white/70">
                          {categoryName}
                        </span>
                        <h3 className="mt-0.5 text-xs sm:text-sm font-bold text-white transition group-hover:text-[#FFC77D] line-clamp-1">
                          {item.name}
                        </h3>

                        <div className="mt-1 flex items-center gap-1.5 text-[11px] text-white/75">
                          <span className="inline-flex items-center gap-0.5 rounded-sm bg-white/20 px-1 py-0.2 font-semibold text-[#FFD166]">
                            <Star className="size-3 fill-current text-[#FFD166]" />
                            {item.averageRating > 0 ? item.averageRating.toFixed(1) : "5.0"}
                          </span>
                          <span>({item.totalReviews || 0})</span>
                        </div>

                        <div className="mt-2 flex items-baseline gap-2">
                          <span className="text-sm sm:text-base font-bold text-[#FFC77D]">
                            {formatCurrency(currentPrice)}
                          </span>
                          {originalPrice && (
                            <span className="text-xs text-white/50 line-through">
                              {formatCurrency(originalPrice)}
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>

                    <div className="mt-3 pt-2 border-t border-white/20">
                      <button
                        type="button"
                        onClick={() => handleQuickAdd(item)}
                        className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-white/25 bg-white/15 text-white backdrop-blur-md py-2 text-xs font-bold transition hover:bg-[#B85C4A] hover:border-[#B85C4A] active:scale-98"
                      >
                        <ShoppingBag className="size-3.5" />
                        Add to Bag
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ============================================================
          HORIZONTAL RAIL 2: POCKET-FRIENDLY UNDER ₹499 (Dynamic - only shown when products exist)
          ============================================================ */}
      {budgetProducts.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-4 sm:px-6 sm:py-6 overflow-hidden w-full max-w-full">
          <div className="rounded-[32px] faded-glass p-5 sm:p-7">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-[#A7BA90]">
                  <Tag className="size-5" />
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-white">
                      Pocket-Friendly Treats • Under ₹499
                    </h2>
                    <span className="rounded-full bg-white/20 border border-white/25 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                      Budget Gifting
                    </span>
                  </div>
                  <p className="text-xs text-white/75">
                    Everyday crochet pieces, keychains, coasters & accessories
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => scrollRail(budgetRailRef, "left")}
                  aria-label="Scroll left"
                  className="flex size-9 items-center justify-center rounded-xl border border-white/25 bg-white/15 text-white shadow-xs backdrop-blur-md transition hover:bg-white/25 active:scale-95"
                >
                  <ChevronLeft className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={() => scrollRail(budgetRailRef, "right")}
                  aria-label="Scroll right"
                  className="flex size-9 items-center justify-center rounded-xl border border-white/25 bg-white/15 text-white shadow-xs backdrop-blur-md transition hover:bg-white/25 active:scale-95"
                >
                  <ChevronRight className="size-4" />
                </button>
              </div>
            </div>

            <div
              ref={budgetRailRef}
              className="flex gap-3 sm:gap-4 overflow-x-auto pb-2 scrollbar-none snap-x snap-mandatory touch-pan-x [-webkit-overflow-scrolling:touch]"
            >
              {budgetProducts.map((item) => {
                const discountPrice = item.discountPrice;
                const originalPrice = discountPrice ? item.price : undefined;
                const currentPrice = discountPrice || item.price;

                return (
                  <div
                    key={item._id}
                    className="group relative flex w-[175px] sm:w-[210px] shrink-0 snap-start flex-col justify-between overflow-hidden rounded-[22px] faded-glass-subtle faded-glass-interactive p-3.5"
                  >
                    <Link to={`/products/${item.slug}`} className="block">
                      <div className="relative aspect-square w-full overflow-hidden rounded-[16px] bg-black/20 ring-1 ring-white/15">
                        {item.images?.[0] ? (
                          <img
                            src={item.images[0]}
                            alt={item.name}
                            className="size-full object-cover transition-transform duration-500 group-hover:scale-108"
                            loading="lazy"
                            decoding="async"
                          />
                        ) : (
                          <div className="flex size-full items-center justify-center text-3xl">🧶</div>
                        )}
                        <span className="absolute top-2 left-2 rounded-full bg-[#7A8B68] px-2 py-0.5 text-[9px] font-bold text-white shadow-xs">
                          UNDER ₹499
                        </span>
                      </div>

                      <div className="mt-2.5">
                        <h3 className="text-xs font-bold text-white transition group-hover:text-[#A7BA90] line-clamp-1">
                          {item.name}
                        </h3>
                        <div className="mt-1 flex items-baseline gap-1.5">
                          <span className="text-sm font-bold text-[#FFC77D]">
                            {formatCurrency(currentPrice)}
                          </span>
                          {originalPrice && (
                            <span className="text-[11px] text-white/50 line-through">
                              {formatCurrency(originalPrice)}
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>

                    <div className="mt-2.5 pt-2 border-t border-white/20">
                      <button
                        type="button"
                        onClick={() => handleQuickAdd(item)}
                        className="flex w-full items-center justify-center gap-1 rounded-lg border border-white/25 bg-white/15 text-white backdrop-blur-md py-1.5 text-[11px] font-bold transition hover:bg-[#7A8B68] hover:border-[#7A8B68] active:scale-98"
                      >
                        <ShoppingBag className="size-3" />
                        Quick Add
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ============================================================
          2. TRUST & PERKS STRIP
          ============================================================ */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {perks.map((perk, index) => (
            <motion.div
              key={perk.title}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              className="flex items-start gap-4 rounded-[24px] faded-glass faded-glass-interactive p-5 sm:p-6"
            >
              <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-white/15 border border-white/25 text-[#FFC77D] backdrop-blur-xs shadow-xs">
                <perk.icon className="size-5" />
              </span>
              <div>
                <h3 className="text-sm font-bold text-white">
                  {perk.title}
                </h3>
                <p className="mt-0.5 text-xs leading-relaxed text-white/75">
                  {perk.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ============================================================
          3. FEATURED PRODUCTS BY CATEGORY / MAIN CATALOG
          ============================================================ */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-16">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-12 text-center"
        >
          <p className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-black/25 backdrop-blur-md px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] text-[#FFC77D] shadow-xs">
            <Sparkles className="size-3.5 text-[#FFC77D]" />
            Curated Artisan Picks
          </p>
          <h2 className="font-display mt-3 text-3xl font-bold tracking-tight text-white sm:text-5xl drop-shadow-sm">
            Hand-crocheted treasures
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm font-medium text-white/80 sm:text-base">
            Every piece is made in limited batches with premium soft yarn, designed to bring joy and cozy comfort.
          </p>
        </motion.div>

        {productsLoading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <Skeleton key={index} className="aspect-square rounded-2xl" />
            ))}
          </div>
        ) : showGrouped ? (
          <div className="space-y-16">
            {categoryGroups.map((group, groupIndex) => (
              <motion.section
                key={group.category._id}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: Math.min(groupIndex * 0.05, 0.2) }}
                aria-label={`Featured ${group.category.name}`}
              >
                <div className="mb-6 flex flex-wrap items-end justify-between gap-3 border-b border-white/20 pb-4">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#FFC77D]">
                      Collection
                    </span>
                    <h3 className="font-display mt-0.5 text-2xl font-bold tracking-tight text-white sm:text-3xl drop-shadow-sm">
                      {group.category.name}
                    </h3>
                  </div>
                  <Link
                    to={`/categories/${group.category.slug}`}
                    className="group inline-flex items-center gap-1.5 text-sm font-semibold text-[#FFC77D] transition hover:text-white"
                  >
                    View all {group.category.name}
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>

                <ProductGrid products={group.products.slice(0, 4)} loading={false} />
              </motion.section>
            ))}
          </div>
        ) : featured && featured.length > 0 ? (
          <ProductGrid products={featured} loading={false} />
        ) : (
          <div className="rounded-[32px] faded-glass p-8 sm:p-12 text-center">
            <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-white/15 border border-white/20 text-3xl shadow-inner">
              🛍️
            </div>
            <h3 className="mt-4 text-xl font-bold text-white">
              {isAdmin ? "No Products in Store Yet" : "Fresh Treasures Coming Soon"}
            </h3>
            <p className="mx-auto mt-2 max-w-md text-sm text-white/80 leading-relaxed">
              {isAdmin
                ? "Your catalog is completely clean. Click below to add your first authentic handmade product listing."
                : "Our artisans are currently preparing new limited batch crochet pieces. Follow along or request a custom piece!"}
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              {isAdmin ? (
                <Link
                  to="/admin/products"
                  className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#C26550] to-[#A84F3D] px-6 py-3.5 text-sm font-bold text-white shadow-soft transition hover:from-[#A84F3D] hover:to-[#8E3B2B] active:scale-98"
                >
                  <PlusCircle className="size-4" />
                  Add First Product
                </Link>
              ) : (
                <a
                  href="https://wa.me/917985835558?text=Hello%20Shikha%2C%20I%20would%20like%20to%20inquire%20about%20your%20crochet%20products."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-2xl bg-[#25D366] px-6 py-3.5 text-sm font-bold text-white shadow-soft transition hover:bg-[#1EBE5D] active:scale-98"
                >
                  <MessageCircle className="size-4" />
                  Inquire on WhatsApp
                </a>
              )}
            </div>
          </div>
        )}
      </section>

      {/* ============================================================
          4. ARTISAN SPOTLIGHT & CUSTOM ORDERS (Story Block in Faded Glass)
          ============================================================ */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.55 }}
          className="relative overflow-hidden rounded-[36px] faded-glass p-8 sm:p-12"
        >
          <div className="grid items-center gap-8 lg:grid-cols-2">
            <div className="space-y-4">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 backdrop-blur-md px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-[#FFC77D]">
                <Heart className="size-3.5 fill-current text-[#FF9E90]" /> Meet the Artisan
              </span>
              <h2 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl drop-shadow-sm">
                Bespoke orders crafted with love by Shikha Rai
              </h2>
              <p className="text-sm leading-relaxed text-white/85 sm:text-base">
                Looking for a special keepsake, baby nursery gift, or custom crochet plushie in specific color palettes? Every piece at Knottiingale is crafted slowly, stitch by stitch. Let us craft something memorable for your loved ones.
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <a
                  href="https://wa.me/917985835558?text=Hello%20Shikha%2C%20I%20would%20like%20to%20request%20a%20custom%20crochet%20order."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-2xl bg-[#25D366] px-5 py-3 text-sm font-bold text-white shadow-md transition hover:bg-[#1EBE5D] active:scale-98"
                >
                  <MessageCircle className="size-4.5" />
                  Order on WhatsApp (+91 7985835558)
                </a>
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 rounded-2xl border border-white/25 bg-white/10 px-5 py-3 text-sm font-semibold text-white backdrop-blur-md transition hover:bg-white/20 active:scale-98"
                >
                  Contact Form & Details
                </Link>
              </div>
            </div>

            {/* Quick feature highlights in Faded Glass */}
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-[22px] border border-white/20 bg-white/10 p-5 backdrop-blur-xl shadow-xs">
                <p className="font-display text-2xl font-bold text-[#FFC77D]">Custom Colors</p>
                <p className="mt-1 text-xs text-white/80 leading-relaxed">Choose from dozens of premium yarn palettes to match your nursery or home decor.</p>
              </div>
              <div className="rounded-[22px] border border-white/20 bg-white/10 p-5 backdrop-blur-xl shadow-xs">
                <p className="font-display text-2xl font-bold text-[#FFB0A3]">Gift Packaging</p>
                <p className="mt-1 text-xs text-white/80 leading-relaxed">Every piece comes tied with satin ribbons, care instructions, and optional handwritten notes.</p>
              </div>
              <div className="rounded-[22px] border border-white/20 bg-white/10 p-5 backdrop-blur-xl shadow-xs">
                <p className="font-display text-2xl font-bold text-[#B4E09E]">Safe & Soft</p>
                <p className="mt-1 text-xs text-white/80 leading-relaxed">Made with child-safe safety eyes, hypoallergenic fiberfill, and ultra-soft non-toxic yarn.</p>
              </div>
              <div className="rounded-[22px] border border-white/20 bg-white/10 p-5 backdrop-blur-xl shadow-xs">
                <p className="font-display text-2xl font-bold text-[#FFD479]">Direct Support</p>
                <p className="mt-1 text-xs text-white/80 leading-relaxed">Talk directly to Shikha Rai and developer Shruti Rai for smooth updates.</p>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ============================================================
          5. CLOSING CTA (Warm Boutique Invitation in Faded Glass)
          ============================================================ */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.55 }}
          className="relative overflow-hidden rounded-[36px] faded-glass px-8 py-16 text-center text-white sm:py-20"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(circle at 50% 0%, rgb(255 199 125 / 0.15), transparent 65%)",
            }}
          />
          <h2 className="font-display relative text-4xl font-bold tracking-tight text-white sm:text-5xl drop-shadow-md">
            Bring a little handmade warmth home.
          </h2>
          <p className="relative mx-auto mt-4 max-w-xl text-white/85 text-base sm:text-lg">
            Create an account for faster checkout, order tracking, and early
            access to new limited crochet drops.
          </p>
          <div className="relative mt-9 flex flex-wrap justify-center gap-3">
            <Link
              to="/register"
              className="group inline-flex h-13 items-center gap-2 rounded-2xl bg-gradient-to-r from-[#C26550] to-[#A84F3D] px-8 text-base font-bold text-white shadow-soft transition hover:from-[#A84F3D] hover:to-[#8E3B2B] hover:shadow-lift active:scale-98"
            >
              Create Free Account
              <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              to="/products"
              className="inline-flex h-13 items-center rounded-2xl border border-white/30 bg-white/10 px-8 text-base font-semibold text-white backdrop-blur-md transition hover:border-white/50 hover:bg-white/20 active:scale-98"
            >
              Browse All Products
            </Link>
          </div>
        </motion.div>
      </section>
      </div>
    </div>
  );
};

export default LandingPage;
