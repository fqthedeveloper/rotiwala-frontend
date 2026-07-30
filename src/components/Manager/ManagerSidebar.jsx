import {
  NavLink,
  useNavigate,
} from "react-router-dom";

import {
  logoutConfirm,
} from "../../utils/alerts";

const ManagerSidebar = ({
  isOpen,
  closeSidebar,
}) => {

  const navigate =
    useNavigate();

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

          <h3>
            🍽️ Roti Waale
          </h3>

          <p>
            Manager Panel
          </p>

        </div>

        <nav className="sidebar-nav">

          <NavLink
            to="/manager/dashboard"
            onClick={closeSidebar}
          >
            <i className="bi bi-grid"></i>
            Dashboard
          </NavLink>

          <div className="sidebar-section">
            Orders
          </div>

          <NavLink
            to="/manager/orders"
            onClick={closeSidebar}
          >
            <i className="bi bi-bag"></i>
            Orders
          </NavLink>

          <NavLink
            to="/manager/walkin"
            onClick={closeSidebar}
          >
            <i className="bi bi-cart-plus"></i>
            Walk-In Orders
          </NavLink>

          <div className="sidebar-section">
            Customers
          </div>
          <NavLink
            to="/manager/discounts/usage"
            onClick={closeSidebar}
          >
            <i className="bi bi-people"></i>
            Usage Analytics
          </NavLink>

          <NavLink
            to="/manager/customers"
            onClick={closeSidebar}
          >
            <i className="bi bi-people"></i>
            Customers
          </NavLink>

          <div className="sidebar-section">
            Reports
          </div>

          <NavLink
            to="/manager/expenses"
            onClick={closeSidebar}
          >
            <i className="bi bi-graph-up"></i>
            Expense
          </NavLink>

          <NavLink
            to="/manager/reports"
            onClick={closeSidebar}
          >
            <i className="bi bi-graph-up"></i>
            Reports
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

export default ManagerSidebar;