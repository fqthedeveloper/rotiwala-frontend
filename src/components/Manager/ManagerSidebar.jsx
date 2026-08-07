// frontend/src/components/Manager/ManagerSidebar.jsx

import { NavLink, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { logoutConfirm } from "../../utils/alerts";

const ManagerSidebar = ({ isOpen, closeSidebar }) => {
  const navigate = useNavigate();

  const [expandedSections, setExpandedSections] = useState(() => {
    try {
      const saved = localStorage.getItem("managerSidebarExpanded");
      return saved ? JSON.parse(saved) : {
        orders: true,
        customers: true,
        staff: true,
        finance: true,
      };
    } catch {
      return {
        orders: true,
        customers: true,
        staff: true,
        finance: true,
      };
    }
  });

  useEffect(() => {
    localStorage.setItem("managerSidebarExpanded", JSON.stringify(expandedSections));
  }, [expandedSections]);

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleLogout = async () => {
    const result = await logoutConfirm();

    if (result.isConfirmed) {
      localStorage.removeItem("access");
      localStorage.removeItem("refresh");
      localStorage.removeItem("user");
      localStorage.removeItem("role");
      localStorage.removeItem("user_id");

      navigate("/login");
    }
  };

  return (
    <>
      <div
        className={`sidebar-overlay ${isOpen ? "show" : ""}`}
        onClick={closeSidebar}
      />

      <aside className={`admin-sidebar ${isOpen ? "open" : ""}`}>
        <div className="sidebar-logo">
          <h3>🍽️ Roti Waale</h3>
          <p>Manager Panel</p>
        </div>

        <nav className="sidebar-nav">
          {/* Dashboard */}
          <NavLink to="/manager/dashboard" onClick={closeSidebar}>
            <i className="bi bi-grid"></i>
            Dashboard
          </NavLink>

          {/* ===== Orders ===== */}
          <div
            className="sidebar-section clickable"
            onClick={() => toggleSection("orders")}
          >
            <span>Orders</span>
            <i className={`bi bi-chevron-${expandedSections.orders ? "down" : "right"}`}></i>
          </div>

          {expandedSections.orders && (
            <>
              <NavLink to="/manager/orders" onClick={closeSidebar}>
                <i className="bi bi-bag"></i>
                Orders
              </NavLink>
              <NavLink to="/manager/walkin" onClick={closeSidebar}>
                <i className="bi bi-cart-plus"></i>
                Walk-In Orders
              </NavLink>
            </>
          )}

          {/* ===== Customers ===== */}
          <div
            className="sidebar-section clickable"
            onClick={() => toggleSection("customers")}
          >
            <span>Customers</span>
            <i className={`bi bi-chevron-${expandedSections.customers ? "down" : "right"}`}></i>
          </div>

          {expandedSections.customers && (
            <>
              <NavLink to="/manager/customers" onClick={closeSidebar}>
                <i className="bi bi-people"></i>
                Customers
              </NavLink>
              <NavLink to="/manager/discounts/usage" onClick={closeSidebar}>
                <i className="bi bi-graph-up"></i>
                Usage Analytics
              </NavLink>
            </>
          )}

          {/* ===== Staff ===== */}
          <div
            className="sidebar-section clickable"
            onClick={() => toggleSection("staff")}
          >
            <span>Staff</span>
            <i className={`bi bi-chevron-${expandedSections.staff ? "down" : "right"}`}></i>
          </div>

          {expandedSections.staff && (
            <>
              <NavLink to="/manager/staff" onClick={closeSidebar}>
                <i className="bi bi-person-badge"></i>
                Staff Management
              </NavLink>
              <NavLink to="/manager/staff/salary/add" onClick={closeSidebar}>
                <i className="bi bi-cash"></i>
                Add Salary
              </NavLink>
            </>
          )}

          {/* ===== Finance ===== */}
          <div
            className="sidebar-section clickable"
            onClick={() => toggleSection("finance")}
          >
            <span>Finance</span>
            <i className={`bi bi-chevron-${expandedSections.finance ? "down" : "right"}`}></i>
          </div>

          {expandedSections.finance && (
            <>
              <NavLink to="/manager/expenses" onClick={closeSidebar}>
                <i className="bi bi-wallet2"></i>
                Expenses
              </NavLink>
              <NavLink to="/manager/reports" onClick={closeSidebar}>
                <i className="bi bi-graph-up"></i>
                Reports
              </NavLink>
            </>
          )}

        </nav>

        <div className="p-3 mt-auto">
          <button onClick={handleLogout} className="btn btn-danger w-100">
            <i className="bi bi-box-arrow-right me-2"></i>
            Logout
          </button>
        </div>

      </aside>
    </>
  );
};

export default ManagerSidebar;