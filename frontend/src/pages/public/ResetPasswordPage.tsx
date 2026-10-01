import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, KeyRound } from "lucide-react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { api, getErrorMessage } from "@/lib/api";
import { useToast } from "@/context/ToastContext";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Logo } from "@/components/layout/Logo";

const resetSchema = z
  .object({
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

type ResetForm = z.infer<typeof resetSchema>;

export const ResetPasswordPage = () => {
  usePageTitle("Reset password");
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const navigate = useNavigate();
  const toast = useToast();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetForm>({
    resolver: zodResolver(resetSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const onSubmit = async (values: ResetForm) => {
    if (!token) {
      toast.error("Missing reset token. Use the link from your email.");
      return;
    }

    try {
      await api.post("/auth/reset-password", {
        token,
        password: values.password,
      });

      toast.success("Password reset successfully. Please log in.");
      navigate("/login");
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-md flex-col justify-center px-4 py-12">
      <div className="mb-8 text-center">
        <Logo className="mb-4 justify-center" />
        <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#3B2924] dark:text-[#FFF4E8]">
          Choose a new password
        </h1>
        <p className="mt-1 text-sm text-[#806E66] dark:text-[#C7B8AE]">
          Your password must be at least 6 characters
        </p>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4 rounded-3xl border border-[#E8DCD0] bg-[#FFFCF7] p-6 sm:p-8 shadow-soft dark:border-[#382823] dark:bg-[#1E1614]"
        noValidate
      >
        <div className="relative">
          <Input
            label="New password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            placeholder="••••••••"
            error={errors.password?.message}
            {...register("password")}
          />
          <button
            type="button"
            onClick={() => setShowPassword((show) => !show)}
            className="absolute right-3 top-9 text-[#806E66] hover:text-[#3B2924] dark:text-[#B3A198] dark:hover:text-[#FFF4E8]"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>

        <Input
          label="Confirm new password"
          type="password"
          autoComplete="new-password"
          placeholder="••••••••"
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
        />

        <Button type="submit" className="w-full" loading={isSubmitting} size="lg">
          <KeyRound className="size-5" />
          Reset password
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-[#806E66] dark:text-[#C7B8AE]">
        <Link
          to="/login"
          className="font-semibold text-[#B85C4A] transition hover:text-[#914536] dark:text-[#D47763] dark:hover:text-[#E28A76]"
        >
          Back to login
        </Link>
      </p>
    </div>
  );
};

export default ResetPasswordPage;
