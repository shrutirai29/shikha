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
  RefreshCcw,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  Tag,
  Truck,
} from "lucide-react";
import { motion } from "framer-motion";
import { useFeaturedProducts, useAddToCart } from "@/hooks/useApi";
import { useToast } from "@/context/ToastContext";
import { ProductGrid } from "@/components/product/ProductGrid";
import { Skeleton } from "@/components/ui/Card";
import type { Category, Product } from "@/types";
import { formatCurrency } from "@/lib/utils";
import heroBackdrop from "@/assets/hero-backdrop.jpg";

// Flipkart-style quick categories
const QUICK_CATEGORIES = [
  { name: "Earbuds Cases", icon: "🎧", slug: "earbuds-cases", tag: "Hot", bg: "bg-[#C98F8B]/15 text-[#B85C4A] dark:bg-[#D8A09B]/20 dark:text-[#D47763]" },
  { name: "Door Torans", icon: "🌸", slug: "torans", tag: "Festive", bg: "bg-[#D8A85B]/20 text-[#D8A85B] dark:bg-[#E0B86A]/20 dark:text-[#E0B86A]" },
  { name: "Plushies & Toys", icon: "🐰", slug: "plushies", tag: "Popular", bg: "bg-[#B85C4A]/15 text-[#B85C4A] dark:bg-[#D47763]/20 dark:text-[#D47763]" },
  { name: "Bags & Totes", icon: "👜", slug: "bags", tag: "Trending", bg: "bg-[#7A8B68]/15 text-[#7A8B68] dark:bg-[#9BAF83]/20 dark:text-[#9BAF83]" },
  { name: "Flower Bouquets", icon: "💐", slug: "flowers", tag: "Gifts", bg: "bg-[#D8A85B]/20 text-[#D8A85B] dark:bg-[#E0B86A]/20 dark:text-[#E0B86A]" },
  { name: "Home Décor", icon: "🏡", slug: "home-decor", tag: "Cozy", bg: "bg-[#7A8B68]/15 text-[#7A8B68] dark:bg-[#9BAF83]/20 dark:text-[#9BAF83]" },
  { name: "Wearables", icon: "🧣", slug: "wearables", tag: "", bg: "bg-[#9B7A68]/15 text-[#9B7A68] dark:bg-[#BFA597]/20 dark:text-[#BFA597]" },
  { name: "All Products", icon: "✨", slug: "", tag: "", bg: "bg-[#F5EDE4] text-[#3B2924] dark:bg-[#352925] dark:text-[#FFF4E8]" },
];

// Amazon-style visual category showcase cards
const VISUAL_CATEGORIES = [
  {
    id: "earbuds-cases",
    title: "Crochet Earbuds Cases",
    subtitle: "Snug floral & bear covers for AirPods",
    startingPrice: "From ₹249",
    tag: "🔥 Most Popular",
    tagStyle: "bg-[#B85C4A]/15 text-[#B85C4A] dark:bg-[#D47763]/25 dark:text-[#D47763]",
    image: "/images/categories/earbuds-covers.jpg",
    link: "/products?category=earbuds-cases",
  },
  {
    id: "torans",
    title: "Handmade Door Torans",
    subtitle: "Traditional marigold & festive door hangings",
    startingPrice: "From ₹599",
    tag: "✨ Indian Artisanal",
    tagStyle: "bg-[#D8A85B]/20 text-[#D8A85B] dark:bg-[#E0B86A]/25 dark:text-[#E0B86A]",
    image: "/images/categories/door-torans.jpg",
    link: "/products?category=torans",
  },
  {
    id: "plushies",
    title: "Amigurumi Plush Toys",
    subtitle: "Lovingly hand-stitched bunny & bear dolls",
    startingPrice: "From ₹399",
    tag: "🐰 Bestseller",
    tagStyle: "bg-[#C98F8B]/20 text-[#B85C4A] dark:bg-[#D8A09B]/25 dark:text-[#D47763]",
    image: "/images/categories/plush-toys.jpg",
    link: "/products?category=plushies",
  },
  {
    id: "bags",
    title: "Granny Square Bags",
    subtitle: "Sunflower & daisy cotton shoulder totes",
    startingPrice: "From ₹699",
    tag: "👜 Handwoven Daily",
    tagStyle: "bg-[#7A8B68]/15 text-[#7A8B68] dark:bg-[#9BAF83]/25 dark:text-[#9BAF83]",
    image: "/images/categories/tote-bags.jpg",
    link: "/products?category=bags",
  },
  {
    id: "flowers",
    title: "Everlasting Bouquets",
    subtitle: "Crochet sunflowers & roses that never fade",
    startingPrice: "From ₹299",
    tag: "💐 Forever Blooms",
    tagStyle: "bg-[#D8A85B]/20 text-[#D8A85B] dark:bg-[#E0B86A]/25 dark:text-[#E0B86A]",
    image: "/images/categories/flower-bouquets.jpg",
    link: "/products?category=flowers",
  },
  {
    id: "home-decor",
    title: "Coasters & Dining Décor",
    subtitle: "Hand-knit floral table mats & mug cozies",
    startingPrice: "From ₹199",
    tag: "☕ Cozy Living",
    tagStyle: "bg-[#7A8B68]/15 text-[#7A8B68] dark:bg-[#9BAF83]/25 dark:text-[#9BAF83]",
    image: "/images/categories/home-decor.jpg",
    link: "/products?category=home-decor",
  },
];

