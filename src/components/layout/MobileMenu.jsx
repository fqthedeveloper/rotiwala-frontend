import { NavLink, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  FaHome,
  FaUtensils,
  FaInfoCircle,
  FaPhoneAlt,
  FaTachometerAlt,
  FaTv,
  FaShoppingCart,
  FaUser,
  FaClipboardList,
  FaSignOutAlt,
  FaTimes,
  FaStore,
  FaLock,
  FaUserPlus,
  FaFire,
  FaKey
} from "react-icons/fa";
import { getCartCount } from "../../service/cartService";
import "./MobileMenu.css";

const MobileMenu = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user") || "null"));
  const [cartCount, setCartCount] = useState(0);

  const syncUser = () => {
    setUser(JSON.parse(localStorage.getItem("user") || "null"));
  };

  const loadCart = async () => {
    const token = localStorage.getItem("access");
    if (!token) {
      setCartCount(0);
      return;
    }
    try {
      const data = await getCartCount();
      setCartCount(data.count || 0);
    } catch {
      setCartCount(0);
    }
  };

  useEffect(() => {
    syncUser();
    loadCart();

    const handleAuth = () => {
      syncUser();
      loadCart();
    };

    window.addEventListener("authChanged", handleAuth);
    window.addEventListener("cartUpdated", loadCart);

    return () => {
      window.removeEventListener("authChanged", handleAuth);
      window.removeEventListener("cartUpdated", loadCart);
    };
  }, []);

  const logout = () => {
    localStorage.clear();
    sessionStorage.clear();
    setUser(null);
    setCartCount(0);
    window.dispatchEvent(new Event("authChanged"));
    window.dispatchEvent(new Event("cartUpdated"));
    onClose();
    navigate("/login", { replace: true });
  };

  if (!isOpen) return null;

  const role = user?.role;
  const initial = user?.first_name?.charAt(0) || user?.phone?.charAt(1) || "U";
  const displayName = user?.first_name
    ? `${user.first_name} ${user.last_name || ""}`.trim()
    : user?.phone || "Food Lover";

  return (
    <>
      <div className="rw-mobile-backdrop" onClick={onClose} aria-hidden="true" />

      <aside className="rw-mobile-drawer" role="dialog" aria-modal="true" aria-label="Mobile Navigation Menu">
        {/* Drawer Header */}
        <div className="rw-mobile-drawer-header">
          <button className="rw-mobile-close-btn" onClick={onClose} aria-label="Close menu">
            <FaTimes />
          </button>

          <h3 className="rw-mobile-brand-title">
            <FaFire style={{ color: "#f7c600" }} /> Roti Waale
          </h3>
          <span className="rw-mobile-brand-sub">Fresh Tandoor · Hot Meals</span>

          {user && (
            <div className="rw-mobile-user-card">
              <div className="rw-mobile-user-avatar">
                {initial}
              </div>
              <div className="rw-mobile-user-details">
                <div className="rw-mobile-user-name">{displayName}</div>
                <div className="rw-mobile-user-phone">{user.phone}</div>
                <span className="rw-mobile-role-badge">
                  {role === "preparing_staff"
                    ? "🍳 Kitchen Staff"
                    : role === "manager"
                    ? "👔 Shop Manager"
                    : role === "super_admin"
                    ? "👑 Super Admin"
                    : "👤 Customer"}
                </span>
                {user.shop_name && (
                  <div style={{ fontSize: "11px", color: "#fef3c7", marginTop: "3px" }}>
                    📍 {user.shop_name}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Drawer Navigation List */}
        <nav className="rw-mobile-drawer-body">
          <div className="rw-mobile-section-label">Explore</div>

          <MobileNavItem to="/" icon={<FaHome />} text="Home" onClose={onClose} />
          <MobileNavItem to="/menu" icon={<FaUtensils />} text="Our Menu" onClose={onClose} />
          <MobileNavItem to="/about" icon={<FaInfoCircle />} text="About Us" onClose={onClose} />
          <MobileNavItem to="/contact" icon={<FaPhoneAlt />} text="Contact & Support" onClose={onClose} />

          {/* Role-Specific Portal Links */}
          {role === "super_admin" && (
            <>
              <div className="rw-mobile-section-label">Administration</div>
              <MobileNavItem
                to="/admin/dashboard"
                icon={<FaTachometerAlt />}
                text="Admin Dashboard"
                onClose={onClose}
              />
            </>
          )}

          {role === "manager" && (
            <>
              <div className="rw-mobile-section-label">Management Portal</div>
              <MobileNavItem
                to="/manager/dashboard"
                icon={<FaTachometerAlt />}
                text="Manager Dashboard"
                onClose={onClose}
              />
              <MobileNavItem
                to="/manager/orders"
                icon={<FaClipboardList />}
                text="Order Console"
                onClose={onClose}
              />
              <MobileNavItem
                to="/display"
                icon={<FaTv />}
                text="Live TV Waiting Board"
                onClose={onClose}
                isExternal
              />
            </>
          )}

          {role === "preparing_staff" && (
            <>
              <div className="rw-mobile-section-label">Kitchen Station</div>
              <MobileNavItem
                to="/manager/dashboard"
                icon={<FaTachometerAlt />}
                text="Kitchen Dashboard"
                onClose={onClose}
              />
              <MobileNavItem
                to="/manager/orders"
                icon={<FaClipboardList />}
                text="Kitchen Orders Queue"
                onClose={onClose}
              />
              <MobileNavItem
                to="/display"
                icon={<FaTv />}
                text="Live TV Waiting Board"
                onClose={onClose}
                isExternal
              />
            </>
          )}

          {/* Account / User Section */}
          <div className="rw-mobile-section-label">My Account</div>

          {!user ? (
            <div className="rw-mobile-auth-grid">
              <NavLink to="/login" onClick={onClose} className="rw-mobile-login-link">
                <FaLock className="me-2" /> Login
              </NavLink>
              <NavLink to="/register" onClick={onClose} className="rw-mobile-reg-link">
                <FaUserPlus className="me-2" /> Register
              </NavLink>
            </div>
          ) : (
            <>
              <MobileNavItem
                to="/cart"
                icon={<FaShoppingCart />}
                text="My Cart"
                badge={cartCount > 0 ? cartCount : null}
                onClose={onClose}
              />

              {role === "customer" && (
                <MobileNavItem
                  to="/my-orders"
                  icon={<FaClipboardList />}
                  text="My Past Orders"
                  onClose={onClose}
                />
              )}

              {role === "preparing_staff" ? (
                <MobileNavItem
                  to="/manager/profile"
                  icon={<FaKey />}
                  text="Kitchen Profile & Password"
                  onClose={onClose}
                />
              ) : (
                <MobileNavItem
                  to="/profile"
                  icon={<FaUser />}
                  text="Profile Settings"
                  onClose={onClose}
                />
              )}

              <button onClick={logout} className="rw-mobile-logout-btn">
                <FaSignOutAlt /> Sign Out Securely
              </button>
            </>
          )}
        </nav>

        {/* Drawer Footer */}
        <div className="rw-mobile-drawer-footer">
          © 2026 Roti Waale · Crafted for Flavor & Hygiene
        </div>
      </aside>
    </>
  );
};

function MobileNavItem({ to, icon, text, badge, onClose, isExternal }) {
  if (isExternal) {
    return (
      <a
        href={to}
        target="_blank"
        rel="noopener noreferrer"
        onClick={onClose}
        className="rw-mobile-nav-link"
      >
        <span className="rw-mobile-nav-icon">{icon}</span>
        <span>{text}</span>
        {badge && <span className="rw-mobile-nav-badge">{badge}</span>}
      </a>
    );
  }

  return (
    <NavLink
      to={to}
      onClick={onClose}
      className={({ isActive }) => `rw-mobile-nav-link ${isActive ? "active" : ""}`}
    >
      <span className="rw-mobile-nav-icon">{icon}</span>
      <span>{text}</span>
      {badge && <span className="rw-mobile-nav-badge">{badge}</span>}
    </NavLink>
  );
}

export default MobileMenu;
