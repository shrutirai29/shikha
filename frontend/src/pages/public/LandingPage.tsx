import { useMemo } from "react";
import { Link } from "react-router-dom";
import { usePageTitle } from "@/hooks/usePageTitle";
import {
  ArrowRight,
  BadgeCheck,
  Heart,
  MessageCircle,
  RefreshCcw,
  ShieldCheck,
  Sparkles,
  Star,
  Truck,
} from "lucide-react";
import { motion } from "framer-motion";
import { useFeaturedProducts } from "@/hooks/useApi";
import { ProductGrid } from "@/components/product/ProductGrid";
import { Skeleton } from "@/components/ui/Card";
import type { Category, Product } from "@/types";
import { formatCurrency } from "@/lib/utils";

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

const testimonials = [
  {
    name: "Ananya Sharma",
    city: "Bengaluru",
    rating: 5,
    comment:
      "The crochet amigurumi bear is breathtaking! The stitches are remarkably tight and neat, and it came packed with so much love.",
  },
  {
    name: "Priyanshi Mehta",
    city: "Mumbai",
    rating: 5,
    comment:
      "Ordered a customized pastel crochet throw. Shikha was wonderfully responsive on WhatsApp for color matching. Absolutely in love!",
  },
  {
    name: "Dr. Ritu Verma",
    city: "Delhi NCR",
    rating: 5,
    comment:
      "Such rare, authentic craftsmanship. You can instantly feel the warmth and care put into each loop. Will definitely order again!",
  },
];

