import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import "./Sidebar.css";

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  return (
    <div className="admin-wrapper">

      <Sidebar
        isOpen={sidebarOpen}
        closeSidebar={() =>
          setSidebarOpen(false)
        }
      />

      <div className="admin-content">

        <div className="admin-topbar">

          <button
            className="btn btn-warning d-lg-none"
            onClick={() =>
              setSidebarOpen(true)
            }
          >
            ☰
          </button>

          <h4 className="mb-0">
            Admin Dashboard
          </h4>

        </div>

        <div className="admin-page-content">
          <Outlet />
        </div>

      </div>

    </div>
  );
};

export default AdminLayout;