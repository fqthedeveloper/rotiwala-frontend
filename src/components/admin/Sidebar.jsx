// frontend/src/components/admin/Sidebar.jsx

import { NavLink, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { logout } from "../../hooks/authService";
import { logoutConfirm } from "../../utils/alerts";

const Sidebar = ({ isOpen, closeSidebar }) => {
  const navigate = useNavigate();

  // State for collapsible sections – stored in localStorage
  const [expandedSections, setExpandedSections] = useState(() => {
    try {
      const saved = localStorage.getItem("adminSidebarExpanded");
      return saved ? JSON.parse(saved) : {
        shopManagement: true,
        menuManagement: true,
        orders: true,
        customers: true,
        discounts: true,
        expenseManagement: true,
        reports: true,
        settings: false,
      };
    } catch {
      return {
        shopManagement: true,
        menuManagement: true,
        orders: true,
        customers: true,
        discounts: true,
        expenseManagement: true,
        reports: true,
        settings: false,
      };
    }
  });

  // Save to localStorage whenever expanded state changes
  useEffect(() => {
    localStorage.setItem("adminSidebarExpanded", JSON.stringify(expandedSections));
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

      if (logout) {
        await logout();
      }

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
          <p>Admin Panel</p>
        </div>

        <nav className="sidebar-nav">
          {/* Dashboard */}
          <NavLink to="/admin/dashboard" onClick={closeSidebar}>
            <i className="bi bi-grid"></i>
            Dashboard
          </NavLink>

          {/* ===== Shop Management ===== */}
          <div
            className="sidebar-section clickable"
            onClick={() => toggleSection("shopManagement")}
          >
            <span>Shop Management</span>
            <i className={`bi bi-chevron-${expandedSections.shopManagement ? "down" : "right"}`}></i>
          </div>

          {expandedSections.shopManagement && (
            <>
              <NavLink to="/admin/shops" onClick={closeSidebar}>
                <i className="bi bi-shop"></i>
                Shops
              </NavLink>
              <NavLink to="/admin/managers" onClick={closeSidebar}>
                <i className="bi bi-person-badge"></i>
                Managers
              </NavLink>
            </>
          )}

          {/* ===== Menu Management ===== */}
          <div
            className="sidebar-section clickable"
            onClick={() => toggleSection("menuManagement")}
          >
            <span>Menu Management</span>
            <i className={`bi bi-chevron-${expandedSections.menuManagement ? "down" : "right"}`}></i>
          </div>

          {expandedSections.menuManagement && (
            <>
              <NavLink to="/admin/categories" onClick={closeSidebar}>
                <i className="bi bi-tags"></i>
                Categories
              </NavLink>
              <NavLink to="/admin/menu-items" onClick={closeSidebar}>
                <i className="bi bi-box"></i>
                Menu Items
              </NavLink>
            </>
          )}

          {/* ===== Orders ===== */}
          <div
            className="sidebar-section clickable"
            onClick={() => toggleSection("orders")}
          >
            <span>Orders</span>
            <i className={`bi bi-chevron-${expandedSections.orders ? "down" : "right"}`}></i>
          </div>

          {expandedSections.orders && (
            <NavLink to="/admin/orders" onClick={closeSidebar}>
              <i className="bi bi-bag"></i>
              Orders
            </NavLink>
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
            <NavLink to="/admin/customer" onClick={closeSidebar}>
              <i className="bi bi-people"></i>
              Customers
            </NavLink>
          )}

          {/* ===== Discounts ===== */}
          <div
            className="sidebar-section clickable"
            onClick={() => toggleSection("discounts")}
          >
            <span>Discounts</span>
            <i className={`bi bi-chevron-${expandedSections.discounts ? "down" : "right"}`}></i>
          </div>

          {expandedSections.discounts && (
            <>
              <NavLink to="/admin/discounts" onClick={closeSidebar}>
                <i className="bi bi-percent"></i>
                Discounts
              </NavLink>
              <NavLink to="/admin/coupons" onClick={closeSidebar}>
                <i className="bi bi-ticket"></i>
                Coupon Codes
              </NavLink>
              <NavLink to="/admin/discounts/usage" onClick={closeSidebar}>
                <i className="bi bi-graph-up"></i>
                Usage Analytics
              </NavLink>
            </>
          )}

          {/* ===== Expense Management ===== */}
          <div
            className="sidebar-section clickable"
            onClick={() => toggleSection("expenseManagement")}
          >
            <span>Expense Management</span>
            <i className={`bi bi-chevron-${expandedSections.expenseManagement ? "down" : "right"}`}></i>
          </div>

          {expandedSections.expenseManagement && (
            <>
              {/* <NavLink to="/admin/expenses/categories" onClick={closeSidebar}>
                <i className="bi bi-tag"></i>
                Expense Categories
              </NavLink> */}
              <NavLink to="/admin/expenses/master-items" onClick={closeSidebar}>
                <i className="bi bi-list-ul"></i>
                Master Items
              </NavLink>
              <NavLink to="/admin/expenses" onClick={closeSidebar}>
                <i className="bi bi-wallet2"></i>
                All Expenses
              </NavLink>
              <NavLink to="/admin/expenses/staff" onClick={closeSidebar}>
                <i className="bi bi-person-badge"></i>
                Staff & Salaries
              </NavLink>
              <NavLink to="/admin/expenses/raw-materials" onClick={closeSidebar}>
                <i className="bi bi-boxes"></i>
                Raw Materials
              </NavLink>
            </>
          )}

          {/* ===== Reports ===== */}
          <div
            className="sidebar-section clickable"
            onClick={() => toggleSection("reports")}
          >
            <span>Reports</span>
            <i className={`bi bi-chevron-${expandedSections.reports ? "down" : "right"}`}></i>
          </div>

          {expandedSections.reports && (
            <NavLink to="/admin/reports" onClick={closeSidebar}>
              <i className="bi bi-graph-up"></i>
              Financial Reports
            </NavLink>
          )}

          {/* ===== Settings ===== */}
          <div
            className="sidebar-section clickable"
            onClick={() => toggleSection("settings")}
          >
            <span>Settings</span>
            <i className={`bi bi-chevron-${expandedSections.settings ? "down" : "right"}`}></i>
          </div>

          {expandedSections.settings && (
            <NavLink to="/admin/settings" onClick={closeSidebar}>
              <i className="bi bi-gear"></i>
              Settings
            </NavLink>
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

export default Sidebar;