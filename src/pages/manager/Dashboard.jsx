import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaStore,
  FaSyncAlt,
  FaClock,
  FaCheckCircle,
  FaFire,
  FaBoxOpen,
  FaHandHolding,
  FaCoins,
  FaChartBar,
  FaBolt,
  FaBell,
  FaArrowRight,
  FaPlus,
  FaListUl,
  FaCog,
  FaTv,
  FaUtensils,
  FaKey,
  FaVolumeUp,
  FaVolumeMute,
} from "react-icons/fa";
import "./CSS/Dashboard.css";
import api from "../../service/api";   // ✅ use the axios instance with auth interceptors
import { tokenOrderAction } from "../../service/orderService";
import toast from "react-hot-toast";
import useNewOrderAlert from "../../hooks/useNewOrderAlert";


const STAT_META = [
  { key: "pending",   label: "Pending Orders",   icon: FaClock,        accent: "amber",   hint: "Awaiting acceptance" },
  { key: "accepted",  label: "Accepted",         icon: FaCheckCircle,  accent: "blue",    hint: "Confirmed by staff" },
  { key: "preparing", label: "Preparing",        icon: FaFire,         accent: "orange",  hint: "In the kitchen" },
  { key: "ready",     label: "Ready for Pickup", icon: FaBoxOpen,      accent: "green",   hint: "Bagged & waiting" },
  { key: "collected", label: "Collected Today",  icon: FaHandHolding,  accent: "violet",  hint: "Completed orders" },
  { key: "today_sales", label: "Today's Sales",  icon: FaCoins,        accent: "gold",    hint: "Revenue today", currency: true },
];

