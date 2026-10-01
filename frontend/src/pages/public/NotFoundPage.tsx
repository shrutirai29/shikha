import { Link } from "react-router-dom";
import { Home, PackageSearch } from "lucide-react";
import { usePageTitle } from "@/hooks/usePageTitle";

export const NotFoundPage = () => {
  usePageTitle("Page not found");

  return (
  <div className="mx-auto flex min-h-[70vh] w-full max-w-lg flex-col items-center justify-center px-4 py-16 text-center">
    <div className="flex size-20 items-center justify-center rounded-3xl bg-[#B85C4A]/10 text-[#B85C4A] dark:bg-[#D47763]/15 dark:text-[#D47763]">
      <PackageSearch className="size-10 text-[#B85C4A] dark:text-[#D47763]" />
    </div>
    <h1 className="font-display mt-6 text-6xl sm:text-7xl font-bold tracking-tight text-[#3B2924] dark:text-[#FFF4E8]">
      404
    </h1>
    <p className="mt-3 text-lg font-semibold text-[#B85C4A] dark:text-[#D47763]">
      Page not found
    </p>
    <p className="mt-1 text-sm text-[#806E66] dark:text-[#C7B8AE]">
      The page you're looking for doesn't exist or has been moved.
    </p>
    <Link
      to="/"
      className="mt-8 inline-flex h-12 items-center gap-2 rounded-2xl bg-[#B85C4A] px-6 text-base font-semibold text-[#FFF8F0] shadow-soft transition hover:bg-[#914536] dark:bg-[#D47763] dark:hover:bg-[#E28A76] dark:text-[#1F1816]"
    >
      <Home className="size-5" />
      Back to home
    </Link>
  </div>
  );
};

export default NotFoundPage;
