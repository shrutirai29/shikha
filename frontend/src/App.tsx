import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ProtectedRoute, GuestRoute } from "@/components/layout/ProtectedRoute";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { PageLoader } from "@/components/ui/Card";

const LandingPage = lazy(() => import("@/pages/public/LandingPage"));
const HomePage = lazy(() => import("@/pages/public/HomePage"));
const ProductsPage = lazy(() => import("@/pages/public/ProductsPage"));
const CategoriesPage = lazy(() => import("@/pages/public/CategoriesPage"));
const CategoryProductsPage = lazy(() => import("@/pages/public/CategoryProductsPage"));
const ProductDetailsPage = lazy(() => import("@/pages/public/ProductDetailsPage"));
const SearchPage = lazy(() => import("@/pages/public/SearchPage"));
const LoginPage = lazy(() => import("@/pages/public/LoginPage"));
const RegisterPage = lazy(() => import("@/pages/public/RegisterPage"));
const ForgotPasswordPage = lazy(() => import("@/pages/public/ForgotPasswordPage"));
const ResetPasswordPage = lazy(() => import("@/pages/public/ResetPasswordPage"));
const VerifyEmailPage = lazy(() => import("@/pages/public/VerifyEmailPage"));
const NotFoundPage = lazy(() => import("@/pages/public/NotFoundPage"));

const ProfilePage = lazy(() => import("@/pages/customer/ProfilePage"));
const SettingsPage = lazy(() => import("@/pages/customer/SettingsPage"));
const AddressesPage = lazy(() => import("@/pages/customer/AddressesPage"));
const WishlistPage = lazy(() => import("@/pages/customer/WishlistPage"));
const CartPage = lazy(() => import("@/pages/customer/CartPage"));
const CheckoutPage = lazy(() => import("@/pages/customer/CheckoutPage"));
const PaymentPage = lazy(() => import("@/pages/customer/PaymentPage"));
const OrdersPage = lazy(() => import("@/pages/customer/OrdersPage"));
const OrderDetailsPage = lazy(() => import("@/pages/customer/OrderDetailsPage"));

const AdminDashboardPage = lazy(() => import("@/pages/admin/DashboardPage"));
const AdminAnalyticsPage = lazy(() => import("@/pages/admin/AnalyticsPage"));
const AdminUsersPage = lazy(() => import("@/pages/admin/UsersPage"));
const AdminProductsPage = lazy(() => import("@/pages/admin/ProductsPage"));
const AdminCategoriesPage = lazy(() => import("@/pages/admin/CategoriesPage"));
const AdminOrdersPage = lazy(() => import("@/pages/admin/OrdersPage"));
const AdminCouponsPage = lazy(() => import("@/pages/admin/CouponsPage"));
const AdminPaymentsPage = lazy(() => import("@/pages/admin/PaymentsPage"));
const AdminReviewsPage = lazy(() => import("@/pages/admin/AdminReviewsPage"));

const withSuspense = (element: React.ReactNode) => (
  <Suspense fallback={<PageLoader />}>{element}</Suspense>
);

const SiteLayout = () => (
  <div className="flex min-h-screen flex-col">
    <Header />
    <main className="flex-1">
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/categories/:slug" element={<CategoryProductsPage />} />
          <Route path="/products/:slug" element={<ProductDetailsPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />

          <Route element={<GuestRoute />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
          </Route>

          <Route element={<ProtectedRoute />}>
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/addresses" element={<AddressesPage />} />
            <Route path="/wishlist" element={<WishlistPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/payment/:orderId" element={<PaymentPage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/orders/:id" element={<OrderDetailsPage />} />
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </main>
    <Footer />
  </div>
);

const AdminRoute = () => (
  <ProtectedRoute requireAdmin>
    <AdminLayout />
  </ProtectedRoute>
);

const App = () => (
  <Routes>
    <Route path="/*" element={<SiteLayout />} />
    <Route path="/admin" element={<AdminRoute />}>
      <Route index element={withSuspense(<AdminDashboardPage />)} />
      <Route path="analytics" element={withSuspense(<AdminAnalyticsPage />)} />
      <Route path="users" element={withSuspense(<AdminUsersPage />)} />
      <Route path="products" element={withSuspense(<AdminProductsPage />)} />
      <Route path="categories" element={withSuspense(<AdminCategoriesPage />)} />
      <Route path="orders" element={withSuspense(<AdminOrdersPage />)} />
      <Route path="coupons" element={withSuspense(<AdminCouponsPage />)} />
      <Route path="payments" element={withSuspense(<AdminPaymentsPage />)} />
      <Route path="reviews" element={withSuspense(<AdminReviewsPage />)} />
    </Route>
  </Routes>
);

export default App;