// Curated live showcase for the Flipkart-style trending rail
const CURATED_TRENDING = [
  {
    _id: "trend-1",
    name: "Pastel Daisy AirPods Case Cover",
    categoryName: "Earbuds Cases",
    price: 349,
    originalPrice: 499,
    rating: 4.9,
    reviewCount: 38,
    image: "/images/categories/earbuds-covers.jpg",
    badge: "Trending #1",
    slug: "pastel-daisy-airpods-case",
  },
  {
    _id: "trend-2",
    name: "Marigold & Jasmine Door Toran (3.5 ft)",
    categoryName: "Door Torans",
    price: 799,
    originalPrice: 1199,
    rating: 5.0,
    reviewCount: 52,
    image: "/images/categories/door-torans.jpg",
    badge: "Festive Pick",
    slug: "marigold-jasmine-door-toran",
  },
  {
    _id: "trend-3",
    name: "Amigurumi Bunny in Knitted Overalls",
    categoryName: "Plush Toys",
    price: 549,
    originalPrice: 799,
    rating: 4.9,
    reviewCount: 46,
    image: "/images/categories/plush-toys.jpg",
    badge: "Bestseller",
    slug: "amigurumi-bunny-overalls",
  },
  {
    _id: "trend-4",
    name: "Granny Square Sunflower Tote Bag",
    categoryName: "Bags & Totes",
    price: 899,
    originalPrice: 1299,
    rating: 4.8,
    reviewCount: 29,
    image: "/images/categories/tote-bags.jpg",
    badge: "Artisan Made",
    slug: "granny-square-sunflower-tote",
  },
  {
    _id: "trend-5",
    name: "Handmade Sunflower & Rose Crochet Bouquet",
    categoryName: "Everlasting Flowers",
    price: 499,
    originalPrice: 699,
    rating: 5.0,
    reviewCount: 64,
    image: "/images/categories/flower-bouquets.jpg",
    badge: "Gift Choice",
    slug: "sunflower-rose-crochet-bouquet",
  },
  {
    _id: "trend-6",
    name: "Handmade Floral Coasters & Table Mat Set",
    categoryName: "Home Décor",
    price: 399,
    originalPrice: 599,
    rating: 4.9,
    reviewCount: 31,
    image: "/images/categories/home-decor.jpg",
    badge: "Under ₹499",
    slug: "floral-coasters-mat-set",
  },
];

