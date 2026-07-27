import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";

const ProtectedRoute = ({ children }) => {
  // get token from Zustand store
  const accessToken = useAuthStore((state) => state.accessToken);
  const location = useLocation();

  // if token is not found, redirect to login page with from state
  if (!accessToken) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // if token is found, render the children
  return children;
};

export default ProtectedRoute;
