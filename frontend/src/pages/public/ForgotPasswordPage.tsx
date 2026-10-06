import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { MailCheck, Send } from "lucide-react";
import { api, getErrorMessage } from "@/lib/api";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useToast } from "@/context/ToastContext";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Logo } from "@/components/layout/Logo";
import authBackdrop from "@/assets/auth-backdrop.jpg";

const forgotSchema = z.object({
  email: z.string().email("Enter a valid email address"),
});

type ForgotForm = z.infer<typeof forgotSchema>;

export const ForgotPasswordPage = () => {
  usePageTitle("Reset Password — Knottiingale");
  const toast = useToast();
  const [sent, setSent] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotForm>({
    resolver: zodResolver(forgotSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (values: ForgotForm) => {
    try {
      setSubmittedEmail(values.email);
      await api.post("/auth/forgot-password", { email: values.email });
      setSent(true);
      toast.success("Password reset link sent to your email!");
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <div className="relative flex min-h-[calc(100vh-140px)] w-full items-center justify-center overflow-hidden px-4 py-12">
      {/* Handcrafted Crochet Backdrop */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden select-none">
        <img
          src={authBackdrop}
          alt="Crochet background"
          className="size-full object-cover object-center opacity-85 dark:opacity-35 transition-opacity duration-500"
        />
        <div className="absolute inset-0 bg-[#FFF8F0]/40 dark:bg-gradient-to-br dark:from-[#150F0D]/85 dark:via-[#1B1311]/80 dark:to-[#120C0A]/90 backdrop-blur-[1px]" />
      </div>

      <div className="relative z-10 w-full max-w-lg">
        <div className="mb-8 text-center">
        <Logo className="mb-4 justify-center" />
        <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#3B2924] dark:text-[#FFF4E8]">
          Reset your password
        </h1>
        <p className="mt-1 text-sm text-[#806E66] dark:text-[#C7B8AE]">
          Enter your registered email and we&apos;ll provide your secure reset link
        </p>
      </div>

      {sent ? (
        <div className="space-y-5 rounded-3xl border border-[#E8DCD0] bg-[#FFFCF7] p-6 sm:p-8 shadow-soft dark:border-[#382823] dark:bg-[#1E1614]">
          <div className="flex flex-col items-center gap-3 text-center">
            <span className="flex size-14 items-center justify-center rounded-2xl bg-[#7A8B68]/15 text-[#7A8B68] dark:bg-[#9BAF83]/20 dark:text-[#9BAF83]">
              <MailCheck className="size-7" />
            </span>
            <h2 className="font-display text-lg font-bold text-[#3B2924] dark:text-[#FFF4E8]">
              Check your inbox
            </h2>
            <p className="text-sm leading-relaxed text-[#806E66] dark:text-[#C7B8AE]">
              A password reset link has been sent to <strong className="text-[#3B2924] dark:text-[#FFF4E8]">{submittedEmail}</strong>. Please check your inbox and spam folder. The link is valid for 1 hour.
            </p>
          </div>

          <div className="border-t border-[#E8DCD0] pt-4 text-center dark:border-[#382823]">
            <Link
              to="/login"
              className="text-xs font-semibold text-[#B85C4A] hover:underline dark:text-[#D47763]"
            >
              ← Back to log in
            </Link>
          </div>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4 rounded-3xl border border-[#E8DCD0] bg-[#FFFCF7] p-6 sm:p-8 shadow-soft dark:border-[#382823] dark:bg-[#1E1614]"
          noValidate
        >
          <Input
            label="Your Registered Email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            error={errors.email?.message}
            {...register("email")}
          />

          <Button
            type="submit"
            className="w-full h-12 rounded-2xl bg-[#B85C4A] text-white hover:bg-[#914536] dark:bg-[#D47763] dark:text-[#1F1816]"
            loading={isSubmitting}
            size="lg"
          >
            <Send className="size-4.5" />
            Send Reset Link
          </Button>
        </form>
      )}

      <p className="mt-6 text-center text-xs text-[#806E66] dark:text-[#C7B8AE]">
        Remembered your password?{" "}
        <Link
          to="/login"
          className="font-semibold text-[#B85C4A] transition hover:underline dark:text-[#D47763]"
        >
          Log in here
        </Link>
      </p>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
