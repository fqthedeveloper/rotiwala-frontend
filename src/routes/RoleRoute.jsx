import { Navigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import Loader from "../components/common/Loader";

const RoleRoute = ({ children, role, roles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <Loader />;
  }

  const storedRole = localStorage.getItem("role");

  if (roles && Array.isArray(roles)) {
    if (!roles.includes(storedRole)) {
      return <Navigate to="/" replace />;
    }
  } else if (role && storedRole !== role) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default RoleRoute;