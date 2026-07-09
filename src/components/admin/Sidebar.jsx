import { NavLink, useNavigate } from "react-router-dom";

import { logout } from "../../hooks/authService";
import { logoutConfirm } from "../../utils/alerts";

const Sidebar = ({
  isOpen,
  closeSidebar,
}) => {

  const navigate = useNavigate();

  const handleLogout =
    async () => {

      const result =
        await logoutConfirm();

      if (
        result.isConfirmed
      ) {

        localStorage.removeItem(
          "access"
        );

        localStorage.removeItem(
          "refresh"
        );

        localStorage.removeItem(
          "user"
        );

        localStorage.removeItem(
          "role"
        );

        localStorage.removeItem(
          "user_id"
        );

        if (logout) {
          await logout();
        }

        navigate("/login");
      }
    };

  return (
    <>
      <div
        className={`sidebar-overlay ${
          isOpen ? "show" : ""
        }`}
        onClick={closeSidebar}
      />

      <aside
        className={`admin-sidebar ${
          isOpen ? "open" : ""
        }`}
      >
        <div className="sidebar-logo">
          <h3>🍽️ Roti Wala</h3>
          <p>Admin Panel</p>
        </div>

        <nav className="sidebar-nav">

          <NavLink
            to="/admin/dashboard"
            onClick={closeSidebar}
          >
            <i className="bi bi-grid"></i>
            Dashboard
          </NavLink>

          <div className="sidebar-section">
            Shop Management
          </div>

          <NavLink
            to="/admin/shops"
            onClick={closeSidebar}
          >
            <i className="bi bi-shop"></i>
            Shops
          </NavLink>

          <NavLink
            to="/admin/managers"
            onClick={closeSidebar}
          >
            <i className="bi bi-person-badge"></i>
            Managers
          </NavLink>

          <div className="sidebar-section">
            Menu Management
          </div>

          <NavLink
            to="/admin/categories"
            onClick={closeSidebar}
          >
            <i className="bi bi-tags"></i>
            Categories
          </NavLink>

          <NavLink
            to="/admin/menu-items"
            onClick={closeSidebar}
          >
            <i className="bi bi-box"></i>
            Menu Items
          </NavLink>

          <NavLink
            to="/admin/orders"
            onClick={closeSidebar}
          >
            <i className="bi bi-bag"></i>
            Orders
          </NavLink>

          <NavLink
            to="/admin/discounts"
            onClick={closeSidebar}
          >
            <i className="bi-solid bi-tags"></i>
            Discounts
          </NavLink>

          <NavLink
            to="/admin/coupons"
            onClick={closeSidebar}
          >
           <i className="bi bi-patch-question-fill"></i>
            Coupon Codes
          </NavLink>

          <NavLink
            to="/admin/users"
            onClick={closeSidebar}
          >
            <i className="bi bi-people"></i>
            Customers
          </NavLink>

          <NavLink
            to="/admin/reports"
            onClick={closeSidebar}
          >
            <i className="bi bi-graph-up"></i>
            Reports
          </NavLink>

          <NavLink
            to="/admin/settings"
            onClick={closeSidebar}
          >
            <i className="bi bi-gear"></i>
            Settings
          </NavLink>

        </nav>

        <div className="p-3 mt-auto">

          <button
            onClick={handleLogout}
            className="btn btn-danger w-100"
          >
            <i className="bi bi-box-arrow-right me-2"></i>
            Logout
          </button>

        </div>

      </aside>
    </>
  );
};

export default Sidebar;