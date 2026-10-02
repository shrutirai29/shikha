import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, MapPin, Phone, MessageCircle, Heart, Code, Sparkles } from "lucide-react";
import { Logo } from "./Logo";
import { useSubscribeNewsletter } from "@/hooks/useApi";
import { useToast } from "@/context/ToastContext";
import { getErrorMessage } from "@/lib/api";

export const Footer = () => {
  const [email, setEmail] = useState("");
  const subscribe = useSubscribeNewsletter();
  const toast = useToast();

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }
    try {
      const res = await subscribe.mutateAsync(email.trim());
      toast.success(res.message || "Thank you for subscribing! ✨");
      setEmail("");
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <footer className="relative z-20 border-t border-[#493A34] bg-[#3B2924] text-[#FFF4E8] dark:border-[#382823] dark:bg-[#0E0908]">
      {/* Newsletter Section */}
      <div className="border-b border-[#493A34] dark:border-[#382823] py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-4 sm:flex-row sm:px-6">
          <div className="text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <Sparkles className="size-4 text-[#D8A85B] dark:text-[#E0B86A]" />
              <span className="text-xs font-semibold uppercase tracking-wider text-[#D8A85B] dark:text-[#E0B86A]">
                Join the Knottiingale Circle
              </span>
            </div>
            <h3 className="mt-1 text-lg font-semibold text-white">
              Get 10% off your first handcrafted crochet order
            </h3>
            <p className="mt-0.5 text-xs text-[#C7B8AE] dark:text-[#B3A198]">
              Be the first to hear about seasonal drops, secret coupon codes, and crochet care tips.
            </p>
          </div>
          <form onSubmit={handleSubscribe} className="flex w-full max-w-md gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="w-full rounded-xl border border-[#5A463E] bg-[#2C1F1B] px-4 py-2.5 text-sm text-white placeholder-[#806E66] outline-none transition focus:border-[#D8A85B] dark:border-[#3A2A24] dark:bg-[#1A1210]"
            />
            <button
              type="submit"
              disabled={subscribe.isPending}
              className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl bg-[#D8A85B] px-5 py-2.5 text-sm font-semibold text-[#1F1816] transition hover:bg-[#E0B86A] disabled:opacity-50"
            >
              {subscribe.isPending ? "Subscribing..." : "Subscribe"}
            </button>
          </form>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
      {/* Brand & Owner Info */}
      <div className="space-y-4">
        <Logo inverted />
        <p className="text-sm text-[#C7B8AE] dark:text-[#B3A198] leading-relaxed">
          Handmade crochet treasures, stitched with love and delivered to your
          door across India. Every piece is made slowly, with care.
        </p>
        <div className="pt-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#A8988F]">
            Founded & Crafted By
          </p>
          <p className="text-sm font-semibold text-white">
            Shikha Rai
          </p>
          <a
            href="https://wa.me/917985835558?text=Hello%20Shikha%2C%20I%20have%20an%20inquiry%20about%20Knottiingale%20crochet%20products."
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-[#D8A85B] hover:text-[#FFF4E8] transition-colors dark:text-[#E0B86A]"
          >
            <MessageCircle className="size-3.5" />
            WhatsApp: +91 7985835558
          </a>
        </div>
      </div>

      {/* Shop Links */}
      <div>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-white">
          Shop & Explore
        </h3>
        <ul className="space-y-2 text-sm text-[#C7B8AE]">
          <li>
            <Link to="/products" className="transition hover:text-[#D8A85B] dark:hover:text-[#E0B86A]">
              All products
            </Link>
          </li>
          <li>
            <Link to="/categories" className="transition hover:text-[#D8A85B] dark:hover:text-[#E0B86A]">
              Categories
            </Link>
          </li>
          <li>
            <Link to="/search" className="transition hover:text-[#D8A85B] dark:hover:text-[#E0B86A]">
              Search
            </Link>
          </li>
          <li>
            <Link to="/wishlist" className="transition hover:text-[#D8A85B] dark:hover:text-[#E0B86A]">
              My Wishlist
            </Link>
          </li>
          <li>
            <Link to="/cart" className="transition hover:text-[#D8A85B] dark:hover:text-[#E0B86A]">
              Cart
            </Link>
          </li>
        </ul>
      </div>

      {/* Customer Care & Policies */}
      <div>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-white">
          Policies & Help
        </h3>
        <ul className="space-y-2 text-sm text-[#C7B8AE]">
          <li>
            <Link to="/contact" className="transition hover:text-[#D8A85B] dark:hover:text-[#E0B86A]">
              Contact & Custom Orders
            </Link>
          </li>
          <li>
            <Link to="/shipping-policy" className="transition hover:text-[#D8A85B] dark:hover:text-[#E0B86A]">
              Shipping & Delivery
            </Link>
          </li>
          <li>
            <Link to="/refund-policy" className="transition hover:text-[#D8A85B] dark:hover:text-[#E0B86A]">
              Cancellation & Returns
            </Link>
          </li>
          <li>
            <Link to="/terms" className="transition hover:text-[#D8A85B] dark:hover:text-[#E0B86A]">
              Terms & Conditions
            </Link>
          </li>
          <li>
            <Link to="/privacy" className="transition hover:text-[#D8A85B] dark:hover:text-[#E0B86A]">
              Privacy Policy
            </Link>
          </li>
        </ul>
      </div>

      {/* Contact & Developer Info */}
      <div>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-white">
          Contact Details
        </h3>
        <ul className="space-y-2.5 text-sm text-[#C7B8AE]">
          <li>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#A8988F]">
              Owner Inquiries
            </p>
            <a
              href="tel:+917985835558"
              className="mt-0.5 flex items-center gap-2 font-medium text-white transition hover:text-[#D8A85B] dark:hover:text-[#E0B86A]"
            >
              <Phone className="size-4 shrink-0 text-[#D8A85B]" />
              +91 7985835558 (Shikha Rai)
            </a>
          </li>
          <li className="pt-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#A8988F]">
              Developer & Tech Support
            </p>
            <a
              href="tel:+917007787536"
              className="mt-0.5 flex items-center gap-2 text-[#C7B8AE] transition hover:text-[#D8A85B] dark:hover:text-[#E0B86A]"
            >
              <Phone className="size-4 shrink-0 text-[#A8988F]" />
              +91 7007787536 (Shruti Rai)
            </a>
            <a
              href="mailto:shruti.rai2901@gmail.com"
              className="mt-1 flex items-center gap-2 text-[#C7B8AE] transition hover:text-[#D8A85B] dark:hover:text-[#E0B86A]"
            >
              <Mail className="size-4 shrink-0 text-[#A8988F]" />
              shruti.rai2901@gmail.com
            </a>
          </li>
          <li className="flex items-start gap-2 pt-1 text-xs text-[#A8988F]">
            <MapPin className="mt-0.5 size-3.5 shrink-0" />
            <span>Knottiingale Studio · India</span>
          </li>
        </ul>
      </div>
    </div>

    {/* Bottom Copyright & Developer Credit */}
    <div className="border-t border-[#493A34] dark:border-[#382823] py-5">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 text-xs text-[#A8988F] dark:text-[#B3A198] sm:flex-row sm:px-6">
        <p>
          © {new Date().getFullYear()} <span className="font-semibold text-white">Knottiingale</span>. All rights reserved. Owned by Shikha Rai.
        </p>
        <p className="flex items-center gap-1.5 text-center">
          <Code className="size-3.5" />
          <span>Developed with <Heart className="inline size-3 fill-[#C98F8B] text-[#C98F8B]" /> by</span>
          <a
            href="mailto:shruti.rai2901@gmail.com"
            className="font-medium text-white transition hover:text-[#D8A85B] dark:hover:text-[#E0B86A]"
          >
            Shruti Rai
          </a>
          <span>·</span>
          <a
            href="tel:+917007787536"
            className="transition hover:text-[#D8A85B] dark:hover:text-[#E0B86A]"
          >
            +91 7007787536
          </a>
        </p>
      </div>
    </div>
  </footer>
  );
};

export default Footer;
