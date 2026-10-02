import {
  useMutation,
  useQuery,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { api, TOKEN_KEY } from "@/lib/api";
import type {
  Address,
  Cart,
  Category,
  ContactMessage,
  ContactQuery,
  Coupon,
  DashboardStats,
  Order,
  OrderQuery,
  Pagination,
  Payment,
  Product,
  ProductAnalytics,
  ProductQuery,
  Review,
  SalesAnalytics,
  SearchQuery,
  User,
  UserListQuery,
} from "@/types";

const unwrap = <T>(response: { data: T }): T => response.data;

/* ------------------------------ Products ------------------------------ */

export const useProducts = (query: ProductQuery) =>
  useQuery({
    queryKey: ["products", query],
    queryFn: async () => {
      const { data } = await api.get<{
        products: Product[];
        pagination: Pagination;
      }>("/products", { params: query });

      return { products: data.products ?? [], pagination: data.pagination };
    },
    placeholderData: keepPreviousData,
  });

export const useProduct = (id: string | undefined) =>
  useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      const { data } = await api.get<{ data: Product }>(`/products/${id}`);

      return data.data;
    },
    enabled: Boolean(id),
  });

export const useProductBySlug = (slug: string | undefined) =>
  useQuery({
    queryKey: ["product-slug", slug],
    queryFn: async () => {
      const { data } = await api.get<{ data: Product }>(
        `/products/slug/${slug}`
      );

      return data.data;
    },
    enabled: Boolean(slug),
  });

export const useFeaturedProducts = (limit = 8) =>
  useQuery({
    queryKey: ["featured-products", limit],
    queryFn: async () => {
      const { data } = await api.get<{ products: Product[] }>("/products", {
        params: { isFeatured: true, limit },
      });

      return data.products ?? [];
    },
  });

/* ------------------------------ Search ------------------------------ */

export const useSearch = (query: SearchQuery) =>
  useQuery({
    queryKey: ["search", query],
    queryFn: async () => {
      const { data } = await api.get<{
        products: Product[];
        pagination: Pagination;
      }>("/search/products", { params: query });

      return { products: data.products ?? [], pagination: data.pagination };
    },
    placeholderData: keepPreviousData,
  });

/* ----------------------------- Categories ----------------------------- */

export const useCategories = (params?: { search?: string }) =>
  useQuery({
    queryKey: ["categories", params],
    queryFn: async () => {
      const { data } = await api.get<{ categories: Category[] }>("/categories", {
        params: { limit: 100, ...params },
      });

      return data.categories ?? [];
    },
  });

/* ------------------------------- Cart ------------------------------- */

export const useCart = () =>
  useQuery({
    queryKey: ["cart"],
    queryFn: async () => {
      const { data } = await api.get<{ data: Cart }>("/cart");

      return data.data;
    },
    enabled: Boolean(localStorage.getItem(TOKEN_KEY)),
  });

export const useAddToCart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { productId: string; quantity: number }) => {
      const { data } = await api.post<{ data: Cart }>("/cart", payload);
      return data.data;
    },
    onSuccess: (cart) => {
      queryClient.setQueryData(["cart"], cart);
    },
  });
};

export const useUpdateCartItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { productId: string; quantity: number }) => {
      const { data } = await api.patch<{ data: Cart }>(
        `/cart/${payload.productId}`,
        { quantity: payload.quantity }
      );
      return data.data;
    },
    onSuccess: (cart) => {
      queryClient.setQueryData(["cart"], cart);
    },
  });
};

export const useRemoveCartItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productId: string) => {
      const { data } = await api.delete<{ data: Cart }>(
        `/cart/${productId}`
      );
      return data.data;
    },
    onSuccess: (cart) => {
      queryClient.setQueryData(["cart"], cart);
    },
  });
};

export const useClearCart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await api.delete("/cart");
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });
};

export const useApplyCoupon = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (code: string) => {
      const { data } = await api.post<{ data: Cart }>("/coupons/apply", {
        code,
      });
      return data.data;
    },
    onSuccess: (cart) => {
      queryClient.setQueryData(["cart"], cart);
    },
  });
};

export const useRemoveCoupon = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data } = await api.delete<{ data: Cart }>("/coupons/remove");
      return data.data;
    },
    onSuccess: (cart) => {
      queryClient.setQueryData(["cart"], cart);
    },
  });
};

/* ----------------------------- Wishlist ----------------------------- */

export const useWishlist = () =>
  useQuery({
    queryKey: ["wishlist"],
    queryFn: async () => {
      const { data } = await api.get<{ products: Product[] }>("/wishlist", {
        params: { limit: 100 },
      });

      return data.products;
    },
    enabled: Boolean(localStorage.getItem(TOKEN_KEY)),
  });

