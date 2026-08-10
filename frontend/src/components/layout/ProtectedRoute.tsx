import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { PageLoader } from "@/components/ui/Card";

export const ProtectedRoute = ({
  requireAdmin = false,
  children,
}: {
  requireAdmin?: boolean;
  children?: React.ReactNode;
}) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <PageLoader label="Checking session…" />;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (requireAdmin && user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return children ?? <Outlet />;
};

export const GuestRoute = () => {
  const { user, isAdmin } = useAuth();

  if (user) {
    // Admins always land on the admin dashboard, never the storefront.
    return <Navigate to={isAdmin ? "/admin" : "/"} replace />;
  }

  return <Outlet />;
};
