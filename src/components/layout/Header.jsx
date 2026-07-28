import { useState, useEffect } from "react";

import { Link, NavLink, useNavigate } from "react-router-dom";

import MobileMenu from "./MobileMenu";

import "./Header.css";

import Logo from "../../assets/react.svg";

import { getCartCount } from "../../service/cartService";

const Header = () => {
  const navigate = useNavigate();

  const [mobileOpen, setMobileOpen] = useState(false);

  const [cartCount, setCartCount] = useState(0);

  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")));

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

    const handleAuthChanged = () => {
      syncUser();
    };

    window.addEventListener("authChanged", handleAuthChanged);

    return () => {
      window.removeEventListener("authChanged", handleAuthChanged);
    };
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

    return () => {
      window.removeEventListener("cartUpdated", handleCartUpdate);
    };
  }, [user]);

  const logout = () => {
    localStorage.clear();

    setUser(null);

    setCartCount(0);

    window.dispatchEvent(new Event("authChanged"));

    navigate("/");
  };

  return (
    <>
      <header className="main-header">
        <div className="container-fluid px-3 px-lg-5">
          <div className="header-wrapper">
            <Link to="/" className="logo-section">
              <img src={Logo} alt="Logo" className="logo-img" />

              <span className="logo-text">Roti Waale</span>
            </Link>

            <nav className="desktop-nav">
              <NavLink to="/">Home</NavLink>

              <NavLink to="/menu">Menu</NavLink>

              <NavLink to="/about">About</NavLink>

              <NavLink to="/contact">Contact</NavLink>
            </nav>

            <div className="header-actions">
              <Link to="/cart" className="cart-btn position-relative">
                <i className="bi bi-cart3"></i>

                {user && cartCount > 0 && (
                  <span
                    className="
                    position-absolute
                    top-0
                    start-100
                    translate-middle
                    badge
                    rounded-pill
                    bg-danger
                  "
                  >
                    {cartCount}
                  </span>
                )}
              </Link>

              {!user ? (
                <>
                  <Link to="/login" className="login-btn">
                    Login
                  </Link>

                  <Link to="/register" className="login-btn">
                    Register
                  </Link>
                </>
              ) : (
                <div className="profile-dropdown">
                  <button className="profile-btn">
                    <div className="avatar">
                      {user.first_name?.charAt(0) || user.phone?.charAt(1)}
                    </div>

                    <span>
                      {user.first_name
                        ? `${user.first_name} ${user.last_name}`
                        : user.phone}
                    </span>
                  </button>

                  <div className="dropdown-menu">
                    <div className="dropdown-user">
                      {user.phone}
                      <br />({user.role})
                    </div>

                    {user.role === "super_admin" && (
                      <Link to="/admin/dashboard">Dashboard</Link>
                    )}
                    {user.role === "manager" && (
                      <Link to="/manager/dashboard">Dashboard</Link>
                    )}
                    {user.role === "customer" && (
                      <Link to="/my-orders">My Orders</Link>
                    )}

                    <button onClick={logout}>Logout</button>
                  </div>
                </div>
              )}

              <button
                className="mobile-toggle"
                onClick={() => setMobileOpen(true)}
              >
                ☰
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
