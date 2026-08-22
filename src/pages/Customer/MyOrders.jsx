// src/pages/Customer/MyOrders.jsx

import { useEffect, useState, useCallback, useRef } from "react";
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
import {
  isOrderReviewedOrSkipped,
  showReviewPopup,
} from "../../utils/reviewPopup";

import "./CSS/MyOrders.css";

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Prevent the review popup from opening multiple times
  const popupShownRef = useRef(false);

  // Keep track of orders that have already been handled
  // during this page session.
  const handledReviewOrdersRef = useRef(new Set());

  const loadOrders = useCallback(async () => {
    try {
      const data = await getMyOrders();

      setOrders(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Unable to load orders:", error);

      Swal.fire(
        "Error",
        "Unable to load orders",
        "error"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  /*
   * ---------------------------------------------------------
   * REVIEW POPUP
   * ---------------------------------------------------------
   *
   * Only show the popup for:
   *
   * 1. collected orders
   * 2. orders which are not already reviewed/skipped
   * 3. orders which have not already been handled in this
   *    page session
   *
   * IMPORTANT:
   *
   * We DO NOT reset popupShownRef after the popup closes.
   *
   * Your old code was doing:
   *
   * setTimeout(() => {
   *   popupShownRef.current = false;
   * }, 1000);
   *
   * That caused the same skipped order to open again when
   * getMyOrders() ran every 5 seconds.
   */
  useEffect(() => {
    if (loading) return;

    if (!orders || orders.length === 0) return;

    // Another review popup is already being displayed/handled
    if (popupShownRef.current) return;

    /*
     * Find the first collected order which:
     *
     * - has not been reviewed
     * - has not been skipped
     * - has not already been handled in this page session
     */
    const collectedOrder = orders.find((order) => {
      if (!order) return false;

      if (order.status !== "collected") {
        return false;
      }

      if (!order.id) {
        return false;
      }

      // Already handled during this page session
      if (handledReviewOrdersRef.current.has(order.id)) {
        return false;
      }

      // Already reviewed/skipped according to reviewPopup.js
      if (isOrderReviewedOrSkipped(order.id)) {
        return false;
      }

      return true;
    });

    if (!collectedOrder) {
      return;
    }

    /*
     * Mark popup as currently shown BEFORE opening it.
     *
     * This prevents duplicate popups if the component renders
     * again while showReviewPopup is open.
     */
    popupShownRef.current = true;

    /*
     * Mark this order as handled immediately.
     *
     * This is important because even if the popup is skipped,
     * the same order must not open again on the next polling
     * request.
     */
    handledReviewOrdersRef.current.add(collectedOrder.id);

    showReviewPopup(
      collectedOrder.id,
      collectedOrder.order_number
    )
      .then(() => {
        /*
         * Popup has been closed.
         *
         * We intentionally DO NOT remove the order from
         * handledReviewOrdersRef.
         *
         * This prevents the same order from showing again.
         */
      })
      .catch((error) => {
        console.error("Review popup error:", error);
      })
      .finally(() => {
        /*
         * Allow another DIFFERENT collected order to show its
         * review popup.
         *
         * Do not use setTimeout here.
         */
        popupShownRef.current = false;
      });
  }, [orders, loading]);

  /*
   * ---------------------------------------------------------
   * LOAD ORDERS
   * ---------------------------------------------------------
   *
   * Initial load + automatic refresh every 5 seconds.
   */
  useEffect(() => {
    loadOrders();

    const interval = setInterval(() => {
      loadOrders();
    }, 5000);

    return () => {
      clearInterval(interval);
    };
  }, [loadOrders]);

  /*
   * ---------------------------------------------------------
   * STATUS ICON
   * ---------------------------------------------------------
   */
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

  /*
   * ---------------------------------------------------------
   * STATUS CSS CLASS
   * ---------------------------------------------------------
   */
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

  /*
   * ---------------------------------------------------------
   * LOADING
   * ---------------------------------------------------------
   */
  if (loading) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <div className="spinner-border text-warning" />

          <p className="mt-3">
            Loading Orders...
          </p>
        </div>
      </div>
    );
  }

  /*
   * ---------------------------------------------------------
   * PAGE
   * ---------------------------------------------------------
   */
  return (
    <div className="orders-page container py-4">

      {/* PAGE HEADER */}
      <div className="d-flex justify-content-between align-items-center flex-wrap mb-4">

        <h2 className="fw-bold">
          My Orders
        </h2>

        <span className="badge bg-dark fs-6">
          Total : {orders.length}
        </span>

      </div>

      {/* NO ORDERS */}
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

          <h4 className="mt-3">
            No Orders Found
          </h4>

          <p>
            Place your first order now.
          </p>

        </motion.div>
      ) : (

        /* ORDERS */
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

                {/* ORDER INFORMATION */}
                <div className="col-lg-8 col-md-8">

                  <h5 className="fw-bold">
                    #{order.order_number}
                  </h5>

                  <div className="order-meta">

                    <p>
                      <FaRupeeSign /> Amount : ₹{" "}
                      {order.total_amount}
                    </p>

                    <p>
                      Payment : {order.payment_method}
                    </p>

                  </div>

                  {/* DISCOUNT BREAKDOWN */}
                  {order.discount_amount > 0 && (
                    <div className="discount-info">

                      <span className="original-amount">
                        ₹{order.original_amount}
                      </span>

                      <span className="discount-line">
                        - ₹{order.discount_amount} (
                        {order.discount_name ||
                          "Discount"}
                        )
                      </span>

                      <span className="final-amount">
                        ₹{order.total_amount}
                      </span>

                    </div>
                  )}

                  {/* READY TIME */}
                  {order.ready_at && (
                    <p>
                      Ready At :{" "}
                      {new Date(
                        order.ready_at
                      ).toLocaleString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                      })}
                    </p>
                  )}

                </div>

                {/* STATUS + DETAILS */}
                <div className="col-lg-4 col-md-4 text-md-end mt-3 mt-md-0">

                  {/* STATUS */}
                  <motion.div
                    animate={{
                      scale: [1, 1.05, 1],
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: 2,
                    }}
                    className={`status-badge ${getStatusClass(
                      order.status
                    )}`}
                  >

                    {getStatusIcon(order.status)}

                    <span>
                      {order.status}
                    </span>

                  </motion.div>

                  {/* VIEW DETAILS */}
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