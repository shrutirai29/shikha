import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { BadgeCheck, Loader2, TriangleAlert } from "lucide-react";
import { api, getErrorMessage } from "@/lib/api";

export const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;

    const verify = async () => {
      if (!token) {
        setStatus("error");
        setMessage("Missing verification token. Use the link from your email.");
        return;
      }

      try {
        await api.post("/auth/verify-email", { token });

        if (active) {
          setStatus("success");
          setMessage("Your email has been verified. You can now log in.");
        }
      } catch (error) {
        if (active) {
          setStatus("error");
          setMessage(getErrorMessage(error));
        }
      }
    };

    void verify();

    return () => {
      active = false;
    };
  }, [token]);

  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-md flex-col justify-center px-4 py-12">
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm dark:border-slate-700 dark:bg-slate-800/60">
        {status === "loading" && (
          <>
            <Loader2 className="size-10 animate-spin text-indigo-600 dark:text-indigo-400" />
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              Verifying your email…
            </h1>
          </>
        )}

        {status === "success" && (
          <>
            <BadgeCheck className="size-12 text-emerald-500" />
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              Email verified
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">{message}</p>
            <Link
              to="/login"
              className="mt-2 rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500"
            >
              Log in now
            </Link>
          </>
        )}

        {status === "error" && (
          <>
            <TriangleAlert className="size-12 text-rose-500" />
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              Verification failed
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">{message}</p>
            <Link
              to="/login"
              className="mt-2 text-sm font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
            >
              Back to login
            </Link>
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyEmailPage;