export const useAddToWishlist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productId: string) => {
      await api.post(`/wishlist/${productId}`);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["wishlist"] });
    },
  });
};

export const useRemoveFromWishlist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productId: string) => {
      await api.delete(`/wishlist/${productId}`);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["wishlist"] });
    },
  });
};

/* ------------------------------ Addresses ------------------------------ */

export const useAddresses = () =>
  useQuery({
    queryKey: ["addresses"],
    queryFn: async () => {
      const { data } = await api.get<{ addresses: Address[] }>("/addresses", {
        params: { limit: 100 },
      });

      return data.addresses;
    },
  });

/* ------------------------------- Orders ------------------------------- */

export const useMyOrders = (page = 1) =>
  useQuery({
    queryKey: ["my-orders", page],
    queryFn: async () => {
      const { data } = await api.get<{
        orders: Order[];
        pagination: Pagination;
      }>("/orders", { params: { page, limit: 10 } });

      return { orders: data.orders ?? [], pagination: data.pagination };
    },
  });

export const useOrder = (id: string | undefined) =>
  useQuery({
    queryKey: ["order", id],
    queryFn: async () => {
      const { data } = await api.get<{ data: Order }>(`/orders/${id}`);

      return data.data;
    },
    enabled: Boolean(id),
  });

/* ------------------------------ Payments ------------------------------ */

export const useMyPayments = () =>
  useQuery({
    queryKey: ["my-payments"],
    queryFn: async () => {
      const { data } = await api.get<{ payments: Payment[] }>(
        "/payments/me",
        { params: { limit: 50 } }
      );

      return data.payments;
    },
  });

/* ------------------------------- Reviews ------------------------------- */

export const useReviews = (productId: string | undefined) =>
  useQuery({
    queryKey: ["reviews", productId],
    queryFn: async () => {
      const { data } = await api.get<{ reviews: Review[] }>(`/reviews/${productId}`, {
        params: { limit: 50 },
      });

      return data.reviews ?? [];
    },
    enabled: Boolean(productId),
  });

export const useAdminReviews = (query: {
  page?: number;
  limit?: number;
  rating?: number;
  search?: string;
}) =>
  useQuery({
    queryKey: ["admin-reviews", query],
    queryFn: async () => {
      const { data } = await api.get<{
        reviews: Review[];
        pagination: Pagination;
      }>("/reviews/admin/all", { params: query });

      return { reviews: data.reviews ?? [], pagination: data.pagination };
    },
    placeholderData: keepPreviousData,
  });

export const useDeleteReviewAdmin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (reviewId: string) => {
      await api.delete(`/reviews/admin/${reviewId}`);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin-reviews"] });
      void queryClient.invalidateQueries({ queryKey: ["reviews"] });
      void queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
};

export const useCancelOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderId: string) => {
      const { data } = await api.post<{ data: Order }>(
        `/orders/${orderId}/cancel`
      );

      return data.data;
    },
    onSuccess: (order) => {
      queryClient.setQueryData(["order", order._id], order);
      void queryClient.invalidateQueries({ queryKey: ["my-orders"] });
    },
  });
};

export const useChangePassword = () =>
  useMutation({
    mutationFn: async (payload: {
      currentPassword: string;
      newPassword: string;
    }) => {
      const { data } = await api.patch<{ message: string }>(
        "/users/me/password",
        payload
      );

      return data.message;
    },
  });

export const useAddReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      productId: string;
      rating: number;
      comment: string;
    }) => {
      const { data } = await api.post<{ data: Review }>(
        `/reviews/${payload.productId}`,
        { rating: payload.rating, comment: payload.comment }
      );
      return data.data;
    },
    onSuccess: (_review, variables) => {
      void queryClient.invalidateQueries({ queryKey: ["reviews"] });
      void queryClient.invalidateQueries({
        queryKey: ["product", variables.productId],
      });
    },
  });
};

/* ------------------------------- Admin ------------------------------- */

export const useAllOrders = (query: OrderQuery = {}) =>
  useQuery({
    queryKey: ["admin-orders", query],
    queryFn: async () => {
      const { data } = await api.get<{
        orders: Order[];
        pagination: Pagination;
      }>("/orders/admin/all", { params: { page: 1, limit: 10, ...query } });

      return { orders: data.orders ?? [], pagination: data.pagination };
    },
    placeholderData: keepPreviousData,
  });



