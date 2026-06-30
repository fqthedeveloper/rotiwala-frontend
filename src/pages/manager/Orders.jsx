import { useEffect, useMemo, useRef, useState } from "react";
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
  FaPhone,
  FaUser,
  FaStickyNote,
  FaHistory,
  FaStore,
  FaHourglassHalf,
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

import "./CSS/Orders.css";

const BaseURL = import.meta.env.VITE_WS_URL;

/* ============================================
   Helper: Format ISO datetime nicely
   ============================================ */
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

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [socketConnected, setSocketConnected] = useState(false);
  const socketRef = useRef(null);

  useEffect(() => {
    document.title = "Manager Orders";
    loadOrders();
    connectSocket();

    const interval = setInterval(() => {
      loadOrders();
    }, 30000);

    return () => {
      clearInterval(interval);
      if (socketRef.current) socketRef.current.close();
    };
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    loadOrders();
    // eslint-disable-next-line
  }, [selectedDate]);

  const connectSocket = () => {
    try {
      const protocol = window.location.protocol === "https:" ? "wss" : "ws";
      socketRef.current = new WebSocket(
        `${protocol}://${BaseURL}/ws/manager/orders/`
      );

      socketRef.current.onopen = () => {
        setSocketConnected(true);
        console.log("Manager WebSocket Connected");
      };

      socketRef.current.onclose = () => {
        setSocketConnected(false);
        setTimeout(() => connectSocket(), 5000);
      };

      socketRef.current.onerror = () => setSocketConnected(false);

      socketRef.current.onmessage = (event) => {
        const data = JSON.parse(event.data);

        if (data.type === "new_order") {
          Swal.fire({
            toast: true,
            position: "top-end",
            icon: "success",
            title: "🔥 New Order Received",
            text: `Order #${data.order_number}`,
            timer: 5000,
            showConfirmButton: false,
          });
          loadOrders();
        }

        if (data.type === "order_update") {
          loadOrders();
        }
      };
    } catch (error) {
      console.log(error);
    }
  };

  const loadOrders = async () => {
    try {
      const data = await getManagerOrders(selectedDate);
      setOrders(data);
    } catch {
      Swal.fire("Error", "Unable to load orders", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (action, id) => {
    try {
      switch (action) {
        case "accept":
          await acceptOrder(id);
          break;
        case "preparing":
          await preparingOrder(id);
          break;
        case "ready":
          await readyOrder(id);
          break;
        case "payment":
          await paymentReceived(id);
          break;
        case "collected":
          await collectedOrder(id);
          break;
        default:
          break;
      }
      loadOrders();
    } catch (error) {
      Swal.fire("Error", error?.response?.data?.error || "Failed", "error");
    }
  };

  const handleReject = async (id) => {
    const result = await Swal.fire({
      title: "Reject Order",
      input: "text",
      inputLabel: "Reason",
      inputPlaceholder: "Enter reason",
      showCancelButton: true,
    });

    if (!result.isConfirmed) return;

    try {
      await rejectOrder(id, result.value);
      loadOrders();
    } catch {
      Swal.fire("Error", "Unable to reject order", "error");
    }
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const keyword = search.toLowerCase();
      return (
        order.order_number?.toLowerCase().includes(keyword) ||
        order.customer_name?.toLowerCase().includes(keyword) ||
        order.customer_phone?.toLowerCase().includes(keyword) ||
        order.status?.toLowerCase().includes(keyword) ||
        order.order_type?.toLowerCase().includes(keyword)
      );
    });
  }, [orders, search]);

  const stats = useMemo(() => {
    return {
      total: orders.length,
      pending: orders.filter((o) => o.status === "pending").length,
      accepted: orders.filter((o) => o.status === "accepted").length,
      preparing: orders.filter((o) => o.status === "preparing").length,
      ready: orders.filter((o) => o.status === "ready").length,
      collected: orders.filter((o) => o.status === "collected").length,
      revenue: orders.reduce(
        (total, order) => total + Number(order.total_amount),
        0
      ),
    };
  }, [orders]);

  useEffect(() => {
    document.title = `${socketConnected ? "🟢" : "🔴"} Manager Orders`;
  }, [socketConnected]);

  if (loading) {
    return (
      <div className="orders-loading">
        <div className="loading-spinner"></div>
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
            <p className="orders-subtitle">Real-Time Manager Dashboard</p>
          </div>

          <div
            className={`socket-status ${
              socketConnected ? "online" : "offline"
            }`}
          >
            <FaBell />
            <span>{socketConnected ? "LIVE" : "OFFLINE"}</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
          <div className="stat-card total" style={{ animationDelay: "0.05s" }}>
            <FaShoppingBag />
            <h3>{stats.total}</h3>
            <span>Orders</span>
          </div>

          <div className="stat-card pending" style={{ animationDelay: "0.1s" }}>
            <FaClock />
            <h3>{stats.pending}</h3>
            <span>Pending</span>
          </div>

          <div className="stat-card accepted" style={{ animationDelay: "0.15s" }}>
            <FaCheck />
            <h3>{stats.accepted}</h3>
            <span>Accepted</span>
          </div>

          <div className="stat-card preparing" style={{ animationDelay: "0.2s" }}>
            <FaFire />
            <h3>{stats.preparing}</h3>
            <span>Preparing</span>
          </div>

          <div className="stat-card ready" style={{ animationDelay: "0.25s" }}>
            <FaBoxOpen />
            <h3>{stats.ready}</h3>
            <span>Ready</span>
          </div>

          <div className="stat-card revenue" style={{ animationDelay: "0.3s" }}>
            <FaRupeeSign />
            <h3>₹{stats.revenue}</h3>
            <span>Revenue</span>
          </div>
        </div>

        {/* Filters */}
        <div className="filters-card">
          <div className="filters-grid">
            <div className="search-box">
              <FaSearch />
              <input
                type="text"
                placeholder="Search order, customer, phone, type..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="date-box">
              <FaCalendarAlt />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Orders Grid */}
        <div className="orders-grid">
          {filteredOrders.length === 0 && (
            <div className="empty-orders">
              <h4>No Orders Found</h4>
              <p>No orders available for selected filters.</p>
            </div>
          )}

          {filteredOrders.map((order, idx) => (
            <div
              className="order-card"
              key={order.id}
              style={{ animationDelay: `${Math.min(idx * 0.05, 0.4)}s` }}
            >
              {/* Header */}
              <div className="order-header">
                <div className="order-header-left">
                  <div className="order-header-top">
                    <h5>#{order.order_number}</h5>
                    <span className={`order-type-badge ${order.order_type}`}>
                      {order.order_type}
                    </span>
                  </div>
                  <small>
                    {order.ordered_at
                      ? formatDateTime(order.ordered_at)
                      : "-"}
                  </small>
                </div>

                <span className={`status-badge ${order.status}`}>
                  {order.status}
                </span>
              </div>

              {/* Customer & Order Info */}
              <div className="customer-box">
                <h6>
                  <FaUser />
                  Customer
                </h6>
                <div className="detail-row">
                  <span>Name</span>
                  <strong>{order.customer_name || "Customer"}</strong>
                </div>
                <div className="detail-row">
                  <span>Phone</span>
                  <strong>{order.customer_phone || "-"}</strong>
                </div>
                <div className="detail-row">
                  <span>Amount</span>
                  <strong>₹{order.total_amount}</strong>
                </div>
                <div className="detail-row">
                  <span>Payment</span>
                  <strong className="payment-method-text">
                    {order.payment_method}
                  </strong>
                </div>
                <div className="detail-row">
                  <span>Payment Status</span>
                  <strong
                    className={`payment-status-text ${order.payment_status}`}
                  >
                    {order.payment_status}
                  </strong>
                </div>

                <div className="detail-divider"></div>

                <div className="detail-row">
                  <span>Order Type</span>
                  <strong className="order-type-text">
                    {order.order_type}
                  </strong>
                </div>
                <div className="detail-row">
                  <span>Pickup</span>
                  <strong>{order.pickup_display || order.pickup_type}</strong>
                </div>
                <div className="detail-row">
                  <span>Est. Ready</span>
                  <strong>
                    {order.estimated_ready_time
                      ? formatDateTime(order.estimated_ready_time)
                      : "-"}
                  </strong>
                </div>
                <div className="detail-row">
                  <span>Est. Minutes</span>
                  <strong className="est-minutes">
                    <FaHourglassHalf style={{ marginRight: 5, fontSize: 12 }} />
                    {order.estimated_minutes} min
                  </strong>
                </div>
                <div className="detail-row">
                  <span>Shop ID</span>
                  <strong>#{order.shop}</strong>
                </div>
              </div>

              {/* Timeline */}
              {(order.accepted_at ||
                order.ready_at ||
                order.collected_at ||
                order.paid_at) && (
                <div className="timeline-box">
                  <h6>
                    <FaHistory />
                    Timeline
                  </h6>
                  <div className="timeline">
                    <div className="timeline-item">
                      <span className="timeline-dot ordered"></span>
                      <div className="timeline-content">
                        <span className="timeline-label">Ordered</span>
                        <strong className="timeline-time">
                          {formatTimeOnly(order.ordered_at)}
                        </strong>
                      </div>
                    </div>

                    {order.accepted_at && (
                      <div className="timeline-item">
                        <span className="timeline-dot accepted"></span>
                        <div className="timeline-content">
                          <span className="timeline-label">Accepted</span>
                          <strong className="timeline-time">
                            {formatTimeOnly(order.accepted_at)}
                          </strong>
                        </div>
                      </div>
                    )}

                    {order.ready_at && (
                      <div className="timeline-item">
                        <span className="timeline-dot ready"></span>
                        <div className="timeline-content">
                          <span className="timeline-label">Ready</span>
                          <strong className="timeline-time">
                            {formatTimeOnly(order.ready_at)}
                          </strong>
                        </div>
                      </div>
                    )}

                    {order.paid_at && (
                      <div className="timeline-item">
                        <span className="timeline-dot paid"></span>
                        <div className="timeline-content">
                          <span className="timeline-label">Paid</span>
                          <strong className="timeline-time">
                            {formatTimeOnly(order.paid_at)}
                          </strong>
                        </div>
                      </div>
                    )}

                    {order.collected_at && (
                      <div className="timeline-item">
                        <span className="timeline-dot collected"></span>
                        <div className="timeline-content">
                          <span className="timeline-label">Collected</span>
                          <strong className="timeline-time">
                            {formatTimeOnly(order.collected_at)}
                          </strong>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Rejection Reason */}
              {order.rejection_reason && (
                <div className="rejection-box">
                  <h6>
                    <FaTimes />
                    Rejection Reason
                  </h6>
                  <p>{order.rejection_reason}</p>
                </div>
              )}

              {/* Pickup Person */}
              {order.pickup_by_other_person && (
                <div className="pickup-box">
                  <h6>
                    <FaPhone />
                    Pickup Person
                  </h6>
                  <div className="detail-row">
                    <span>Name</span>
                    <strong>{order.pickup_person_name || "-"}</strong>
                  </div>
                  <div className="detail-row">
                    <span>Phone</span>
                    <strong>{order.pickup_person_phone || "-"}</strong>
                  </div>
                </div>
              )}

              {/* Items */}
              <div className="items-box">
                <h6>
                  <FaShoppingBag />
                  Items
                </h6>
                {order.items?.map((item) => (
                  <div key={item.id} className="item-row">
                    <span>
                      {item.quantity}x {item.item_name}
                    </span>
                    <strong>₹{item.total_price}</strong>
                  </div>
                ))}
                {(!order.items || order.items.length === 0) && (
                  <p className="no-items">No items in this order.</p>
                )}
              </div>

              {/* Notes */}
              {order.notes && (
                <div className="notes-box">
                  <h6>
                    <FaStickyNote />
                    Notes
                  </h6>
                  <p>{order.notes}</p>
                </div>
              )}

              {/* Actions */}
              <div className="actions-box">
                {order.status === "pending" && (
                  <>
                    <button
                      className="btn-action accept"
                      onClick={() => handleAction("accept", order.id)}
                    >
                      <FaCheck /> Accept
                    </button>
                    <button
                      className="btn-action reject"
                      onClick={() => handleReject(order.id)}
                    >
                      <FaTimes /> Reject
                    </button>
                  </>
                )}

                {order.status === "accepted" && (
                  <button
                    className="btn-action preparing"
                    onClick={() => handleAction("preparing", order.id)}
                  >
                    <FaFire /> Preparing
                  </button>
                )}

                {order.status === "preparing" && (
                  <button
                    className="btn-action ready"
                    onClick={() => handleAction("ready", order.id)}
                  >
                    <FaBoxOpen /> Ready
                  </button>
                )}

                {order.status === "ready" &&
                  order.payment_status !== "paid" && (
                    <button
                      className="btn-action payment"
                      onClick={() => handleAction("payment", order.id)}
                    >
                      <FaMoneyBill /> Payment Received
                    </button>
                  )}

                {order.status === "ready" &&
                  order.payment_status === "paid" && (
                    <button
                      className="btn-action collected"
                      onClick={() => handleAction("collected", order.id)}
                    >
                      <FaCheckCircle /> Collected
                    </button>
                  )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}