import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaClock,
  FaCheck,
  FaFire,
  FaBoxOpen,
  FaCheckCircle,
  FaRupeeSign,
  FaChartLine,
  FaClipboardList,
  FaArrowRight,
  FaSyncAlt,
  FaStore,
  FaWalking,
  FaExclamationTriangle,
  FaShoppingBag,
} from "react-icons/fa";
import api from "../../service/api";
import "./CSS/Dashboard.css";

/* ============================================
   Animated Counter Hook
   ============================================ */
const useCountUp = (end, duration = 1800) => {
  const [count, setCount] = useState(0);
  const frameRef = useRef();

  useEffect(() => {
    if (end === 0) {
      setCount(0);
      return;
    }
    const startTime = performance.now();

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 4);
      const current = Math.floor(end * easeOut);
      setCount(current);
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      }
    };

    frameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameRef.current);
  }, [end, duration]);

  return count;
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [pageVisible, setPageVisible] = useState(false);
  const [stats, setStats] = useState({
    pending: 0,
    accepted: 0,
    preparing: 0,
    ready: 0,
    collected: 0,
    today_sales: 0,
  });

  const pendingCount = useCountUp(stats.pending);
  const acceptedCount = useCountUp(stats.accepted);
  const preparingCount = useCountUp(stats.preparing);
  const readyCount = useCountUp(stats.ready);
  const collectedCount = useCountUp(stats.collected);
  const salesCount = useCountUp(stats.today_sales);

  useEffect(() => {
    document.title = "Manager Dashboard";
    loadDashboard();
    const t = setTimeout(() => setPageVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const res = await api.get("/orders/dashboard/");
      setStats(res.data);
    } catch (err) {
      console.error("Dashboard load failed:", err);
    } finally {
      setTimeout(() => setLoading(false), 400);
    }
  };

  const totalOrders =
    stats.pending +
    stats.accepted +
    stats.preparing +
    stats.ready +
    stats.collected;

  const completionRate =
    totalOrders > 0 ? Math.round((stats.collected / totalOrders) * 100) : 0;

  const activeOrders =
    stats.pending + stats.accepted + stats.preparing + stats.ready;

  const statCards = [
    {
      key: "pending",
      label: "Pending",
      value: pendingCount,
      icon: <FaClock />,
      color: "#e65100",
      bg: "#fff3e0",
      path: "/manager/orders",
    },
    {
      key: "accepted",
      label: "Accepted",
      value: acceptedCount,
      icon: <FaCheck />,
      color: "#00695c",
      bg: "#e0f2f1",
      path: "/manager/orders",
    },
    {
      key: "preparing",
      label: "Preparing",
      value: preparingCount,
      icon: <FaFire />,
      color: "#1565c0",
      bg: "#e3f2fd",
      path: "/manager/orders",
    },
    {
      key: "ready",
      label: "Ready",
      value: readyCount,
      icon: <FaBoxOpen />,
      color: "#2e7d32",
      bg: "#e8f5e9",
      path: "/manager/orders",
    },
    {
      key: "collected",
      label: "Collected",
      value: collectedCount,
      icon: <FaCheckCircle />,
      color: "#424242",
      bg: "#f5f5f5",
      path: "/manager/orders",
    },
    {
      key: "today_sales",
      label: "Paid Today",
      value: salesCount,
      icon: <FaRupeeSign />,
      color: "#f9a825",
      bg: "#fffde7",
      path: "/manager/orders",
    },
  ];

  const statusBars = [
    { key: "pending", label: "Pending", value: stats.pending, color: "#e65100" },
    { key: "accepted", label: "Accepted", value: stats.accepted, color: "#00695c" },
    { key: "preparing", label: "Preparing", value: stats.preparing, color: "#1565c0" },
    { key: "ready", label: "Ready", value: stats.ready, color: "#2e7d32" },
    { key: "collected", label: "Collected", value: stats.collected, color: "#424242" },
  ];

  const maxBarValue = Math.max(...statusBars.map((b) => b.value), 1);

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-loading">
          <div className="dash-spinner">
            <div className="dash-ring"></div>
            <div className="dash-ring"></div>
            <div className="dash-ring"></div>
          </div>
          <h4>Loading Dashboard</h4>
          <div className="loading-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`dashboard-page ${pageVisible ? "visible" : ""}`}>
      <div className="dashboard-container">
        {/* Header */}
        <div className="dashboard-header" style={{ animationDelay: "0s" }}>
          <div className="header-left">
            <div className="header-icon-wrap">
              <div className="header-icon">
                <FaStore />
              </div>
              <div className="header-pulse"></div>
            </div>
            <div className="header-text">
              <h1>Manager Dashboard</h1>
              <p>Real-time performance overview</p>
            </div>
          </div>
          <div className="header-right">
            <button className="refresh-btn" onClick={loadDashboard}>
              <FaSyncAlt />
              <span className="btn-text">Refresh</span>
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="stats-section">
          <div className="stats-grid-dashboard">
            {statCards.map((card, idx) => (
              <div
                key={card.key}
                className="stat-card-dashboard"
                style={{ animationDelay: `${0.1 + idx * 0.07}s` }}
                onClick={() => navigate(card.path)}
              >
                <div className="stat-bg" style={{ background: card.bg }}></div>
                <div className="stat-top">
                  <div className="stat-icon" style={{ color: card.color }}>
                    {card.icon}
                  </div>
                  <div className="stat-arrow">
                    <FaArrowRight />
                  </div>
                </div>
                <div className="stat-body">
                  <h3 className="stat-value">{card.value}</h3>
                  <span className="stat-label">{card.label}</span>
                </div>
                <div className="stat-shine"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Middle Section */}
        <div className="dashboard-middle">
          {/* Chart Card */}
          <div className="panel-card chart-panel" style={{ animationDelay: "0.45s" }}>
            <div className="panel-header">
              <h5>
                <FaChartLine />
                Order Status Distribution
              </h5>
              <span className="badge-total">{totalOrders} Total</span>
            </div>

            <div className="bar-chart">
              {statusBars.map((bar, idx) => (
                <div className="bar-row" key={bar.key}>
                  <div className="bar-label">
                    <span className="bar-dot" style={{ background: bar.color }}></span>
                    <span className="bar-label-text">{bar.label}</span>
                  </div>
                  <div className="bar-track">
                    <div
                      className="bar-fill"
                      style={{
                        width: `${(bar.value / maxBarValue) * 100}%`,
                        background: `linear-gradient(90deg, ${bar.color}22, ${bar.color})`,
                        animationDelay: `${0.6 + idx * 0.08}s`,
                      }}
                    >
                      <span className="bar-value">{bar.value}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Circular Completion Ring */}
            <div className="ring-wrapper">
              <div className="completion-ring">
                <svg viewBox="0 0 130 130" className="ring-svg">
                  <defs>
                    <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#f7c600" />
                      <stop offset="100%" stopColor="#ffd93d" />
                    </linearGradient>
                  </defs>
                  <circle className="ring-bg" cx="65" cy="65" r="54" />
                  <circle
                    className="ring-progress"
                    cx="65"
                    cy="65"
                    r="54"
                    style={{
                      strokeDasharray: `${2 * Math.PI * 54}`,
                      strokeDashoffset: `${2 * Math.PI * 54 * (1 - completionRate / 100)}`,
                    }}
                  />
                </svg>
                <div className="ring-center">
                  <span className="ring-percent">{completionRate}%</span>
                  <span className="ring-label">Completion</span>
                </div>
              </div>
              <div className="ring-info">
                <h6>Completion Rate</h6>
                <p>
                  {stats.collected} of {totalOrders} orders collected
                </p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="panel-card actions-panel" style={{ animationDelay: "0.55s" }}>
            <div className="panel-header">
              <h5>
                <FaClipboardList />
                Quick Actions
              </h5>
            </div>

            <div className="quick-actions">
              <button className="q-action" onClick={() => navigate("/orders/orders")}>
                <div className="q-icon" style={{ background: "#fff3e0", color: "#e65100" }}>
                  <FaClipboardList />
                </div>
                <div className="q-text">
                  <h6>View Orders</h6>
                  <p>Manage incoming orders</p>
                </div>
                <FaArrowRight className="q-arrow" />
              </button>

              <button className="q-action" onClick={() => navigate("/orders/walkin")}>
                <div className="q-icon" style={{ background: "#e8f5e9", color: "#2e7d32" }}>
                  <FaWalking />
                </div>
                <div className="q-text">
                  <h6>Walk-in Order</h6>
                  <p>Create order at counter</p>
                </div>
                <FaArrowRight className="q-arrow" />
              </button>

              <button className="q-action" onClick={loadDashboard}>
                <div className="q-icon" style={{ background: "#e3f2fd", color: "#1565c0" }}>
                  <FaSyncAlt />
                </div>
                <div className="q-text">
                  <h6>Refresh Data</h6>
                  <p>Update live statistics</p>
                </div>
                <FaArrowRight className="q-arrow" />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Alert */}
        <div className="dashboard-bottom" style={{ animationDelay: "0.65s" }}>
          <div className="alert-card">
            <div className="alert-icon">
              {stats.pending > 0 ? <FaExclamationTriangle /> : <FaShoppingBag />}
            </div>
            <div className="alert-body">
              <h5>
                {stats.pending > 0 ? "Action Required" : "All Caught Up"}
              </h5>
              <p>
                You have <strong>{activeOrders}</strong> active orders.
                {stats.pending > 0 && (
                  <span className="urgent">
                    {" "}{stats.pending} pending orders need immediate attention!
                  </span>
                )}
              </p>
            </div>
            <button className="alert-btn" onClick={() => navigate("/manager/orders")}>
              View Orders
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}