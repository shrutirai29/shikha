import { useState } from "react";
import { MessageCircle, X, Phone, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const FloatingContact = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-[4.75rem] right-3 sm:bottom-6 sm:right-6 z-40 flex flex-col items-end">
      {/* Popover Card */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Mobile backdrop scrim to dismiss on tap */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-30 bg-black/25 backdrop-blur-xs sm:hidden"
            />
            <motion.div
              initial={{ opacity: 0, y: 15, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="relative z-40 mb-3 w-[calc(100vw-2rem)] max-w-xs sm:w-80 overflow-hidden rounded-2xl border border-[#E8DCD0] bg-[#FFFCF7]/95 p-4 sm:p-5 shadow-2xl backdrop-blur-xl dark:border-[#382823] dark:bg-[#1E1614]/95"
            >
            <div className="flex items-center justify-between pb-3 border-b border-[#E8DCD0] dark:border-[#382823]">
              <div className="flex items-center gap-2">
                <span className="relative flex size-2.5">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-[#7A8B68] opacity-75 dark:bg-[#9BAF83]" />
                  <span className="relative inline-flex size-2.5 rounded-full bg-[#7A8B68] dark:bg-[#9BAF83]" />
                </span>
                <span className="text-xs font-semibold uppercase tracking-wider text-[#806E66] dark:text-[#C7B8AE]">
                  Knottiingale Studio
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1 text-[#806E66] hover:bg-[#F5EDE4] dark:text-[#C7B8AE] dark:hover:bg-[#251B18]"
                aria-label="Close contact card"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="my-3 space-y-1">
              <p className="text-sm font-bold text-[#3B2924] dark:text-[#FFF4E8]">
                Looking for a custom crochet piece?
              </p>
              <p className="text-xs text-[#806E66] dark:text-[#C7B8AE]">
                Connect directly with founder & artisan <strong className="text-[#3B2924] dark:text-[#FFF4E8]">Shikkha Rai</strong> for custom sizes, personalized gifts, or order queries.
              </p>
            </div>

            <div className="space-y-2 pt-1">
              <a
                href="https://wa.me/917985835558?text=Hello%20Shikkha%2C%20I%20have%20an%20inquiry%20regarding%20Knottiingale%20handmade%20crochet%20pieces."
                target="_blank"
                rel="noopener noreferrer"
                className="group flex w-full items-center justify-center gap-2 rounded-xl bg-[#7A8B68] px-4 py-2.5 text-xs font-semibold text-white shadow-md transition hover:bg-[#687757] dark:bg-[#9BAF83] dark:text-[#1F1816]"
              >
                <MessageCircle className="size-4 transition-transform group-hover:scale-110" />
                Chat on WhatsApp (+91 7985835558)
              </a>

              <a
                href="tel:+917985835558"
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#E8DCD0] bg-[#F5EDE4] px-4 py-2 text-xs font-semibold text-[#3B2924] transition hover:bg-[#FFFCF7] dark:border-[#382823] dark:bg-[#251B18] dark:text-[#FFF4E8] dark:hover:bg-[#1E1614]"
              >
                <Phone className="size-3.5" />
                Call +91 7985835558
              </a>
            </div>
          </motion.div>
        </>
      )}
      </AnimatePresence>

      {/* Main Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="group relative flex size-11 sm:size-13 items-center justify-center rounded-full bg-[#7A8B68] text-white shadow-xl shadow-[#7A8B68]/30 transition duration-300 hover:scale-105 active:scale-95 dark:bg-[#9BAF83] dark:text-[#1F1816]"
        aria-label="Open contact options"
      >
        <span className="absolute -inset-1 rounded-full bg-[#7A8B68]/30 blur-sm transition group-hover:opacity-100 opacity-60 dark:bg-[#9BAF83]/30" />
        <span className="relative flex items-center justify-center">
          {isOpen ? (
            <X className="size-5 sm:size-6 transition-transform rotate-90 duration-200" />
          ) : (
            <>
              <MessageCircle className="size-5 sm:size-6" />
              <span className="absolute -right-1 -top-1 flex size-3.5 items-center justify-center rounded-full bg-[#B85C4A] ring-2 ring-[#FFFCF7] dark:ring-[#1E1614]">
                <Sparkles className="size-2 text-[#D8A85B]" />
              </span>
            </>
          )}
        </span>
      </button>
    </div>
  );
};
