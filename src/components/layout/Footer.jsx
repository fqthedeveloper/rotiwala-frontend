import { Link } from "react-router-dom";
import "./Footer.css";

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="footer-section">

      {/* Main Footer */}
      <div className="footer-main">

        <div className="container">

          <div className="row gy-4">

            {/* Company */}
            <div className="col-lg-4 col-md-6">

              <h4 className="footer-title">
                Roti Wala
              </h4>

              <p className="footer-text">
                Fresh homemade food delivered
                to your doorstep with love,
                quality and hygiene.
              </p>

              <div className="social-icons">

                <a href="#">
                  <i className="bi bi-facebook"></i>
                </a>

                <a href="#">
                  <i className="bi bi-instagram"></i>
                </a>

                <a href="#">
                  <i className="bi bi-twitter-x"></i>
                </a>

                <a href="#">
                  <i className="bi bi-youtube"></i>
                </a>

              </div>

            </div>

            {/* Quick Links */}
            <div className="col-lg-2 col-md-6">

              <h5 className="footer-heading">
                Quick Links
              </h5>

              <ul className="footer-links">

                <li>
                  <Link to="/">
                    Home
                  </Link>
                </li>

                <li>
                  <Link to="/menu">
                    Menu
                  </Link>
                </li>

                <li>
                  <Link to="/about">
                    About Us
                  </Link>
                </li>

                <li>
                  <Link to="/contact">
                    Contact
                  </Link>
                </li>

              </ul>

            </div>

            {/* Customer */}
            <div className="col-lg-3 col-md-6">

              <h5 className="footer-heading">
                Customer Support
              </h5>

              <ul className="footer-links">

                <li>
                  <Link to="/faq">
                    FAQ
                  </Link>
                </li>

                <li>
                  <Link to="/orders">
                    My Orders
                  </Link>
                </li>

                <li>
                  <Link to="/privacy">
                    Privacy Policy
                  </Link>
                </li>

                <li>
                  <Link to="/terms">
                    Terms & Conditions
                  </Link>
                </li>

              </ul>

            </div>

            {/* Contact */}
            <div className="col-lg-3 col-md-6">

              <h5 className="footer-heading">
                Contact Info
              </h5>

              <ul className="contact-info">

                <li>
                  <i className="bi bi-geo-alt"></i>
                  Guwahati, Assam, India
                </li>

                <li>
                  <i className="bi bi-telephone"></i>
                  +91 9876543210
                </li>

                <li>
                  <i className="bi bi-envelope"></i>
                  support@rotiwala.com
                </li>

                <li>
                  <i className="bi bi-clock"></i>
                  09:00 AM - 11:00 PM
                </li>

              </ul>

            </div>

          </div>

        </div>

      </div>

      {/* Bottom Footer */}

      <div className="footer-bottom">

        <div className="container">

          <div className="footer-bottom-wrapper">

            <div>
              © {year} Roti Wala.
              All Rights Reserved.
            </div>

            <div className="footer-bottom-links">

              <Link to="/privacy">
                Privacy
              </Link>

              <Link to="/terms">
                Terms
              </Link>

              <Link to="/refund">
                Refund Policy
              </Link>

            </div>

          </div>

        </div>

      </div>

    </footer>
  );
};

export default Footer;