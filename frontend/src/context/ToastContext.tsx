import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastKind = "success" | "error" | "info";

interface Toast {
  id: number;
  kind: ToastKind;
  message: string;
}

interface ToastContextValue {
  toast: (message: string, kind?: ToastKind) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const icons: Record<ToastKind, ReactNode> = {
  success: <CheckCircle2 className="size-5 text-[#7A8B68] dark:text-[#9BAF83]" />,
  error: <AlertCircle className="size-5 text-[#B85C4A] dark:text-[#D47763]" />,
  info: <Info className="size-5 text-[#D8A85B] dark:text-[#E0B86A]" />,
};

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const remove = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (message: string, kind: ToastKind = "success") => {
      const id = Date.now() + Math.random();

      setToasts((prev) => [...prev, { id, kind, message }]);

      window.setTimeout(() => remove(id), 4000);
    },
    [remove]
  );

  const success = useCallback(
    (message: string) => toast(message, "success"),
    [toast]
  );
  const error = useCallback(
    (message: string) => toast(message, "error"),
    [toast]
  );
  const info = useCallback(
    (message: string) => toast(message, "info"),
    [toast]
  );

  return (
    <ToastContext.Provider value={{ toast, success, error, info }}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 top-4 z-[100] flex flex-col items-center gap-2 px-4 sm:items-end sm:pr-6"
      >
        <AnimatePresence>
          {toasts.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: -12, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.96 }}
              transition={{ duration: 0.18 }}
              className={cn(
                "pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl border border-[#E8DCD0] bg-[#FFFCF7]/95 p-4 shadow-lift backdrop-blur-md dark:border-[#382823] dark:bg-[#1E1614]/95"
              )}
              role="status"
            >
              <span className="mt-0.5 shrink-0">{icons[item.kind]}</span>
              <p className="flex-1 text-sm font-medium text-[#3B2924] dark:text-[#FFF4E8]">
                {item.message}
              </p>
              <button
                type="button"
                onClick={() => remove(item.id)}
                className="shrink-0 rounded-lg p-1 text-[#806E66] transition hover:bg-[#F5EDE4] hover:text-[#3B2924] dark:text-[#B3A198] dark:hover:bg-[#251B18] dark:hover:text-[#FFF4E8]"
                aria-label="Dismiss notification"
              >
                <X className="size-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextValue => {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }

  return context;
};
