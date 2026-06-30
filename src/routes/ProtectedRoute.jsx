import { Navigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import Loader from "../components/common/Loader";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <Loader />;
  }

  const access = localStorage.getItem("access");

  if (!user || !access) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;