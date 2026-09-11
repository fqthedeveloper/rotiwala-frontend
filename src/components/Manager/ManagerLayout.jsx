import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { FaBars, FaStore, FaDotCircle } from "react-icons/fa";
import ManagerSidebar from "./ManagerSidebar";
import "./ManagerSidebar.css";

const ManagerLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userRole, setUserRole] = useState(localStorage.getItem("role") || "");
  const [shopName, setShopName] = useState("");

  useEffect(() => {
    try {
      const u = JSON.parse(localStorage.getItem("user") || "{}");
      if (u.shop_name) setShopName(u.shop_name);
      if (u.role) setUserRole(u.role);
    } catch {}
  }, []);

  const isKitchen = userRole === "preparing_staff";

  return (
    <div className="admin-wrapper">
      <ManagerSidebar
        isOpen={sidebarOpen}
        closeSidebar={() => setSidebarOpen(false)}
      />

      <div className="admin-content">
        <header className="admin-topbar">
          <button
            className="admin-menu-toggle d-lg-none"
            onClick={() => setSidebarOpen(true)}
            aria-label="Toggle Sidebar Navigation"
          >
            <FaBars />
          </button>

          <div className="admin-topbar-info">
            <h4 className="admin-topbar-title">
              {isKitchen ? "🍳 Kitchen Station" : "👔 Manager Panel"}
            </h4>
            {shopName && (
              <span className="admin-topbar-shop">
                <FaStore className="me-1" /> {shopName}
              </span>
            )}
          </div>

          <div className="admin-topbar-status ms-auto">
            <span className="live-status-pill">
              <FaDotCircle className="live-pulse-dot" />
              <span className="d-none d-sm-inline">{isKitchen ? "Kitchen Active" : "Store Live"}</span>
              <span className="d-sm-none">Live</span>
            </span>
          </div>
        </header>

        <main className="admin-page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default ManagerLayout;