export const useAllPayments = (page = 1) =>
  useQuery({
    queryKey: ["admin-payments", page],
    queryFn: async () => {
      const { data } = await api.get<{
        payments: Payment[];
        pagination: Pagination;
      }>("/payments", { params: { page, limit: 10 } });

      return { payments: data.payments ?? [], pagination: data.pagination };
    },
  });

export const useAllUsers = (query: UserListQuery) =>
  useQuery({
    queryKey: ["admin-users", query],
    queryFn: async () => {
      const { data } = await api.get<{ users: User[]; pagination: Pagination }>(
        "/users/admin/all",
        { params: query }
      );

      return { users: data.users ?? [], pagination: data.pagination };
    },
    placeholderData: keepPreviousData,
  });

export const useAdminCoupons = () =>
  useQuery({
    queryKey: ["admin-coupons"],
    queryFn: async () => {
      const { data } = await api.get<{ coupons: Coupon[] }>("/coupons", {
        params: { limit: 100 },
      });

      return data.coupons ?? [];
    },
  });

export const useAdminProducts = (query: ProductQuery) =>
  useQuery({
    queryKey: ["admin-products", query],
    queryFn: async () => {
      const { data } = await api.get<{ products: Product[] }>(
        "/products/admin/all",
        {
          params: { ...query, limit: 100, includeInactive: true },
        }
      );

      return data.products ?? [];
    },
  });

export const useAdminCategories = () =>
  useQuery({
    queryKey: ["admin-categories"],
    queryFn: async () => {
      const { data } = await api.get<{ categories: Category[] }>("/categories", {
        params: { limit: 100 },
      });

      return data.categories ?? [];
    },
  });

export const useDashboard = () =>
  useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const { data } = await api.get<{ data: DashboardStats }>("/dashboard");

      return data.data;
    },
  });

export const useSalesAnalytics = () =>
  useQuery({
    queryKey: ["sales-analytics"],
    queryFn: async () => {
      const { data } = await api.get<{ data: SalesAnalytics }>(
        "/analytics/sales"
      );

      return data.data;
    },
  });

export const useProductAnalytics = () =>
  useQuery({
    queryKey: ["product-analytics"],
    queryFn: async () => {
      const { data } = await api.get<{ data: ProductAnalytics }>(
        "/analytics/products"
      );

      return data.data;
    },
  });

export const useWishlistProducts = useWishlist;

/* -------------------------- Contact & Inquiries -------------------------- */

export const useSubmitContact = () => {
  return useMutation({
    mutationFn: async (payload: {
      name: string;
      email: string;
      phone?: string;
      subject: string;
      message: string;
    }) => {
      const { data } = await api.post<{
        success: boolean;
        message: string;
        data: ContactMessage;
      }>("/contact", payload);
      return data;
    },
  });
};

export const useContactMessages = (query: ContactQuery = {}) => {
  return useQuery({
    queryKey: ["admin-contact-messages", query],
    queryFn: async () => {
      const { data } = await api.get<{
        success: boolean;
        data: ContactMessage[];
        pagination: Pagination;
      }>("/contact", { params: query });
      return {
        messages: data.data ?? [],
        pagination: data.pagination,
      };
    },
    placeholderData: keepPreviousData,
  });
};

export const useUpdateContactStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      status,
      notes,
    }: {
      id: string;
      status: "New" | "In Progress" | "Resolved";
      notes?: string;
    }) => {
      const { data } = await api.patch<{
        success: boolean;
        message: string;
        data: ContactMessage;
      }>(`/contact/${id}/status`, { status, notes });
      return data.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin-contact-messages"] });
    },
  });
};

export const useDeleteContactMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.delete<{ success: boolean; message: string }>(
        `/contact/${id}`
      );
      return data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin-contact-messages"] });
    },
  });
};

/* ------------------------------ Newsletter ------------------------------ */

export const useSubscribeNewsletter = () => {
  return useMutation({
    mutationFn: async (email: string) => {
      const { data } = await api.post<{ success: boolean; message: string }>(
        "/newsletter/subscribe",
        { email }
      );
      return data;
    },
  });
};

/* ------------------------------- Invoice ------------------------------- */

export const downloadOrderInvoice = async (orderId: string) => {
  const response = await api.get<string>(`/orders/${orderId}/invoice`, {
    responseType: "text" as "json",
  });
  const html = typeof response.data === "string" ? response.data : String(response.data);
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const win = window.open(url, "_blank");
  if (!win) {
    // If popup blocked, create hidden download link
    const a = document.createElement("a");
    a.href = url;
    a.download = `Invoice-${orderId.slice(-6).toUpperCase()}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
};

export { unwrap };
