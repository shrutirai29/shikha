import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, LogIn } from "lucide-react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { getErrorMessage } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Logo } from "@/components/layout/Logo";
import authBackdrop from "@/assets/auth-backdrop.jpg";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginForm = z.infer<typeof loginSchema>;

export const LoginPage = () => {
  usePageTitle("Log in");
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);

  const from = (location.state as { from?: string } | null)?.from ?? "/";

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (values: LoginForm) => {
    try {
      const { user } = await login(values);

      // Admins go straight to the admin dashboard — never the storefront.
      if (user.role === "admin") {
        toast.success("Welcome back, admin!");
        navigate("/admin", { replace: true });
        return;
      }

      toast.success("Welcome back!");
      navigate(from, { replace: true });
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
            Welcome back
          </h1>
          <p className="mt-1 text-sm text-[#806E66] dark:text-[#C7B8AE]">
            Log in to continue shopping
          </p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4 rounded-3xl border border-[#E8DCD0]/90 bg-[#FFFCF7]/95 p-6 sm:p-8 shadow-2xl backdrop-blur-xl dark:border-[#493A34]/80 dark:bg-[#1E1614]/95 dark:shadow-[0_20px_50px_rgba(0,0,0,0.6)]"
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

          <div className="relative">
            <Input
              label="Password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="••••••••"
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

          <div className="flex justify-end">
            <Link
              to="/forgot-password"
              className="text-sm font-medium text-[#B85C4A] transition hover:text-[#914536] dark:text-[#D47763] dark:hover:text-[#E28A76]"
            >
              Forgot password?
            </Link>
          </div>

          <Button type="submit" className="w-full" loading={isSubmitting} size="lg">
            <LogIn className="size-5" />
            Log in
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-[#806E66] dark:text-[#C7B8AE]">
          Don&apos;t have an account?{" "}
          <Link
            to="/register"
            className="font-semibold text-[#B85C4A] transition hover:text-[#914536] dark:text-[#D47763] dark:hover:text-[#E28A76]"
          >
            Sign up free
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
