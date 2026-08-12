import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";

const ProtectedRoute = ({ children }) => {
  const user = useAuthStore((state) => state.user);
  const accessToken = useAuthStore((state) => state.accessToken);
  const location = useLocation();

  // If token is not found, redirect to login page
  if (!accessToken || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Strict Role Isolation: If an ADMIN tries to access user routes, redirect to Admin Console
  if (user.role === "ADMIN") {
    return <Navigate to="/admin/dashboard" replace />;
  }

  // If normal USER, render children
  return children;
};

export default ProtectedRoute;

