import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
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
    images: z.string(),
    category: z.string().min(1, "Category is required"),
    isFeatured: z.boolean().optional(),
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
    reset({
      name: "",
      description: "",
      price: "",
      discountPrice: "",
      stock: "0",
      images: "",
      category: categories?.[0]?._id ?? "",
      isFeatured: false,
    });
    setModalOpen(true);
  };

  const openEdit = (product: Product) => {
    setEditing(product);

    reset({
      name: product.name,
      description: product.description,
      price: String(product.price),
      discountPrice: product.discountPrice ? String(product.discountPrice) : "",
      stock: String(product.stock),
      images: product.images.join("\n"),
      category: typeof product.category === "string" ? product.category : product.category._id,
      isFeatured: product.isFeatured,
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
        images: values.images
          .split("\n")
          .map((url) => url.trim())
          .filter(Boolean),
      };

      if (editing) {
        const { data } = await api.patch<{ data: Product }>(
          `/products/${editing._id}`,
          payload
        );
        return data.data;
      }

      const { data } = await api.post<{ data: Product }>("/products", payload);
      return data.data;
    },
    onSuccess: () => {
      toast.success(editing ? "Product updated" : "Product created");
      setModalOpen(false);
      invalidate();
    },
    onError: (saveError) => {
      toast.error(getErrorMessage(saveError));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (productId: string) => {
      await api.delete(`/products/${productId}`);
    },
    onSuccess: () => {
      toast.success("Product deleted");
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
            Products
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Manage your product catalog
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="size-4" /> Add product
        </Button>
      </div>

      <div className="relative max-w-xs">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search products…"
          className="h-10 w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
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
                <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-400 dark:border-slate-700">
                  <th className="px-5 py-3 font-semibold">Product</th>
                  <th className="px-5 py-3 font-semibold">Category</th>
                  <th className="px-5 py-3 font-semibold">Price</th>
                  <th className="px-5 py-3 font-semibold">Stock</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => {
                  const category =
                    typeof product.category === "string" ? null : product.category;

                  return (
                    <tr
                      key={product._id}
                      className="border-b border-slate-100 last:border-0 dark:border-slate-700/60"
                    >
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="size-11 shrink-0 overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-700/40">
                            {product.images[0] ? (
                              <img src={product.images[0]} alt="" className="size-full object-cover" />
                            ) : null}
                          </div>
                          <div className="min-w-0">
                            <p className="max-w-52 truncate font-semibold text-slate-900 dark:text-white">
                              {product.name}
                            </p>
                            <p className="text-xs text-slate-400">{product.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-slate-600 dark:text-slate-300">
                        {category?.name ?? "—"}
                      </td>
                      <td className="px-5 py-3">
                        <span className="font-semibold text-slate-900 dark:text-white">
                          {formatCurrency(product.discountPrice ?? product.price)}
                        </span>
                        {product.discountPrice ? (
                          <span className="ml-1.5 text-xs text-slate-400 line-through">
                            {formatCurrency(product.price)}
                          </span>
                        ) : null}
                      </td>
                      <td className="px-5 py-3">
                        <Badge variant={product.stock <= 5 ? "warning" : "success"}>
                          {product.stock}
                        </Badge>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex gap-1">
                          {product.isFeatured && <Badge variant="info">Featured</Badge>}
                          <Badge variant={product.isActive ? "success" : "danger"}>
                            {product.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex justify-end gap-2">
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
              <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Category
              </label>
              <select
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                {...register("category")}
              >
                {(categories ?? []).map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="mt-1 text-xs font-medium text-rose-600">{errors.category.message}</p>
              )}
            </div>
            <label className="flex items-end gap-2 pb-2">
              <input
                type="checkbox"
                className="size-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                {...register("isFeatured")}
              />
              <span className="text-sm text-slate-600 dark:text-slate-300">Featured product</span>
            </label>
          </div>
          <Textarea
            label="Image URLs (one per line)"
            rows={3}
            hint="Paste image URLs, one per line"
            error={errors.images?.message}
            {...register("images")}
          />

          <div className="flex justify-end gap-3">
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
            ? `"${deleting.name}" will be hidden from the store. This can be reverted by an admin.`
            : undefined
        }
        confirmLabel="Delete"
        danger
        loading={deleteMutation.isPending}
      />
    </div>
  );
};

export default ProductsPage;