// Budget Savers Under ₹499
const CURATED_UNDER_499 = [
  {
    _id: "budget-1",
    name: "Mini Bear AirPods Pouch with Clasp",
    price: 299,
    originalPrice: 449,
    image: "/images/categories/earbuds-covers.jpg",
    slug: "mini-bear-airpods-pouch",
  },
  {
    _id: "budget-2",
    name: "Daisy Flower Car Mirror Hanging",
    price: 249,
    originalPrice: 349,
    image: "/images/categories/flower-bouquets.jpg",
    slug: "daisy-car-mirror-hanging",
  },
  {
    _id: "budget-3",
    name: "Handmade Blossom Mug Cozy & Coaster",
    price: 199,
    originalPrice: 299,
    image: "/images/categories/home-decor.jpg",
    slug: "blossom-mug-cozy-coaster",
  },
  {
    _id: "budget-4",
    name: "Cute Amigurumi Strawberry Keychain",
    price: 189,
    originalPrice: 259,
    image: "/images/categories/plush-toys.jpg",
    slug: "amigurumi-strawberry-keychain",
  },
  {
    _id: "budget-5",
    name: "Mini Sunflower Stem (Single Bloom)",
    price: 229,
    originalPrice: 319,
    image: "/images/categories/flower-bouquets.jpg",
    slug: "mini-sunflower-stem",
  },
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
  const heroProduct = featured?.[0];
  const addToCart = useAddToCart();
  const toast = useToast();

  const trendingRailRef = useRef<HTMLDivElement>(null);
  const budgetRailRef = useRef<HTMLDivElement>(null);

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
    <div>
      {/* ============================================================
          TOP E-COMMERCE CATEGORY RAIL (Flipkart-style)
          ============================================================ */}
      <nav aria-label="Quick Categories" className="border-b border-[#E8DCD0] bg-[#FFFCF7] shadow-xs dark:border-[#382823] dark:bg-[#1E1614] w-full max-w-full overflow-hidden">
        <div className="mx-auto flex max-w-7xl items-center justify-start xl:justify-between gap-2.5 sm:gap-3 overflow-x-auto px-3 py-3 sm:px-6 scrollbar-none touch-pan-x [-webkit-overflow-scrolling:touch]">
          {QUICK_CATEGORIES.map((cat) => (
            <Link
              key={cat.name}
              to={cat.slug ? `/products?category=${cat.slug}` : "/products"}
              className="group flex flex-col items-center gap-1.5 shrink-0 px-2 py-1 rounded-xl transition hover:-translate-y-0.5"
            >
              <div className="relative">
                <span className={`flex size-12 sm:size-14 items-center justify-center rounded-2xl text-2xl sm:text-3xl shadow-xs transition group-hover:scale-108 group-hover:shadow-md ${cat.bg}`}>
                  {cat.icon}
                </span>
                {cat.tag && (
                  <span className="absolute -top-1.5 -right-2 rounded-full bg-[#B85C4A] px-1.5 py-0.2 text-[9px] font-bold text-white uppercase tracking-wider dark:bg-[#D47763]">
                    {cat.tag}
                  </span>
                )}
              </div>
              <span className="text-[11px] sm:text-xs font-semibold text-[#3B2924] transition group-hover:text-[#B85C4A] whitespace-nowrap dark:text-[#FFF4E8] dark:group-hover:text-[#D47763]">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </nav>

      {/* ============================================================
          MYNTRA-STYLE FIRST ORDER OFFER STRIP
          ============================================================ */}
      <div className="bg-gradient-to-r from-[#B85C4A] via-[#914536] to-[#B85C4A] px-3 sm:px-4 py-1.5 sm:py-2 text-center text-[11px] sm:text-xs font-semibold tracking-wide text-white shadow-xs">
        <span className="inline-flex flex-wrap items-center justify-center gap-x-2 gap-y-0.5">
          <span>🎟️ <strong>FLAT 10% OFF</strong> on your 1st order with code <span className="underline decoration-white/60 font-mono font-bold tracking-wider">KNOTTY10</span></span>
          <span className="hidden sm:inline">•</span>
          <span className="hidden sm:inline">📦 Free Express Shipping Over ₹500 across India</span>
        </span>
      </div>

      {/* ============================================================
          1. HERO SECTION (Artisanal Photography Backdrop & Editorial Layout)
          ============================================================ */}
      <section className="relative min-h-[540px] sm:min-h-[640px] lg:min-h-[700px] overflow-hidden bg-[#FFF8F0] dark:bg-[#1F1816]">
        {/* Full-bleed photography backdrop */}
        <div className="absolute inset-0 select-none">
          <img
            src={heroBackdrop}
            alt="Handmade crochet flowers, bunny and natural yarn flatlay"
            className="size-full object-cover object-[78%_center] sm:object-[70%_center] lg:object-center opacity-95 dark:opacity-35 transition-opacity duration-500"
          />

          {/* Warm artistic gradient scrim: keeps text legible on the left while revealing the photography on the right */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#FFF8F0]/95 via-[#FFF8F0]/85 to-[#FFF8F0]/40 sm:to-transparent lg:via-[#FFF8F0]/65 dark:from-[#1F1816]/95 dark:via-[#1F1816]/85 dark:to-[#1F1816]/60" />

          {/* Ambient soft glow orbs that accent the pottery and yarn tones */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-32 left-10 size-96 rounded-full bg-gradient-to-br from-[#C98F8B]/20 via-[#B85C4A]/15 to-transparent blur-3xl dark:from-[#D8A09B]/15 dark:via-[#D47763]/10"
          />
        </div>

        {/* Hero Content Container */}
        <div className="relative mx-auto grid max-w-7xl items-center gap-8 sm:gap-10 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-12 lg:gap-6 xl:gap-8 lg:py-24 overflow-hidden w-full max-w-full">
          {/* Left Column: Brand Story & Call-to-actions */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="min-w-0 lg:col-span-7 xl:col-span-7 max-w-2xl"
          >
            {/* Pill: Hand-Stitched by Shikha Rai */}
            <div className="inline-flex items-center gap-2 rounded-full border border-[#B85C4A]/25 bg-[#FFFCF7]/90 px-3.5 sm:px-4 py-1.5 text-[11px] sm:text-xs font-semibold text-[#B85C4A] shadow-soft backdrop-blur-md dark:border-[#D47763]/30 dark:bg-[#1E1614]/90 dark:text-[#D47763]">
              <span className="relative flex size-2 shrink-0">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-[#C98F8B] opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-[#B85C4A] dark:bg-[#D47763]" />
              </span>
              <span>Pure Artisan Craft · Hand-Stitched by Shikha Rai</span>
            </div>

            {/* Display Headline */}
            <h1 className="font-display mt-4 sm:mt-5 text-3xl sm:text-4xl md:text-5xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-semibold leading-[1.15] sm:leading-[1.1] tracking-tight text-[#3B2924] dark:text-[#FFF4E8]">
              Handmade with love,{" "}
              <span className="block font-normal italic text-[#B85C4A] dark:text-[#D47763]">
                one stitch at a time.
              </span>
            </h1>

            {/* Narrative description */}
            <p className="mt-4 sm:mt-5 max-w-xl text-sm leading-relaxed text-[#806E66] sm:text-lg dark:text-[#C7B8AE]">
              Welcome to <strong className="text-[#3B2924] dark:text-[#FFF4E8]">Knottiingale</strong>. Soft plush toys, cozy
              home décor, torans, bags, and heartfelt handcrafted gifts — carefully crocheted with natural cotton yarn
              by <strong className="text-[#3B2924] dark:text-[#FFF4E8]">Shikha Rai</strong> and delivered across India.
            </p>

            {/* Action buttons */}
            <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <Link
                to="/products"
                className="group relative inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-[#B85C4A] px-7 text-sm font-bold text-white shadow-soft transition hover:bg-[#914536] hover:shadow-lift active:scale-98 dark:bg-[#D47763] dark:text-[#1F1816] dark:hover:bg-[#E28A76]"
              >
                Explore Collection
                <ArrowRight className="size-4.5 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                to="/contact"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-[#7A8B68] bg-[#FFFCF7]/90 px-6 text-sm font-semibold text-[#7A8B68] shadow-sm backdrop-blur-md transition hover:bg-[#7A8B68]/15 active:scale-98 dark:border-[#9BAF83] dark:bg-[#1E1614]/90 dark:text-[#9BAF83] dark:hover:bg-[#9BAF83]/15"
              >
                Custom Order Inquiry
              </Link>
            </div>

            {/* Craft Highlights */}
            <div className="mt-8 sm:mt-10 flex flex-wrap items-center gap-3 sm:gap-6 border-t border-[#E8DCD0]/70 pt-5 sm:pt-6 text-[11px] sm:text-xs font-medium text-[#806E66] dark:border-[#493A34]/70 dark:text-[#C7B8AE]">
              <span className="flex items-center gap-1.5 sm:gap-2">
                <span className="flex size-5 sm:size-6 items-center justify-center rounded-full bg-[#7A8B68]/15 text-[#7A8B68] dark:bg-[#9BAF83]/20 dark:text-[#9BAF83]">✓</span>
                100% Handcrafted
              </span>
              <span className="flex items-center gap-1.5 sm:gap-2">
                <span className="flex size-5 sm:size-6 items-center justify-center rounded-full bg-[#D8A85B]/20 text-[#D8A85B] dark:bg-[#E0B86A]/20 dark:text-[#E0B86A]">
                  <Star className="size-3 sm:size-3.5 fill-current" />
                </span>
                5.0 Rated by Buyers
              </span>
              <span className="flex items-center gap-1.5 sm:gap-2">
                <span className="flex size-5 sm:size-6 items-center justify-center rounded-full bg-[#B85C4A]/15 text-[#B85C4A] dark:bg-[#D47763]/20 dark:text-[#D47763]">⚡</span>
                Fast Pan-India Dispatch
              </span>
            </div>
          </motion.div>

          {/* Right Column: Floating Boutique Spotlight Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="min-w-0 lg:col-span-5 xl:col-span-5 flex flex-col justify-end lg:items-end w-full"
          >
            {/* Elegant glassmorphic showcase card floating harmoniously over the photo */}
            <div className="w-full max-w-[340px] sm:max-w-sm rounded-3xl border border-[#E8DCD0]/90 bg-[#FFFCF7]/90 p-4 sm:p-5 shadow-lift backdrop-blur-md dark:border-[#493A34]/80 dark:bg-[#2A211E]/90">
              <div className="flex items-center justify-between border-b border-[#E8DCD0]/80 pb-3 dark:border-[#493A34]/80">
                <div className="flex items-center gap-2">
                  <span className="flex size-7 items-center justify-center rounded-lg bg-[#B85C4A]/15 text-[#B85C4A] dark:bg-[#D47763]/20 dark:text-[#D47763]">
                    <Sparkles className="size-4" />
                  </span>
                  <div>
                    <p className="text-xs font-bold text-[#3B2924] dark:text-[#FFF4E8]">
                      Artisan Spotlight
                    </p>
                    <p className="text-[10px] text-[#806E66] dark:text-[#C7B8AE]">
                      Limited batch pieces
                    </p>
                  </div>
                </div>
                <span className="rounded-full bg-[#7A8B68]/15 px-2.5 py-0.5 text-[11px] font-semibold text-[#7A8B68] dark:bg-[#9BAF83]/20 dark:text-[#9BAF83]">
                  In Stock
                </span>
              </div>

              {heroProduct ? (
                <div className="mt-4 flex items-center gap-3.5">
                  <div className="size-16 shrink-0 overflow-hidden rounded-2xl bg-[#F5EDE4] ring-1 ring-[#3B2924]/10 dark:bg-[#352925] dark:ring-white/10">
                    {heroProduct.images?.[0] ? (
                      <img
                        src={heroProduct.images[0]}
                        alt={heroProduct.name}
                        className="size-full object-cover"
                      />
                    ) : (
                      <div className="flex size-full items-center justify-center text-2xl">🧶</div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-[#3B2924] dark:text-[#FFF4E8]">
                      {heroProduct.name}
                    </p>
                    <p className="text-xs font-bold text-[#B85C4A] dark:text-[#D47763]">
                      {formatCurrency(heroProduct.price)}
                    </p>
                    <p className="mt-0.5 text-[11px] text-[#806E66] line-clamp-1 dark:text-[#C7B8AE]">
                      Made slowly with 100% cotton
                    </p>
                  </div>
                  <Link
                    to={`/products/${heroProduct.slug}`}
                    className="shrink-0 rounded-xl bg-[#B85C4A] p-2 text-white shadow-soft transition hover:bg-[#914536] dark:bg-[#D47763] dark:text-[#1F1816]"
                    aria-label={`View ${heroProduct.name}`}
                  >
                    <ArrowRight className="size-4" />
                  </Link>
                </div>
              ) : (
                <div className="mt-4 flex items-center gap-3">
                  <span className="text-3xl">🐰</span>
                  <div>
                    <p className="text-sm font-semibold text-[#3B2924] dark:text-[#FFF4E8]">
                      Bunny & Flora Collection
                    </p>
                    <p className="text-xs text-[#806E66] dark:text-[#C7B8AE]">
                      Hand-crocheted daisy blossoms & plushies
                    </p>
                  </div>
                </div>
              )}

              {/* Popular category chips */}
              <div className="mt-4 border-t border-[#E8DCD0]/70 pt-3 dark:border-[#493A34]/70">
                <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-[#806E66] dark:text-[#C7B8AE]">
                  Quick Explore
                </p>
                <div className="flex flex-wrap gap-1.5">
                  <Link
                    to="/products"
                    className="rounded-lg bg-[#F5EDE4]/90 px-2.5 py-1 text-[11px] font-medium text-[#3B2924] transition hover:bg-[#B85C4A] hover:text-white dark:bg-[#352925] dark:text-[#FFF4E8] dark:hover:bg-[#D47763] dark:hover:text-[#1F1816]"
                  >
                    🐰 Plushies
                  </Link>
                  <Link
                    to="/products"
                    className="rounded-lg bg-[#F5EDE4]/90 px-2.5 py-1 text-[11px] font-medium text-[#3B2924] transition hover:bg-[#B85C4A] hover:text-white dark:bg-[#352925] dark:text-[#FFF4E8] dark:hover:bg-[#D47763] dark:hover:text-[#1F1816]"
                  >
                    🌸 Daisy Torans
                  </Link>
                  <Link
                    to="/products"
                    className="rounded-lg bg-[#F5EDE4]/90 px-2.5 py-1 text-[11px] font-medium text-[#3B2924] transition hover:bg-[#B85C4A] hover:text-white dark:bg-[#352925] dark:text-[#FFF4E8] dark:hover:bg-[#D47763] dark:hover:text-[#1F1816]"
                  >
                    🎧 Earbuds Cases
                  </Link>
                  <Link
                    to="/products"
                    className="rounded-lg bg-[#F5EDE4]/90 px-2.5 py-1 text-[11px] font-medium text-[#3B2924] transition hover:bg-[#B85C4A] hover:text-white dark:bg-[#352925] dark:text-[#FFF4E8] dark:hover:bg-[#D47763] dark:hover:text-[#1F1816]"
                  >
                    👜 Bags
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom smooth fade into content */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#FFF8F0] dark:from-[#1F1816] to-transparent"
        />
      </section>

      {/* ============================================================
          AMAZON-STYLE VISUAL CATEGORIES GRID: "Shop What We Make"
          ============================================================ */}
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
            to="/products"
            className="group inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-[#B85C4A] transition hover:text-[#914536] dark:text-[#D47763] dark:hover:text-[#E28A76]"
          >
            <span>See All Collections</span>
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-6 sm:gap-4">
          {VISUAL_CATEGORIES.map((cat, idx) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.05 }}
            >
              <Link
                to={cat.link}
                className="group flex h-full flex-col overflow-hidden rounded-2xl border border-[#E8DCD0] bg-[#FFFCF7] p-3 shadow-soft transition-all duration-300 hover:-translate-y-1.5 hover:border-[#B85C4A]/40 hover:shadow-lift dark:border-[#493A34] dark:bg-[#2A211E] dark:hover:border-[#D47763]/40"
              >
                {/* Visual Image container with tag & zoom */}
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-[#F5EDE4] dark:bg-[#352925]">
                  <img
                    src={cat.image}
                    alt={cat.title}
                    className="size-full object-cover transition-transform duration-500 group-hover:scale-108"
                    loading="lazy"
                  />
                  <span className={`absolute top-2 left-2 rounded-full px-2 py-0.5 text-[10px] font-bold backdrop-blur-md ${cat.tagStyle}`}>
                    {cat.tag}
                  </span>
                </div>

                {/* Details */}
                <div className="mt-3 flex flex-1 flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-[#3B2924] transition group-hover:text-[#B85C4A] dark:text-[#FFF4E8] dark:group-hover:text-[#D47763] line-clamp-1">
                      {cat.title}
                    </h3>
                    <p className="mt-0.5 text-[11px] leading-snug text-[#806E66] dark:text-[#C7B8AE] line-clamp-2">
                      {cat.subtitle}
                    </p>
                  </div>
                  <div className="mt-3 flex items-center justify-between border-t border-[#E8DCD0]/60 pt-2.5 dark:border-[#493A34]/60">
                    <span className="text-xs font-bold text-[#B85C4A] dark:text-[#D47763]">
                      {cat.startingPrice}
                    </span>
                    <span className="flex size-6 items-center justify-center rounded-full bg-[#F5EDE4] text-[#3B2924] transition group-hover:bg-[#B85C4A] group-hover:text-white dark:bg-[#352925] dark:text-[#FFF4E8] dark:group-hover:bg-[#D47763] dark:group-hover:text-[#1F1816]">
                      <ArrowRight className="size-3.5" />
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ============================================================
          FLIPKART-STYLE HORIZONTAL RAIL 1: TRENDING BESTSELLERS
          ============================================================ */}
      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 overflow-hidden w-full max-w-full">
        <div className="rounded-3xl border border-[#E8DCD0] bg-gradient-to-b from-[#FFFCF7] to-[#F5EDE4]/30 p-4 sm:p-6 shadow-soft dark:border-[#382823] dark:from-[#1E1614] dark:to-[#150F0D]">
          {/* Header with Title and Scroll Controls */}
          <div className="mb-5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#B85C4A]/15 text-[#B85C4A] dark:bg-[#D47763]/20 dark:text-[#D47763]">
                <Flame className="size-5" />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-display text-xl sm:text-2xl font-semibold tracking-tight text-[#3B2924] dark:text-[#FFF4E8]">
                    Trending Right Now
                  </h2>
                  <span className="hidden sm:inline-block rounded-full bg-[#B85C4A] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white dark:bg-[#D47763] dark:text-[#1F1816]">
                    Top Sellers
                  </span>
                </div>
                <p className="text-xs text-[#806E66] dark:text-[#C7B8AE]">
                  Most loved pieces crocheted this week
                </p>
              </div>
            </div>

            {/* Desktop Carousel Navigation */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => scrollRail(trendingRailRef, "left")}
                aria-label="Scroll left"
                className="flex size-9 items-center justify-center rounded-xl border border-[#E8DCD0] bg-white text-[#3B2924] shadow-xs transition hover:bg-[#F5EDE4] active:scale-95 dark:border-[#382823] dark:bg-[#251B18] dark:text-[#FFF4E8] dark:hover:bg-[#352925]"
              >
                <ChevronLeft className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => scrollRail(trendingRailRef, "right")}
                aria-label="Scroll right"
                className="flex size-9 items-center justify-center rounded-xl border border-[#E8DCD0] bg-white text-[#3B2924] shadow-xs transition hover:bg-[#F5EDE4] active:scale-95 dark:border-[#382823] dark:bg-[#251B18] dark:text-[#FFF4E8] dark:hover:bg-[#352925]"
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
            {CURATED_TRENDING.map((item) => {
              const discountPercent = Math.round(
                ((item.originalPrice - item.price) / item.originalPrice) * 100
              );

              return (
                <div
                  key={item._id}
                  className="group relative flex w-[195px] sm:w-[260px] shrink-0 snap-start flex-col justify-between overflow-hidden rounded-2xl border border-[#E8DCD0] bg-white p-3 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-[#B85C4A]/40 hover:shadow-lift dark:border-[#382823] dark:bg-[#1E1614]"
                >
                  {/* Image area */}
                  <Link to={`/products?search=${encodeURIComponent(item.name)}`} className="block">
                    <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-[#F5EDE4] dark:bg-[#251B18]">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="size-full object-cover transition-transform duration-500 group-hover:scale-108"
                        loading="lazy"
                      />
                      <span className="absolute top-2 left-2 rounded-full bg-[#B85C4A] px-2 py-0.5 text-[10px] font-bold text-white shadow-xs dark:bg-[#D47763] dark:text-[#1F1816]">
                        {item.badge}
                      </span>
                      <span className="absolute bottom-2 right-2 rounded-full bg-black/60 px-1.5 py-0.5 text-[10px] font-semibold text-white backdrop-blur-xs">
                        {discountPercent}% OFF
                      </span>
                    </div>

                    {/* Metadata */}
                    <div className="mt-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#7A8B68] dark:text-[#9BAF83]">
                        {item.categoryName}
                      </span>
                      <h3 className="mt-0.5 text-xs sm:text-sm font-semibold text-[#3B2924] transition group-hover:text-[#B85C4A] dark:text-[#FFF4E8] dark:group-hover:text-[#D47763] line-clamp-1">
                        {item.name}
                      </h3>

                      {/* Rating */}
                      <div className="mt-1 flex items-center gap-1.5 text-[11px] text-[#806E66] dark:text-[#C7B8AE]">
                        <span className="inline-flex items-center gap-0.5 rounded-sm bg-[#7A8B68]/15 px-1 py-0.2 font-semibold text-[#7A8B68] dark:bg-[#9BAF83]/20 dark:text-[#9BAF83]">
                          <Star className="size-3 fill-current text-[#7A8B68] dark:text-[#9BAF83]" />
                          {item.rating}
                        </span>
                        <span>({item.reviewCount})</span>
                      </div>

                      {/* Pricing */}
                      <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-sm sm:text-base font-bold text-[#B85C4A] dark:text-[#D47763]">
                          {formatCurrency(item.price)}
                        </span>
                        <span className="text-xs text-[#806E66] line-through dark:text-[#C7B8AE]">
                          {formatCurrency(item.originalPrice)}
                        </span>
                      </div>
                    </div>
                  </Link>

                  {/* Quick Action Button */}
                  <div className="mt-3 pt-2 border-t border-[#E8DCD0]/60 dark:border-[#382823]/60">
                    <button
                      type="button"
                      onClick={() => handleQuickAdd(item)}
                      className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-[#F5EDE4] py-2 text-xs font-bold text-[#3B2924] transition hover:bg-[#B85C4A] hover:text-white active:scale-98 dark:bg-[#251B18] dark:text-[#FFF4E8] dark:hover:bg-[#D47763] dark:hover:text-[#1F1816]"
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

      {/* ============================================================
          FLIPKART-STYLE HORIZONTAL RAIL 2: POCKET-FRIENDLY UNDER ₹499
          ============================================================ */}
      <section className="mx-auto max-w-7xl px-4 py-4 sm:px-6 sm:py-6 overflow-hidden w-full max-w-full">
        <div className="rounded-3xl border border-[#E8DCD0] bg-[#FFFCF7] p-4 sm:p-6 shadow-soft dark:border-[#382823] dark:bg-[#1E1614]">
          {/* Header */}
          <div className="mb-5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#7A8B68]/15 text-[#7A8B68] dark:bg-[#9BAF83]/20 dark:text-[#9BAF83]">
                <Tag className="size-5" />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-display text-xl sm:text-2xl font-semibold tracking-tight text-[#3B2924] dark:text-[#FFF4E8]">
                    Pocket-Friendly Treats • Under ₹499
                  </h2>
                  <span className="rounded-full bg-[#7A8B68]/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#7A8B68] dark:bg-[#9BAF83]/20 dark:text-[#9BAF83]">
                    Budget Gifting
                  </span>
                </div>
                <p className="text-xs text-[#806E66] dark:text-[#C7B8AE]">
                  Adorable everyday pieces, keychains, coasters & accessories
                </p>
              </div>
            </div>

            {/* Scroll buttons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => scrollRail(budgetRailRef, "left")}
                aria-label="Scroll left"
                className="flex size-9 items-center justify-center rounded-xl border border-[#E8DCD0] bg-white text-[#3B2924] shadow-xs transition hover:bg-[#F5EDE4] active:scale-95 dark:border-[#382823] dark:bg-[#251B18] dark:text-[#FFF4E8] dark:hover:bg-[#352925]"
              >
                <ChevronLeft className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => scrollRail(budgetRailRef, "right")}
                aria-label="Scroll right"
                className="flex size-9 items-center justify-center rounded-xl border border-[#E8DCD0] bg-white text-[#3B2924] shadow-xs transition hover:bg-[#F5EDE4] active:scale-95 dark:border-[#382823] dark:bg-[#251B18] dark:text-[#FFF4E8] dark:hover:bg-[#352925]"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>
          </div>

          {/* Horizontal Snap Scroll Track */}
          <div
            ref={budgetRailRef}
            className="flex gap-3 sm:gap-4 overflow-x-auto pb-2 scrollbar-none snap-x snap-mandatory touch-pan-x [-webkit-overflow-scrolling:touch]"
          >
            {CURATED_UNDER_499.map((item) => (
              <div
                key={item._id}
                className="group relative flex w-[175px] sm:w-[210px] shrink-0 snap-start flex-col justify-between overflow-hidden rounded-2xl border border-[#E8DCD0] bg-white p-3 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-[#7A8B68]/40 hover:shadow-lift dark:border-[#382823] dark:bg-[#1E1614]"
              >
                <Link to={`/products?search=${encodeURIComponent(item.name)}`} className="block">
                  <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-[#F5EDE4] dark:bg-[#251B18]">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="size-full object-cover transition-transform duration-500 group-hover:scale-108"
                      loading="lazy"
                    />
                    <span className="absolute top-2 left-2 rounded-full bg-[#7A8B68] px-2 py-0.5 text-[9px] font-bold text-white shadow-xs dark:bg-[#9BAF83] dark:text-[#1F1816]">
                      UNDER ₹499
                    </span>
                  </div>

                  <div className="mt-2.5">
                    <h3 className="text-xs font-semibold text-[#3B2924] transition group-hover:text-[#7A8B68] dark:text-[#FFF4E8] dark:group-hover:text-[#9BAF83] line-clamp-1">
                      {item.name}
                    </h3>
                    <div className="mt-1 flex items-baseline gap-1.5">
                      <span className="text-sm font-bold text-[#B85C4A] dark:text-[#D47763]">
                        {formatCurrency(item.price)}
                      </span>
                      <span className="text-[11px] text-[#806E66] line-through dark:text-[#C7B8AE]">
                        {formatCurrency(item.originalPrice)}
                      </span>
                    </div>
                  </div>
                </Link>

                <div className="mt-2.5 pt-2 border-t border-[#E8DCD0]/60 dark:border-[#382823]/60">
                  <button
                    type="button"
                    onClick={() => handleQuickAdd(item)}
                    className="flex w-full items-center justify-center gap-1 rounded-lg bg-[#F5EDE4] py-1.5 text-[11px] font-bold text-[#3B2924] transition hover:bg-[#7A8B68] hover:text-white active:scale-98 dark:bg-[#251B18] dark:text-[#FFF4E8] dark:hover:bg-[#9BAF83] dark:hover:text-[#1F1816]"
                  >
                    <ShoppingBag className="size-3" />
                    Quick Add
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
          2. TRUST & PERKS STRIP (CollectUI Clean Cards)
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
              className="flex items-start gap-4 rounded-2xl border border-[#E8DCD0] bg-[#FFFCF7] p-5 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-lift dark:border-[#493A34] dark:bg-[#2A211E]"
            >
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#F5EDE4] text-[#B85C4A] dark:bg-[#352925] dark:text-[#D47763]">
                <perk.icon className="size-5" />
              </span>
              <div>
                <h3 className="text-sm font-semibold text-[#3B2924] dark:text-[#FFF4E8]">
                  {perk.title}
                </h3>
                <p className="mt-0.5 text-xs leading-relaxed text-[#806E66] dark:text-[#C7B8AE]">
                  {perk.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ============================================================
          3. FEATURED PRODUCTS BY CATEGORY
          ============================================================ */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-16">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-12 text-center"
        >
          <p className="inline-flex items-center gap-1.5 rounded-full border border-[#B85C4A]/25 bg-[#F5EDE4] px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] text-[#B85C4A] dark:border-[#D47763]/25 dark:bg-[#352925] dark:text-[#D47763]">
            <Sparkles className="size-3.5 text-[#D8A85B] dark:text-[#E0B86A]" />
            Curated Artisan Picks
          </p>
          <h2 className="font-display mt-3 text-3xl font-semibold tracking-tight text-[#3B2924] sm:text-5xl dark:text-[#FFF4E8]">
            Hand-crocheted treasures
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-[#806E66] sm:text-base dark:text-[#C7B8AE]">
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
                <div className="mb-6 flex flex-wrap items-end justify-between gap-3 border-b border-[#E8DCD0] pb-4 dark:border-[#493A34]">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#7A8B68] dark:text-[#9BAF83]">
                      Collection
                    </span>
                    <h3 className="font-display mt-0.5 text-2xl font-semibold tracking-tight text-[#3B2924] sm:text-3xl dark:text-[#FFF4E8]">
                      {group.category.name}
                    </h3>
                  </div>
                  <Link
                    to={`/categories/${group.category.slug}`}
                    className="group inline-flex items-center gap-1.5 text-sm font-semibold text-[#B85C4A] transition hover:text-[#914536] dark:text-[#D47763] dark:hover:text-[#E28A76]"
                  >
                    View all {group.category.name}
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>

                <ProductGrid products={group.products.slice(0, 4)} loading={false} />
              </motion.section>
            ))}
          </div>
        ) : (
          <ProductGrid products={featured ?? []} loading={false} />
        )}
      </section>

      {/* ============================================================
          4. ARTISAN SPOTLIGHT & CUSTOM ORDERS (Story Block)
          ============================================================ */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.55 }}
          className="relative overflow-hidden rounded-[2.5rem] border border-[#E8DCD0] bg-gradient-to-br from-[#F5EDE4]/70 via-[#FFFCF7] to-[#F5EDE4]/50 p-8 shadow-soft dark:border-[#493A34] dark:from-[#2A211E] dark:via-[#1F1816] dark:to-[#2A211E] sm:p-12"
        >
          <div className="grid items-center gap-8 lg:grid-cols-2">
            <div className="space-y-4">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#C98F8B]/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#B85C4A] dark:bg-[#D8A09B]/20 dark:text-[#D47763]">
                <Heart className="size-3.5 fill-current text-[#C98F8B]" /> Meet the Artisan
              </span>
              <h2 className="font-display text-3xl font-semibold tracking-tight text-[#3B2924] sm:text-4xl dark:text-[#FFF4E8]">
                Bespoke orders crafted with love by Shikha Rai
              </h2>
              <p className="text-sm leading-relaxed text-[#806E66] sm:text-base dark:text-[#C7B8AE]">
                Looking for a special keepsake, baby nursery gift, or custom crochet plushie in specific color palettes? Every piece at Knottiingale is crafted slowly, stitch by stitch. Let us craft something memorable for your loved ones.
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <a
                  href="https://wa.me/917985835558?text=Hello%20Shikha%2C%20I%20would%20like%20to%20request%20a%20custom%20crochet%20order."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#7A8B68] px-5 py-3 text-sm font-bold text-white shadow-md transition hover:bg-[#687757] active:scale-98 dark:bg-[#9BAF83] dark:text-[#1F1816]"
                >
                  <MessageCircle className="size-4.5" />
                  Order on WhatsApp (+91 7985835558)
                </a>
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 rounded-xl border border-[#E8DCD0] bg-[#FFFCF7] px-5 py-3 text-sm font-semibold text-[#3B2924] shadow-sm transition hover:bg-[#F5EDE4] dark:border-[#493A34] dark:bg-[#2A211E] dark:text-[#FFF4E8] dark:hover:bg-[#352925]"
                >
                  Contact Form & Details
                </Link>
              </div>
            </div>

            {/* Quick feature highlights */}
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-[#E8DCD0] bg-[#FFFCF7]/90 p-5 shadow-sm backdrop-blur dark:border-[#493A34] dark:bg-[#2A211E]/90">
                <p className="font-display text-2xl font-bold text-[#B85C4A] dark:text-[#D47763]">Custom Colors</p>
                <p className="mt-1 text-xs text-[#806E66] dark:text-[#C7B8AE]">Choose from dozens of premium yarn palettes to match your nursery or home decor.</p>
              </div>
              <div className="rounded-2xl border border-[#E8DCD0] bg-[#FFFCF7]/90 p-5 shadow-sm backdrop-blur dark:border-[#493A34] dark:bg-[#2A211E]/90">
                <p className="font-display text-2xl font-bold text-[#C98F8B] dark:text-[#D8A09B]">Gift Packaging</p>
                <p className="mt-1 text-xs text-[#806E66] dark:text-[#C7B8AE]">Every piece comes tied with satin ribbons, care instructions, and optional handwritten notes.</p>
              </div>
              <div className="rounded-2xl border border-[#E8DCD0] bg-[#FFFCF7]/90 p-5 shadow-sm backdrop-blur dark:border-[#493A34] dark:bg-[#2A211E]/90">
                <p className="font-display text-2xl font-bold text-[#7A8B68] dark:text-[#9BAF83]">Safe & Soft</p>
                <p className="mt-1 text-xs text-[#806E66] dark:text-[#C7B8AE]">Made with child-safe safety eyes, hypoallergenic fiberfill, and ultra-soft non-toxic yarn.</p>
              </div>
              <div className="rounded-2xl border border-[#E8DCD0] bg-[#FFFCF7]/90 p-5 shadow-sm backdrop-blur dark:border-[#493A34] dark:bg-[#2A211E]/90">
                <p className="font-display text-2xl font-bold text-[#D8A85B] dark:text-[#E0B86A]">Direct Support</p>
                <p className="mt-1 text-xs text-[#806E66] dark:text-[#C7B8AE]">Talk directly to Shikha Rai and developer Shruti Rai for smooth updates.</p>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ============================================================
          5. CLOSING CTA (Warm Boutique Invitation)
          ============================================================ */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.55 }}
          className="relative overflow-hidden rounded-[2.5rem] border border-[#493A34] bg-[#3B2924] px-8 py-16 text-center text-[#FFF4E8] shadow-lift dark:bg-[#1F1816] sm:py-20"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(circle at 50% 0%, rgb(216 168 91 / 0.18), transparent 65%)",
            }}
          />
          <h2 className="font-display relative text-4xl font-semibold tracking-tight text-[#FFF4E8] sm:text-5xl">
            Bring a little handmade warmth home.
          </h2>
          <p className="relative mx-auto mt-4 max-w-xl text-[#C7B8AE]">
            Create an account for faster checkout, order tracking, and early
            access to new limited crochet drops.
          </p>
          <div className="relative mt-9 flex flex-wrap justify-center gap-3">
            <Link
              to="/register"
              className="group inline-flex h-13 items-center gap-2 rounded-2xl bg-[#B85C4A] px-8 text-base font-bold text-white shadow-soft transition hover:bg-[#914536] hover:shadow-lift active:scale-98 dark:bg-[#D47763] dark:text-[#1F1816]"
            >
              Create Free Account
              <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              to="/products"
              className="inline-flex h-13 items-center rounded-2xl border border-[#FFF4E8]/30 px-8 text-base font-semibold text-[#FFF4E8] backdrop-blur transition hover:border-[#FFF4E8]/60 hover:bg-white/5 active:scale-98"
            >
              Browse All Products
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
};

export default LandingPage;
