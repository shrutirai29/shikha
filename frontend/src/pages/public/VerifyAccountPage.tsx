import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { BadgeCheck, Loader2, Mail, Phone, TriangleAlert } from "lucide-react";
import { api, getErrorMessage } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Logo } from "@/components/layout/Logo";

type VerificationType = "email" | "phone";

const OtpSection = ({
  type,
  email,
  onVerified,
}: {
  type: VerificationType;
  email: string;
  onVerified: () => void;
}) => {
  const toast = useToast();
  const [code, setCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;

    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);

    return () => clearTimeout(timer);
  }, [cooldown]);

  const verify = async () => {
    if (code.trim().length !== 6) {
      toast.error("Enter the 6-digit code");
      return;
    }

    setVerifying(true);

    try {
      await api.post("/auth/verify-code", { email, type, code: code.trim() });
      toast.success(type === "email" ? "Email verified" : "Phone verified");
      onVerified();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setVerifying(false);
    }
  };

  const resend = async () => {
    setResending(true);

    try {
      await api.post("/auth/resend-code", { email, type });
      toast.success("A new code has been sent");
      setCooldown(30);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setResending(false);
    }
  };

  const Icon = type === "email" ? Mail : Phone;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800/60">
      <div className="mb-3 flex items-center gap-3">
        <span className="flex size-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300">
          <Icon className="size-5" />
        </span>
        <div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
            {type === "email" ? "Verify your email" : "Verify your phone"}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {type === "email"
              ? `Code sent to ${email}`
              : "Code sent to your phone via SMS"}
          </p>
        </div>
      </div>

      <div className="flex items-end gap-2">
        <Input
          label="6-digit code"
          inputMode="numeric"
          maxLength={6}
          placeholder="••••••"
          value={code}
          onChange={(event) =>
            setCode(event.target.value.replace(/\D/g, "").slice(0, 6))
          }
          onKeyDown={(event) => {
            if (event.key === "Enter") void verify();
          }}
        />
        <Button
          onClick={() => void verify()}
          loading={verifying}
          disabled={code.trim().length !== 6}
          className="mb-0.5"
        >
          Verify
        </Button>
      </div>

      <button
        type="button"
        onClick={() => void resend()}
        disabled={resending || cooldown > 0}
        className="mt-3 text-xs font-medium text-indigo-600 transition hover:text-indigo-500 disabled:opacity-50 dark:text-indigo-300 dark:hover:text-indigo-200"
      >
        {cooldown > 0
          ? `Resend code in ${cooldown}s`
          : resending
            ? "Sending…"
            : "Resend code"}
      </button>
    </div>
  );
};

export const VerifyAccountPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const toast = useToast();
  const { user, refreshProfile } = useAuth();

  const token = searchParams.get("token") ?? "";

  const email =
    user?.email ?? (location.state as { email?: string } | null)?.email ?? "";
  const [verified, setVerified] = useState<Record<string, boolean>>({
    email: Boolean(user?.isVerified),
    phone: Boolean(user?.phone && user.phoneVerified),
  });
  const [tokenStatus, setTokenStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >(token ? "loading" : "idle");
  const [tokenMessage, setTokenMessage] = useState("");

  useEffect(() => {
    let active = true;

    const verifyWithToken = async () => {
      if (!token) return;

      try {
        await api.post("/auth/verify-email", { token });

        if (active) {
          setTokenStatus("success");
          setTokenMessage("Your email has been verified.");
          setVerified((prev) => ({ ...prev, email: true }));
        }
      } catch (error) {
        if (active) {
          setTokenStatus("error");
          setTokenMessage(getErrorMessage(error));
        }
      }
    };

    void verifyWithToken();

    return () => {
      active = false;
    };
  }, [token]);

  const allVerified = verified.email && verified.phone;

  const handleVerified = (type: VerificationType) => {
    const next = { ...verified, [type]: true };
    setVerified(next);
    void refreshProfile();

    if (next.email && next.phone) {
      toast.success("Account verified — happy shopping!");
    }
  };

  if (allVerified) {
    return (
      <div className="mx-auto flex min-h-[70vh] w-full max-w-md flex-col justify-center px-4 py-12">
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-soft dark:border-slate-700 dark:bg-slate-800/60">
          <BadgeCheck className="size-12 text-emerald-500" />
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">
            Account verified
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Your email and phone are verified. You can now shop, order and track
            deliveries.
          </p>
          <Button onClick={() => navigate("/")} className="mt-2">
            Start shopping
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-md flex-col justify-center px-4 py-12">
      <div className="mb-8 text-center">
        <Logo className="mb-4 justify-center" />
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Verify your account
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Enter the codes we sent to your email and phone
        </p>
      </div>

      {tokenStatus === "loading" && (
        <div className="flex items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800/60">
          <Loader2 className="size-5 animate-spin text-indigo-600 dark:text-indigo-400" />
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Verifying your email…
          </p>
        </div>
      )}

      {tokenStatus === "error" && (
        <div className="mb-4 flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50/70 p-4 dark:border-rose-500/25 dark:bg-rose-500/10">
          <TriangleAlert className="size-5 shrink-0 text-rose-500" />
          <p className="text-sm text-rose-700 dark:text-rose-300">
            {tokenMessage}
          </p>
        </div>
      )}

      {!verified.email && (
        <OtpSection
          type="email"
          email={email}
          onVerified={() => handleVerified("email")}
        />
      )}

      {!verified.phone && user?.phone && (
        <div className="mt-4">
          <OtpSection
            type="phone"
            email={email}
            onVerified={() => handleVerified("phone")}
          />
        </div>
      )}

      {!verified.phone && !user?.phone && (
        <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800/60">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            No phone number on this account. Add one in{" "}
            <Link
              to="/profile"
              className="font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-300"
            >
              your profile
            </Link>{" "}
            to verify it.
          </p>
        </div>
      )}

      <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
        {email && !user ? (
          <>
            Changed your mind?{" "}
            <Link
              to="/login"
              className="font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
            >
              Log in
            </Link>
          </>
        ) : (
          <>
            <Link
              to="/"
              className="font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
            >
              Back to store
            </Link>
          </>
        )}
      </p>
    </div>
  );
};

export default VerifyAccountPage;
