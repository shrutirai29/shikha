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

/** Delivery-agent-only area: agents can never reach admin or customer pages. */
export const DeliveryAgentRoute = ({
  children,
}: {
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

  if (user.role !== "delivery_agent") {
    return <Navigate to="/" replace />;
  }

  return children ?? <Outlet />;
};

export const GuestRoute = () => {
  const { user } = useAuth();

  if (user) {
    // Admins land on the admin dashboard, delivery agents on their portal —
    // never the storefront.
    if (user.role === "admin") {
      return <Navigate to="/admin" replace />;
    }

    if (user.role === "delivery_agent") {
      return <Navigate to="/delivery" replace />;
    }

    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};
