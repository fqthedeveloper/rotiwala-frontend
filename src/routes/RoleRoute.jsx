import { Navigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import Loader from "../components/common/Loader";

const RoleRoute = ({ children, role }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <Loader />;
  }

  const storedRole = localStorage.getItem("role");

  if (storedRole !== role) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default RoleRoute;