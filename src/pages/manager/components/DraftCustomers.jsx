import { motion } from "framer-motion";
import {
  FaPlus, FaPhone, FaClock, FaShoppingCart, FaRupeeSign, FaUserFriends,
} from "react-icons/fa";
import "./CSS/DraftCustomers.css";

export default function DraftCustomers({
  loading, carts, selectedCartId, setSelectedCartId, createCustomerCart,
}) {
  if (loading) {
    return (
      <div className="draft-panel">
        <div className="panel-title">
          <h3>Draft Customers</h3>
        </div>
        <div className="draft-loading">
          {[1, 2, 3, 4].map((i) => <div key={i} className="draft-skeleton" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="draft-panel">
      <div className="panel-title">
        <div>
          <h3>Draft Customers</h3>
          <span>{carts.length} Active Drafts</span>
        </div>
        <button className="new-btn" onClick={createCustomerCart}>
          <FaPlus /> New
        </button>
      </div>

      {carts.length === 0 ? (
        <div className="draft-empty">
          <FaUserFriends />
          <h4>No Drafts Yet</h4>
          <p>Click "New" to start a customer order.</p>
        </div>
      ) : (
        <div className="draft-list">
          {carts.map((cart, index) => {
            const active = cart.id === selectedCartId;
            const customerName = cart.customer_name || "Walk-In Customer";
            const phone = cart.customer_phone || "No Phone";
            const initials = customerName
              .split(" ")
              .map((w) => w[0])
              .join("")
              .substring(0, 2)
              .toUpperCase();

            return (
              <motion.div
                key={cart.id}
                layout
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04, duration: 0.25 }}
                whileHover={{ y: -3 }}
                whileTap={{ scale: 0.98 }}
                className={`draft-card ${active ? "active" : ""}`}
                onClick={() => setSelectedCartId(cart.id)}
              >
                <div className="draft-top">
                  <div className="draft-avatar">{initials}</div>
                  <div className="draft-info">
                    <h5>{customerName}</h5>
                    <small>{cart.cart_number}</small>
                  </div>
                </div>

                <div className="draft-row"><FaPhone /><span>{phone}</span></div>
                <div className="draft-row"><FaShoppingCart /><span>{cart.total_items} Items</span></div>
                <div className="draft-row">
                  <FaRupeeSign />
                  <strong>₹{Number(cart.total_amount).toFixed(2)}</strong>
                </div>

                <div className="draft-footer">
                  <div className="draft-time">
                    <FaClock />
                    <span>
                      {new Date(cart.updated_at).toLocaleTimeString([], {
                        hour: "2-digit", minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <span className={`status ${cart.status}`}>{cart.status}</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}