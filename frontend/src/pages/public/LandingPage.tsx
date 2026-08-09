import { Suspense, lazy } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BadgeCheck,
  RefreshCcw,
  ShieldCheck,
  Sparkles,
  Truck,
} from "lucide-react";
import { motion } from "framer-motion";
import { useFeaturedProducts, useCategories } from "@/hooks/useApi";
import { ProductGrid } from "@/components/product/ProductGrid";
import { Skeleton } from "@/components/ui/Card";

const ProductStage = lazy(() => import("@/components/three/ProductStage"));

const perks = [
  { icon: Truck, title: "Fast Delivery", description: "Free shipping on orders over ₹500" },
  { icon: ShieldCheck, title: "Secure Payments", description: "Razorpay-powered encrypted checkout" },
  { icon: RefreshCcw, title: "Easy Returns", description: "7-day hassle-free return policy" },
  { icon: BadgeCheck, title: "Verified Quality", description: "100% authentic products, every time" },
];

export const LandingPage = () => {
  const { data: featured, isLoading: productsLoading } = useFeaturedProducts(8);
  const { data: categories, isLoading: categoriesLoading } = useCategories();

  const heroImage = featured?.[0]?.images?.[0];

  return (
    <div>
      {/* ============ Hero ============ */}
      <section className="relative overflow-hidden bg-slate-950 bg-ink-grain">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 pb-20 pt-14 sm:px-6 lg:grid-cols-2 lg:gap-8 lg:pb-28 lg:pt-24">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-xl"
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-indigo-300/30 bg-white/5 px-4 py-1.5 text-sm font-medium text-indigo-200 backdrop-blur">
              <Sparkles className="size-3.5" />
              New season collection is live
            </span>

            <h1 className="font-display mt-6 text-5xl font-semibold leading-[1.05] tracking-tight text-slate-50 sm:text-6xl lg:text-7xl">
              Everyday essentials,
              <span className="block italic text-indigo-300">beautifully made.</span>
            </h1>

            <p className="mt-6 max-w-md text-lg leading-relaxed text-slate-300">
              Shop premium fashion, electronics and lifestyle pieces curated
              for the way you live — delivered across India.
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
                  Featured picks
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
                  Secure checkout
                </dd>
              </div>
            </dl>
          </motion.div>

          {/* 3D product presentation */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
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

      {/* ============ Perks ============ */}
      <section className="border-b border-slate-200 bg-white dark:border-slate-700/60 dark:bg-slate-900">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 py-12 sm:px-6 lg:grid-cols-4">
          {perks.map((perk, index) => (
            <motion.div
              key={perk.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
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

      {/* ============ Featured products ============ */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5 }}
          className="mb-10 flex flex-wrap items-end justify-between gap-4"
        >
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-300">
              Curated for you
            </p>
            <h2 className="font-display mt-2 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl dark:text-slate-50">
              Featured products
            </h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Hand-picked pieces our customers love
            </p>
          </div>
          <Link
            to="/products"
            className="group inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 transition hover:text-indigo-500 dark:text-indigo-300 dark:hover:text-indigo-200"
          >
            View all
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </motion.div>

        <ProductGrid products={featured} loading={productsLoading} />
      </section>

      {/* ============ Categories ============ */}
      <section className="border-y border-slate-200 bg-white py-16 dark:border-slate-700/60 dark:bg-slate-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5 }}
            className="mb-10 flex flex-wrap items-end justify-between gap-4"
          >
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-300">
                Explore
              </p>
              <h2 className="font-display mt-2 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl dark:text-slate-50">
                Shop by category
              </h2>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Find exactly what you&apos;re looking for
              </p>
            </div>
            <Link
              to="/categories"
              className="group inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 transition hover:text-indigo-500 dark:text-indigo-300 dark:hover:text-indigo-200"
            >
              All categories
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </motion.div>

          {categoriesLoading ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
              {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton key={index} className="aspect-square rounded-2xl" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
              {(categories ?? []).slice(0, 6).map((category, index) => (
                <motion.div
                  key={category._id}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                >
                  <Link
                    to={`/categories/${category.slug}`}
                    className="group block overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft transition duration-300 hover:-translate-y-1 hover:shadow-lift dark:border-slate-700 dark:bg-slate-800"
                  >
                    <div className="relative aspect-square overflow-hidden bg-slate-100 dark:bg-slate-700/40">
                      {category.image ? (
                        <img
                          src={category.image}
                          alt={category.name}
                          loading="lazy"
                          className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex size-full items-center justify-center">
                          <span className="font-display text-5xl font-semibold text-indigo-200 dark:text-indigo-400/60">
                            {category.name.charAt(0)}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="text-sm font-semibold text-slate-900 transition group-hover:text-indigo-600 dark:text-slate-50 dark:group-hover:text-indigo-300">
                        {category.name}
                      </h3>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ============ CTA ============ */}
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
            Ready to upgrade your everyday?
          </h2>
          <p className="relative mx-auto mt-4 max-w-xl text-slate-300">
            Create an account to unlock faster checkout, order tracking, and
            exclusive offers.
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
