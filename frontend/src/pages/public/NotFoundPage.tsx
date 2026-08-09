import { Link } from "react-router-dom";
import { Home, PackageSearch } from "lucide-react";

export const NotFoundPage = () => (
  <div className="mx-auto flex min-h-[70vh] w-full max-w-lg flex-col items-center justify-center px-4 py-16 text-center">
    <PackageSearch className="size-16 text-slate-300 dark:text-slate-600" />
    <h1 className="mt-6 text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white">
      404
    </h1>
    <p className="mt-3 text-lg font-semibold text-slate-700 dark:text-slate-200">
      Page not found
    </p>
    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
      The page you're looking for doesn't exist or has been moved.
    </p>
    <Link
      to="/"
      className="mt-8 inline-flex h-12 items-center gap-2 rounded-xl bg-indigo-600 px-6 text-base font-semibold text-white shadow-sm transition hover:bg-indigo-500"
    >
      <Home className="size-5" />
      Back to home
    </Link>
  </div>
);

export default NotFoundPage;
