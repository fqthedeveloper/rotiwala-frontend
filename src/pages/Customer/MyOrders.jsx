import { useEffect, useState, useCallback } from "react";

import { Link } from "react-router-dom";

import { motion, AnimatePresence } from "framer-motion";

import Swal from "sweetalert2";

import {
  FaShoppingBag,
  FaClock,
  FaCheckCircle,
  FaTruck,
  FaBoxOpen,
  FaTimesCircle,
  FaRupeeSign,
} from "react-icons/fa";

import { getMyOrders } from "../../service/orderService";

import "./CSS/MyOrders.css";

export default function MyOrders() {
  const [orders, setOrders] = useState([]);

  const [loading, setLoading] = useState(true);

  const loadOrders = useCallback(async () => {
    try {
      const data = await getMyOrders();

      setOrders(data);
    } catch {
      Swal.fire("Error", "Unable to load orders", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();

    const interval = setInterval(() => {
      loadOrders();
    }, 5000);

    return () => clearInterval(interval);
  }, [loadOrders]);

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <FaClock />;

      case "accepted":
        return <FaCheckCircle />;

      case "preparing":
        return <FaShoppingBag />;

      case "ready":
        return <FaTruck />;

      case "collected":
        return <FaBoxOpen />;

      case "rejected":
        return <FaTimesCircle />;

      default:
        return <FaClock />;
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "pending":
        return "pending";

      case "accepted":
        return "accepted";

      case "preparing":
        return "preparing";

      case "ready":
        return "ready";

      case "collected":
        return "collected";

      case "rejected":
        return "rejected";

      default:
        return "pending";
    }
  };

  if (loading) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <div className="spinner-border text-warning" />

          <p className="mt-3">Loading Orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center flex-wrap mb-4">
        <h2 className="fw-bold">My Orders</h2>

        <span className="badge bg-dark fs-6">
          Total Orders : {orders.length}
        </span>
      </div>

      {orders.length === 0 ? (
        <motion.div
          initial={{
            opacity: 0,
            scale: 0.9,
          }}
          animate={{
            opacity: 1,
            scale: 1,
          }}
          className="empty-state"
        >
          <FaShoppingBag size={70} />

          <h4 className="mt-3">No Orders Found</h4>

          <p>Place your first order now.</p>
        </motion.div>
      ) : (
        <AnimatePresence>
          {orders.map((order, index) => (
            <motion.div
              key={order.id}
              initial={{
                opacity: 0,
                y: 40,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
              }}
              transition={{
                delay: index * 0.08,
              }}
              whileHover={{
                scale: 1.01,
              }}
              className="order-card"
            >
              <div className="row align-items-center">
                <div className="col-lg-8 col-md-8">
                  <h5 className="fw-bold">#{order.order_number}</h5>

                  <div className="order-meta">
                    <p>
                      <FaRupeeSign /> Amount : ₹{order.total_amount}
                    </p>

                    <p>Payment :{order.payment_method}</p>
                  </div>
                </div>

                <div className="col-lg-4 col-md-4 text-md-end mt-3 mt-md-0">
                  <motion.div
                    animate={{
                      scale: [1, 1.05, 1],
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: 2,
                    }}
                    className={`status-badge ${getStatusClass(order.status)}`}
                  >
                    {getStatusIcon(order.status)}

                    <span>{order.status}</span>
                  </motion.div>

                  <Link
                    to={`/my-orders/${order.id}`}
                    className="btn btn-warning mt-3 fw-bold"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      )}
    </div>
  );
}
