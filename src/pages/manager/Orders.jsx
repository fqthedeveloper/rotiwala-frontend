import { useEffect, useMemo, useRef, useState, useCallback, memo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Swal from "sweetalert2";
import {
  FaCheck,
  FaTimes,
  FaFire,
  FaBoxOpen,
  FaMoneyBill,
  FaCheckCircle,
  FaSearch,
  FaCalendarAlt,
  FaShoppingBag,
  FaClock,
  FaRupeeSign,
  FaBell,
  FaUser,
  FaStickyNote,
  FaHistory,
  FaHourglassHalf,
  FaSync,
  FaFilter,
  FaChevronDown,
  FaPrint,
  FaPhone,
  FaTruck,
  FaHome,
  FaEdit,
  FaBan,
  FaExclamationTriangle,
  FaVolumeUp,
  FaVolumeMute,
  FaPlus,
} from "react-icons/fa";


import {
  getManagerOrders,
  acceptOrder,
  rejectOrder,
  preparingOrder,
  readyOrder,
  paymentReceived,
  collectedOrder,
  cancelWalkInOrder,
} from "../../service/orderService";

import {
  getDeliveryBoys,
  assignDeliveryBoy,
  autoAssignDelivery,
} from "../../service/deliveryService";

import ReceiptPrinter from "./components/ReceiptPrinter";
import EditWalkInOrderModal from "./components/EditWalkInOrderModal";
import CancelOnlineOrderModal from "./components/CancelOnlineOrderModal";

import "./CSS/Orders.css";
import useNewOrderAlert from "../../hooks/useNewOrderAlert";


const BaseURL = import.meta.env.VITE_WS_URL;

// ---------- Helpers ----------
const formatDateTime = (isoString) => {
  if (!isoString) return "-";
  const d = new Date(isoString);
  return d.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const formatTimeOnly = (isoString) => {
  if (!isoString) return "-";
  const d = new Date(isoString);
  return d.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

// ---------- Subcomponents ----------
const OrderCard = memo(({
  order,
  onAction,
  onReject,
  onPrint,
  isPreparingStaff,
  onEditWalkIn,
  onCancelWalkIn,
  onCancelOnline,
  onAssignDriver,
  onHandToDriver,
}) => {
  const [loadingAction, setLoadingAction] = useState(null);

  const handleAction = async (action, id) => {
    setLoadingAction(action);
    try {
      await onAction(action, id);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleReject = async (id) => {
    const result = await Swal.fire({
      title: "Reject Order",
      input: "text",
      inputLabel: "Reason",
      inputPlaceholder: "Enter reason",
      showCancelButton: true,
      confirmButtonText: "Reject",
      cancelButtonText: "Cancel",
    });
    if (result.isConfirmed) {
      setLoadingAction("reject");
      try {
        await onReject(id, result.value);
      } finally {
        setLoadingAction(null);
      }
    }
  };

  const isDelivery = order.delivery_option === "delivery";

  const renderActions = () => {
    const { status, id, payment_status } = order;
    const commonProps = (action) => ({
      onClick: () => handleAction(action, id),
      disabled: loadingAction !== null,
    });

    const actionButtons = [];

    // Print button â€” always visible
    actionButtons.push(
      <button
        key="print"
        className="btn-action print"
        onClick={() => onPrint(order)}
        disabled={loadingAction !== null}
      >
        <FaPrint /> Receipt
      </button>
    );

    if (isPreparingStaff) {
      // ---- Kitchen staff: only kitchen-relevant actions ----
      switch (status) {
        case "accepted":
          actionButtons.push(
            <button key="preparing" className="btn-action preparing" {...commonProps("preparing")}>
              {loadingAction === "preparing" ? <span className="spinner-sm" /> : <FaFire />}
              Start Preparing
            </button>
          );
          break;
        case "preparing":
          actionButtons.push(
            <button key="ready" className="btn-action ready" {...commonProps("ready")}>
              {loadingAction === "ready" ? <span className="spinner-sm" /> : <FaBoxOpen />}
              Mark Ready ðŸ””
            </button>
          );
          break;
        default:
          break;
      }
    } else {
      // ---- Manager: all actions ----

      // Payment collection button for unpaid orders
      if (payment_status !== "paid" && status !== "collected") {
        actionButtons.push(
          <button
            key="payment"
            className="btn-action payment"
            {...commonProps("payment")}
          >
            {loadingAction === "payment" ? <span className="spinner-sm" /> : <FaMoneyBill />}
            {isDelivery ? "Collect Payment" : "Payment Received"}
          </button>
        );
      }

      // Status-specific actions
      switch (status) {
        case "pending":
          actionButtons.push(
            <button key="accept" className="btn-action accept" {...commonProps("accept")}>
              {loadingAction === "accept" ? <span className="spinner-sm" /> : <FaCheck />}
              Accept
            </button>,
            <button
              key="reject"
              className="btn-action reject"
              onClick={() => (onCancelOnline ? onCancelOnline(order) : handleReject(id))}
              disabled={loadingAction !== null}
              title="Reject or cancel this online order"
            >
              {loadingAction === "reject" ? <span className="spinner-sm" /> : <FaTimes />}
              Reject
            </button>
          );
          break;

        case "accepted":
          actionButtons.push(
            <button key="preparing" className="btn-action preparing" {...commonProps("preparing")}>
              {loadingAction === "preparing" ? <span className="spinner-sm" /> : <FaFire />}
              Preparing
            </button>
          );
          break;

        case "preparing":
          actionButtons.push(
            <button key="ready" className="btn-action ready" {...commonProps("ready")}>
              {loadingAction === "ready" ? <span className="spinner-sm" /> : <FaBoxOpen />}
              Ready
            </button>
          );
          break;

        case "ready":
          if (isDelivery) {
            const hasDriver = !!(order.delivery_details && order.delivery_details.delivery_boy_name);
            if (!hasDriver) {
              actionButtons.push(
                <button
                  key="assign-driver"
                  className="btn-action assign"
                  onClick={() => onAssignDriver && onAssignDriver(order)}
                  disabled={loadingAction !== null}
                  title="Assign a delivery driver to this order"
                >
                  <FaTruck /> Assign Driver
                </button>
              );
            } else {
              actionButtons.push(
                <button
                  key="hand-to-driver"
                  className="btn-action collected"
                  onClick={() => (onHandToDriver ? onHandToDriver(order) : handleAction("collected", id))}
                  disabled={loadingAction !== null}
                  title={`Hand over to ${order.delivery_details.delivery_boy_name}`}
                >
                  {loadingAction === "collected" ? <span className="spinner-sm" /> : <FaTruck />}
                  Hand to Driver
                </button>
              );
            }
          } else {
            actionButtons.push(
              <button key="collected" className="btn-action collected" {...commonProps("collected")}>
                {loadingAction === "collected" ? <span className="spinner-sm" /> : <FaCheckCircle />}
                Deliver / Complete
              </button>
            );
          }
          break;

        default:
          break;
      }

      // Online order manager controls: Cancel with reason (Shop Issue vs Customer Fault)
      if (
        order.order_type !== "walkin" &&
        ["accepted", "preparing", "ready"].includes(status)
      ) {
        actionButtons.push(
          <button
            key="cancel-online"
            className="btn-action cancel"
            onClick={() => onCancelOnline && onCancelOnline(order)}
            disabled={loadingAction !== null}
            title="Cancel online order (Shop Issue vs Customer Fault)"
          >
            <FaBan /> Cancel Order
          </button>
        );
      }

      // Manager controls: Edit items/details/payment method (Cash/UPI)
      if (
        ["pending", "accepted", "preparing", "ready"].includes(status)
      ) {
        actionButtons.push(
          <button
            key="edit-order"
            className="btn-action edit"
            onClick={() => onEditWalkIn && onEditWalkIn(order)}
            disabled={loadingAction !== null}
            title="Edit items, customer details, or payment method (Cash / UPI)"
          >
            <FaEdit /> Edit Order
          </button>
        );

        if (order.order_type === "walkin") {
          actionButtons.push(
            <button
              key="cancel-walkin"
              className="btn-action cancel"
              onClick={() => onCancelWalkIn && onCancelWalkIn(order)}
              disabled={loadingAction !== null}
              title="Cancel this walk-in order with a reason"
            >
              <FaBan /> Cancel
            </button>
          );
        }
      }
    }

    return actionButtons;
  };

  return (
    <motion.div
      className="order-card"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      {/* Header */}
      <div className="order-header">
        <div className="order-header-left">
          <div className="order-header-top">
            <h5>#{order.order_number}</h5>
            {order.token_number && (
              <span className="token-badge-highlight">
                Token #{order.token_number}
              </span>
            )}
            <span className={`order-type-badge ${order.order_type}`}>
              {order.order_type}
            </span>
            <span className={`delivery-option-badge ${isDelivery ? "delivery" : "pickup"}`}>
              {isDelivery ? <FaTruck /> : <FaHome />}
              {isDelivery ? "Delivery" : "Pickup"}
            </span>
          </div>
          <small>{order.ordered_at ? formatDateTime(order.ordered_at) : "-"}</small>
        </div>
        <span className={`status-badge ${order.status}`}>{order.status}</span>
      </div>

      {/* Customer & Order Info */}
      <div className="customer-box">
        <div className="customer-box-header">
          <h6><FaUser /> Customer</h6>
          {order.customer_is_flagged && (
            <span className="customer-flagged-pill">
              <FaExclamationTriangle /> Flagged Customer
            </span>
          )}
        </div>

        {order.customer_is_flagged && (
          <div className="customer-flagged-alert">
            <div className="flagged-alert-title">
              <FaExclamationTriangle className="flag-warn-icon" />
              <strong>Warning: Customer Flagged (Score: {order.customer_trust_score ?? 0} pts)</strong>
            </div>
            <p className="flagged-alert-desc">
              {order.customer_flag_reasons && order.customer_flag_reasons.length > 0
                ? order.customer_flag_reasons.join(" • ")
                : "Customer previously reported for no-show or unreachable on phone calls."}
            </p>
          </div>
        )}

        <div className="detail-row"><span>Name</span><strong>{order.customer_name || "Customer"}</strong></div>
        <div className="detail-row"><span>Phone</span><strong>{order.customer_phone || "-"}</strong></div>
        <div className="detail-row">
          <span>Trust Score</span>
          <strong className={order.customer_is_flagged ? "trust-score-flagged" : "trust-score-normal"}>
            {order.customer_trust_score ?? 100} pts {order.customer_is_flagged && "(⚠️ Flagged)"}
          </strong>
        </div>
        <div className="detail-row"><span>Amount</span><strong>₹{order.total_amount}</strong></div>
        <div className="detail-row">
          <span>Payment</span>
          <strong className="payment-method-text">
            {order.payment_method?.toLowerCase() === "upi" ? "📱 UPI" : "💵 Cash"}
          </strong>
        </div>
        <div className="detail-row">
          <span>Payment Status</span>
          <strong className={`payment-status-text ${order.payment_status}`}>
            {order.payment_status?.toLowerCase() === "paid" ? "🟢 Paid" : "🟡 Unpaid"}
          </strong>
        </div>
        <div className="detail-divider" />
        <div className="detail-row"><span>Order Type</span><strong className="order-type-text">{order.order_type}</strong></div>

        {/* Delivery Option & Address */}
        <div className="detail-row">
          <span>Delivery Option</span>
          <strong className={`delivery-option-text ${isDelivery ? "delivery" : "pickup"}`}>
            {isDelivery ? "Home Delivery" : "Pay at Shop"}
          </strong>
        </div>
        {isDelivery && (
          <>
            <div className="detail-row">
              <span>Delivery Address</span>
              <strong className="delivery-address-text">{order.delivery_address || "N/A"}</strong>
            </div>
            {order.delivery_fee !== undefined && Number(order.delivery_fee) > 0 && (
              <div className="detail-row">
                <span>Delivery Fee</span>
                <strong>₹{order.delivery_fee}</strong>
              </div>
            )}
          </>
        )}

        {/* Pickup info (only for pickup) */}
        {!isDelivery && (
          <div className="detail-row">
            <span>Pickup</span>
            <strong>
              {order.pickup_time
                ? new Date(order.pickup_time).toLocaleString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                  })
                : order.pickup_type}
            </strong>
          </div>
        )}

        <div className="detail-row"><span>Est. Ready</span><strong>{order.estimated_ready_time ? formatDateTime(order.estimated_ready_time) : "-"}</strong></div>
        <div className="detail-row"><span>Est. Minutes</span><strong className="est-minutes"><FaHourglassHalf style={{ marginRight: 5, fontSize: 12 }} /> {order.estimated_minutes} min</strong></div>
        <div className="detail-row"><span>Shop ID</span><strong>#{order.shop}</strong></div>
      </div>

      {/* Timeline */}
      {(order.accepted_at || order.ready_at || order.collected_at || order.paid_at) && (
        <div className="timeline-box">
          <h6><FaHistory /> Timeline</h6>
          <div className="timeline">
            <div className="timeline-item">
              <span className="timeline-dot ordered" />
              <div className="timeline-content"><span className="timeline-label">Ordered</span><strong className="timeline-time">{formatTimeOnly(order.ordered_at)}</strong></div>
            </div>
            {order.accepted_at && (
              <div className="timeline-item">
                <span className="timeline-dot accepted" />
                <div className="timeline-content"><span className="timeline-label">Accepted</span><strong className="timeline-time">{formatTimeOnly(order.accepted_at)}</strong></div>
              </div>
            )}
            {order.ready_at && (
              <div className="timeline-item">
                <span className="timeline-dot ready" />
                <div className="timeline-content"><span className="timeline-label">Ready</span><strong className="timeline-time">{formatTimeOnly(order.ready_at)}</strong></div>
              </div>
            )}
            {order.paid_at && (
              <div className="timeline-item">
                <span className="timeline-dot paid" />
                <div className="timeline-content"><span className="timeline-label">Paid</span><strong className="timeline-time">{formatTimeOnly(order.paid_at)}</strong></div>
              </div>
            )}
            {order.collected_at && (
              <div className="timeline-item">
                <span className="timeline-dot collected" />
                <div className="timeline-content"><span className="timeline-label">Collected</span><strong className="timeline-time">{formatTimeOnly(order.collected_at)}</strong></div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Rejection Reason */}
      {order.rejection_reason && (
        <div className="rejection-box">
          <h6><FaTimes /> Rejection Reason</h6>
          <p>{order.rejection_reason}</p>
        </div>
      )}

      {/* Delivery Details (only for delivery orders) */}
      {isDelivery && (
        <div className="delivery-box">
          <div className="delivery-box-header">
            <h6><FaTruck /> Delivery Details</h6>
            {order.delivery_details?.delivery_boy_name && order.status !== "collected" && (
              <button
                type="button"
                className="delivery-reassign-btn"
                onClick={() => onAssignDriver && onAssignDriver(order)}
                title="Change or reassign delivery boy"
              >
                Change
              </button>
            )}
          </div>
          {order.delivery_details?.delivery_boy_name ? (
            <>
              <div className="detail-row">
                <span>Driver</span>
                <strong>{order.delivery_details.delivery_boy_name}</strong>
              </div>
              {order.delivery_details.delivery_boy_phone && (
                <div className="detail-row">
                  <span>Phone</span>
                  <strong>
                    <a href={`tel:${order.delivery_details.delivery_boy_phone}`} className="driver-phone-link">
                      <FaPhone style={{ fontSize: 11, marginRight: 4 }} />
                      {order.delivery_details.delivery_boy_phone}
                    </a>
                  </strong>
                </div>
              )}
              <div className="detail-row">
                <span>Assignment</span>
                <span className={`driver-status-badge ${order.delivery_details.status || "assigned"}`}>
                  {order.delivery_details.status || "Assigned"}
                </span>
              </div>
            </>
          ) : (
            <div className="delivery-unassigned-row">
              <span className="unassigned-text">⚠️ Driver Not Assigned</span>
              {order.status !== "collected" && (
                <button
                  type="button"
                  className="assign-driver-sm-btn"
                  onClick={() => onAssignDriver && onAssignDriver(order)}
                >
                  <FaTruck style={{ marginRight: 4 }} /> Assign
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Pickup Person (only if pickup and person specified) */}
      {!isDelivery && order.pickup_by_other_person && (
        <div className="pickup-box">
          <h6><FaPhone /> Pickup Person</h6>
          <div className="detail-row"><span>Name</span><strong>{order.pickup_person_name || "-"}</strong></div>
          <div className="detail-row"><span>Phone</span><strong>{order.pickup_person_phone || "-"}</strong></div>
        </div>
      )}

      {/* Items */}
      <div className="items-box">
        <h6><FaShoppingBag /> Items</h6>
        {order.items?.map((item) => (
          <div key={item.id} className="item-row">
            <span>{item.quantity}x {item.item_name}</span>
            <strong>₹{item.total_price}</strong>
          </div>
        ))}
        {(!order.items || order.items.length === 0) && <p className="no-items">No items in this order.</p>}
      </div>

      {/* Notes */}
      {order.notes && (
        <div className="notes-box">
          <h6><FaStickyNote /> Notes</h6>
          <p>{order.notes}</p>
        </div>
      )}

      {/* Actions */}
      <div className="actions-box">{renderActions()}</div>
    </motion.div>
  );
});

const StatsGrid = ({ stats, activeFilter, onFilterChange }) => {
  const items = [
    { key: "total", label: "Orders", value: stats.total, icon: FaShoppingBag, color: "total" },
    { key: "pending", label: "Pending", value: stats.pending, icon: FaClock, color: "pending" },
    { key: "accepted", label: "Accepted", value: stats.accepted, icon: FaCheck, color: "accepted" },
    { key: "preparing", label: "Preparing", value: stats.preparing, icon: FaFire, color: "preparing" },
    { key: "ready", label: "Ready", value: stats.ready, icon: FaBoxOpen, color: "ready" },
    { key: "revenue", label: "Revenue", value: `₹${stats.revenue}`, icon: FaRupeeSign, color: "revenue" },
  ];

  return (
    <div className="stats-grid">
      {items.map(({ key, label, value, icon: Icon, color }) => (
        <div
          key={key}
          className={`stat-card ${color} ${activeFilter === key ? "active" : ""}`}
          onClick={() => onFilterChange(key === activeFilter ? null : key)}
          role="button"
          tabIndex={0}
        >
          <Icon />
          <h3>{value}</h3>
          <span>{label}</span>
        </div>
      ))}
    </div>
  );
};

const FilterBar = ({ search, setSearch, selectedDate, setSelectedDate, onRefresh, lastUpdated }) => {
  const [showDatePresets, setShowDatePresets] = useState(false);

  const presets = [
    { label: "Today", value: new Date().toISOString().split("T")[0] },
    { label: "Yesterday", value: new Date(Date.now() - 86400000).toISOString().split("T")[0] },
    { label: "This Week", value: new Date(Date.now() - 7 * 86400000).toISOString().split("T")[0] },
  ];

  return (
    <div className="filters-card">
      <div className="filters-grid">
        <div className="search-box">
          <FaSearch />
          <input
            type="text"
            placeholder="Search orders, customers, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button className="clear-search" onClick={() => setSearch("")} aria-label="Clear search">
              &times;
            </button>
          )}
        </div>
        <div className="date-box">
          <FaCalendarAlt />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
          <button
            className="date-preset-toggle"
            onClick={() => setShowDatePresets((prev) => !prev)}
            aria-label="Date presets"
          >
            <FaChevronDown />
          </button>
          {showDatePresets && (
            <div className="date-presets-dropdown">
              {presets.map((p) => (
                <button key={p.value} onClick={() => { setSelectedDate(p.value); setShowDatePresets(false); }}>
                  {p.label}
                </button>
              ))}
            </div>
          )}
        </div>
        <button className="refresh-btn" onClick={onRefresh} aria-label="Refresh orders">
          <FaSync /> <span>Refresh</span>
          {lastUpdated && <span className="last-updated">Updated {lastUpdated}</span>}
        </button>
      </div>
    </div>
  );
};

// ---------- Main Component ----------
export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [statusFilter, setStatusFilter] = useState(null);
  const [socketConnected, setSocketConnected] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Role detection
  const userRole = localStorage.getItem("role");
  const isPreparingStaff = userRole === "preparing_staff";

  // Receipt printer states
  const [showReceipt, setShowReceipt] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [selectedOrderType, setSelectedOrderType] = useState('online');

  // Walk-in order edit state
  const [editingWalkInOrder, setEditingWalkInOrder] = useState(null);

  // Online order cancellation state (Shop Issue vs Customer Fault)
  const [cancellingOnlineOrder, setCancellingOnlineOrder] = useState(null);

  const socketRef = useRef(null);
  const reconnectAttempt = useRef(0);
  const debounceTimer = useRef(null);

  // ----- Socket connection -----
  const connectSocket = useCallback(() => {
    try {
      const protocol = window.location.protocol === "https:" ? "wss" : "ws";
      socketRef.current = new WebSocket(`${protocol}://${BaseURL}/ws/manager/orders/`);

      socketRef.current.onopen = () => {
        setSocketConnected(true);
        reconnectAttempt.current = 0;
        console.log("Manager WebSocket Connected");
      };

      socketRef.current.onclose = () => {
        setSocketConnected(false);
        const delay = Math.min(1000 * 2 ** reconnectAttempt.current, 30000);
        reconnectAttempt.current += 1;
        setTimeout(connectSocket, delay);
      };

      socketRef.current.onerror = () => {
        setSocketConnected(false);
      };

      socketRef.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === "new_order" || data.type === "order_update") {
          Swal.fire({
            toast: true,
            position: "top-end",
            icon: "info",
            title: data.type === "new_order" ? "🔥 New Order" : "Order Updated",
            text: data.type === "new_order" ? `Order #${data.order_number}` : "",
            timer: 4000,
            showConfirmButton: false,
          });
          loadOrders();
        }
      };
    } catch (error) {
      console.error("WebSocket error:", error);
    }
  }, []);

  // ----- Load orders -----
  const loadOrders = useCallback(async () => {
    try {
      const data = await getManagerOrders(selectedDate);
      setOrders(data);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch {
      Swal.fire("Error", "Unable to load orders", "error");
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  // ----- Actions -----
  const handleAction = useCallback(async (action, id) => {
    try {
      switch (action) {
        case "accept": await acceptOrder(id); break;
        case "preparing": await preparingOrder(id); break;
        case "ready": await readyOrder(id); break;
        case "payment": await paymentReceived(id); break;
        case "collected": await collectedOrder(id); break;
        default: return;
      }
      await loadOrders();
    } catch (error) {
      Swal.fire("Error", error?.response?.data?.error || "Action failed", "error");
    }
  }, [loadOrders]);

  const handleReject = useCallback(async (id, reason) => {
    try {
      await rejectOrder(id, reason);
      await loadOrders();
    } catch {
      Swal.fire("Error", "Unable to reject order", "error");
    }
  }, [loadOrders]);

  // Walk-in order cancellation with reason/purpose
  const handleCancelWalkIn = useCallback(async (order) => {
    const { value: reason } = await Swal.fire({
      title: "Cancel Walk-In Order",
      html: `<p style="font-size:14px; color:#64748b; margin-bottom:12px;">Cancelling Walk-In Order <b>#${order.order_number}</b>. Please select the cancellation purpose / reason:</p>`,
      input: "select",
      inputOptions: {
        "Customer changed mind / Left": "Customer changed mind / Left",
        "Wrong order entered": "Wrong order entered",
        "Payment issue / Unpaid": "Payment issue / Unpaid",
        "Items out of stock": "Items out of stock",
        "Custom reason": "Custom reason (enter details)...",
      },
      inputPlaceholder: "Select a cancellation reason",
      showCancelButton: true,
      confirmButtonColor: "#e11d48",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Continue",
      inputValidator: (val) => {
        if (!val) return "Please choose a reason to proceed";
      },
    });

    if (!reason) return;

    let finalReason = reason;
    if (reason === "Custom reason") {
      const { value: textReason } = await Swal.fire({
        title: "Reason Details",
        input: "textarea",
        inputLabel: "Please describe the reason for cancellation",
        inputPlaceholder: "e.g., Customer requested cancel and left the shop...",
        showCancelButton: true,
        confirmButtonColor: "#e11d48",
        inputValidator: (val) => {
          if (!val || !val.trim()) return "Please enter reason details";
        },
      });
      if (!textReason) return;
      finalReason = textReason.trim();
    }

    try {
      await cancelWalkInOrder(order.id, finalReason);
      Swal.fire({
        icon: "success",
        title: "Order Cancelled",
        text: `Walk-in order #${order.order_number} has been cancelled.`,
        timer: 2000,
        showConfirmButton: false,
      });
      await loadOrders();
    } catch (err) {
      Swal.fire("Error", err?.response?.data?.error || "Failed to cancel walk-in order", "error");
    }
  }, [loadOrders]);

  // ----- Print Receipt Handler -----
  const handlePrintReceipt = useCallback((order) => {
    setSelectedOrderId(order.id);
    setSelectedOrderType(order.order_type || 'online');
    setShowReceipt(true);
  }, []);

  // ----- Delivery Driver Assignment Handler -----
  const handleAssignDriver = useCallback(async (order) => {
    try {
      Swal.fire({
        title: "Loading Delivery Drivers...",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      const deliveryBoys = await getDeliveryBoys();
      Swal.close();

      const boyOptionsHtml = (deliveryBoys || [])
        .map((b) => {
          const statusDot = b.is_online ? (b.is_available ? '🟢' : '🟡') : '⚪';
          const statusText = b.is_online ? (b.is_available ? 'Available' : 'Busy') : 'Offline';
          return `<option value="${b.id}">${b.full_name} (${b.phone || 'No phone'}) - ${statusDot} ${statusText}</option>`;
        })
        .join("");

      const { value: formValues } = await Swal.fire({
        title: `🚚 Assign Delivery Driver`,
        html: `
          <div style="text-align:left; font-size:14px;">
            <p style="margin-bottom:12px; color:#475569;">
              Order <b>#${order.order_number}</b> &bull; ₹${order.total_amount} &bull; ${order.customer_name || 'Customer'}<br>
              <small style="color:#64748b;">📍 ${order.delivery_address || 'Home Delivery'}</small>
            </p>
            <div style="margin-bottom:16px;">
              <button type="button" id="btn-swal-auto-assign" style="width:100%; font-weight:700; padding:12px 14px; border-radius:12px; background:linear-gradient(135deg, #f59e0b, #d97706); color:#fff; border:none; box-shadow:0 4px 14px rgba(245,158,11,0.35); cursor:pointer; display:flex; align-items:center; justify-content:center; gap:8px;">
                ⚡ 1-Click Auto Assign (Fastest)
              </button>
            </div>
            <div style="text-align:center; font-weight:700; color:#94a3b8; margin-bottom:12px; font-size:12px; text-transform:uppercase; letter-spacing:1px;">
              &mdash; OR SELECT DRIVER MANUALLY &mdash;
            </div>
            <label style="display:block; font-weight:700; margin-bottom:6px; color:#334155;">Delivery Boy:</label>
            <select id="swal-select-boy" class="swal2-select" style="width:100%; display:block; margin:0 0 10px 0; padding:10px 12px; border-radius:10px; border:1.5px solid #cbd5e1; font-size:14px;">
              <option value="">-- Choose a driver --</option>
              ${boyOptionsHtml}
            </select>
          </div>
        `,
        showCancelButton: true,
        confirmButtonText: "Assign Selected Driver",
        cancelButtonText: "Cancel",
        confirmButtonColor: "#2563eb",
        cancelButtonColor: "#64748b",
        didOpen: () => {
          const autoBtn = document.getElementById("btn-swal-auto-assign");
          if (autoBtn) {
            autoBtn.addEventListener("click", async () => {
              Swal.showLoading();
              try {
                const res = await autoAssignDelivery(order.id);
                Swal.fire({
                  icon: "success",
                  title: "Driver Assigned!",
                  text: `Order #${order.order_number} auto-assigned to ${res.delivery_boy_name || "driver"}.`,
                  timer: 2500,
                  showConfirmButton: false,
                });
                await loadOrders();
              } catch (err) {
                Swal.fire(
                  "Auto-Assign Notice",
                  err?.response?.data?.error || "Could not auto-assign. Please pick a driver manually from the dropdown.",
                  "warning"
                );
              }
            });
          }
        },
        preConfirm: () => {
          const boyId = document.getElementById("swal-select-boy")?.value;
          if (!boyId) {
            Swal.showValidationMessage("Please select a delivery boy or use 1-Click Auto Assign");
            return false;
          }
          return { boyId: parseInt(boyId, 10) };
        },
      });

      if (formValues && formValues.boyId) {
        Swal.showLoading();
        await assignDeliveryBoy(order.id, formValues.boyId);
        Swal.fire({
          icon: "success",
          title: "Driver Assigned!",
          text: `Delivery driver assigned successfully to Order #${order.order_number}.`,
          timer: 2500,
          showConfirmButton: false,
        });
        await loadOrders();
      }
    } catch (err) {
      console.error(err);
      Swal.fire("Error", err?.response?.data?.error || "Failed to assign delivery driver", "error");
    }
  }, [loadOrders]);

  // ----- Hand to Driver Handler -----
  const handleHandToDriver = useCallback(async (order) => {
    const driverName = order.delivery_details?.delivery_boy_name || "Delivery Driver";
    const { isConfirmed } = await Swal.fire({
      title: "Hand Over Order to Driver?",
      html: `
        <div style="font-size:15px; color:#334155; line-height:1.5;">
          Ready to dispatch Order <b>#${order.order_number}</b>?<br>
          <strong style="color:#0f172a; margin-top:8px; display:inline-block;">🚚 Driver: ${driverName}</strong>
          ${order.delivery_details?.delivery_boy_phone ? `<br><small style="color:#64748b;">📞 ${order.delivery_details.delivery_boy_phone}</small>` : ''}
        </div>
      `,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, Hand to Driver",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#16a34a",
      cancelButtonColor: "#64748b",
    });

    if (isConfirmed) {
      try {
        await collectedOrder(order.id);
        Swal.fire({
          icon: "success",
          title: "Dispatched!",
          text: `Order #${order.order_number} marked handed over to ${driverName}.`,
          timer: 2000,
          showConfirmButton: false,
        });
        await loadOrders();
      } catch (err) {
        Swal.fire("Error", err?.response?.data?.error || "Failed to update order status", "error");
      }
    }
  }, [loadOrders]);

  // ----- Filtering -----
  // Kitchen staff only see active kitchen orders (not pending or completed)
  const KITCHEN_STATUSES = ["pending", "accepted", "preparing", "ready"];

  const filteredOrders = useMemo(() => {
    let result = orders;

    // For preparing staff, only show kitchen-relevant statuses
    if (isPreparingStaff) {
      result = result.filter((o) => KITCHEN_STATUSES.includes(o.status));
    }

    if (search.trim()) {
      const keyword = search.toLowerCase().trim();
      result = result.filter((order) =>
        order.order_number?.toLowerCase().includes(keyword) ||
        order.token_number?.toLowerCase().includes(keyword) ||
        order.customer_name?.toLowerCase().includes(keyword) ||
        order.customer_phone?.toLowerCase().includes(keyword) ||
        order.status?.toLowerCase().includes(keyword) ||
        order.order_type?.toLowerCase().includes(keyword) ||
        order.delivery_option?.toLowerCase().includes(keyword) ||
        order.delivery_address?.toLowerCase().includes(keyword)
      );
    }
    if (statusFilter) {
      result = result.filter((order) => order.status === statusFilter);
    }
    return result;
  }, [orders, search, statusFilter, isPreparingStaff]);

  // ----- Stats -----
  const stats = useMemo(() => {
    // For kitchen staff, stats are calculated over kitchen-relevant orders only
    const baseOrders = isPreparingStaff
      ? orders.filter((o) => KITCHEN_STATUSES.includes(o.status))
      : orders;

    return {
      total: baseOrders.length,
      pending: baseOrders.filter((o) => o.status === "pending").length,
      accepted: baseOrders.filter((o) => o.status === "accepted").length,
      preparing: baseOrders.filter((o) => o.status === "preparing").length,
      ready: baseOrders.filter((o) => o.status === "ready").length,
      collected: baseOrders.filter((o) => o.status === "collected").length,
      revenue: baseOrders.reduce((sum, o) => sum + Number(o.total_amount), 0),
    };
  }, [orders, isPreparingStaff]);

  // 🔔 Sound & browser notification when new pending orders arrive
  const { soundEnabled, toggleSound } = useNewOrderAlert(stats?.pending);

  // ----- Effects -----

  useEffect(() => {
    document.title = isPreparingStaff
      ? `${socketConnected ? "🟢" : "🔴"} Kitchen Orders`
      : `${socketConnected ? "🟢" : "🔴"} Manager Orders`;
  }, [socketConnected, isPreparingStaff]);

  useEffect(() => {
    loadOrders();
    connectSocket();
    const interval = setInterval(loadOrders, 30000);
    return () => {
      clearInterval(interval);
      if (socketRef.current) socketRef.current.close();
    };
  }, [connectSocket, loadOrders]);

  useEffect(() => {
    loadOrders();
  }, [selectedDate, loadOrders]);

  useEffect(() => {
    clearTimeout(debounceTimer.current);
  }, [search]);

  // ----- Render -----
  if (loading) {
    return (
      <div className="orders-loading">
        <div className="loading-spinner" />
        <h5 className="mt-4">Loading Orders...</h5>
      </div>
    );
  }

  return (
    <div className="orders-page">
      <div className="orders-container">
        {/* Topbar */}
        <div className="orders-topbar">
          <div className="topbar-text">
            <h2 className="orders-title">
              {isPreparingStaff ? "🍳 Kitchen Orders" : "Orders Management"}
            </h2>
            <p className="orders-subtitle">
              {isPreparingStaff
                ? "Preparing • Packaging • Ready — Real-Time Kitchen View"
                : "Real-Time Manager Dashboard"}
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {!isPreparingStaff && (
              <Link
                to="/manager/walkin"
                className="btn-new-walkin"
                title="Create a new Walk-In / Counter Order"
              >
                <FaPlus size={12} />
                <span>New Walk-In</span>
              </Link>
            )}

            {/* Sound toggle */}
            <button
              onClick={toggleSound}
              title={soundEnabled ? 'Turn off order alert sound' : 'Turn on order alert sound'}
              style={{
                background: soundEnabled ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.10)',
                border: `1.5px solid ${soundEnabled ? '#10b981' : '#ef4444'}`,
                color: soundEnabled ? '#10b981' : '#ef4444',
                borderRadius: '8px',
                padding: '6px 12px',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {soundEnabled ? <FaVolumeUp size={13} /> : <FaVolumeMute size={13} />}
              {soundEnabled ? 'Sound ON' : 'Sound OFF'}
            </button>
            <div className={`socket-status ${socketConnected ? "online" : "offline"}`}>
              <FaBell />
              <span>{socketConnected ? "LIVE" : "OFFLINE"}</span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <StatsGrid
          stats={stats}
          activeFilter={statusFilter}
          onFilterChange={setStatusFilter}
        />

        {/* Filters */}
        <FilterBar
          search={search}
          setSearch={setSearch}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          onRefresh={loadOrders}
          lastUpdated={lastUpdated}
        />

        {/* Orders Grid */}
        <div className="orders-grid">
          {filteredOrders.length === 0 ? (
            <div className="empty-orders">
              <h4>{isPreparingStaff ? "No Active Kitchen Orders" : "No Orders Found"}</h4>
              <p>
                {isPreparingStaff
                  ? "All orders are either completed or not yet accepted."
                  : "Try adjusting your filters or refresh the page."}
              </p>
            </div>
          ) : (
            filteredOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onAction={handleAction}
                onReject={handleReject}
                onPrint={handlePrintReceipt}
                isPreparingStaff={isPreparingStaff}
                onEditWalkIn={(ord) => setEditingWalkInOrder(ord)}
                onCancelWalkIn={handleCancelWalkIn}
                onCancelOnline={(ord) => setCancellingOnlineOrder(ord)}
                onAssignDriver={handleAssignDriver}
                onHandToDriver={handleHandToDriver}
              />
            ))
          )}
        </div>
      </div>

      {/* Edit Walk-In Order Modal */}
      {editingWalkInOrder && (
        <EditWalkInOrderModal
          isOpen={!!editingWalkInOrder}
          order={editingWalkInOrder}
          onClose={() => setEditingWalkInOrder(null)}
          onOrderUpdated={(updatedOrder) => {
            loadOrders();
            if (updatedOrder) {
              setEditingWalkInOrder(updatedOrder);
            }
          }}
        />
      )}

      {/* Cancel Online Order Modal (Shop Issue vs Customer Fault) */}
      {cancellingOnlineOrder && (
        <CancelOnlineOrderModal
          isOpen={!!cancellingOnlineOrder}
          order={cancellingOnlineOrder}
          onClose={() => setCancellingOnlineOrder(null)}
          onSuccess={() => {
            setCancellingOnlineOrder(null);
            loadOrders();
          }}
        />
      )}

      {/* Receipt Printer Modal */}
      {showReceipt && (
        <ReceiptPrinter
          orderId={selectedOrderId}
          orderType={selectedOrderType}
          onClose={() => {
            setShowReceipt(false);
            setSelectedOrderId(null);
            setSelectedOrderType('online');
          }}
        />
      )}
    </div>
  );
}
