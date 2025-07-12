import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";

const ProtectedRoute = ({ children }) => {
  const { authUser, isChecking } = useAuthStore();

  if (isChecking) {
    return null;
  }

  return authUser ? children : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
