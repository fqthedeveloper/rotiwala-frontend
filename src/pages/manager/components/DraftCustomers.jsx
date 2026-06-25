import { motion } from "framer-motion";

import {
  FaPlus,
  FaUser,
  FaPhone,
  FaClock,
  FaShoppingCart,
  FaRupeeSign,
} from "react-icons/fa";

import "./CSS/DraftCustomers.css";

export default function DraftCustomers({
  loading,

  carts,

  selectedCartId,

  setSelectedCartId,

  createCustomerCart,
}) {
  if (loading) {
    return (
      <>
        <div className="panel-title">
          <h3>Draft Customers</h3>
        </div>

        <div className="draft-loading">
          {[1, 2, 3, 4, 5].map((item) => (
            <div key={item} className="draft-skeleton" />
          ))}
        </div>
      </>
    );
  }

  return (
    <>
      <div className="panel-title">
        <div>
          <h3>Draft Customers</h3>

          <span>{carts.length} Active Drafts</span>
        </div>

        <button className="new-btn" onClick={createCustomerCart}>
          <FaPlus />
          New
        </button>
      </div>

      <div className="draft-list">
        {carts.map((cart, index) => {
          const active = cart.id === selectedCartId;

          const customerName = cart.customer_name || "Walk-In Customer";

          const phone = cart.customer_phone || "No Phone";

          const initials = customerName
            .split(" ")
            .map((word) => word[0])
            .join("")
            .substring(0, 2)
            .toUpperCase();

          return (
            <motion.div
              key={cart.id}
              layout
              initial={{
                opacity: 0,
                y: 15,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: index * 0.04,
              }}
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

              <div className="draft-row">
                <FaPhone />

                <span>{phone}</span>
              </div>

              <div className="draft-row">
                <FaShoppingCart />

                <span>{cart.total_items} Items</span>
              </div>

              <div className="draft-row">
                <FaRupeeSign />

                <strong>₹{Number(cart.total_amount).toFixed(2)}</strong>
              </div>

              <div className="draft-footer">
                <FaClock />

                <span>
                  {new Date(cart.updated_at).toLocaleTimeString(
                    [],

                    {
                      hour: "2-digit",

                      minute: "2-digit",
                    },
                  )}
                </span>

                <span className={`status ${cart.status}`}>{cart.status}</span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </>
  );
}
