import { useState } from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import CartDrawer from "./CartDrawer";

const MainLayout = () => {
  const [cartOpen, setCartOpen] = useState(false);

  return (
    <div className="customer-theme" style={{ minHeight: "100%", display: "flex", flexDirection: "column" }}>
      <Header onOpenCart={() => setCartOpen(true)} />

      <main
        className="customer-main"
        style={{
          flex: 1,
          minHeight: "75vh",
          width: "100%",
        }}
      >
        <Outlet context={{ openCart: () => setCartOpen(true) }} />
      </main>

      <Footer />

      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  );
};

export default MainLayout;