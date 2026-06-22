import { useState } from "react";
import { Outlet } from "react-router-dom";
import ManagerSidebar from "./ManagerSidebar";
import "./ManagerSidebar.css";

const ManagerLayout = () => {

  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  return (
    <div className="admin-wrapper">

      <ManagerSidebar
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
            Shop Manager Panel
          </h4>

        </div>

        <div className="admin-page-content">

          <Outlet />

        </div>

      </div>

    </div>
  );
};

export default ManagerLayout;