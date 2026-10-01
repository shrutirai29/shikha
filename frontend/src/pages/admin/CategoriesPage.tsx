import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ImagePlus, Pencil, Plus, Trash2 } from "lucide-react";
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
});

type CategoryForm = z.infer<typeof categorySchema>;

export const CategoriesPage = () => {
  const toast = useToast();
  const queryClient = useQueryClient();
  const { data: categories, isLoading, isError, error, refetch } = useAdminCategories();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState<Category | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const imagePreview = useMemo(
    () => (imageFile ? URL.createObjectURL(imageFile) : null),
    [imageFile]
  );

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
    setImageFile(null);
    reset({ name: "", description: "" });
    setModalOpen(true);
  };

  const openEdit = (category: Category) => {
    setEditing(category);
    setImageFile(null);
    reset({
      name: category.name,
      description: category.description ?? "",
    });
    setModalOpen(true);
  };

  const saveMutation = useMutation({
    mutationFn: async (values: CategoryForm) => {
      const payload = {
        name: values.name,
        description: values.description || undefined,
      };

      let category: Category;

      if (editing) {
        const { data } = await api.patch<{ data: Category }>(
          `/categories/${editing._id}`,
          payload
        );
        category = data.data;
      } else {
        const { data } = await api.post<{ data: Category }>("/categories", payload);
        category = data.data;
        setEditing(category);
      }

      let imagesFailed = "";

      try {
        if (imageFile) {
          const formData = new FormData();
          formData.append("image", imageFile);

          const { data } = await api.post<{ data: Category }>(
            `/categories/${category._id}/image`,
            formData
          );
          category = data.data;
        }
      } catch (uploadError) {
        imagesFailed = getErrorMessage(uploadError);
      }

      return { category, imagesFailed };
    },
    onSuccess: ({ imagesFailed }) => {
      invalidate();

      if (imagesFailed) {
        toast.error(`Category saved, but image upload failed: ${imagesFailed}`);
        return;
      }

      toast.success(editing ? "Category updated" : "Category created");
      setModalOpen(false);
      setImageFile(null);
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
          <h1 className="text-2xl font-bold tracking-tight text-[#3B2924] dark:text-[#FFF4E8]">
            Categories
          </h1>
          <p className="mt-1 text-sm text-[#806E66] dark:text-[#B3A198]">
            Organize and curate your handmade catalog
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
              <div className="size-14 shrink-0 overflow-hidden rounded-xl bg-[#F5EDE4] dark:bg-[#251B18] border border-[#E8DCD0] dark:border-[#382823]">
                {category.image ? (
                  <img src={category.image} alt="" className="size-full object-cover" />
                ) : (
                  <div className="flex size-full items-center justify-center bg-gradient-to-br from-[#E0B86A]/20 to-[#D47763]/20 text-xl font-bold text-[#B85C4A] dark:text-[#E0B86A]">
                    {category.name.charAt(0)}
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="truncate text-sm font-semibold text-[#3B2924] dark:text-[#FFF4E8]">
                    {category.name}
                  </h3>
                  <Badge variant={category.isActive ? "success" : "danger"}>
                    {category.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <p className="mt-0.5 line-clamp-2 text-xs text-[#806E66] dark:text-[#B3A198]">
                  {category.description || category.slug}
                </p>
              </div>
              <div className="flex shrink-0 gap-1">
                <button
                  type="button"
                  onClick={() => openEdit(category)}
                  className="rounded-lg p-2 text-[#806E66] transition hover:bg-[#F5EDE4] hover:text-[#3B2924] dark:text-[#B3A198] dark:hover:bg-[#251B18] dark:hover:text-[#FFF4E8]"
                  aria-label={`Edit ${category.name}`}
                >
                  <Pencil className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setDeleting(category)}
                  className="rounded-lg p-2 text-[#806E66] transition hover:bg-[#B85C4A]/10 hover:text-[#914536] dark:text-[#B3A198] dark:hover:bg-[#D47763]/15 dark:hover:text-[#E28A76]"
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
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#3B2924] dark:text-[#FFF4E8]">
              Category image
            </label>
            <div className="flex items-center gap-3">
              {(imagePreview || (!imageFile && editing?.image)) && (
                <div className="size-20 shrink-0 overflow-hidden rounded-lg border border-[#E8DCD0] bg-[#F5EDE4] dark:border-[#382823] dark:bg-[#1A1210]">
                  <img
                    src={imagePreview ?? editing!.image!}
                    alt=""
                    className="size-full object-cover"
                  />
                </div>
              )}
              <label className="flex cursor-pointer items-center gap-2 rounded-xl border-2 border-dashed border-[#E8DCD0] px-4 py-3 text-sm font-medium text-[#806E66] transition hover:border-[#D47763] hover:text-[#D47763] dark:border-[#382823] dark:text-[#B3A198] dark:hover:border-[#D47763]/60 dark:hover:text-[#FFF4E8]">
                <ImagePlus className="size-4" />
                {imageFile
                  ? "Replace image"
                  : editing?.image
                    ? "Change image"
                    : "Upload image"}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(event) => {
                    const file = event.target.files?.[0] ?? null;
                    setImageFile(file);
                    event.target.value = "";
                  }}
                />
              </label>
            </div>
            <p className="mt-1.5 text-xs text-[#806E66] dark:text-[#B3A198]">
              JPG, PNG, WebP, GIF or AVIF (max 5MB).
            </p>
          </div>
          <div className="flex justify-end gap-3 pt-2">
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
