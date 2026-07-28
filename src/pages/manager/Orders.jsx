import { useEffect, useMemo, useRef, useState, useCallback, memo } from "react";
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
} from "react-icons/fa";

import {
  getManagerOrders,
  acceptOrder,
  rejectOrder,
  preparingOrder,
  readyOrder,
  paymentReceived,
  collectedOrder,
} from "../../service/orderService";

import ReceiptPrinter from "./components/ReceiptPrinter";

import "./CSS/Orders.css";

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
const OrderCard = memo(({ order, onAction, onReject, onPrint }) => {
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

  const renderActions = () => {
    const { status, id, payment_status } = order;
    const commonProps = (action) => ({
      onClick: () => handleAction(action, id),
      disabled: loadingAction !== null,
    });

    const actionButtons = [];

    // Print button
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
            onClick={() => handleReject(id)}
            disabled={loadingAction !== null}
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
        if (payment_status !== "paid") {
          actionButtons.push(
            <button key="payment" className="btn-action payment" {...commonProps("payment")}>
              {loadingAction === "payment" ? <span className="spinner-sm" /> : <FaMoneyBill />}
              Payment Received
            </button>
          );
        } else {
          actionButtons.push(
            <button key="collected" className="btn-action collected" {...commonProps("collected")}>
              {loadingAction === "collected" ? <span className="spinner-sm" /> : <FaCheckCircle />}
              Collected
            </button>
          );
        }
        break;

      default:
        break;
    }

    return actionButtons;
  };

  const isDelivery = order.delivery_option === "delivery";

  return (
    <div className="order-card">
      {/* Header */}
      <div className="order-header">
        <div className="order-header-left">
          <div className="order-header-top">
            <h5>#{order.order_number}</h5>
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
        <h6><FaUser /> Customer</h6>
        <div className="detail-row"><span>Name</span><strong>{order.customer_name || "Customer"}</strong></div>
        <div className="detail-row"><span>Phone</span><strong>{order.customer_phone || "-"}</strong></div>
        <div className="detail-row"><span>Amount</span><strong>₹{order.total_amount}</strong></div>
        <div className="detail-row"><span>Payment</span><strong className="payment-method-text">{order.payment_method}</strong></div>
        <div className="detail-row"><span>Payment Status</span><strong className={`payment-status-text ${order.payment_status}`}>{order.payment_status}</strong></div>
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
    </div>
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

  // Receipt printer states
  const [showReceipt, setShowReceipt] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [selectedOrderType, setSelectedOrderType] = useState('online');

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

  // ----- Print Receipt Handler -----
  const handlePrintReceipt = useCallback((order) => {
    setSelectedOrderId(order.id);
    setSelectedOrderType(order.order_type || 'online');
    setShowReceipt(true);
  }, []);

  // ----- Filtering -----
  const filteredOrders = useMemo(() => {
    let result = orders;
    if (search.trim()) {
      const keyword = search.toLowerCase().trim();
      result = result.filter((order) =>
        order.order_number?.toLowerCase().includes(keyword) ||
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
  }, [orders, search, statusFilter]);

  // ----- Stats -----
  const stats = useMemo(() => {
    return {
      total: orders.length,
      pending: orders.filter((o) => o.status === "pending").length,
      accepted: orders.filter((o) => o.status === "accepted").length,
      preparing: orders.filter((o) => o.status === "preparing").length,
      ready: orders.filter((o) => o.status === "ready").length,
      collected: orders.filter((o) => o.status === "collected").length,
      revenue: orders.reduce((sum, o) => sum + Number(o.total_amount), 0),
    };
  }, [orders]);

  // ----- Effects -----
  useEffect(() => {
    document.title = `${socketConnected ? "🟢" : "🔴"} Manager Orders`;
  }, [socketConnected]);

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
            <h2 className="orders-title">Orders Management</h2>
            <p className="orders-subtitle">Real‑Time Manager Dashboard</p>
          </div>
          <div className={`socket-status ${socketConnected ? "online" : "offline"}`}>
            <FaBell />
            <span>{socketConnected ? "LIVE" : "OFFLINE"}</span>
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
              <h4>No Orders Found</h4>
              <p>Try adjusting your filters or refresh the page.</p>
            </div>
          ) : (
            filteredOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onAction={handleAction}
                onReject={handleReject}
                onPrint={handlePrintReceipt}
              />
            ))
          )}
        </div>
      </div>

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