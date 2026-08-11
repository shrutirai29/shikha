import { Suspense, lazy, useMemo } from "react";
import { Link } from "react-router-dom";
import { usePageTitle } from "@/hooks/usePageTitle";
import {
  ArrowRight,
  BadgeCheck,
  RefreshCcw,
  ShieldCheck,
  Sparkles,
  Truck,
} from "lucide-react";
import { motion } from "framer-motion";
import { useFeaturedProducts } from "@/hooks/useApi";
import { ProductGrid } from "@/components/product/ProductGrid";
import { Skeleton } from "@/components/ui/Card";
import type { Category, Product } from "@/types";

const ProductStage = lazy(() => import("@/components/three/ProductStage"));

const perks = [
  { icon: Truck, title: "Fast Delivery", description: "Free shipping on orders over ₹500" },
  { icon: ShieldCheck, title: "Secure Payments", description: "Razorpay-powered encrypted checkout" },
  { icon: RefreshCcw, title: "Easy Returns", description: "7-day hassle-free return policy" },
  { icon: BadgeCheck, title: "Handmade with Love", description: "Every piece crafted slowly, stitch by stitch" },
];

export const LandingPage = () => {
  usePageTitle("Home");
  const { data: featured, isLoading: productsLoading } = useFeaturedProducts(24);

  // The first featured product becomes the hero's 3D presentation.
  const heroImage = featured?.[0]?.images?.[0];

  // Group the featured picks by their category so shoppers can browse
  // "Featured — Fashion", "Featured — Electronics", etc.
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
      {/* ============ 1. Featured products, by category ============ */}
      <section className="mx-auto max-w-7xl px-4 pb-4 pt-10 sm:px-6 sm:pt-14">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10 text-center"
        >
          <p className="inline-flex items-center gap-2 rounded-full border border-indigo-300/40 bg-indigo-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-indigo-600 dark:border-indigo-500/25 dark:bg-indigo-500/10 dark:text-indigo-300">
            <Sparkles className="size-3.5" />
            Curated for you
          </p>
          <h1 className="font-display mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-5xl dark:text-slate-50">
            Featured by category
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm text-slate-500 sm:text-base dark:text-slate-400">
            Hand-picked pieces from across our collections — find something
            beautiful in every category.
          </p>
        </motion.div>

        {productsLoading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <Skeleton key={index} className="aspect-square rounded-2xl" />
            ))}
          </div>
        ) : showGrouped ? (
          <div className="space-y-14">
            {categoryGroups.map((group, groupIndex) => (
              <motion.section
                key={group.category._id}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: Math.min(groupIndex * 0.05, 0.2) }}
                aria-label={`Featured ${group.category.name}`}
              >
                <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-300">
                      Featured
                    </p>
                    <h2 className="font-display mt-1 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl dark:text-slate-50">
                      {group.category.name}
                    </h2>
                  </div>
                  <Link
                    to={`/categories/${group.category.slug}`}
                    className="group inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 transition hover:text-indigo-500 dark:text-indigo-300 dark:hover:text-indigo-200"
                  >
                    View all {group.category.name}
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </div>

                <ProductGrid products={group.products.slice(0, 4)} loading={false} />
              </motion.section>
            ))}
          </div>
        ) : (
          <ProductGrid products={featured ?? []} loading={false} />
        )}

        {/* Trust strip */}
        <div className="mt-14 grid grid-cols-2 gap-6 border-t border-slate-200 pt-10 dark:border-slate-700/60 lg:grid-cols-4">
          {perks.map((perk, index) => (
            <motion.div
              key={perk.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.45, delay: index * 0.06 }}
              className="group flex items-start gap-3"
            >
              <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl border border-indigo-200 bg-indigo-50 text-indigo-600 transition group-hover:border-indigo-300 dark:border-indigo-500/20 dark:bg-indigo-500/10 dark:text-indigo-300">
                <perk.icon className="size-5" />
              </span>
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50">
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

      {/* ============ 2. Hero ============ */}
      <section className="relative overflow-hidden bg-slate-950 bg-ink-grain">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 pb-20 pt-14 sm:px-6 lg:grid-cols-2 lg:gap-8 lg:pb-28 lg:pt-24">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-xl"
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-indigo-300/30 bg-white/5 px-4 py-1.5 text-sm font-medium text-indigo-200 backdrop-blur">
              <Sparkles className="size-3.5" />
              New handmade collection is live
            </span>

            <h2 className="font-display mt-6 text-5xl font-semibold leading-[1.05] tracking-tight text-slate-50 sm:text-6xl lg:text-7xl">
              Handmade with love,
              <span className="block italic text-indigo-300">one stitch at a time.</span>
            </h2>

            <p className="mt-6 max-w-md text-lg leading-relaxed text-slate-300">
              Cozy crochet creations — soft toys, warm throws and everyday
              little treasures — made slowly, with care, and delivered
              across India.
            </p>

            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                to="/products"
                className="group inline-flex h-13 items-center gap-2 rounded-full bg-slate-100 px-7 text-base font-semibold text-slate-950 shadow-lift transition hover:bg-white"
              >
                Shop now
                <ArrowRight className="size-4.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                to="/categories"
                className="inline-flex h-13 items-center rounded-full border border-white/20 px-7 text-base font-semibold text-slate-100 backdrop-blur transition hover:border-white/40 hover:bg-white/5"
              >
                Browse categories
              </Link>
            </div>

            <dl className="mt-12 flex gap-10 text-slate-300">
              <div>
                <dt className="font-display text-3xl font-semibold text-slate-50">
                  {featured?.length ? `${featured.length}+` : "4.9"}
                </dt>
                <dd className="mt-1 text-xs uppercase tracking-widest text-slate-400">
                  Loved by shoppers
                </dd>
              </div>
              <div>
                <dt className="font-display text-3xl font-semibold text-slate-50">24h</dt>
                <dd className="mt-1 text-xs uppercase tracking-widest text-slate-400">
                  Dispatch time
                </dd>
              </div>
              <div>
                <dt className="font-display text-3xl font-semibold text-slate-50">100%</dt>
                <dd className="mt-1 text-xs uppercase tracking-widest text-slate-400">
                  Handmade with love
                </dd>
              </div>
            </dl>
          </motion.div>

          {/* 3D product presentation */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="relative mx-auto w-full max-w-md lg:max-w-none"
          >
            <Suspense
              fallback={
                <div className="flex aspect-square w-full items-center justify-center rounded-[2rem] bg-slate-900">
                  <div className="size-44 animate-pulse rounded-full bg-slate-800" />
                </div>
              }
            >
              <ProductStage
                imageUrl={heroImage}
                label="Featured product presentation"
                className="aspect-square w-full"
              />
            </Suspense>
          </motion.div>
        </div>

        {/* bottom fade into page background */}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent to-slate-50 dark:to-slate-950"
        />
      </section>

      {/* ============ 3. CTA ============ */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.55 }}
          className="relative overflow-hidden rounded-[2rem] bg-slate-950 bg-ink-grain px-8 py-16 text-center sm:py-20"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(circle at 50% 0%, rgb(201 173 167 / 0.18), transparent 55%)",
            }}
          />
          <h2 className="font-display relative text-4xl font-semibold tracking-tight text-slate-50 sm:text-5xl">
            Bring a little handmade warmth home?
          </h2>
          <p className="relative mx-auto mt-4 max-w-xl text-slate-300">
            Create an account for faster checkout, order tracking, and early
            access to new handmade drops.
          </p>
          <Link
            to="/register"
            className="group relative mt-9 inline-flex h-13 items-center gap-2 rounded-full bg-slate-100 px-8 text-base font-semibold text-slate-950 shadow-lift transition hover:bg-white"
          >
            Create free account
            <ArrowRight className="size-5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </motion.div>
      </section>
    </div>
  );
};

export default LandingPage;
