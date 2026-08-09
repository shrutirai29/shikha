import { Link } from "react-router-dom";
import { Badge, Card } from "@/components/ui/Card";
import { PageLayout } from "@/components/layout/PageLayout";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { api, getErrorMessage } from "@/lib/api";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useChangePassword } from "@/hooks/useApi";

export const SettingsPage = () => {
  const { user, refreshProfile } = useAuth();
  const toast = useToast();
  const changePassword = useChangePassword();
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [phoneCode, setPhoneCode] = useState("");
  const [verifyingPhone, setVerifyingPhone] = useState(false);
  const [sendingPhoneCode, setSendingPhoneCode] = useState(false);

  const verifyPhone = async () => {
    if (!user?.email) return;

    setVerifyingPhone(true);

    try {
      await api.post("/auth/verify-code", {
        email: user.email,
        type: "phone",
        code: phoneCode,
      });
      toast.success("Phone verified successfully");
      setPhoneCode("");
      await refreshProfile();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setVerifyingPhone(false);
    }
  };

  const resendPhoneCode = async () => {
    if (!user?.email) return;

    setSendingPhoneCode(true);

    try {
      await api.post("/auth/resend-code", {
        email: user.email,
        type: "phone",
      });
      toast.success("A new code has been sent");
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSendingPhoneCode(false);
    }
  };

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
            Phone verification
          </h3>
          <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
            {user?.phone
              ? user.phoneVerified
                ? "Your phone number is verified."
                : "Verify your phone number to place orders."
              : "Add a phone number to your profile to verify it."}
          </p>

          <Badge variant={user?.phoneVerified ? "success" : "warning"}>
            {user?.phoneVerified ? "Phone verified" : "Phone unverified"}
          </Badge>

          {user?.phone && !user.phoneVerified && (
            <div className="mt-4 space-y-3">
              <Input
                label="6-digit code"
                inputMode="numeric"
                maxLength={6}
                placeholder="••••••"
                value={phoneCode}
                onChange={(event) =>
                  setPhoneCode(event.target.value.replace(/\D/g, "").slice(0, 6))
                }
              />
              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={verifyPhone}
                  loading={verifyingPhone}
                  disabled={phoneCode.length !== 6}
                >
                  Verify phone
                </Button>
                <Button variant="outline" onClick={resendPhoneCode} loading={sendingPhoneCode}>
                  Resend code
                </Button>
              </div>
            </div>
          )}
        </Card>

        <Card className="p-6">
          <h3 className="mb-1 text-base font-semibold text-slate-900 dark:text-white">
            Change password
          </h3>
          <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
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
