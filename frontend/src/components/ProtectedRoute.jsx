import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";

const ProtectedRoute = ({ children }) => {
  // get token from Zustand store
  const accessToken = useAuthStore((state) => state.accessToken);

  // if token is not found, redirect to login page
  if (!accessToken) {
    return <Navigate to="/login" replace />;
  }

  // if token is found, render the children
  return children;
};

export default ProtectedRoute;