// count-up hook — smoothly interpolates a number from prev → next
function useCountUp(target, duration = 900) {
  const [value, setValue] = useState(target ?? 0);
  const rafRef = useRef(null);
  const startRef = useRef(null);
  const fromRef = useRef(target ?? 0);

  useEffect(() => {
    if (target == null) return;
    cancelAnimationFrame(rafRef.current);
    fromRef.current = value;
    startRef.current = null;

    const step = (ts) => {
      if (!startRef.current) startRef.current = ts;
      const p = Math.min(1, (ts - startRef.current) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      const next = fromRef.current + (target - fromRef.current) * eased;
      setValue(next);
      if (p < 1) rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, duration]);

  return value;
}

function StatCard({ meta, value, changed, index }) {
  const num = useCountUp(value ?? 0, 900);
  const Icon = meta.icon;
  const display = meta.currency
    ? `₹${Math.round(num).toLocaleString("en-IN")}`
    : Math.round(num).toLocaleString();

  return (
    <div
      className={`stat-card stat-accent-${meta.accent} ${changed ? "value-changed" : ""}`}
      style={{ animationDelay: `${index * 70}ms` }}
      data-testid={`stat-card-${meta.key}`}
    >
      <div className="stat-shine" aria-hidden="true" />
      <div className="stat-card-top">
        <div className="stat-icon-wrap" aria-hidden="true">
          <Icon />
        </div>
        <span className="stat-ring" aria-hidden="true" />
      </div>
      <div className="stat-value" data-testid={`stat-value-${meta.key}`}>{display}</div>
      <div className="stat-label">{meta.label}</div>
      <div className="stat-hint">{meta.hint}</div>
    </div>
  );
}

function CompletionRing({ percent }) {
  const clamped = Math.max(0, Math.min(100, percent || 0));
  const anim = useCountUp(clamped, 1500);
  const R = 62;
  const C = 2 * Math.PI * R;
  const offset = C - (anim / 100) * C;
  return (
    <div className="completion-ring-wrap" data-testid="completion-ring">
      <svg viewBox="0 0 160 160" className="ring-svg">
        <defs>
          <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffd93d" />
            <stop offset="100%" stopColor="#f7c600" />
          </linearGradient>
        </defs>
        <circle cx="80" cy="80" r={R} className="ring-track" />
        <circle
          cx="80"
          cy="80"
          r={R}
          className="ring-progress"
          strokeDasharray={C}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="ring-center">
        <span className="ring-percent">{Math.round(anim)}%</span>
        <span className="ring-caption">completion</span>
      </div>
    </div>
  );
}

function BarChart({ stats }) {
  const items = useMemo(
    () => [
      { key: "pending",   label: "Pending",   value: stats?.pending ?? 0,   color: "#f59e0b" },
      { key: "accepted",  label: "Accepted",  value: stats?.accepted ?? 0,  color: "#3b82f6" },
      { key: "preparing", label: "Preparing", value: stats?.preparing ?? 0, color: "#f97316" },
      { key: "ready",     label: "Ready",     value: stats?.ready ?? 0,     color: "#10b981" },
      { key: "collected", label: "Collected", value: stats?.collected ?? 0, color: "#8b5cf6" },
    ],
    [stats]
  );
  const max = Math.max(1, ...items.map((i) => i.value));

  return (
    <div className="bar-chart" data-testid="order-bar-chart">
      {items.map((it, idx) => {
        const pct = (it.value / max) * 100;
        return (
          <div key={it.key} className="bar-row" style={{ animationDelay: `${idx * 90}ms` }}>
            <div className="bar-label">
              <span>{it.label}</span>
              <strong>{it.value}</strong>
            </div>
            <div className="bar-track">
              <div
                className="bar-fill"
                style={{
                  width: `${pct}%`,
                  background: `linear-gradient(90deg, ${it.color}, ${it.color}cc)`,
                  animationDelay: `${idx * 110}ms`,
                }}
                data-testid={`bar-${it.key}`}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function TokenQuickBar({ onActionSuccess }) {
  const [tokenInput, setTokenInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAction = async (action) => {
    if (!tokenInput.trim()) {
      toast.error("Please enter a token number (e.g. 0001)");
      return;
    }
    setLoading(true);
    try {
      const res = await tokenOrderAction({
        token_number: tokenInput.trim(),
        action: action,
        mark_as_paid: true,
      });
      toast.success(res.message || `Token #${tokenInput} updated to ${action}`);
      setTokenInput("");
      if (onActionSuccess) onActionSuccess();
    } catch (err) {
      toast.error(err.response?.data?.error || `Failed to update token #${tokenInput}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="token-fast-bar mb-4">
      <div className="token-bar-left">
        <span className="token-bar-badge">⚡ Quick Token Action</span>
        <span className="token-bar-hint">Update order status directly using token number</span>
      </div>
      <div className="token-bar-right">
        <input
          type="text"
          placeholder="Token # (e.g. 0001)"
          value={tokenInput}
          onChange={(e) => setTokenInput(e.target.value)}
          className="token-num-input"
          onKeyDown={(e) => {
            if (e.key === "Enter") handleAction("ready");
          }}
        />
        <button
          className="btn btn-success token-btn ready"
          disabled={loading}
          onClick={() => handleAction("ready")}
        >
          🔔 Mark Ready
        </button>
        <button
          className="btn btn-primary token-btn complete"
          disabled={loading}
          onClick={() => handleAction("complete")}
        >
          ✅ Deliver / Complete
        </button>
      </div>
    </div>
  );
}

function QuickActions({ isPreparingStaff, navigate }) {
  const actions = isPreparingStaff
    ? [
        { key: "view-orders", label: "Kitchen Orders Queue", icon: FaListUl, path: "/manager/orders" },
        { key: "display", label: "📺 TV Waiting Board", icon: FaTv, path: "/display", external: true },
        { key: "profile", label: "My Profile & Password", icon: FaKey, path: "/manager/profile" },
      ]
    : [
        { key: "walkin", label: "Walk-in Order", icon: FaPlus, path: "/manager/walkin" },
        { key: "view-orders", label: "View All Orders", icon: FaListUl, path: "/manager/orders" },
        { key: "staff", label: "Kitchen Staff Team", icon: FaUtensils, path: "/manager/preparing-staff" },
        { key: "display", label: "📺 TV Waiting Board", icon: FaTv, path: "/display", external: true },
      ];

  const handleClick = (action) => {
    if (action.external) {
      window.open(action.path, "_blank");
    } else {
      navigate(action.path);
    }
  };

  return (
    <div className="quick-actions" data-testid="quick-actions">
      {actions.map((a, i) => {
        const Icon = a.icon;
        return (
          <button
            key={a.key}
            className="qa-btn"
            style={{ animationDelay: `${i * 80}ms` }}
            onClick={() => handleClick(a)}
            data-testid={`qa-${a.key}`}
          >
            <span className="qa-icon"><Icon /></span>
            <span className="qa-label">{a.label}</span>
            <span className="qa-arrow"><FaArrowRight /></span>
          </button>
        );
      })}
    </div>
  );
}

function AlertCard({ pending }) {
  const urgent = (pending ?? 0) > 0;
  return (
    <div
      className={`alert-card ${urgent ? "alert-urgent" : "alert-calm"}`}
      data-testid="alert-card"
    >
      <div className="alert-icon"><FaBell /></div>
      <div className="alert-body">
        <h4>{urgent ? `${pending} pending order${pending > 1 ? "s" : ""} need attention` : "All caught up"}</h4>
        <p>
          {urgent
            ? "Head to the orders queue to accept and start preparing."
            : "No pending orders right now. Great pace, keep it up!"}
        </p>
      </div>
      {urgent && <button className="alert-cta" data-testid="alert-cta">Review<FaArrowRight /></button>}
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="dashboard-loading" data-testid="dashboard-loading">
      <div className="multi-ring">
        <span></span><span></span><span></span>
      </div>
      <div className="bouncing-dots">
        <i></i><i></i><i></i>
      </div>
      <p>Loading your store…</p>
    </div>
  );
}

export default function ManagerDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [changedKeys, setChangedKeys] = useState(new Set());
  const prevRef = useRef(null);

  const load = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      // ✅ Use the authenticated api instance and your existing backend endpoint
      const res = await api.get("/orders/dashboard/");
      const next = res.data;
      if (prevRef.current) {
        const changes = new Set();
        for (const k of ["pending", "accepted", "preparing", "ready", "collected", "today_sales"]) {
          if (prevRef.current[k] !== next[k]) changes.add(k);
        }
        setChangedKeys(changes);
        setTimeout(() => setChangedKeys(new Set()), 1400);
      }
      prevRef.current = next;
      setStats(next);
    } catch (e) {
      // silent fail — UI shows loading
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    load(false);
    // Auto-poll every 30 seconds to detect new orders
    const interval = setInterval(() => load(false), 30000);
    return () => clearInterval(interval);
  }, []);

  // 🔔 Sound & notification alert when new pending orders arrive
  const { soundEnabled, toggleSound } = useNewOrderAlert(stats?.pending);

  const completionPct = useMemo(() => {
    if (!stats) return 0;
    const total = stats.pending + stats.accepted + stats.preparing + stats.ready + stats.collected;
    if (total === 0) return 0;
    return (stats.collected / total) * 100;
  }, [stats]);

  const values = {
    pending: stats?.pending,
    accepted: stats?.accepted,
    preparing: stats?.preparing,
    ready: stats?.ready,
    collected: stats?.collected,
    today_sales: stats?.today_sales,
  };

  const navigate = useNavigate();
  const userRole = localStorage.getItem("role");
  const isPreparingStaff = userRole === "preparing_staff";

  return (
    <div className="manager-dashboard" data-testid="manager-dashboard">
      <div className="dashboard-bg" aria-hidden="true">
        <div className="bg-orb bg-orb-a" />
        <div className="bg-orb bg-orb-b" />
        <div className="bg-grain" />
      </div>

      <header className="dashboard-header" data-testid="dashboard-header">
        <div className="header-left">
          <div className="store-icon-wrap">
            <span className="store-halo" aria-hidden="true" />
            <FaStore className="store-icon" />
          </div>
          <div className="header-titles">
            <span className="header-eyebrow">
              {isPreparingStaff ? "Kitchen & Preparation Console" : "Manager Console"}
            </span>
            <h1 className="header-title" data-testid="dashboard-title">
              {stats?.shop_name || stats?.store_name || (isPreparingStaff ? "Kitchen Station" : "Your Store")}
            </h1>
            <span className="header-subtitle">
              <FaBolt /> Live overview · updates in real time
            </span>
          </div>
        </div>
        <div className="d-flex align-items-center gap-2">
          {/* Sound toggle */}
          <button
            className={`refresh-btn`}
            onClick={toggleSound}
            title={soundEnabled ? 'Turn off order alert sound' : 'Turn on order alert sound'}
            style={{
              background: soundEnabled ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.12)',
              border: `1px solid ${soundEnabled ? '#10b981' : '#ef4444'}`,
              color: soundEnabled ? '#10b981' : '#ef4444',
              borderRadius: '10px',
              padding: '8px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {soundEnabled ? <FaVolumeUp /> : <FaVolumeMute />}
            <span className="refresh-label">{soundEnabled ? 'Sound ON' : 'Sound OFF'}</span>
          </button>

          <button
            className={`refresh-btn ${refreshing ? "is-refreshing" : ""}`}
            onClick={() => load(true)}
            disabled={refreshing}
            data-testid="refresh-btn"
          >
            <FaSyncAlt className="refresh-icon" />
            <span className="refresh-label">Refresh</span>
            <span className="refresh-ripple" aria-hidden="true" />
          </button>
        </div>
      </header>

      {loading ? (
        <DashboardSkeleton />
      ) : (
        <>
          {/* Fast Token Action Bar */}
          <TokenQuickBar onActionSuccess={() => load(true)} />

          <section className="stats-grid-dashboard" data-testid="stats-grid">
            {STAT_META.map((m, i) => (
              <StatCard
                key={m.key}
                meta={m}
                value={values[m.key]}
                changed={changedKeys.has(m.key)}
                index={i}
              />
            ))}
          </section>

          <section className="dashboard-middle" data-testid="dashboard-middle">
            <div className="panel chart-panel" data-testid="chart-panel">
              <div className="panel-header">
                <div>
                  <h3><FaChartBar /> Order Distribution</h3>
                  <p>Snapshot across pipeline stages</p>
                </div>
                <CompletionRing percent={completionPct} />
              </div>
              <BarChart stats={stats} />
            </div>

            <div className="panel actions-panel" data-testid="actions-panel">
              <div className="panel-header">
                <div>
                  <h3><FaBolt /> Quick Actions</h3>
                  <p>Shortcuts you use every day</p>
                </div>
              </div>
              <QuickActions isPreparingStaff={isPreparingStaff} navigate={navigate} />
              <AlertCard pending={stats?.pending ?? 0} />
            </div>
          </section>
        </>
      )}
    </div>
  );
}