import { Link } from "react-router-dom";
import { Card } from "@/components/ui/Card";
import { PageLayout } from "@/components/layout/PageLayout";
import { useToast } from "@/context/ToastContext";
import { getErrorMessage } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useChangePassword } from "@/hooks/useApi";

export const SettingsPage = () => {
  const toast = useToast();
  const changePassword = useChangePassword();

  return (
    <PageLayout title="Settings" subtitle="Account preferences and security">
      <div className="max-w-2xl space-y-6">
        <Card className="p-6">
          <h3 className="font-display mb-1 text-base font-semibold text-[#3B2924] dark:text-[#FFF4E8]">
            Change password
          </h3>
          <p className="mb-4 text-sm text-[#806E66] dark:text-[#C7B8AE]">
            Keep your account secure with a strong, unique password.
          </p>

          <form
            onSubmit={(event) => {
              event.preventDefault();

              const form = new FormData(event.currentTarget);

              changePassword
                .mutateAsync({
                  currentPassword: String(form.get("currentPassword") ?? ""),
                  newPassword: String(form.get("newPassword") ?? ""),
                })
                .then(() => {
                  toast.success("Password changed successfully");
                  event.currentTarget.reset();
                })
                .catch((error) => toast.error(getErrorMessage(error)));
            }}
            className="space-y-4"
          >
            <Input
              name="currentPassword"
              label="Current password"
              type="password"
              placeholder="Enter your current password"
              required
              minLength={6}
            />
            <Input
              name="newPassword"
              label="New password"
              type="password"
              placeholder="At least 6 characters"
              required
              minLength={6}
            />
            <Button type="submit" loading={changePassword.isPending}>
              Update password
            </Button>
          </form>
        </Card>

        <Card className="p-6">
          <h3 className="font-display mb-1 text-base font-semibold text-[#3B2924] dark:text-[#FFF4E8]">
            Account
          </h3>
          <p className="text-sm text-[#806E66] dark:text-[#C7B8AE]">
            Manage your addresses and order history.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              to="/addresses"
              className="rounded-xl border border-[#E8DCD0] px-4 py-2 text-sm font-medium text-[#3B2924] transition hover:bg-[#F5EDE4] dark:border-[#382823] dark:text-[#FFF4E8] dark:hover:bg-[#251B18]"
            >
              Manage addresses
            </Link>
            <Link
              to="/orders"
              className="rounded-xl border border-[#E8DCD0] px-4 py-2 text-sm font-medium text-[#3B2924] transition hover:bg-[#F5EDE4] dark:border-[#382823] dark:text-[#FFF4E8] dark:hover:bg-[#251B18]"
            >
              View orders
            </Link>
            <Link
              to="/profile"
              className="rounded-xl border border-[#E8DCD0] px-4 py-2 text-sm font-medium text-[#3B2924] transition hover:bg-[#F5EDE4] dark:border-[#382823] dark:text-[#FFF4E8] dark:hover:bg-[#251B18]"
            >
              Edit profile
            </Link>
          </div>
        </Card>
      </div>
    </PageLayout>
  );
};

export default SettingsPage;
