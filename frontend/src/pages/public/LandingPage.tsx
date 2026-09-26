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
          1. HERO SECTION (Warm artisanal first impression)
          ============================================================ */}
      <section className="relative overflow-hidden bg-[#FFF8F0] dark:bg-[#1F1816] bg-ink-grain">
        {/* Ambient background glow orbs */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 size-[650px] rounded-full bg-gradient-to-tr from-[#C98F8B]/15 via-[#B85C4A]/10 to-transparent blur-3xl dark:from-[#D8A09B]/15 dark:via-[#D47763]/10"
        />

        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 pb-20 pt-12 sm:px-6 lg:grid-cols-2 lg:gap-12 lg:pb-28 lg:pt-20">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-xl"
          >
            {/* Pulsing announcement pill */}
            <span className="relative inline-flex items-center gap-2 overflow-hidden rounded-full border border-[#B85C4A]/25 bg-[#FFFCF7] px-4 py-1.5 text-xs font-semibold text-[#B85C4A] shadow-soft dark:border-[#D47763]/30 dark:bg-[#2A211E] dark:text-[#D47763]">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-[#C98F8B] opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-[#B85C4A] dark:bg-[#D47763]" />
              </span>
              Handcrafted Collection · Fresh Drops Live
            </span>

            <h1 className="font-display mt-6 text-4xl font-semibold leading-[1.08] tracking-tight text-[#3B2924] sm:text-6xl lg:text-7xl dark:text-[#FFF4E8]">
              Handmade with love,{" "}
              <span className="block italic text-[#B85C4A] dark:text-[#D47763]">
                one stitch at a time.
              </span>
            </h1>

            <p className="mt-6 max-w-lg text-base leading-relaxed text-[#806E66] sm:text-lg dark:text-[#C7B8AE]">
              Welcome to <strong className="text-[#3B2924] dark:text-[#FFF4E8]">Knottiingale</strong>. Soft plush toys, cozy
              warm throws, and heartfelt artisanal gifts — hand-crocheted slowly
              with care by <strong className="text-[#3B2924] dark:text-[#FFF4E8]">Shikha Rai</strong> and delivered across India.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3.5">
              <Link
                to="/products"
                className="group relative inline-flex h-12.5 items-center gap-2 rounded-2xl bg-[#B85C4A] px-7 text-sm font-bold text-white shadow-soft transition hover:bg-[#914536] hover:shadow-lift active:scale-98 dark:bg-[#D47763] dark:text-[#1F1816] dark:hover:bg-[#E28A76]"
              >
                Explore Collection
                <ArrowRight className="size-4.5 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                to="/contact"
                className="inline-flex h-12.5 items-center gap-2 rounded-2xl border border-[#7A8B68] bg-[#FFFCF7] px-6 text-sm font-semibold text-[#7A8B68] shadow-sm transition hover:bg-[#7A8B68]/10 active:scale-98 dark:border-[#9BAF83] dark:bg-[#2A211E] dark:text-[#9BAF83] dark:hover:bg-[#9BAF83]/10"
              >
                Custom Order Inquiry
              </Link>
            </div>

            {/* Social Proof metrics */}
            <dl className="mt-12 flex gap-8 border-t border-[#E8DCD0] pt-6 text-[#806E66] sm:gap-12 dark:border-[#493A34] dark:text-[#C7B8AE]">
              <div>
                <dt className="font-display text-2xl font-bold text-[#3B2924] sm:text-3xl dark:text-[#FFF4E8]">
                  {featured?.length ? `${featured.length}+` : "4.9"}
                </dt>
                <dd className="mt-0.5 text-[11px] font-semibold uppercase tracking-widest text-[#806E66] dark:text-[#C7B8AE]">
                  Unique Pieces
                </dd>
              </div>
              <div>
                <dt className="font-display text-2xl font-bold text-[#3B2924] sm:text-3xl dark:text-[#FFF4E8]">
                  24–48h
                </dt>
                <dd className="mt-0.5 text-[11px] font-semibold uppercase tracking-widest text-[#806E66] dark:text-[#C7B8AE]">
                  Fast Dispatch
                </dd>
              </div>
              <div>
                <dt className="font-display text-2xl font-bold text-[#3B2924] sm:text-3xl dark:text-[#FFF4E8]">
                  100%
                </dt>
                <dd className="mt-0.5 text-[11px] font-semibold uppercase tracking-widest text-[#806E66] dark:text-[#C7B8AE]">
                  Handmade Craft
                </dd>
              </div>
            </dl>
          </motion.div>

          {/* Featured Artisan Showcase */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="relative mx-auto w-full max-w-md lg:max-w-none"
          >
            {/* Soft Ambient Glow */}
            <div
              aria-hidden="true"
              className="absolute -inset-1 rounded-[3rem] bg-gradient-to-r from-[#C98F8B]/20 via-[#B85C4A]/25 to-[#D8A85B]/20 blur-2xl opacity-60 dark:from-[#D8A09B]/20 dark:via-[#D47763]/25"
            />

            <div className="relative overflow-hidden rounded-[2.5rem] border border-[#E8DCD0] bg-[#FFFCF7] p-6 shadow-soft dark:border-[#493A34] dark:bg-[#2A211E]">
              {heroProduct?.images?.[0] ? (
                <div className="group relative aspect-square overflow-hidden rounded-[2rem] bg-[#F5EDE4] dark:bg-[#1F1816] ring-1 ring-inset ring-[#3B2924]/5 dark:ring-white/5">
                  <img
                    src={heroProduct.images[0]}
                    alt={heroProduct.name}
                    className="size-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1F1816]/90 via-[#1F1816]/25 to-transparent" />

                  {/* Top Bestseller Badge */}
                  <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full border border-white/20 bg-[#1F1816]/75 px-3.5 py-1 text-xs font-semibold text-[#D8A85B] backdrop-blur-md">
                    <Sparkles className="size-3.5 text-[#D8A85B]" />
                    Bestseller of the Week
                  </div>

                  {/* Bottom Info Overlay */}
                  <div className="absolute bottom-5 left-5 right-5 space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wider text-[#C98F8B]">
                      Featured Handcraft
                    </p>
                    <div className="flex items-end justify-between gap-3">
                      <div>
                        <h3 className="font-display text-xl font-bold text-white line-clamp-1">
                          {heroProduct.name}
                        </h3>
                        <p className="text-base font-semibold text-[#FFF4E8]">
                          {formatCurrency(heroProduct.price)}
                        </p>
                      </div>
                      <Link
                        to={`/products/${heroProduct.slug}`}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-[#B85C4A] px-4 py-2 text-xs font-bold text-white shadow-md transition hover:bg-[#914536] active:scale-95 dark:bg-[#D47763] dark:text-[#1F1816] dark:hover:bg-[#E28A76]"
                      >
                        View Piece
                        <ArrowRight className="size-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex aspect-square flex-col justify-between rounded-[2rem] bg-gradient-to-br from-[#F5EDE4] to-[#E8DCD0] p-8 border border-[#E8DCD0] dark:border-[#493A34] dark:from-[#352925] dark:to-[#1F1816]">
                  <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[#B85C4A]/30 bg-[#B85C4A]/10 px-3.5 py-1 text-xs font-semibold text-[#B85C4A] dark:text-[#D47763]">
                    <Sparkles className="size-3.5 text-[#D8A85B]" />
                    Artisan Spotlight
                  </div>

                  <div className="space-y-3">
                    <span className="text-4xl">🧶</span>
                    <h3 className="font-display text-2xl font-bold text-[#3B2924] dark:text-[#FFF4E8]">
                      Every Stitch Woven with Love
                    </h3>
                    <p className="text-sm leading-relaxed text-[#806E66] dark:text-[#C7B8AE]">
                      Explore slow-made crochet plushies, winter wearables, and home accessories hand-crocheted by Shikha Rai in India.
                    </p>
                  </div>

                  <Link
                    to="/products"
                    className="inline-flex w-fit items-center gap-2 rounded-xl bg-[#B85C4A] px-5 py-2.5 text-xs font-bold text-white shadow-soft transition hover:bg-[#914536] dark:bg-[#D47763] dark:text-[#1F1816]"
                  >
                    Browse All Handcrafted Pieces
                    <ArrowRight className="size-3.5" />
                  </Link>
                </div>
              )}

              {/* Trust badges footer */}
              <div className="mt-4 flex flex-wrap items-center justify-between gap-2 pt-2 text-xs text-[#806E66] dark:text-[#C7B8AE]">
                <span className="flex items-center gap-1.5 font-medium text-[#7A8B68] dark:text-[#9BAF83]">
                  <BadgeCheck className="size-4 text-[#7A8B68] dark:text-[#9BAF83]" />
                  100% Cotton & Azo-Free Wool
                </span>
                <span className="flex items-center gap-1 text-[#D8A85B] dark:text-[#E0B86A] font-semibold">
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
          className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-b from-transparent to-[#FFF8F0] dark:to-[#1F1816]"
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
