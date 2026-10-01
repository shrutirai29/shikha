import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ImagePlus, Pencil, Plus, Search, Trash2, X } from "lucide-react";
import { api, getErrorMessage } from "@/lib/api";
import { useAdminProducts, useCategories } from "@/hooks/useApi";
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
import { formatCurrency } from "@/lib/utils";
import type { Product } from "@/types";

const priceField = (label: string) =>
  z
    .string()
    .refine((value) => value.trim() !== "" && !Number.isNaN(Number(value)), {
      message: label,
    });

const productSchema = z
  .object({
    name: z.string().min(3, "Name must be at least 3 characters"),
    description: z.string().min(10, "Description must be at least 10 characters"),
    price: priceField("Price must be a valid number"),
    discountPrice: z
      .string()
      .optional()
      .refine(
        (value) => !value || value.trim() === "" || !Number.isNaN(Number(value)),
        { message: "Discount price must be a valid number" }
      ),
    stock: z
      .string()
      .refine(
        (value) => value.trim() !== "" && Number.isInteger(Number(value)),
        { message: "Stock must be a whole number" }
      ),
    category: z.string().min(1, "Category is required"),
    isFeatured: z.boolean().optional(),
    isActive: z.boolean().optional(),
  })
  .refine(
    (data) =>
      !data.discountPrice ||
      data.discountPrice.trim() === "" ||
      Number(data.discountPrice) < Number(data.price),
    {
      path: ["discountPrice"],
      message: "Discount price must be lower than price",
    }
  );

type ProductForm = z.input<typeof productSchema>;

