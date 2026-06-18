import { Navigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";

const RoleRoute = ({
  children,
  role,
}) => {

  const { user } =
    useAuth();

  const storedRole =
    localStorage.getItem(
      "role"
    );

  if (
    storedRole !== role
  ) {

    return (
      <Navigate
        to="/"
        replace
      />
    );
  }

  return children;
};

export default RoleRoute;