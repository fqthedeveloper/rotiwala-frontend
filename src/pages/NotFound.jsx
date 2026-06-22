import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import "./CSS/NotFound.css";

export default function NotFound() {
  return (
    <div className="notfound-wrap">
      <motion.div
        className="notfound-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
      >
        <motion.div
          className="notfound-figure"
          initial={{ scale: 0.96 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div className="notfound-code">404</div>
          <div className="notfound-emoji" aria-hidden>
            🚫🍽️
          </div>
        </motion.div>

        <div className="notfound-body">
          <h3>Page Not Found</h3>
          <p>
            The page you are looking for doesn't exist or has been moved. Try
            going back to the home page or explore our menu.
          </p>

          <div className="notfound-actions">
            <Link to="/" className="btn btn-primary">
              Go Home
            </Link>
            <Link to="/menu" className="btn btn-outline">
              View Menu
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
