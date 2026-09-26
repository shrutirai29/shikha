import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { api, getErrorMessage } from "@/lib/api";
import { useAdminCoupons } from "@/hooks/useApi";
import { useToast } from "@/context/ToastContext";
import { Badge, Card } from "@/components/ui/Card";
import { ErrorState, EmptyState } from "@/components/ui/States";
import { PageLoader } from "@/components/ui/Card";
import { ConfirmDialog, Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Coupon } from "@/types";

const numberField = (label: string, { integer = false, positive = false } = {}) =>
  z
    .string()
    .refine(
      (value) => {
        if (value.trim() === "") return false;

        const num = Number(value);

        if (Number.isNaN(num)) return false;
        if (positive && num <= 0) return false;
        if (integer && !Number.isInteger(num)) return false;

        return true;
      },
      { message: label }
    );

const couponSchema = z.object({
  code: z.string().min(3, "Code must be at least 3 characters").max(20),
  description: z.string().min(5).max(200),
  discountType: z.enum(["PERCENTAGE", "FIXED"]),
  discountValue: numberField("Discount must be positive", { positive: true }),
  minimumPurchase: numberField("Must be 0 or more"),
  maximumDiscount: numberField("Must be 0 or more"),
  usageLimit: numberField("Usage limit must be a positive whole number", {
    integer: true,
    positive: true,
  }),
  expiresAt: z.string().min(1, "Expiry date is required"),
});

type CouponForm = z.input<typeof couponSchema>;

const toLocalDateInput = (date?: string) => {
  if (!date) return "";

  const d = new Date(date);

  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
};

