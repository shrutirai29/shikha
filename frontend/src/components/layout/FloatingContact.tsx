import { useState } from "react";
import { MessageCircle, X, Phone, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const FloatingContact = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end">
      {/* Popover Card */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="mb-3 w-80 overflow-hidden rounded-2xl border border-slate-200/80 bg-white/95 p-5 shadow-2xl backdrop-blur-xl dark:border-slate-700/80 dark:bg-slate-900/95"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="relative flex size-2.5">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex size-2.5 rounded-full bg-emerald-500" />
                </span>
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Knottiingale Studio
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                aria-label="Close contact card"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="my-3 space-y-1">
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                Looking for a custom crochet piece?
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Connect directly with founder & artisan <strong>Shikha Rai</strong> for custom sizes, personalized gifts, or order queries.
              </p>
            </div>

            <div className="space-y-2 pt-1">
              <a
                href="https://wa.me/917985835558?text=Hello%20Shikha%2C%20I%20have%20an%20inquiry%20regarding%20Knottiingale%20handmade%20crochet%20pieces."
                target="_blank"
                rel="noopener noreferrer"
                className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2.5 text-xs font-semibold text-white shadow-md shadow-emerald-600/20 transition hover:from-emerald-500 hover:to-teal-500"
              >
                <MessageCircle className="size-4 transition-transform group-hover:scale-110" />
                Chat on WhatsApp (+91 7985835558)
              </a>

              <a
                href="tel:+917985835558"
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                <Phone className="size-3.5" />
                Call +91 7985835558
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Trigger Button (Uiverse-style glowing pulse FAB) */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="group relative flex size-13 items-center justify-center rounded-full bg-gradient-to-tr from-emerald-600 via-teal-600 to-emerald-500 text-white shadow-xl shadow-emerald-600/30 transition duration-300 hover:scale-105 active:scale-95"
        aria-label="Open contact options"
      >
        <span className="absolute -inset-1 rounded-full bg-emerald-500/30 blur-sm transition group-hover:opacity-100 opacity-60" />
        <span className="relative flex items-center justify-center">
          {isOpen ? (
            <X className="size-6 transition-transform rotate-90 duration-200" />
          ) : (
            <>
              <MessageCircle className="size-6" />
              <span className="absolute -right-1 -top-1 flex size-3.5 items-center justify-center rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900">
                <Sparkles className="size-2 text-white" />
              </span>
            </>
          )}
        </span>
      </button>
    </div>
  );
};
