import { Link } from "react-router-dom";
import { Badge, Card } from "@/components/ui/Card";
import { PageLayout } from "@/components/layout/PageLayout";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { api, getErrorMessage } from "@/lib/api";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export const SettingsPage = () => {
  const { user } = useAuth();
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);

  const resendVerification = async () => {
    setSending(true);

    try {
      await api.post("/auth/resend-verification", {
        email: email || user?.email,
      });

      toast.success("Verification email sent");
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSending(false);
    }
  };

  return (
    <PageLayout title="Settings" subtitle="Account preferences and security">
      <div className="max-w-2xl space-y-6">
        <Card className="p-6">
          <h3 className="mb-1 text-base font-semibold text-slate-900 dark:text-white">
            Email verification
          </h3>
          <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
            {user?.isVerified
              ? "Your email is verified. You can use all account features."
              : "Your email is not verified yet. Verify it to unlock the full experience."}
          </p>

          <Badge variant={user?.isVerified ? "success" : "warning"}>
            {user?.isVerified ? "Verified" : "Unverified"}
          </Badge>

          {!user?.isVerified && (
            <div className="mt-4 space-y-3">
              <Input
                label="Send to a different email"
                type="email"
                placeholder={user?.email}
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
              <Button variant="outline" onClick={resendVerification} loading={sending}>
                Resend verification email
              </Button>
            </div>
          )}
        </Card>

        <Card className="p-6">
          <h3 className="mb-1 text-base font-semibold text-slate-900 dark:text-white">
            Account
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Manage your addresses and order history.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              to="/addresses"
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              Manage addresses
            </Link>
            <Link
              to="/orders"
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              View orders
            </Link>
            <Link
              to="/profile"
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700"
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