export const ProductsPage = () => {
  const toast = useToast();
  const queryClient = useQueryClient();
  const { data: categories } = useCategories();

  const [search, setSearch] = useState("");
  const { data: products, isLoading, isError, error, refetch } = useAdminProducts({
    search: search || undefined,
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState<Product | null>(null);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [removedImages, setRemovedImages] = useState<string[]>([]);

  const existingImages = useMemo(
    () =>
      (editing?.images ?? []).filter((url) => !removedImages.includes(url)),
    [editing, removedImages]
  );

  const newImagePreviews = useMemo(
    () => newImages.map((file) => URL.createObjectURL(file)),
    [newImages]
  );

  const maxImagesReached = existingImages.length + newImages.length >= 5;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProductForm>({
    resolver: zodResolver(productSchema),
  });

  const invalidate = () =>
    void queryClient.invalidateQueries({ queryKey: ["admin-products"] });

  const openCreate = () => {
    setEditing(null);
    setNewImages([]);
    setRemovedImages([]);
    reset({
      name: "",
      description: "",
      price: "",
      discountPrice: "",
      stock: "0",
      category: categories?.[0]?._id ?? "",
      isFeatured: false,
      isActive: true,
    });
    setModalOpen(true);
  };

  const openEdit = (product: Product) => {
    setEditing(product);
    setNewImages([]);
    setRemovedImages([]);

    reset({
      name: product.name,
      description: product.description,
      price: String(product.price),
      discountPrice: product.discountPrice ? String(product.discountPrice) : "",
      stock: String(product.stock),
      category: typeof product.category === "string" ? product.category : product.category._id,
      isFeatured: product.isFeatured,
      isActive: product.isActive,
    });
    setModalOpen(true);
  };

  const saveMutation = useMutation({
    mutationFn: async (values: ProductForm) => {
      const payload = {
        name: values.name,
        description: values.description,
        price: Number(values.price),
        discountPrice: values.discountPrice?.trim()
          ? Number(values.discountPrice)
          : undefined,
        stock: Number(values.stock),
        category: values.category,
        isFeatured: values.isFeatured ?? false,
        isActive: values.isActive ?? true,
      };

      let product: Product;

      if (editing) {
        const { data } = await api.patch<{ data: Product }>(
          `/products/${editing._id}`,
          payload
        );
        product = data.data;
      } else {
        const { data } = await api.post<{ data: Product }>("/products", payload);
        product = data.data;
        setEditing(product);
      }

      let imagesFailed = "";

      try {
        for (const url of removedImages) {
          await api.delete(`/products/${product._id}/images`, { data: { url } });
          setRemovedImages((prev) => prev.filter((u) => u !== url));
        }

        if (newImages.length > 0) {
          const formData = new FormData();
          newImages.forEach((file) => formData.append("images", file));

          const { data } = await api.post<{ data: Product }>(
            `/products/${product._id}/images`,
            formData
          );
          product = data.data;
          setNewImages([]);
        }
      } catch (uploadError) {
        imagesFailed = getErrorMessage(uploadError);
      }

      return { product, imagesFailed };
    },
    onSuccess: ({ imagesFailed }) => {
      invalidate();

      if (imagesFailed) {
        toast.error(
          `Product saved, but image upload failed: ${imagesFailed}. Fix the issue and click Save again.`
        );
        return;
      }

      toast.success(editing ? "Product updated" : "Product created");
      setModalOpen(false);
      setNewImages([]);
      setRemovedImages([]);
    },
    onError: (saveError) => {
      toast.error(getErrorMessage(saveError));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (productId: string) => {
      const res = await api.delete<{ message?: string }>(`/products/${productId}`);
      return res.data.message;
    },
    onSuccess: (message) => {
      toast.success(message ?? "Product deleted");
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#3B2924] dark:text-[#FFF4E8]">
            Products
          </h1>
          <p className="mt-1 text-sm text-[#806E66] dark:text-[#B3A198]">
            Manage your artisanal catalog and inventory
          </p>
        </div>
        <Button onClick={openCreate} className="w-full sm:w-auto">
          <Plus className="size-4" /> Add product
        </Button>
      </div>

      <div className="relative w-full sm:max-w-xs">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[#806E66] dark:text-[#B3A198]" />
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search products…"
          className="h-10 w-full rounded-xl border border-[#E8DCD0] bg-[#FFFCF7] pl-9 pr-3 text-sm text-[#3B2924] shadow-sm placeholder:text-[#806E66]/60 focus:border-[#B85C4A] focus:outline-none focus:ring-2 focus:ring-[#B85C4A]/20 dark:border-[#382823] dark:bg-[#1A1210]/90 dark:text-[#FFF4E8] dark:placeholder:text-[#B3A198]/50 dark:focus:border-[#D47763] dark:focus:ring-[#D47763]/25"
        />
      </div>

      {isError ? (
        <ErrorState message={getErrorMessage(error)} onRetry={() => void refetch()} />
      ) : !products || products.length === 0 ? (
        <EmptyState
          title="No products found"
          description="Create your first product to start selling."
          action={
            <Button onClick={openCreate}>
              <Plus className="size-4" /> Add product
            </Button>
          }
        />
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[#E8DCD0] text-xs uppercase tracking-wide text-[#806E66] dark:border-[#382823] dark:text-[#B3A198]">
                  <th className="px-3.5 py-3 sm:px-5 font-semibold">Product</th>
                  <th className="px-3.5 py-3 sm:px-5 font-semibold">Category</th>
                  <th className="px-3.5 py-3 sm:px-5 font-semibold">Price</th>
                  <th className="px-3.5 py-3 sm:px-5 font-semibold">Stock</th>
                  <th className="px-3.5 py-3 sm:px-5 font-semibold">Status</th>
                  <th className="px-3.5 py-3 sm:px-5 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => {
                  const category =
                    typeof product.category === "string" ? null : product.category;

                  return (
                    <tr
                      key={product._id}
                      className="border-b border-[#E8DCD0]/60 last:border-0 hover:bg-[#F5EDE4]/30 dark:border-[#382823]/60 dark:hover:bg-[#251B18]/40 transition-colors"
                    >
                      <td className="px-3.5 py-3 sm:px-5">
                        <div className="flex items-center gap-2.5 sm:gap-3">
                          <div className="size-10 sm:size-11 shrink-0 overflow-hidden rounded-xl border border-[#E8DCD0] bg-[#F5EDE4] dark:border-[#382823] dark:bg-[#251B18]">
                            {product.images[0] ? (
                              <img src={product.images[0]} alt="" className="size-full object-cover" />
                            ) : null}
                          </div>
                          <div className="min-w-0">
                            <p className="max-w-36 sm:max-w-52 truncate font-semibold text-[#3B2924] dark:text-[#FFF4E8]">
                              {product.name}
                            </p>
                            <p className="text-xs text-[#806E66] dark:text-[#B3A198] truncate max-w-32 sm:max-w-none">{product.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3.5 py-3 sm:px-5 text-[#806E66] dark:text-[#B3A198]">
                        {category?.name ?? "—"}
                      </td>
                      <td className="px-3.5 py-3 sm:px-5">
                        <span className="font-semibold text-[#3B2924] dark:text-[#FFF4E8]">
                          {formatCurrency(product.discountPrice ?? product.price)}
                        </span>
                        {product.discountPrice ? (
                          <span className="ml-1.5 text-xs text-[#806E66] line-through dark:text-[#B3A198]">
                            {formatCurrency(product.price)}
                          </span>
                        ) : null}
                      </td>
                      <td className="px-3.5 py-3 sm:px-5">
                        <Badge variant={product.stock <= 5 ? "warning" : "success"}>
                          {product.stock}
                        </Badge>
                      </td>
                      <td className="px-3.5 py-3 sm:px-5">
                        <div className="flex gap-1">
                          {product.isFeatured && <Badge variant="info">Featured</Badge>}
                          <Badge variant={product.isActive ? "success" : "danger"}>
                            {product.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                      </td>
                      <td className="px-3.5 py-3 sm:px-5">
                        <div className="flex justify-end gap-2 whitespace-nowrap">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openEdit(product)}
                            aria-label={`Edit ${product.name}`}
                          >
                            <Pencil className="size-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => setDeleting(product)}
                            aria-label={`Delete ${product.name}`}
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Edit product" : "Add product"}
        size="lg"
      >
        <form
          onSubmit={handleSubmit((values) => saveMutation.mutate(values))}
          className="space-y-4"
          noValidate
        >
          <Input label="Name" error={errors.name?.message} {...register("name")} />
          <Textarea label="Description" rows={4} error={errors.description?.message} {...register("description")} />
          <div className="grid gap-4 sm:grid-cols-3">
            <Input label="Price (₹)" type="number" min={0} step="0.01" error={errors.price?.message} {...register("price")} />
            <Input label="Discount price" type="number" min={0} step="0.01" error={errors.discountPrice?.message} {...register("discountPrice")} />
            <Input label="Stock" type="number" min={0} error={errors.stock?.message} {...register("stock")} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#3B2924] dark:text-[#FFF4E8]">
                Category
              </label>
              <select
                className="w-full rounded-xl border border-[#E8DCD0] bg-[#FFFCF7] px-3.5 py-2.5 text-sm text-[#3B2924] shadow-sm focus:border-[#B85C4A] focus:outline-none focus:ring-2 focus:ring-[#B85C4A]/20 dark:border-[#382823] dark:bg-[#1A1210]/90 dark:text-[#FFF4E8] dark:focus:border-[#D47763] dark:focus:ring-[#D47763]/25"
                {...register("category")}
              >
                {(categories ?? []).map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="mt-1 text-xs font-medium text-[#914536] dark:text-[#E28A76]">{errors.category.message}</p>
              )}
            </div>
            <div className="flex flex-wrap items-end gap-4">
              <label className="flex items-center gap-2 pb-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="size-4 rounded border-[#E8DCD0] accent-[#B85C4A] dark:border-[#382823]"
                  {...register("isFeatured")}
                />
                <span className="text-sm text-[#3B2924] dark:text-[#FFF4E8]">Featured product</span>
              </label>
              <label className="flex items-center gap-2 pb-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="size-4 rounded border-[#E8DCD0] accent-[#B85C4A] dark:border-[#382823]"
                  {...register("isActive")}
                />
                <span className="text-sm text-[#3B2924] dark:text-[#FFF4E8]">Active (visible in store)</span>
              </label>
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#3B2924] dark:text-[#FFF4E8]">
              Product images
            </label>
            <div className="flex flex-wrap gap-3">
              {existingImages.map((url) => (
                <div
                  key={url}
                  className="relative size-20 overflow-hidden rounded-xl border border-[#E8DCD0] bg-[#F5EDE4] dark:border-[#382823] dark:bg-[#1A1210]"
                >
                  <img src={url} alt="" className="size-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setRemovedImages([...removedImages, url])}
                    aria-label="Remove image"
                    className="absolute -right-1.5 -top-1.5 grid size-5 place-items-center rounded-full bg-[#B85C4A] text-white shadow hover:bg-[#914536] dark:bg-[#D47763] dark:hover:bg-[#E28A76] dark:text-[#1F1816]"
                  >
                    <X className="size-3" />
                  </button>
                </div>
              ))}
              {newImages.map((file, index) => (
                <div
                  key={`${file.name}-${index}`}
                  className="relative size-20 overflow-hidden rounded-xl border border-[#E8DCD0] bg-[#F5EDE4] dark:border-[#382823] dark:bg-[#1A1210]"
                >
                  <img
                    src={newImagePreviews[index]}
                    alt={file.name}
                    className="size-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setNewImages(newImages.filter((_, i) => i !== index))
                    }
                    aria-label={`Remove ${file.name}`}
                    className="absolute -right-1.5 -top-1.5 grid size-5 place-items-center rounded-full bg-[#B85C4A] text-white shadow hover:bg-[#914536] dark:bg-[#D47763] dark:hover:bg-[#E28A76] dark:text-[#1F1816]"
                  >
                    <X className="size-3" />
                  </button>
                </div>
              ))}
              {!maxImagesReached && (
                <label className="grid size-20 cursor-pointer place-items-center rounded-xl border-2 border-dashed border-[#E8DCD0] text-[#806E66] transition hover:border-[#D47763] hover:text-[#D47763] dark:border-[#382823] dark:text-[#B3A198] dark:hover:border-[#D47763]">
                  <ImagePlus className="size-6" />
                  <span className="sr-only">Upload images</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(event) => {
                      const files = Array.from(event.target.files ?? []);
                      setNewImages(
                        [...newImages, ...files].slice(
                          0,
                          5 - existingImages.length
                        )
                      );
                      event.target.value = "";
                    }}
                  />
                </label>
              )}
            </div>
            <p className="mt-1.5 text-xs text-[#806E66] dark:text-[#B3A198]">
              Up to 5 images — JPG, PNG, WebP, GIF or AVIF (max 5MB each).
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={saveMutation.isPending}>
              {editing ? "Save changes" : "Create product"}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={() => deleting && deleteMutation.mutate(deleting._id)}
        title="Delete product?"
        description={
          deleting
            ? deleting.isActive
              ? `"${deleting.name}" will be deactivated and hidden from the store. Delete it again later to remove it permanently.`
              : `"${deleting.name}" is already inactive and will be permanently deleted. This cannot be undone.`
            : undefined
        }
        confirmLabel={deleting?.isActive ? "Deactivate" : "Delete permanently"}
        danger
        loading={deleteMutation.isPending}
      />
    </div>
  );
};

export default ProductsPage;
