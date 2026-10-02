import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/context/ThemeContext";
import { ToastProvider } from "@/context/ToastContext";
import { AuthProvider } from "@/context/AuthContext";
import App from "./App";
import "./index.css";

// Early non-blocking background wake-up ping for deployed backend (helps mitigate Render free tier cold-starts)
const rawApiUrl = import.meta.env.VITE_API_URL || "/api";
const healthUrl = rawApiUrl.endsWith("/api")
  ? `${rawApiUrl.replace(/\/api$/, "")}/`
  : `${rawApiUrl.replace(/\/$/, "")}/`;
if (typeof window !== "undefined") {
  try {
    fetch(healthUrl, { method: "GET", mode: "cors", credentials: "omit" }).catch(() => {});
  } catch {
    // Non-blocking ping
  }
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes fresh: instant cache transitions without skeleton flicker
      gcTime: 30 * 60 * 1000,   // keep in memory for 30 minutes
    },
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <BrowserRouter>
              <App />
            </BrowserRouter>
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </StrictMode>
);
