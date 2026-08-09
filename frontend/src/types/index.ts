export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: { field: string; message: string }[];
  requestId?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data?: T;
  pagination?: Pagination;
  requestId?: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: "admin" | "customer";
  phone?: string;
  isVerified: boolean;
  isActive: boolean;
  createdAt?: string;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  isActive: boolean;
  createdAt?: string;
}

export interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  discountPrice?: number;
  stock: number;
  images: string[];
  category: Category | string;
  isFeatured: boolean;
  isActive: boolean;
  averageRating: number;
  totalReviews: number;
  createdAt?: string;
}

export interface CartItem {
  product: Product | string;
  quantity: number;
  price: number;
}

export interface Cart {
  _id: string;
  user: string;
  items: CartItem[];
  totalAmount: number;
  discount: number;
  finalAmount: number;
  coupon?: { _id: string; code: string; discountType: string; discountValue: number } | string | null;
}

export interface ShippingAddress {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
}

export interface Address extends ShippingAddress {
  _id: string;
  isDefault: boolean;
  isActive?: boolean;
}

export interface OrderItem {
  product: Product | string;
  name: string;
  image: string;
  quantity: number;
  price: number;
}

export interface Order {
  _id: string;
  user: User | string;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  paymentMethod: "COD" | "RAZORPAY";
  paymentStatus: "Pending" | "Paid" | "Failed" | "Refunded";
  orderStatus: "Pending" | "Processing" | "Shipped" | "Delivered" | "Cancelled";
  subtotal: number;
  discount: number;
  shippingCharge: number;
  tax: number;
  totalAmount: number;
  coupon?: string | null;
  createdAt?: string;
}

export interface Payment {
  _id: string;
  user: User | string;
  order: Order | string;
  amount: number;
  currency: string;
  razorpayOrderId: string;
  razorpayPaymentId?: string;
  status: "Pending" | "Authorized" | "Paid" | "Failed" | "Refunded";
  refundId?: string;
  refundAmount?: number;
  refundReason?: string;
  refundedAt?: string | null;
  createdAt?: string;
}

export interface Coupon {
  _id: string;
  code: string;
  description: string;
  discountType: "PERCENTAGE" | "FIXED";
  discountValue: number;
  minimumPurchase: number;
  maximumDiscount: number;
  usageLimit: number;
  usedCount: number;
  expiresAt: string;
  isActive: boolean;
  createdAt?: string;
}

export interface Review {
  _id: string;
  user: User | string;
  product: string;
  rating: number;
  comment: string;
  verifiedPurchase: boolean;
  isActive: boolean;
  createdAt?: string;
}

export interface Wishlist {
  _id: string;
  user: string;
  products: Product[];
}

export interface DashboardStats {
  totals: {
    users: number;
    products: number;
    categories: number;
    orders: number;
    pendingOrders: number;
    reviews: number;
    activeCoupons: number;
    revenue: number;
  };
  recentOrders: Order[];
  lowStockProducts: Product[];
}

export interface SalesAnalytics {
  salesByDay: { date: string; revenue: number; payments: number }[];
  paymentStatus: { _id: string; count: number }[];
  orderStatus: { _id: string; count: number }[];
}

export interface ProductAnalytics {
  topRatedProducts: Product[];
  lowStockProducts: Product[];
}

export interface RazorpayOrder {
  payment: Payment;
  key: string;
  razorpayOrderId: string;
  amount: number;
  currency: string;
}

export interface ProductQuery {
  page?: number;
  limit?: number;
  search?: string;
  sort?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  isFeatured?: boolean;
}

export interface SearchQuery {
  q?: string;
  page?: number;
  limit?: number;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
}

export interface UserListQuery {
  page?: number;
  limit?: number;
  search?: string;
  role?: "admin" | "customer";
  isActive?: boolean;
}
