import { NavLink, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

const MobileMenu = ({
  isOpen,
  onClose,
}) => {

  const navigate = useNavigate();

  const [user, setUser] = useState(
    JSON.parse(
      localStorage.getItem("user")
    )
  );

  useEffect(() => {

    const syncUser = () => {

      setUser(
        JSON.parse(
          localStorage.getItem("user")
        )
      );

    };

    window.addEventListener(
      "authChanged",
      syncUser
    );

    return () =>
      window.removeEventListener(
        "authChanged",
        syncUser
      );

  }, []);

  const logout = () => {

    localStorage.clear();

    setUser(null);

    window.dispatchEvent(
      new Event("authChanged")
    );

    onClose();

    navigate("/");

  };

  if (!isOpen) return null;

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.55)",
          backdropFilter: "blur(4px)",
          zIndex: 9998,
        }}
      />

      <div
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          width: "85%",
          maxWidth: "360px",
          height: "100vh",
          background: "#fff",
          zIndex: 9999,
          boxShadow: "-10px 0 30px rgba(0,0,0,.15)",
          display: "flex",
          flexDirection: "column",
          overflowY: "auto",
          animation: "slideIn .3s ease",
        }}
      >

        <div
          style={{
            background:
              "linear-gradient(135deg,#ff9800,#ff5722)",
            padding: "25px 20px",
            color: "#fff",
            position: "sticky",
            top: 0,
            zIndex: 10,
          }}
        >

          <button
            onClick={onClose}
            style={{
              position: "absolute",
              right: "15px",
              top: "15px",
              width: "40px",
              height: "40px",
              border: "none",
              borderRadius: "50%",
              background: "rgba(255,255,255,.2)",
              color: "#fff",
              fontSize: "24px",
              cursor: "pointer",
            }}
          >
            ×
          </button>

          <h3
            style={{
              margin: 0,
              fontWeight: "800",
            }}
          >
            🍽️ Roti Wala
          </h3>

          {user && (
            <div
              style={{
                marginTop: "10px",
                fontSize: "14px",
                opacity: 0.95,
              }}
            >
              {user.phone}
              <br />
              {user.role}
            </div>
          )}

        </div>

        <div
          style={{
            padding: "15px",
            flex: 1,
          }}
        >

          <NavItem
            to="/"
            text="🏠 Home"
            onClose={onClose}
          />

          <NavItem
            to="/menu"
            text="🍔 Menu"
            onClose={onClose}
          />

          <NavItem
            to="/about"
            text="ℹ️ About"
            onClose={onClose}
          />

          <NavItem
            to="/contact"
            text="📞 Contact"
            onClose={onClose}
          />

          <NavItem
            to="/cart"
            text="🛒 Cart"
            onClose={onClose}
          />

          <NavItem
            to="/my-orders"
            text="📋 My Orders"
            onClose={onClose}
          />

          {(user?.role === "super_admin" ||
            user?.role === "manager") && (

            <NavItem
              to="/admin/dashboard"
              text="📊 Dashboard"
              onClose={onClose}
            />

          )}

          {!user ? (
            <>
              <NavItem
                to="/login"
                text="🔐 Login"
                onClose={onClose}
              />

              <NavItem
                to="/register"
                text="📝 Register"
                onClose={onClose}
              />
            </>
          ) : (

            <button
              onClick={logout}
              style={{
                width: "100%",
                border: "none",
                background:
                  "linear-gradient(135deg,#ef4444,#dc2626)",
                color: "#fff",
                padding: "14px",
                borderRadius: "12px",
                marginTop: "20px",
                fontWeight: "700",
                cursor: "pointer",
              }}
            >
              Logout
            </button>

          )}

        </div>

        <div
          style={{
            padding: "15px",
            textAlign: "center",
            fontSize: "12px",
            color: "#888",
            borderTop: "1px solid #eee",
          }}
        >
          © 2026 Roti Wala
        </div>

      </div>

      <style>
        {`
          @keyframes slideIn{
            from{
              transform:translateX(100%);
            }
            to{
              transform:translateX(0);
            }
          }
        `}
      </style>

    </>
  );
};

function NavItem({
  to,
  text,
  onClose,
}) {

  return (
    <NavLink
      to={to}
      onClick={onClose}
      style={({ isActive }) => ({
        display: "block",
        textDecoration: "none",
        padding: "14px 16px",
        borderRadius: "12px",
        marginBottom: "10px",
        background: isActive
          ? "#fff7ed"
          : "#f8f9fa",
        color: "#333",
        fontWeight: "600",
        transition: ".3s",
      })}
    >
      {text}
    </NavLink>
  );
}

export default MobileMenu;