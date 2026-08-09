import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { MailCheck, Send } from "lucide-react";
import { api, getErrorMessage } from "@/lib/api";
import { useToast } from "@/context/ToastContext";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Logo } from "@/components/layout/Logo";
import { useState } from "react";

const forgotSchema = z.object({
  email: z.string().email("Enter a valid email address"),
});

type ForgotForm = z.infer<typeof forgotSchema>;

export const ForgotPasswordPage = () => {
  const toast = useToast();
  const [sent, setSent] = useState(false);

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
      await api.post("/auth/forgot-password", { email: values.email });
      setSent(true);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-md flex-col justify-center px-4 py-12">
      <div className="mb-8 text-center">
        <Logo className="mb-4 justify-center" />
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Reset your password
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Enter your email and we&apos;ll send you a reset link
        </p>
      </div>

      {sent ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-8 text-center dark:border-emerald-500/30 dark:bg-emerald-500/10">
          <MailCheck className="size-10 text-emerald-600 dark:text-emerald-400" />
          <h2 className="text-base font-semibold text-emerald-900 dark:text-emerald-200">
            Check your inbox
          </h2>
          <p className="text-sm text-emerald-700 dark:text-emerald-300/80">
            If an account exists for that email, a password reset link is on
            its way. The link expires in 1 hour.
          </p>
          <Link
            to="/login"
            className="mt-2 text-sm font-semibold text-emerald-700 underline dark:text-emerald-300"
          >
            Back to login
          </Link>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800/60"
          noValidate
        >
          <Input
            label="Email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            error={errors.email?.message}
            {...register("email")}
          />

          <Button type="submit" className="w-full" loading={isSubmitting} size="lg">
            <Send className="size-5" />
            Send reset link
          </Button>
        </form>
      )}

      <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
        Remembered your password?{" "}
        <Link
          to="/login"
          className="font-semibold text-indigo-600 transition hover:text-indigo-500 dark:text-indigo-400"
        >
          Log in
        </Link>
      </p>
    </div>
  );
};

export default ForgotPasswordPage;
