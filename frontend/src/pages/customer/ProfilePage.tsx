import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "react-router-dom";
import { Mail, MapPin, Package, Save, ShieldCheck, User as UserIcon } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { getErrorMessage } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge, Card } from "@/components/ui/Card";
import { PageLayout } from "@/components/layout/PageLayout";
import { initials } from "@/lib/utils";

const profileSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters").max(50),
  phone: z
    .string()
    .regex(/^[0-9+\-\s]{10,15}$/, "Enter a valid phone number")
    .optional()
    .or(z.literal("")),
});

type ProfileForm = z.infer<typeof profileSchema>;

export const ProfilePage = () => {
  const { user, updateProfile } = useAuth();
  const toast = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name ?? "",
      phone: user?.phone ?? "",
    },
  });

  const onSubmit = async (values: ProfileForm) => {
    try {
      await updateProfile({
        name: values.name,
        phone: values.phone || undefined,
      });

      toast.success("Profile updated");
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const quickLinks = [
    { to: "/orders", label: "My orders", icon: Package },
    { to: "/addresses", label: "Addresses", icon: MapPin },
    { to: "/wishlist", label: "Wishlist", icon: Package },
    { to: "/settings", label: "Settings", icon: UserIcon },
  ];

  return (
    <PageLayout title="My profile" subtitle="Manage your personal information">
      <div className="grid gap-8 lg:grid-cols-[1fr_2fr]">
        <div className="space-y-6">
          <Card className="p-6 text-center">
            <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-2xl font-bold text-white">
              {initials(user?.name ?? "U")}
            </div>
            <h2 className="mt-4 text-lg font-bold text-slate-900 dark:text-white">
              {user?.name}
            </h2>
            <p className="mt-1 flex items-center justify-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
              <Mail className="size-4" /> {user?.email}
            </p>
            <div className="mt-4 flex justify-center gap-2">
              <Badge variant={user?.role === "admin" ? "info" : "default"}>
                <ShieldCheck className="size-3.5" />
                {user?.role === "admin" ? "Admin" : "Customer"}
              </Badge>
              <Badge variant={user?.isVerified ? "success" : "warning"}>
                {user?.isVerified ? "Verified" : "Email unverified"}
              </Badge>
            </div>
          </Card>

          <Card className="p-3">
            {quickLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                <link.icon className="size-4.5 text-slate-400" />
                {link.label}
              </Link>
            ))}
          </Card>
        </div>

        <Card className="h-fit p-6">
          <h3 className="mb-5 text-base font-semibold text-slate-900 dark:text-white">
            Personal details
          </h3>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <Input
              label="Full name"
              autoComplete="name"
              error={errors.name?.message}
              {...register("name")}
            />

            <Input
              label="Email"
              value={user?.email ?? ""}
              disabled
              hint="Email cannot be changed"
            />

            <Input
              label="Phone"
              type="tel"
              autoComplete="tel"
              placeholder="+91 98765 43210"
              error={errors.phone?.message}
              {...register("phone")}
            />

            <Button type="submit" loading={isSubmitting}>
              <Save className="size-4" />
              Save changes
            </Button>
          </form>
        </Card>
      </div>
    </PageLayout>
  );
};

export default ProfilePage;