export const CouponsPage = () => {
  const toast = useToast();
  const queryClient = useQueryClient();
  const { data: coupons, isLoading, isError, error, refetch } = useAdminCoupons();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Coupon | null>(null);
  const [deleting, setDeleting] = useState<Coupon | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CouponForm>({
    resolver: zodResolver(couponSchema),
  });

  const invalidate = () =>
    void queryClient.invalidateQueries({ queryKey: ["admin-coupons"] });

  const openCreate = () => {
    setEditing(null);
    reset({
      code: "",
      description: "",
      discountType: "PERCENTAGE",
      discountValue: "10",
      minimumPurchase: "0",
      maximumDiscount: "0",
      usageLimit: "1",
      expiresAt: "",
    });
    setModalOpen(true);
  };

  const openEdit = (coupon: Coupon) => {
    setEditing(coupon);
    reset({
      code: coupon.code,
      description: coupon.description,
      discountType: coupon.discountType,
      discountValue: String(coupon.discountValue),
      minimumPurchase: String(coupon.minimumPurchase),
      maximumDiscount: String(coupon.maximumDiscount),
      usageLimit: String(coupon.usageLimit),
      expiresAt: toLocalDateInput(coupon.expiresAt),
    });
    setModalOpen(true);
  };

  const saveMutation = useMutation({
    mutationFn: async (values: CouponForm) => {
      const payload = {
        code: values.code,
        description: values.description,
        discountType: values.discountType,
        discountValue: Number(values.discountValue),
        minimumPurchase: Number(values.minimumPurchase),
        maximumDiscount: Number(values.maximumDiscount),
        usageLimit: Number(values.usageLimit),
        expiresAt: new Date(`${values.expiresAt}T23:59:59`).toISOString(),
      };

      if (editing) {
        const { data } = await api.patch<{ data: Coupon }>(
          `/coupons/${editing._id}`,
          payload
        );
        return data.data;
      }

      const { data } = await api.post<{ data: Coupon }>("/coupons", payload);
      return data.data;
    },
    onSuccess: () => {
      toast.success(editing ? "Coupon updated" : "Coupon created");
      setModalOpen(false);
      invalidate();
    },
    onError: (saveError) => {
      toast.error(getErrorMessage(saveError));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (couponId: string) => {
      await api.delete(`/coupons/${couponId}`);
    },
    onSuccess: () => {
      toast.success("Coupon deleted");
      setDeleting(null);
      invalidate();
    },
    onError: (deleteError) => {
      toast.error(getErrorMessage(deleteError));
    },
  });

  if (isLoading) {
    return <PageLoader />;
  }

  const isExpired = (coupon: Coupon) => new Date(coupon.expiresAt) < new Date();
  const isExhausted = (coupon: Coupon) => coupon.usedCount >= coupon.usageLimit;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#3B2924] dark:text-[#FFF4E8]">
            Coupons
          </h1>
          <p className="mt-1 text-sm text-[#806E66] dark:text-[#B3A198]">
            Create and manage promotional discount coupons
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="size-4" /> Add coupon
        </Button>
      </div>

      {isError ? (
        <ErrorState message={getErrorMessage(error)} onRetry={() => void refetch()} />
      ) : !coupons || coupons.length === 0 ? (
        <EmptyState
          title="No coupons yet"
          description="Create coupons to offer discounts to your customers."
          action={
            <Button onClick={openCreate}>
              <Plus className="size-4" /> Add coupon
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {coupons.map((coupon) => {
            const expired = isExpired(coupon);
            const exhausted = isExhausted(coupon);
            const inactive = !coupon.isActive || expired || exhausted;

            return (
              <Card key={coupon._id} className="p-5">
                <div className="mb-3 flex items-start justify-between">
                  <div>
                    <p className="font-mono text-lg font-bold tracking-wider text-[#B85C4A] dark:text-[#E0B86A]">
                      {coupon.code}
                    </p>
                    <p className="mt-0.5 text-xs text-[#806E66] dark:text-[#B3A198]">
                      {coupon.discountType === "PERCENTAGE"
                        ? `${coupon.discountValue}% off`
                        : `${formatCurrency(coupon.discountValue)} off`}
                    </p>
                  </div>
                  <Badge variant={inactive ? "danger" : "success"}>
                    {expired ? "Expired" : exhausted ? "Exhausted" : coupon.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>

                <p className="mb-3 line-clamp-2 text-sm text-[#3B2924] dark:text-[#FFF4E8]/90">
                  {coupon.description}
                </p>

                <dl className="space-y-1.5 border-t border-[#E8DCD0] pt-3 text-xs text-[#806E66] dark:border-[#382823] dark:text-[#B3A198]">
                  <div className="flex justify-between">
                    <dt>Minimum purchase</dt>
                    <dd className="font-medium text-[#3B2924] dark:text-[#FFF4E8]">{formatCurrency(coupon.minimumPurchase)}</dd>
                  </div>
                  {coupon.discountType === "PERCENTAGE" && (
                    <div className="flex justify-between">
                      <dt>Max discount</dt>
                      <dd className="font-medium text-[#3B2924] dark:text-[#FFF4E8]">
                        {coupon.maximumDiscount > 0
                          ? formatCurrency(coupon.maximumDiscount)
                          : "Unlimited"}
                      </dd>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <dt>Usage</dt>
                    <dd className="font-medium text-[#3B2924] dark:text-[#FFF4E8]">
                      {coupon.usedCount}/{coupon.usageLimit}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt>Expires</dt>
                    <dd className="font-medium text-[#3B2924] dark:text-[#FFF4E8]">{formatDate(coupon.expiresAt)}</dd>
                  </div>
                </dl>

                <div className="mt-4 flex justify-end gap-2 border-t border-[#E8DCD0]/60 pt-3 dark:border-[#382823]/60">
                  <Button size="sm" variant="outline" onClick={() => openEdit(coupon)}>
                    <Pencil className="size-3.5" />
                  </Button>
                  <Button size="sm" variant="danger" onClick={() => setDeleting(coupon)}>
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Edit coupon" : "Add coupon"}
        size="lg"
      >
        <form
          onSubmit={handleSubmit((values) => saveMutation.mutate(values))}
          className="space-y-4"
          noValidate
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Code"
              placeholder="SAVE10"
              error={errors.code?.message}
              {...register("code")}
            />
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#3B2924] dark:text-[#FFF4E8]">
                Discount type
              </label>
              <select
                className="w-full rounded-xl border border-[#E8DCD0] bg-[#FFFCF7] px-3.5 py-2.5 text-sm text-[#3B2924] shadow-sm focus:border-[#B85C4A] focus:outline-none focus:ring-2 focus:ring-[#B85C4A]/20 dark:border-[#382823] dark:bg-[#1A1210]/90 dark:text-[#FFF4E8] dark:focus:border-[#D47763] dark:focus:ring-[#D47763]/25"
                {...register("discountType")}
              >
                <option value="PERCENTAGE">Percentage (%)</option>
                <option value="FIXED">Fixed amount (₹)</option>
              </select>
            </div>
          </div>

          <Textarea
            label="Description"
            rows={2}
            error={errors.description?.message}
            {...register("description")}
          />

          <div className="grid gap-4 sm:grid-cols-3">
            <Input label="Discount value" type="number" min={0} step="0.01" error={errors.discountValue?.message} {...register("discountValue")} />
            <Input label="Minimum purchase (₹)" type="number" min={0} step="0.01" error={errors.minimumPurchase?.message} {...register("minimumPurchase")} />
            <Input label="Max discount (₹, 0 = none)" type="number" min={0} step="0.01" error={errors.maximumDiscount?.message} {...register("maximumDiscount")} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Usage limit" type="number" min={1} error={errors.usageLimit?.message} {...register("usageLimit")} />
            <Input label="Expiry date" type="date" error={errors.expiresAt?.message} {...register("expiresAt")} />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={saveMutation.isPending}>
              {editing ? "Save changes" : "Create coupon"}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={() => deleting && deleteMutation.mutate(deleting._id)}
        title="Delete coupon?"
        description={deleting ? `Coupon "${deleting.code}" will be permanently deleted.` : undefined}
        confirmLabel="Delete"
        danger
        loading={deleteMutation.isPending}
      />
    </div>
  );
};

export default CouponsPage;
