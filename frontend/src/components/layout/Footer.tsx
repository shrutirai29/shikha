import { Link } from "react-router-dom";
import { Mail, MapPin, Phone, MessageCircle, Heart, Code } from "lucide-react";
import { Logo } from "./Logo";

export const Footer = () => (
  <footer className="border-t border-slate-200 bg-white dark:border-slate-700/60 dark:bg-slate-900">
    <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
      {/* Brand & Owner Info */}
      <div className="space-y-4">
        <Logo />
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Handmade crochet treasures, stitched with love and delivered to your
          door across India. Every piece is made slowly, with care.
        </p>
        <div className="pt-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Founded & Crafted By
          </p>
          <p className="text-sm font-semibold text-slate-900 dark:text-white">
            Shikha Rai
          </p>
          <a
            href="https://wa.me/917985835558?text=Hello%20Shikha%2C%20I%20have%20an%20inquiry%20about%20Knottiingale%20crochet%20products."
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 hover:text-emerald-500 dark:text-emerald-400"
          >
            <MessageCircle className="size-3.5" />
            WhatsApp: +91 7985835558
          </a>
        </div>
      </div>

      {/* Shop Links */}
      <div>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-900 dark:text-white">
          Shop & Explore
        </h3>
        <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
          <li>
            <Link to="/products" className="transition hover:text-indigo-600 dark:hover:text-indigo-400">
              All products
            </Link>
          </li>
          <li>
            <Link to="/categories" className="transition hover:text-indigo-600 dark:hover:text-indigo-400">
              Categories
            </Link>
          </li>
          <li>
            <Link to="/search" className="transition hover:text-indigo-600 dark:hover:text-indigo-400">
              Search
            </Link>
          </li>
          <li>
            <Link to="/wishlist" className="transition hover:text-indigo-600 dark:hover:text-indigo-400">
              My Wishlist
            </Link>
          </li>
          <li>
            <Link to="/cart" className="transition hover:text-indigo-600 dark:hover:text-indigo-400">
              Cart
            </Link>
          </li>
        </ul>
      </div>

      {/* Customer Care & Policies */}
      <div>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-900 dark:text-white">
          Policies & Help
        </h3>
        <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
          <li>
            <Link to="/contact" className="transition hover:text-indigo-600 dark:hover:text-indigo-400">
              Contact & Custom Orders
            </Link>
          </li>
          <li>
            <Link to="/shipping-policy" className="transition hover:text-indigo-600 dark:hover:text-indigo-400">
              Shipping & Delivery
            </Link>
          </li>
          <li>
            <Link to="/refund-policy" className="transition hover:text-indigo-600 dark:hover:text-indigo-400">
              Cancellation & Returns
            </Link>
          </li>
          <li>
            <Link to="/terms" className="transition hover:text-indigo-600 dark:hover:text-indigo-400">
              Terms & Conditions
            </Link>
          </li>
          <li>
            <Link to="/privacy" className="transition hover:text-indigo-600 dark:hover:text-indigo-400">
              Privacy Policy
            </Link>
          </li>
        </ul>
      </div>

      {/* Contact & Developer Info */}
      <div>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-900 dark:text-white">
          Contact Details
        </h3>
        <ul className="space-y-2.5 text-sm text-slate-500 dark:text-slate-400">
          <li>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Owner Inquiries
            </p>
            <a
              href="tel:+917985835558"
              className="mt-0.5 flex items-center gap-2 font-medium text-slate-700 transition hover:text-indigo-600 dark:text-slate-200 dark:hover:text-indigo-400"
            >
              <Phone className="size-4 shrink-0 text-slate-400" />
              +91 7985835558 (Shikha Rai)
            </a>
          </li>
          <li className="pt-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Developer & Tech Support
            </p>
            <a
              href="tel:+917007787536"
              className="mt-0.5 flex items-center gap-2 text-slate-600 transition hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-400"
            >
              <Phone className="size-4 shrink-0 text-slate-400" />
              +91 7007787536 (Shruti Rai)
            </a>
            <a
              href="mailto:shruti.rai2901@gmail.com"
              className="mt-1 flex items-center gap-2 text-slate-600 transition hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-400"
            >
              <Mail className="size-4 shrink-0 text-slate-400" />
              shruti.rai2901@gmail.com
            </a>
          </li>
          <li className="flex items-start gap-2 pt-1 text-xs text-slate-400 dark:text-slate-500">
            <MapPin className="mt-0.5 size-3.5 shrink-0" />
            <span>Knottiingale Studio · India</span>
          </li>
        </ul>
      </div>
    </div>

    {/* Bottom Copyright & Developer Credit */}
    <div className="border-t border-slate-200 py-5 dark:border-slate-700/60">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 text-xs text-slate-400 sm:flex-row sm:px-6 dark:text-slate-500">
        <p>
          © {new Date().getFullYear()} <span className="font-semibold text-slate-700 dark:text-slate-300">Knottiingale</span>. All rights reserved. Owned by Shikha Rai.
        </p>
        <p className="flex items-center gap-1.5 text-center">
          <Code className="size-3.5" />
          <span>Developed with <Heart className="inline size-3 fill-rose-500 text-rose-500" /> by</span>
          <a
            href="mailto:shruti.rai2901@gmail.com"
            className="font-medium text-slate-700 transition hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-400"
          >
            Shruti Rai
          </a>
          <span>·</span>
          <a
            href="tel:+917007787536"
            className="transition hover:text-indigo-600 dark:hover:text-indigo-400"
          >
            +91 7007787536
          </a>
        </p>
      </div>
    </div>
  </footer>
);

export default Footer;
