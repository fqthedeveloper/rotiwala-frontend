import { useState, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import MobileMenu from "./MobileMenu";
import "./Header.css";
import Logo from "../../assets/react.svg";
import { getCartCount } from "../../service/cartService";
import { FaMapMarkerAlt, FaShoppingCart, FaBars, FaUser } from "react-icons/fa";

const Header = ({ onOpenCart }) => {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")));
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedShop, setSelectedShop] = useState(null);

  const syncUser = () => {
    const currentUser = JSON.parse(localStorage.getItem("user"));
    setUser(currentUser);
  };

  const loadCartCount = async () => {
    const token = localStorage.getItem("access");
    if (!token) {
      setCartCount(0);
      return;
    }
    try {
      const data = await getCartCount();
      setCartCount(data.count || 0);
    } catch (error) {
      console.log(error);
      setCartCount(0);
    }
  };

  useEffect(() => {
    syncUser();
    const handleAuthChanged = () => syncUser();
    window.addEventListener("authChanged", handleAuthChanged);
    return () => window.removeEventListener("authChanged", handleAuthChanged);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest(".profile-dropdown")) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  useEffect(() => {
    if (user) {
      loadCartCount();
    } else {
      setCartCount(0);
    }

    const handleCartUpdate = () => {
      if (user) {
        loadCartCount();
      }
    };
    window.addEventListener("cartUpdated", handleCartUpdate);
    return () => window.removeEventListener("cartUpdated", handleCartUpdate);
  }, [user]);

  const logout = () => {
    localStorage.clear();
    sessionStorage.clear();
    setUser(null);
    setCartCount(0);
    setDropdownOpen(false);
    window.dispatchEvent(new Event("authChanged"));
    window.dispatchEvent(new Event("cartUpdated"));
    navigate("/login", { replace: true });
  };

  const handleCartClick = (e) => {
    if (onOpenCart) {
      e.preventDefault();
      onOpenCart();
    }
  };

  return (
    <>
      <header className="main-header">
        <div className="container-fluid px-3 px-lg-5">
          <div className="header-wrapper">
            <Link to="/" className="logo-section">
              <img src={Logo} alt="Roti Waale Logo" className="logo-img" />
              <div className="logo-text-group">
                <span className="logo-text">ROTI WAALE</span>
                <span className="logo-subtext">Fresh Roti. Hot Meal.</span>
              </div>
            </Link>

            <nav className="desktop-nav">
              <NavLink to="/">Home</NavLink>
              <NavLink to="/menu">Menu</NavLink>
              <NavLink to="/about">About</NavLink>
              <NavLink to="/contact">Contact</NavLink>
            </nav>

            <div className="header-actions">
              <button
                className="cart-btn position-relative"
                onClick={handleCartClick}
                aria-label="View Cart"
              >
                <FaShoppingCart size={20} />
                {cartCount > 0 && (
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                    {cartCount}
                  </span>
                )}
              </button>

              {!user ? (
                <div className="auth-btns d-none d-lg-flex">
                  <Link to="/login" className="login-btn">
                    Login
                  </Link>
                  <Link to="/register" className="register-btn">
                    Register
                  </Link>
                </div>
              ) : (
                <div className="profile-dropdown">
                  <button
                    className="profile-btn"
                    onClick={() => setDropdownOpen((prev) => !prev)}
                    type="button"
                  >
                    <div className="avatar">
                      {user.first_name?.charAt(0) || user.phone?.charAt(1) || "U"}
                    </div>
                    <span>
                      {user.first_name
                        ? `${user.first_name} ${user.last_name || ""}`
                        : user.phone}
                    </span>
                    <span style={{ fontSize: "11px", opacity: 0.7 }}>▼</span>
                  </button>

                  <div className={`dropdown-menu ${dropdownOpen ? "show" : ""}`}>
                    <div className="dropdown-user">
                      <div className="fw-bold">{user.first_name ? `${user.first_name} ${user.last_name || ""}` : user.phone}</div>
                      <div className="text-muted small">{user.phone}</div>
                      <span className="badge bg-warning text-dark mt-1 text-uppercase" style={{ fontSize: "10px", padding: "4px 8px" }}>
                        {user.role === "preparing_staff" ? "🍳 Kitchen Staff" : user.role === "manager" ? "👔 Manager" : user.role}
                      </span>
                      {user.shop_name && (
                        <div className="text-muted small mt-1">📍 {user.shop_name}</div>
                      )}
                    </div>

                    {user.role === "super_admin" && (
                      <Link to="/admin/dashboard" onClick={() => setDropdownOpen(false)}>
                        📊 Admin Dashboard
                      </Link>
                    )}
                    {user.role === "manager" && (
                      <>
                        <Link to="/manager/dashboard" onClick={() => setDropdownOpen(false)}>
                          📊 Manager Dashboard
                        </Link>
                        <Link to="/display" target="_blank" rel="noopener noreferrer" onClick={() => setDropdownOpen(false)}>
                          📺 Live TV Display
                        </Link>
                      </>
                    )}
                    {user.role === "preparing_staff" && (
                      <>
                        <Link to="/manager/dashboard" onClick={() => setDropdownOpen(false)}>
                          🍳 Kitchen Dashboard
                        </Link>
                        <Link to="/manager/orders" onClick={() => setDropdownOpen(false)}>
                          📋 Kitchen Orders
                        </Link>
                        <Link to="/display" target="_blank" rel="noopener noreferrer" onClick={() => setDropdownOpen(false)}>
                          📺 Live TV Display
                        </Link>
                      </>
                    )}
                    {user.role === "customer" && (
                      <Link to="/my-orders" onClick={() => setDropdownOpen(false)}>
                        📋 My Orders
                      </Link>
                    )}

                    {user.role === "preparing_staff" ? (
                      <Link to="/manager/profile" onClick={() => setDropdownOpen(false)}>
                        👤 Kitchen Profile &amp; Password
                      </Link>
                    ) : (
                      <Link to="/profile" onClick={() => setDropdownOpen(false)}>
                        👤 Profile
                      </Link>
                    )}

                    <div style={{ borderTop: "1px solid #eee", margin: "4px 0" }}></div>
                    <button
                      onClick={logout}
                      className="text-danger fw-bold"
                      style={{ background: "transparent" }}
                    >
                      🚪 Logout
                    </button>
                  </div>
                </div>
              )}

              {user && (
                <button
                  className="mobile-avatar-btn d-lg-none"
                  onClick={() => setMobileOpen(true)}
                  aria-label="Open User Menu"
                >
                  <span className="mobile-avatar-initial">
                    {user.first_name?.charAt(0) || user.phone?.charAt(1) || "U"}
                  </span>
                </button>
              )}

              <button
                className="mobile-toggle"
                onClick={() => setMobileOpen(true)}
                aria-label="Open Mobile Menu"
              >
                <FaBars />
              </button>
            </div>
          </div>
        </div>
      </header>

      <MobileMenu isOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  );
};

export default Header;
