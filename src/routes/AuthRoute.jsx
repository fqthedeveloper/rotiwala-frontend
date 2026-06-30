import { Navigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import Loader from "../components/common/Loader";

const AuthRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <Loader />;
  }

  const access = localStorage.getItem("access");
  const role = localStorage.getItem("role");

  // If user is logged in, redirect away from login/register
  if (user && access) {
    if (role === "super_admin") {
      return <Navigate to="/admin/dashboard" replace />;
    }
    if (role === "manager") {
      return <Navigate to="/manager/dashboard" replace />;
    }
    // Default: customer or any other role → home
    return <Navigate to="/" replace />;
  }

  return children;
};

export default AuthRoute;