export const LandingPage = () => {
  usePageTitle("Handmade Crochet Treasures");
  const { data: featured, isLoading: productsLoading } = useFeaturedProducts(24);
  const heroProduct = featured?.[0];

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
          1. HERO SECTION (Uiverse & CollectUI First Impression)
          ============================================================ */}
      <section className="relative overflow-hidden bg-slate-950 bg-ink-grain">
        {/* Ambient background glow orbs */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 size-[650px] rounded-full bg-gradient-to-tr from-rose-500/15 via-indigo-600/20 to-transparent blur-3xl"
        />

        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 pb-20 pt-12 sm:px-6 lg:grid-cols-2 lg:gap-12 lg:pb-28 lg:pt-20">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-xl"
          >
            {/* Uiverse-style pulsing announcement pill */}
            <span className="relative inline-flex items-center gap-2 overflow-hidden rounded-full border border-indigo-400/30 bg-white/5 px-4 py-1.5 text-xs font-semibold text-indigo-200 backdrop-blur-md">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-rose-400 opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-rose-500" />
              </span>
              Handcrafted Collection · Fresh Drops Live
            </span>

            <h1 className="font-display mt-6 text-4xl font-semibold leading-[1.08] tracking-tight text-slate-50 sm:text-6xl lg:text-7xl">
              Handmade with love,{" "}
              <span className="block italic text-gradient-rose">
                one stitch at a time.
              </span>
            </h1>

            <p className="mt-6 max-w-lg text-base leading-relaxed text-slate-300 sm:text-lg">
              Welcome to <strong>Knottiingale</strong>. Soft plush toys, cozy
              warm throws, and heartfelt artisanal gifts — hand-crocheted slowly
              with care by <strong>Shikha Rai</strong> and delivered across India.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3.5">
              <Link
                to="/products"
                className="group relative inline-flex h-12.5 items-center gap-2 rounded-2xl bg-gradient-to-r from-slate-100 to-white px-7 text-sm font-bold text-slate-950 shadow-lift transition hover:scale-102 hover:shadow-glow active:scale-98"
              >
                Explore Collection
                <ArrowRight className="size-4.5 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                to="/contact"
                className="inline-flex h-12.5 items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-6 text-sm font-semibold text-white backdrop-blur-md transition hover:border-white/40 hover:bg-white/15 active:scale-98"
              >
                Custom Order Inquiry
              </Link>
            </div>

            {/* Social Proof metrics */}
            <dl className="mt-12 flex gap-8 border-t border-white/10 pt-6 text-slate-300 sm:gap-12">
              <div>
                <dt className="font-display text-2xl font-bold text-white sm:text-3xl">
                  {featured?.length ? `${featured.length}+` : "4.9"}
                </dt>
                <dd className="mt-0.5 text-[11px] font-semibold uppercase tracking-widest text-slate-400">
                  Unique Pieces
                </dd>
              </div>
              <div>
                <dt className="font-display text-2xl font-bold text-white sm:text-3xl">
                  24–48h
                </dt>
                <dd className="mt-0.5 text-[11px] font-semibold uppercase tracking-widest text-slate-400">
                  Fast Dispatch
                </dd>
              </div>
              <div>
                <dt className="font-display text-2xl font-bold text-white sm:text-3xl">
                  100%
                </dt>
                <dd className="mt-0.5 text-[11px] font-semibold uppercase tracking-widest text-slate-400">
                  Handmade Craft
                </dd>
              </div>
            </dl>
          </motion.div>

          {/* Featured Artisan Showcase (Replacing 3D sphere) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="relative mx-auto w-full max-w-md lg:max-w-none"
          >
            {/* Soft Ambient Glow */}
            <div
              aria-hidden="true"
              className="absolute -inset-1 rounded-[3rem] bg-gradient-to-r from-rose-500/20 via-indigo-500/25 to-purple-500/20 blur-2xl opacity-75"
            />

            <div className="relative overflow-hidden rounded-[2.5rem] border border-white/15 bg-gradient-to-b from-slate-900/90 to-slate-950/95 p-6 shadow-2xl backdrop-blur-xl">
              {heroProduct?.images?.[0] ? (
                <div className="group relative aspect-square overflow-hidden rounded-[2rem] bg-slate-900 ring-1 ring-white/10">
                  <img
                    src={heroProduct.images[0]}
                    alt={heroProduct.name}
                    className="size-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent" />

                  {/* Top Bestseller Badge */}
                  <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full border border-white/20 bg-slate-950/75 px-3.5 py-1 text-xs font-semibold text-rose-300 backdrop-blur-md">
                    <Sparkles className="size-3.5 text-amber-300" />
                    Bestseller of the Week
                  </div>

                  {/* Bottom Info Overlay */}
                  <div className="absolute bottom-5 left-5 right-5 space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wider text-indigo-300">
                      Featured Handcraft
                    </p>
                    <div className="flex items-end justify-between gap-3">
                      <div>
                        <h3 className="font-display text-xl font-bold text-white line-clamp-1">
                          {heroProduct.name}
                        </h3>
                        <p className="text-base font-semibold text-slate-200">
                          {formatCurrency(heroProduct.price)}
                        </p>
                      </div>
                      <Link
                        to={`/products/${heroProduct.slug}`}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-white px-3.5 py-2 text-xs font-bold text-slate-950 shadow-md transition hover:bg-slate-100 active:scale-95"
                      >
                        View Piece
                        <ArrowRight className="size-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex aspect-square flex-col justify-between rounded-[2rem] bg-gradient-to-br from-indigo-950/40 via-slate-900/80 to-purple-950/40 p-8 border border-white/10">
                  <div className="inline-flex w-fit items-center gap-2 rounded-full border border-rose-400/30 bg-rose-500/10 px-3.5 py-1 text-xs font-semibold text-rose-300">
                    <Sparkles className="size-3.5 text-amber-300" />
                    Artisan Spotlight
                  </div>

                  <div className="space-y-3">
                    <span className="text-4xl">🧶</span>
                    <h3 className="font-display text-2xl font-bold text-white">
                      Every Stitch Woven with Love
                    </h3>
                    <p className="text-sm leading-relaxed text-slate-300">
                      Explore slow-made crochet plushies, winter wearables, and home accessories hand-crocheted by Shikha Rai in India.
                    </p>
                  </div>

                  <Link
                    to="/products"
                    className="inline-flex w-fit items-center gap-2 rounded-xl bg-gradient-to-r from-rose-500 to-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-lift transition hover:scale-102"
                  >
                    Browse All Handcrafted Pieces
                    <ArrowRight className="size-3.5" />
                  </Link>
                </div>
              )}

              {/* Trust badges footer */}
              <div className="mt-4 flex flex-wrap items-center justify-between gap-2 pt-2 text-xs text-slate-300">
                <span className="flex items-center gap-1.5 font-medium">
                  <BadgeCheck className="size-4 text-emerald-400" />
                  100% Cotton & Azo-Free Wool
                </span>
                <span className="flex items-center gap-1 text-amber-300 font-semibold">
                  <Star className="size-3.5 fill-current" />
                  5.0 Customer Rating
                </span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom smooth fade into content */}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-b from-transparent to-slate-50 dark:to-slate-950"
        />
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
              className="flex items-start gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-lift dark:border-slate-800/80 dark:bg-slate-900/70"
            >
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300">
                <perk.icon className="size-5" />
              </span>
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                  {perk.title}
                </h3>
                <p className="mt-0.5 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
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
          <p className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200/60 bg-indigo-50/70 px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] text-indigo-700 dark:border-indigo-500/20 dark:bg-indigo-500/10 dark:text-indigo-300">
            <Sparkles className="size-3.5" />
            Curated Artisan Picks
          </p>
          <h2 className="font-display mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-5xl dark:text-slate-50">
            Hand-crocheted treasures
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-slate-500 sm:text-base dark:text-slate-400">
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
                <div className="mb-6 flex flex-wrap items-end justify-between gap-3 border-b border-slate-200/80 pb-4 dark:border-slate-800">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400">
                      Collection
                    </span>
                    <h3 className="font-display mt-0.5 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl dark:text-slate-50">
                      {group.category.name}
                    </h3>
                  </div>
                  <Link
                    to={`/categories/${group.category.slug}`}
                    className="group inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 transition hover:text-indigo-500 dark:text-indigo-300 dark:hover:text-indigo-200"
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
          4. ARTISAN SPOTLIGHT & CUSTOM ORDERS (CollectUI Story Block)
          ============================================================ */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.55 }}
          className="relative overflow-hidden rounded-[2.5rem] border border-slate-200/80 bg-gradient-to-br from-indigo-50/60 via-white to-rose-50/40 p-8 shadow-soft dark:border-slate-800 dark:from-slate-900/90 dark:via-slate-900/60 dark:to-slate-800/80 sm:p-12"
        >
          <div className="grid items-center gap-8 lg:grid-cols-2">
            <div className="space-y-4">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300">
                <Heart className="size-3.5 fill-current text-rose-500" /> Meet the Artisan
              </span>
              <h2 className="font-display text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl dark:text-white">
                Bespoke orders crafted with love by Shikha Rai
              </h2>
              <p className="text-sm leading-relaxed text-slate-600 sm:text-base dark:text-slate-300">
                Looking for a special keepsake, baby nursery gift, or custom crochet plushie in specific color palettes? Every piece at Knottiingale is crafted slowly, stitch by stitch. Let us craft something memorable for your loved ones.
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <a
                  href="https://wa.me/917985835558?text=Hello%20Shikha%2C%20I%20would%20like%20to%20request%20a%20custom%20crochet%20order."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-3 text-sm font-bold text-white shadow-md shadow-emerald-600/20 transition hover:from-emerald-500 hover:to-teal-500 active:scale-98"
                >
                  <MessageCircle className="size-4.5" />
                  Order on WhatsApp (+91 7985835558)
                </a>
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                >
                  Contact Form & Details
                </Link>
              </div>
            </div>

            {/* Quick feature highlights */}
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-5 shadow-sm backdrop-blur dark:border-slate-700/60 dark:bg-slate-800/60">
                <p className="font-display text-2xl font-bold text-indigo-600 dark:text-indigo-400">Custom Colors</p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Choose from dozens of premium yarn palettes to match your nursery or home decor.</p>
              </div>
              <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-5 shadow-sm backdrop-blur dark:border-slate-700/60 dark:bg-slate-800/60">
                <p className="font-display text-2xl font-bold text-rose-600 dark:text-rose-400">Gift Packaging</p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Every piece comes tied with satin ribbons, care instructions, and optional handwritten notes.</p>
              </div>
              <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-5 shadow-sm backdrop-blur dark:border-slate-700/60 dark:bg-slate-800/60">
                <p className="font-display text-2xl font-bold text-emerald-600 dark:text-emerald-400">Safe & Soft</p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Made with child-safe safety eyes, hypoallergenic fiberfill, and ultra-soft non-toxic yarn.</p>
              </div>
              <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-5 shadow-sm backdrop-blur dark:border-slate-700/60 dark:bg-slate-800/60">
                <p className="font-display text-2xl font-bold text-amber-600 dark:text-amber-400">Direct Support</p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Talk directly to Shikha Rai and developer Shruti Rai for smooth updates.</p>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ============================================================
          5. CUSTOMER TESTIMONIALS (CollectUI Social Proof)
          ============================================================ */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="mb-10 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400">
            Customer Love
          </p>
          <h2 className="font-display mt-2 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl dark:text-slate-50">
            What our happy shoppers say
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {testimonials.map((t, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.45, delay: idx * 0.1 }}
              className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-6 shadow-soft transition-all duration-300 hover:shadow-lift dark:border-slate-800 dark:bg-slate-900/70"
            >
              <div className="space-y-3">
                <div className="flex gap-1 text-amber-400">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="size-4 fill-current" />
                  ))}
                </div>
                <p className="text-sm italic leading-relaxed text-slate-600 dark:text-slate-300">
                  "{t.comment}"
                </p>
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800">
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">
                    {t.name}
                  </p>
                  <p className="text-[11px] text-slate-400">{t.city}</p>
                </div>
                <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                  Verified Buyer
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ============================================================
          6. CLOSING CTA (Uiverse Inspired Glow Card)
          ============================================================ */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.55 }}
          className="relative overflow-hidden rounded-[2.5rem] bg-slate-950 bg-ink-grain px-8 py-16 text-center sm:py-20"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(circle at 50% 0%, rgb(230 182 182 / 0.22), transparent 60%)",
            }}
          />
          <h2 className="font-display relative text-4xl font-semibold tracking-tight text-slate-50 sm:text-5xl">
            Bring a little handmade warmth home.
          </h2>
          <p className="relative mx-auto mt-4 max-w-xl text-slate-300">
            Create an account for faster checkout, order tracking, and early
            access to new limited crochet drops.
          </p>
          <div className="relative mt-9 flex flex-wrap justify-center gap-3">
            <Link
              to="/register"
              className="group inline-flex h-13 items-center gap-2 rounded-2xl bg-gradient-to-r from-slate-100 to-white px-8 text-base font-bold text-slate-950 shadow-lift transition hover:bg-white active:scale-98"
            >
              Create Free Account
              <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              to="/products"
              className="inline-flex h-13 items-center rounded-2xl border border-white/20 px-8 text-base font-semibold text-slate-100 backdrop-blur transition hover:border-white/40 hover:bg-white/5 active:scale-98"
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
