import { useEffect, useRef, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { Button } from "./Button";

export const Modal = ({
  open,
  onClose,
  title,
  children,
  footer,
  size = "md",
  hideHeader = false,
  className,
  bodyClassName,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  hideHeader?: boolean;
  className?: string;
  bodyClassName?: string;
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        onClose();
        return;
      }

      // Trap Tab focus inside the dialog.
      if (event.key !== "Tab" || !dialogRef.current) return;

      const focusables = dialogRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );

      if (focusables.length === 0) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";

    // Move focus into the dialog so keyboard users land inside it.
    const focusTimer = window.setTimeout(() => {
      dialogRef.current?.focus();
    }, 0);

    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
      // Restore focus to the element that opened the dialog.
      previouslyFocused?.focus?.();
    };
  }, [open, onClose]);

  const sizes = {
    sm: "max-w-sm",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-3xl",
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-3 sm:p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#0D0807]/70 backdrop-blur-md"
          />
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            tabIndex={-1}
            ref={dialogRef}
            className={className ?? cnRelative(sizes[size])}
          >
            {!hideHeader && (
              <div className="flex items-center justify-between border-b border-[#E8DCD0] px-5 py-4 dark:border-[#382823]">
                <h2 className="text-base font-semibold text-[#3B2924] dark:text-[#FFF4E8]">{title}</h2>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close dialog"
                  className="rounded-lg p-1.5 text-[#806E66] transition hover:bg-[#F5EDE4] hover:text-[#3B2924] dark:text-[#B3A198] dark:hover:bg-[#251B18] dark:hover:text-[#FFF4E8]"
                >
                  <X className="size-5" />
                </button>
              </div>
            )}
            <div className={bodyClassName ?? (hideHeader ? "p-0" : "px-5 py-4")}>{children}</div>
            {footer && (
              <div className="flex justify-end gap-3 border-t border-[#E8DCD0] px-5 py-4 dark:border-[#382823]">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

const cnRelative = (size: string) =>
  `relative w-full ${size} max-h-[90vh] overflow-y-auto rounded-2xl bg-[#FFFCF7] border border-[#E8DCD0] shadow-2xl dark:bg-[#1E1614]/95 dark:backdrop-blur-xl dark:border-[#382823] dark:shadow-[0_20px_50px_rgba(0,0,0,0.6)]`;

export const ConfirmDialog = ({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirm",
  danger,
  loading,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  danger?: boolean;
  loading?: boolean;
}) => (
  <Modal
    open={open}
    onClose={onClose}
    title={title}
    size="sm"
    footer={
      <>
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button variant={danger ? "danger" : "primary"} onClick={onConfirm} loading={loading}>
          {confirmLabel}
        </Button>
      </>
    }
  >
    {description && (
      <p className="text-sm text-[#806E66] dark:text-[#B3A198]">{description}</p>
    )}
  </Modal>
);
