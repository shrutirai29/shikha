import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { api, getErrorMessage } from "@/lib/api";
import { useAdminCategories } from "@/hooks/useApi";
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
import type { Category } from "@/types";

const categorySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50),
  description: z.string().max(200).optional().or(z.literal("")),
  image: z.string().url("Enter a valid image URL").optional().or(z.literal("")),
});

type CategoryForm = z.infer<typeof categorySchema>;

export const CategoriesPage = () => {
  const toast = useToast();
  const queryClient = useQueryClient();
  const { data: categories, isLoading, isError, error, refetch } = useAdminCategories();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState<Category | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CategoryForm>({
    resolver: zodResolver(categorySchema),
  });

  const invalidate = () =>
    void queryClient.invalidateQueries({ queryKey: ["admin-categories"] });

  const openCreate = () => {
    setEditing(null);
    reset({ name: "", description: "", image: "" });
    setModalOpen(true);
  };

  const openEdit = (category: Category) => {
    setEditing(category);
    reset({
      name: category.name,
      description: category.description ?? "",
      image: category.image ?? "",
    });
    setModalOpen(true);
  };

  const saveMutation = useMutation({
    mutationFn: async (values: CategoryForm) => {
      const payload = {
        name: values.name,
        description: values.description || undefined,
        image: values.image || undefined,
      };

      if (editing) {
        const { data } = await api.patch<{ data: Category }>(
          `/categories/${editing._id}`,
          payload
        );
        return data.data;
      }

      const { data } = await api.post<{ data: Category }>("/categories", payload);
      return data.data;
    },
    onSuccess: () => {
      toast.success(editing ? "Category updated" : "Category created");
      setModalOpen(false);
      invalidate();
    },
    onError: (saveError) => {
      toast.error(getErrorMessage(saveError));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (categoryId: string) => {
      await api.delete(`/categories/${categoryId}`);
    },
    onSuccess: () => {
      toast.success("Category deleted");
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
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Categories
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Organize your catalog
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="size-4" /> Add category
        </Button>
      </div>

      {isError ? (
        <ErrorState message={getErrorMessage(error)} onRetry={() => void refetch()} />
      ) : !categories || categories.length === 0 ? (
        <EmptyState
          title="No categories yet"
          description="Create categories to organize your products."
          action={
            <Button onClick={openCreate}>
              <Plus className="size-4" /> Add category
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <Card key={category._id} className="flex items-center gap-4 p-4">
              <div className="size-14 shrink-0 overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-700/40">
                {category.image ? (
                  <img src={category.image} alt="" className="size-full object-cover" />
                ) : (
                  <div className="flex size-full items-center justify-center bg-gradient-to-br from-indigo-100 to-indigo-200 text-xl font-bold text-indigo-500 dark:from-indigo-950 dark:to-slate-800 dark:text-indigo-400">
                    {category.name.charAt(0)}
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                    {category.name}
                  </h3>
                  <Badge variant={category.isActive ? "success" : "danger"}>
                    {category.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <p className="mt-0.5 line-clamp-2 text-xs text-slate-400">
                  {category.description || category.slug}
                </p>
              </div>
              <div className="flex shrink-0 gap-1">
                <button
                  type="button"
                  onClick={() => openEdit(category)}
                  className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-200"
                  aria-label={`Edit ${category.name}`}
                >
                  <Pencil className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setDeleting(category)}
                  className="rounded-lg p-2 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10"
                  aria-label={`Delete ${category.name}`}
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Edit category" : "Add category"}
      >
        <form
          onSubmit={handleSubmit((values) => saveMutation.mutate(values))}
          className="space-y-4"
          noValidate
        >
          <Input label="Name" error={errors.name?.message} {...register("name")} />
          <Textarea label="Description" rows={3} error={errors.description?.message} {...register("description")} />
          <Input
            label="Image URL (optional)"
            placeholder="https://…"
            error={errors.image?.message}
            {...register("image")}
          />
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={saveMutation.isPending}>
              {editing ? "Save changes" : "Create category"}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={() => deleting && deleteMutation.mutate(deleting._id)}
        title="Delete category?"
        description={
          deleting
            ? `"${deleting.name}" will be hidden from the store.`
            : undefined
        }
        confirmLabel="Delete"
        danger
        loading={deleteMutation.isPending}
      />
    </div>
  );
};

export default CategoriesPage;
