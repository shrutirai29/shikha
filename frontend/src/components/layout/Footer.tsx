import { Link } from "react-router-dom";
import { Mail, MapPin, Phone } from "lucide-react";
import { Logo } from "./Logo";

export const Footer = () => (
  <footer className="border-t border-slate-200 bg-white dark:border-slate-700/60 dark:bg-slate-900">
    <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
      <div className="space-y-3">
        <Logo />
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Premium online store for fashion, electronics and lifestyle products.
          Quality you can trust, delivered to your door.
        </p>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-900 dark:text-white">
          Shop
        </h3>
        <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
          <li><Link to="/products" className="transition hover:text-indigo-600 dark:hover:text-indigo-400">All products</Link></li>
          <li><Link to="/categories" className="transition hover:text-indigo-600 dark:hover:text-indigo-400">Categories</Link></li>
          <li><Link to="/search" className="transition hover:text-indigo-600 dark:hover:text-indigo-400">Search</Link></li>
        </ul>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-900 dark:text-white">
          Account
        </h3>
        <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
          <li><Link to="/profile" className="transition hover:text-indigo-600 dark:hover:text-indigo-400">My profile</Link></li>
          <li><Link to="/orders" className="transition hover:text-indigo-600 dark:hover:text-indigo-400">My orders</Link></li>
          <li><Link to="/wishlist" className="transition hover:text-indigo-600 dark:hover:text-indigo-400">Wishlist</Link></li>
          <li><Link to="/cart" className="transition hover:text-indigo-600 dark:hover:text-indigo-400">Cart</Link></li>
        </ul>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-900 dark:text-white">
          Contact
        </h3>
        <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
          <li className="flex items-center gap-2"><Phone className="size-4" /> +91 98765 43210</li>
          <li className="flex items-center gap-2"><Mail className="size-4" /> support@shikha.store</li>
          <li className="flex items-start gap-2"><MapPin className="mt-0.5 size-4" /> Mumbai, Maharashtra, India</li>
        </ul>
      </div>
    </div>

    <div className="border-t border-slate-200 py-5 dark:border-slate-700/60">
      <p className="text-center text-xs text-slate-400 dark:text-slate-500">
        © {new Date().getFullYear()} Shikha. All rights reserved.
      </p>
    </div>
  </footer>
);
