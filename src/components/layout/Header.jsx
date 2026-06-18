import {
  useState,
  useEffect
} from "react";

import {
  Link,
  NavLink,
  useNavigate
} from "react-router-dom";

import MobileMenu from "./MobileMenu";

import "./Header.css";

import Logo from "../../assets/react.svg";

const Header = () => {

  const navigate =
    useNavigate();

  const [mobileOpen,
    setMobileOpen] =
    useState(false);

  const [user,
    setUser] =
    useState(
      JSON.parse(
        localStorage.getItem(
          "user"
        )
      )
    );

  useEffect(() => {

    const syncUser =
      () => {

        setUser(
          JSON.parse(
            localStorage.getItem(
              "user"
            )
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

    navigate("/");
  };

  return (
    <>
      <header className="main-header">

        <div className="container-fluid px-3 px-lg-5">

          <div className="header-wrapper">

            <Link
              to="/"
              className="logo-section"
            >
              <img
                src={Logo}
                alt="Logo"
                className="logo-img"
              />

              <span className="logo-text">
                Roti Wala
              </span>
            </Link>

            <nav className="desktop-nav">

              <NavLink to="/">
                Home
              </NavLink>

              <NavLink to="/menu">
                Menu
              </NavLink>

              <NavLink to="/about">
                About
              </NavLink>

              <NavLink to="/contact">
                Contact
              </NavLink>

            </nav>

            <div className="header-actions">

              <Link
                to="/cart"
                className="cart-btn"
              >
                <i className="bi bi-cart3"></i>
              </Link>

              {!user ? (

                <><Link
                  to="/login"
                  className="login-btn"
                >
                  Login
                </Link><Link
                  to="/register"
                  className="login-btn"
                >
                    Register
                  </Link></>
                

              ) : (

                <div
                  className="profile-dropdown"
                >

                  <button
                    className="profile-btn"
                  >

                    <div
                      className="avatar"
                    >
                      {user.first_name?.charAt(0) ||
                        user.phone?.charAt(1)}
                    </div>

                    <span>
                      {`${user.first_name} ${user.last_name}` ||
                        user.phone}
                    </span>

                  </button>

                  <div
                    className="dropdown-menu"
                  >

                    <div
                      className="dropdown-user"
                    >
                      {user.phone} <br />
                      ({user.role})
                    </div>

                    {(user.role ===
                      "super_admin" ||
                      user.role ===
                      "manager") && (

                      <Link
                        to="/admin/dashboard"
                      >
                        Dashboard
                      </Link>

                    )}


                    <button
                      onClick={logout}
                    >
                      Logout
                    </button>

                  </div>

                </div>

              )}

              <button
                className="mobile-toggle"
                onClick={() =>
                  setMobileOpen(true)
                }
              >
                ☰
              </button>

            </div>

          </div>

        </div>

      </header>

      <MobileMenu
        isOpen={mobileOpen}
        onClose={() =>
          setMobileOpen(false)
        }
      />
    </>
  );
};

export default Header;