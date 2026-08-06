import { Outlet } from "react-router-dom";

import Header from "./Header";
import Footer from "./Footer";

const MainLayout = () => {
  return (
    <div className="customer-theme" style={{ minHeight: "100%", display: "flex", flexDirection: "column" }}>
      <Header />

      <main
        className="customer-main"
        style={{
          flex: 1,
          minHeight: "75vh",
          width: "100%",
        }}
      >
        <Outlet />
      </main>

      <Footer />
    </div>
  );
};

export default MainLayout;