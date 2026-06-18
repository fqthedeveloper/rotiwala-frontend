import {
  useNavigate,
} from "react-router-dom";

import {
  logoutConfirm,
} from "../../utils/alerts";

import useAuth
from "../../hooks/useAuth";

const UserDropdown = () => {

  const { user, logout } =
    useAuth();

  const navigate =
    useNavigate();

  const handleLogout =
    async () => {

      const result =
        await logoutConfirm();

      if (
        result.isConfirmed
      ) {

        await logout();

        navigate("/login");
      }
    };

  return (
    <div
      className="dropdown"
    >

      <button
        className="btn btn-primary-custom dropdown-toggle"
        data-bs-toggle="dropdown"
      >
        {user?.phone}
      </button>

      <ul
        className="dropdown-menu"
      >

        <li>

          <button
            className="dropdown-item"
          >
            My Profile
          </button>

        </li>

        <li>

          <button
            className="dropdown-item"
          >
            Orders
          </button>

        </li>

        <li>
          <hr />
        </li>

        <li>

          <button
            onClick={handleLogout}
            className="dropdown-item text-danger"
          >
            Logout
          </button>

        </li>

      </ul>

    </div>
  );
};

export default UserDropdown;