import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Home, MapPin, Pencil, Plus, Star, Trash2 } from "lucide-react";
import { api, getErrorMessage } from "@/lib/api";
import { useAddresses } from "@/hooks/useApi";
import { useToast } from "@/context/ToastContext";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge, Card, PageLoader } from "@/components/ui/Card";
import { ConfirmDialog, Modal } from "@/components/ui/Modal";
import { EmptyState, ErrorState } from "@/components/ui/States";
import { PageLayout } from "@/components/layout/PageLayout";
import type { Address } from "@/types";

const addressSchema = z.object({
  fullName: z.string().min(2, "Full name is required").max(80),
  phone: z.string().min(10, "Enter a valid phone number").max(15),
  addressLine1: z.string().min(5, "Address is required").max(150),
  addressLine2: z.string().max(150).optional().or(z.literal("")),
  city: z.string().min(2, "City is required").max(80),
  state: z.string().min(2, "State is required").max(80),
  country: z.string().min(2, "Country is required").max(80),
  postalCode: z.string().min(4, "Postal code is required").max(10),
  isDefault: z.boolean().optional(),
});

type AddressForm = z.infer<typeof addressSchema>;

const emptyForm: AddressForm = {
  fullName: "",
  phone: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  country: "India",
  postalCode: "",
};

export const AddressesPage = () => {
  const { data: addresses, isLoading, isError, error, refetch } = useAddresses();
  const queryClient = useQueryClient();
  const toast = useToast();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Address | null>(null);
  const [deleting, setDeleting] = useState<Address | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AddressForm>({
    resolver: zodResolver(addressSchema),
    defaultValues: emptyForm,
  });

  const openCreate = () => {
    setEditing(null);
    reset(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (address: Address) => {
    setEditing(address);
    reset({
      fullName: address.fullName,
      phone: address.phone,
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2 ?? "",
      city: address.city,
      state: address.state,
      country: address.country,
      postalCode: address.postalCode,
      isDefault: address.isDefault,
    });
    setModalOpen(true);
  };

  const invalidate = () =>
    void queryClient.invalidateQueries({ queryKey: ["addresses"] });

  const saveMutation = useMutation({
    mutationFn: async (values: AddressForm) => {
      const payload = {
        ...values,
        addressLine2: values.addressLine2 || undefined,
      };

      if (editing) {
        const { data } = await api.patch<{ data: Address }>(
          `/addresses/${editing._id}`,
          payload
        );
        return data.data;
      }

      const { data } = await api.post<{ data: Address }>("/addresses", payload);
      return data.data;
    },
    onSuccess: () => {
      toast.success(editing ? "Address updated" : "Address added");
      setModalOpen(false);
      invalidate();
      void refetch();
    },
    onError: (saveError) => {
      toast.error(getErrorMessage(saveError));
    },
  });

  const setDefaultMutation = useMutation({
    mutationFn: async (addressId: string) => {
      const { data } = await api.patch<{ data: Address }>(
        `/addresses/${addressId}/default`
      );
      return data.data;
    },
    onSuccess: () => {
      toast.success("Default address updated");
      invalidate();
    },
    onError: (defaultError) => {
      toast.error(getErrorMessage(defaultError));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (addressId: string) => {
      await api.delete(`/addresses/${addressId}`);
    },
    onSuccess: () => {
      toast.success("Address deleted");
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

  return (
    <PageLayout
      title="Addresses"
      subtitle="Manage your shipping addresses"
      actions={
        <Button onClick={openCreate}>
          <Plus className="size-4" /> Add address
        </Button>
      }
    >
      {isError ? (
        <ErrorState message={getErrorMessage(error)} onRetry={() => void refetch()} />
      ) : !addresses || addresses.length === 0 ? (
        <EmptyState
          icon={<MapPin className="size-7" />}
          title="No addresses yet"
          description="Add a shipping address to make checkout faster."
          action={
            <Button onClick={openCreate}>
              <Plus className="size-4" /> Add your first address
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {addresses.map((address) => (
            <Card key={address._id} className="flex flex-col p-5">
              <div className="mb-3 flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Home className="size-4.5 text-slate-400" />
                  {address.isDefault ? (
                    <Badge variant="info">
                      <Star className="size-3.5 fill-current" /> Default
                    </Badge>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setDefaultMutation.mutate(address._id)}
                      className="text-xs font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
                    >
                      Set as default
                    </button>
                  )}
                </div>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => openEdit(address)}
                    className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-200"
                    aria-label={`Edit address for ${address.fullName}`}
                  >
                    <Pencil className="size-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleting(address)}
                    className="rounded-lg p-1.5 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10"
                    aria-label={`Delete address for ${address.fullName}`}
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-0.5 text-sm">
                <p className="font-semibold text-slate-900 dark:text-white">
                  {address.fullName}
                </p>
                <p className="text-slate-500 dark:text-slate-400">{address.phone}</p>
                <p className="text-slate-600 dark:text-slate-300">
                  {address.addressLine1}
                  {address.addressLine2 ? `, ${address.addressLine2}` : ""}
                </p>
                <p className="text-slate-600 dark:text-slate-300">
                  {address.city}, {address.state} — {address.postalCode}
                </p>
                <p className="text-slate-500 dark:text-slate-400">{address.country}</p>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Edit address" : "Add address"}
        size="lg"
      >
        <form
          onSubmit={handleSubmit((values) => saveMutation.mutate(values))}
          className="grid gap-4 sm:grid-cols-2"
          noValidate
        >
          <Input label="Full name" placeholder="Priya Sharma" error={errors.fullName?.message} {...register("fullName")} />
          <Input label="Phone" type="tel" placeholder="+91 98765 43210" error={errors.phone?.message} {...register("phone")} />
          <div className="sm:col-span-2">
            <Input label="Address line 1" placeholder="House no, street, area" error={errors.addressLine1?.message} {...register("addressLine1")} />
          </div>
          <div className="sm:col-span-2">
            <Input label="Address line 2 (optional)" placeholder="Landmark, building" error={errors.addressLine2?.message} {...register("addressLine2")} />
          </div>
          <Input label="City" placeholder="Mumbai" error={errors.city?.message} {...register("city")} />
          <Input label="State" placeholder="Maharashtra" error={errors.state?.message} {...register("state")} />
          <Input label="Country" placeholder="India" error={errors.country?.message} {...register("country")} />
          <Input label="Postal code" placeholder="400001" error={errors.postalCode?.message} {...register("postalCode")} />

          <label className="flex items-center gap-2 sm:col-span-2">
            <input type="checkbox" className="size-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" {...register("isDefault")} />
            <span className="text-sm text-slate-600 dark:text-slate-300">Set as default address</span>
          </label>

          <div className="flex justify-end gap-3 sm:col-span-2">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={saveMutation.isPending}>
              {editing ? "Save changes" : "Add address"}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={() => deleting && deleteMutation.mutate(deleting._id)}
        title="Delete address?"
        description={
          deleting
            ? `This will remove the address for ${deleting.fullName}. This cannot be undone.`
            : undefined
        }
        confirmLabel="Delete"
        danger
        loading={deleteMutation.isPending}
      />

      {saveMutation.isSuccess && (
        <div className="sr-only" aria-live="polite">
          <CheckCircle2 />
        </div>
      )}
    </PageLayout>
  );
};

export default AddressesPage;
