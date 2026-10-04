import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, KeyRound, MailCheck, UserPlus } from "lucide-react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { getErrorMessage } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Logo } from "@/components/layout/Logo";
import authBackdrop from "@/assets/auth-backdrop.jpg";

const registerSchema = z
  .object({
    name: z.string().min(3, "Name must be at least 3 characters"),
    email: z.string().email("Enter a valid email address"),
    phone: z
      .string()
      .regex(/^[0-9+\-\s]{10,15}$/, "Enter a valid phone number (10-15 digits)"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

const otpSchema = z.object({
  code: z.string().regex(/^\d{6}$/, "Enter the 6-digit code from your email"),
});

type RegisterForm = z.infer<typeof registerSchema>;
type OtpForm = z.infer<typeof otpSchema>;

const RESEND_COOLDOWN_SECONDS = 60;

export const RegisterPage = () => {
  usePageTitle("Create account");
  const { register: registerUser, verifyOtp, resendOtp } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  const [fallbackOtp, setFallbackOtp] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);
  const [resending, setResending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", phone: "", password: "", confirmPassword: "" },
  });

  const {
    register: registerOtp,
    handleSubmit: handleOtpSubmit,
    setValue: setOtpValue,
    formState: { errors: otpErrors },
  } = useForm<OtpForm>({
    resolver: zodResolver(otpSchema),
    defaultValues: { code: "" },
  });

  useEffect(() => {
    if (countdown <= 0) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    timerRef.current = setInterval(() => {
      setCountdown((c) => (c > 0 ? c - 1 : 0));
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [countdown > 0]); // eslint-disable-line react-hooks/exhaustive-deps

  const startCountdown = () => setCountdown(RESEND_COOLDOWN_SECONDS);

  const onSubmit = async (values: RegisterForm) => {
    try {
      const result = await registerUser({
        name: values.name,
        email: values.email,
        password: values.password,
        phone: values.phone,
      });

      setPendingEmail(result.email);
      startCountdown();

      if (result.fallbackOtp) {
        setFallbackOtp(result.fallbackOtp);
        setOtpValue("code", result.fallbackOtp);
        toast.info("Direct verification code ready below.");
      } else if (!result.delivered) {
        toast.error(
          "We couldn't deliver the code to your email right now. Please try resending in a moment."
        );
      } else {
        toast.success("We've emailed you a 6-digit verification code.");
      }
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const onVerify = async (values: OtpForm) => {
    if (!pendingEmail) return;

    setVerifying(true);

    try {
      await verifyOtp(pendingEmail, values.code);
      toast.success("Email verified — welcome to Knottiingale!");
      navigate("/", { replace: true });
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setVerifying(false);
    }
  };

  const onResend = async () => {
    if (!pendingEmail || countdown > 0) return;

    setResending(true);

    try {
      const result = await resendOtp(pendingEmail);
      startCountdown();

      if (result.fallbackOtp) {
        setFallbackOtp(result.fallbackOtp);
        setOtpValue("code", result.fallbackOtp);
        toast.info("Direct verification code ready below.");
      } else if (!result.delivered) {
        toast.error(
          "We couldn't deliver the code right now. Please try again shortly."
        );
      } else {
        toast.success("A new code has been sent to your email.");
      }
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setResending(false);
    }
  };

  if (pendingEmail) {
    return (
      <div className="relative flex min-h-[calc(100vh-140px)] w-full items-center justify-center overflow-hidden px-4 py-12">
        {/* Handcrafted Crochet Backdrop */}
        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden select-none">
          <img
            src={authBackdrop}
            alt="Crochet background"
            loading="lazy"
            decoding="async"
            className="size-full object-cover object-center opacity-85 dark:opacity-35 transition-opacity duration-500"
          />
          <div className="absolute inset-0 bg-[#FFF8F0]/40 dark:bg-gradient-to-br dark:from-[#150F0D]/85 dark:via-[#1B1311]/80 dark:to-[#120C0A]/90 backdrop-blur-[1px]" />
        </div>

        <div className="relative z-10 w-full max-w-md">
          <div className="mb-8 text-center">
            <Logo className="mb-4 justify-center" />
            <h1 className="text-2xl font-bold tracking-tight text-[#3B2924] dark:text-[#FFF4E8]">
              Verify your email
            </h1>
            <p className="mt-1 text-sm text-[#806E66] dark:text-[#C7B8AE]">
              Enter the 6-digit code we emailed to{" "}
              <span className="font-semibold text-[#3B2924] dark:text-[#FFF4E8]">
                {pendingEmail}
              </span>
            </p>
          </div>

          <form
            onSubmit={handleOtpSubmit(onVerify)}
            className="space-y-4 rounded-3xl border border-[#E8DCD0]/90 bg-[#FFFCF7]/95 p-6 sm:p-8 shadow-2xl backdrop-blur-xl dark:border-[#493A34]/80 dark:bg-[#1E1614]/95 dark:shadow-[0_20px_50px_rgba(0,0,0,0.6)]"
            noValidate
          >
          <div className="rounded-xl bg-[#B85C4A]/10 p-4 text-sm text-[#B85C4A] dark:bg-[#D47763]/20 dark:text-[#D47763]">
            <p className="flex items-start gap-2">
              <MailCheck className="mt-0.5 size-4 shrink-0" />
              <span>
                Your account is created only after the code is verified. The
                code expires in 10 minutes.
              </span>
            </p>
          </div>

          {fallbackOtp && (
            <div className="rounded-2xl border border-[#D8A85B]/40 bg-[#D8A85B]/15 p-4 text-sm dark:border-[#E0B86A]/30 dark:bg-[#E0B86A]/15">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#806E66] dark:text-[#C7B8AE]">
                  Direct Verification Code
                </span>
                <span className="rounded-full bg-[#7A8B68]/20 px-2 py-0.5 text-[10px] font-bold text-[#5B6D4A] dark:bg-[#9BAF83]/20 dark:text-[#9BAF83]">
                  Ready
                </span>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className="font-mono text-2xl font-bold tracking-widest text-[#B85C4A] dark:text-[#D47763]">
                  {fallbackOtp}
                </span>
                <button
                  type="button"
                  onClick={() => setOtpValue("code", fallbackOtp)}
                  className="rounded-xl bg-[#B85C4A] px-3 py-1.5 text-xs font-bold text-white shadow-soft transition hover:bg-[#914536] active:scale-95 dark:bg-[#D47763] dark:text-[#1F1816]"
                >
                  Auto-fill Code
                </button>
              </div>
              <p className="mt-2 text-[11px] text-[#806E66] dark:text-[#C7B8AE]">
                Mail delivery is currently restricted by IP whitelist. Your code has been provided directly above so you can proceed without delay.
              </p>
            </div>
          )}

          <Input
            label="Verification code"
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="123456"
            maxLength={6}
            error={otpErrors.code?.message}
            {...registerOtp("code")}
          />

          <Button
            type="submit"
            className="w-full"
            size="lg"
            loading={verifying}
          >
            <KeyRound className="size-5" />
            Verify & create account
          </Button>

          <div className="flex items-center justify-between text-sm">
            <span className="text-[#806E66] dark:text-[#C7B8AE]">
              Didn't get it?
            </span>
            <button
              type="button"
              onClick={onResend}
              disabled={countdown > 0 || resending}
              className="font-semibold text-[#B85C4A] transition hover:text-[#914536] disabled:cursor-not-allowed disabled:text-[#806E66]/40 dark:text-[#D47763] dark:disabled:text-[#C7B8AE]/40"
            >
              {countdown > 0
                ? `Resend in ${countdown}s`
                : resending
                  ? "Sending…"
                  : "Resend code"}
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              setPendingEmail(null);
              setCountdown(0);
            }}
            className="w-full text-center text-sm text-[#806E66] transition hover:text-[#3B2924] dark:text-[#C7B8AE] dark:hover:text-[#FFF4E8]"
          >
            Use a different email
          </button>
        </form>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-[calc(100vh-140px)] w-full items-center justify-center overflow-hidden px-4 py-12">
      {/* Handcrafted Crochet Backdrop */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden select-none">
        <img
          src={authBackdrop}
          alt="Crochet background"
          loading="lazy"
          decoding="async"
          className="size-full object-cover object-center opacity-85 dark:opacity-35 transition-opacity duration-500"
        />
        <div className="absolute inset-0 bg-[#FFF8F0]/40 dark:bg-gradient-to-br dark:from-[#150F0D]/85 dark:via-[#1B1311]/80 dark:to-[#120C0A]/90 backdrop-blur-[1px]" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="mb-8 text-center">
          <Logo className="mb-4 justify-center" />
          <h1 className="text-2xl font-bold tracking-tight text-[#3B2924] dark:text-[#FFF4E8]">
            Create your account
          </h1>
          <p className="mt-1 text-sm text-[#806E66] dark:text-[#C7B8AE]">
            Join Knottiingale for faster checkout and exclusive offers
          </p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4 rounded-3xl border border-[#E8DCD0]/90 bg-[#FFFCF7]/95 p-6 sm:p-8 shadow-2xl backdrop-blur-xl dark:border-[#493A34]/80 dark:bg-[#1E1614]/95 dark:shadow-[0_20px_50px_rgba(0,0,0,0.6)]"
          noValidate
        >
        <Input
          label="Full name"
          autoComplete="name"
          placeholder="Priya Sharma"
          error={errors.name?.message}
          {...register("name")}
        />

        <Input
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          error={errors.email?.message}
          {...register("email")}
        />

        <Input
          label="Phone"
          type="tel"
          autoComplete="tel"
          placeholder="+91 98765 43210"
          error={errors.phone?.message}
          {...register("phone")}
        />

        <div className="relative">
          <Input
            label="Password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            placeholder="••••••••"
            hint="At least 6 characters"
            error={errors.password?.message}
            {...register("password")}
          />
          <button
            type="button"
            onClick={() => setShowPassword((show) => !show)}
            className="absolute right-3 top-9 text-[#806E66] hover:text-[#3B2924] dark:text-[#C7B8AE] dark:hover:text-[#FFF4E8]"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>

        <Input
          label="Confirm password"
          type="password"
          autoComplete="new-password"
          placeholder="••••••••"
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
        />

        <Button type="submit" className="w-full" loading={isSubmitting} size="lg">
          <UserPlus className="size-5" />
          Send verification code
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-[#806E66] dark:text-[#C7B8AE]">
        Already have an account?{" "}
        <Link
          to="/login"
          className="font-semibold text-[#B85C4A] transition hover:text-[#914536] dark:text-[#D47763] dark:hover:text-[#E28A76]"
        >
          Log in
        </Link>
      </p>
      </div>
    </div>
  );
};

export default RegisterPage;
