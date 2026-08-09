import { Link } from "react-router-dom";
import { ArrowRight, BadgeCheck, RefreshCcw, ShieldCheck, Truck } from "lucide-react";
import { motion } from "framer-motion";
import { useFeaturedProducts, useCategories } from "@/hooks/useApi";
import { ProductGrid } from "@/components/product/ProductGrid";
import { Skeleton } from "@/components/ui/Card";
import { PageLayout } from "@/components/layout/PageLayout";

const perks = [
  { icon: Truck, title: "Fast Delivery", description: "Free shipping on orders over ₹500" },
  { icon: ShieldCheck, title: "Secure Payments", description: "Razorpay-powered encrypted checkout" },
  { icon: RefreshCcw, title: "Easy Returns", description: "7-day hassle-free return policy" },
  { icon: BadgeCheck, title: "Verified Quality", description: "100% authentic products, every time" },
];

export const LandingPage = () => {
  const { data: featured, isLoading: productsLoading } = useFeaturedProducts(8);
  const { data: categories, isLoading: categoriesLoading } = useCategories();

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600">
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 30%, white 1.5px, transparent 1.5px), radial-gradient(circle at 80% 70%, white 1.5px, transparent 1.5px)",
            backgroundSize: "48px 48px",
          }}
        />
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl"
          >
            <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-sm font-medium text-white backdrop-blur">
              <span className="size-2 rounded-full bg-emerald-300" />
              New season collection is live
            </span>
            <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-white sm:text-6xl">
              Discover products you&apos;ll love
            </h1>
            <p className="mt-5 text-lg text-indigo-100">
              Shop premium fashion, electronics and lifestyle essentials at
              prices that make sense. Delivered across India.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/products"
                className="inline-flex h-12 items-center gap-2 rounded-xl bg-white px-6 text-base font-semibold text-indigo-700 shadow-lg transition hover:bg-indigo-50"
              >
                Shop now <ArrowRight className="size-5" />
              </Link>
              <Link
                to="/categories"
                className="inline-flex h-12 items-center rounded-xl border border-white/30 px-6 text-base font-semibold text-white backdrop-blur transition hover:bg-white/10"
              >
                Browse categories
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Perks */}
      <section className="border-b border-slate-200 bg-white dark:border-slate-700/60 dark:bg-slate-900">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 py-10 sm:px-6 lg:grid-cols-4">
          {perks.map((perk) => (
            <div key={perk.title} className="flex items-start gap-3">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
                <perk.icon className="size-5" />
              </span>
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{perk.title}</h3>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{perk.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured products */}
      <PageLayout
        title="Featured products"
        subtitle="Hand-picked items our customers love"
        actions={
          <Link
            to="/products"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 transition hover:text-indigo-500 dark:text-indigo-400"
          >
            View all <ArrowRight className="size-4" />
          </Link>
        }
      >
        <ProductGrid products={featured} loading={productsLoading} />
      </PageLayout>

      {/* Categories */}
      <section className="border-t border-slate-200 bg-white py-14 dark:border-slate-700/60 dark:bg-slate-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
                Shop by category
              </h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Find exactly what you&apos;re looking for
              </p>
            </div>
            <Link
              to="/categories"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 transition hover:text-indigo-500 dark:text-indigo-400"
            >
              All categories <ArrowRight className="size-4" />
            </Link>
          </div>

          {categoriesLoading ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
              {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton key={index} className="aspect-square rounded-2xl" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
              {(categories ?? []).slice(0, 6).map((category) => (
                <Link
                  key={category._id}
                  to={`/categories/${category.slug}`}
                  className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-lg dark:border-slate-700 dark:bg-slate-800"
                >
                  <div className="relative aspect-square overflow-hidden bg-slate-100 dark:bg-slate-700/40">
                    {category.image ? (
                      <img
                        src={category.image}
                        alt={category.name}
                        loading="lazy"
                        className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex size-full items-center justify-center text-4xl font-bold text-slate-300 dark:text-slate-600">
                        {category.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                      {category.name}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 to-slate-700 px-8 py-14 text-center dark:from-indigo-950 dark:to-slate-900">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Ready to upgrade your everyday?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-slate-300">
            Create an account to unlock faster checkout, order tracking, and
            exclusive offers.
          </p>
          <Link
            to="/register"
            className="mt-8 inline-flex h-12 items-center gap-2 rounded-xl bg-white px-8 text-base font-semibold text-slate-900 shadow-lg transition hover:bg-slate-100"
          >
            Create free account <ArrowRight className="size-5" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
