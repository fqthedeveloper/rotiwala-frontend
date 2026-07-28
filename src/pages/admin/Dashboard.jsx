import React, { useEffect, useState } from "react";
import {
  FaShoppingBag,
  FaUsers,
  FaRupeeSign,
  FaStore,
  FaUtensils,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  getSuperAdminStats,
  getSuperAdminRecentOrders,
  getSuperAdminRevenueTrend,
  getSuperAdminOrdersByShop,
  getSuperAdminTopProducts,
} from "../../service/orderService";

const SuperAdminDashboard = () => {
  useEffect(() => {
    document.title = "Super Admin Dashboard | Roti Wala";
  }, []);

  // ---------- State ----------
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [revenueTrend, setRevenueTrend] = useState([]);
  const [ordersByShop, setOrdersByShop] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Animated count state
  const [animatedStats, setAnimatedStats] = useState({});

  // ---------- Fetch Data ----------
  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);
        const [
          statsData,
          recentData,
          revenueData,
          shopData,
          productData,
        ] = await Promise.all([
          getSuperAdminStats(),
          getSuperAdminRecentOrders(8),
          getSuperAdminRevenueTrend(30),
          getSuperAdminOrdersByShop(),
          getSuperAdminTopProducts(6),
        ]);

        setStats(statsData);
        setRecentOrders(recentData);
        setRevenueTrend(revenueData);
        setOrdersByShop(shopData);
        setTopProducts(productData);
        setError(null);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
        setError("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  // ---------- Animate stats (count‑up) ----------
  useEffect(() => {
    if (!stats) return;

    // We want to animate these numeric fields
    const fields = [
      "total_orders",
      "total_revenue",
      "total_customers",
      "total_shops",
      "total_products",
      "pending_orders",
      "completed_orders",
      "cancelled_orders",
      "orders_today",
      "revenue_today",
    ];

    const initial = {};
    fields.forEach((key) => {
      initial[key] = 0;
    });
    setAnimatedStats(initial);

    // Duration per field (ms)
    const duration = 1000;
    const frameRate = 16; // ms per frame
    const totalFrames = Math.floor(duration / frameRate);

    let frame = 0;
    const interval = setInterval(() => {
      frame++;
      const progress = Math.min(frame / totalFrames, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);

      const newStats = {};
      fields.forEach((key) => {
        const target = stats[key] || 0;
        newStats[key] = Math.round(eased * target);
      });
      setAnimatedStats(newStats);

      if (frame >= totalFrames) {
        clearInterval(interval);
        // Set final exact values
        const final = {};
        fields.forEach((key) => {
          final[key] = stats[key] || 0;
        });
        setAnimatedStats(final);
      }
    }, frameRate);

    return () => clearInterval(interval);
  }, [stats]);

  // ---------- Helpers ----------
  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return "₹0";
    return `₹${Number(amount).toLocaleString("en-IN")}`;
  };

  const formatNumber = (num) => {
    if (num === undefined || num === null) return "0";
    return Number(num).toLocaleString("en-IN");
  };

  // Colors for pie chart
  const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

  if (loading) {
    return (
      <div className="dashboard-loading" role="status" aria-live="polite">
        <div className="spinner" />
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-error" role="alert">
        <p>⚠️ {error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  // ---------- Render ----------
  return (
    <div className="superadmin-dashboard">
      <style>{`
        /* ----- Global Reset & Variables ----- */
        :root {
          --bg-primary: #0b1120;
          --bg-card: rgba(255,255,255,0.03);
          --border-card: rgba(255,255,255,0.06);
          --text-primary: #00050e;
          --text-muted: #b3b5b9;
          --shadow: 0 8px 32px rgba(0,0,0,0.5);
        }
        * { box-sizing: border-box; }

        .superadmin-dashboard {
          padding: 20px;
          min-height: 100vh;
          background: radial-gradient(ellipse at 10% 20%, #fff8df, #dfe2e7);
          color: var(--text-primary);
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
        }

        /* ----- Spinner ----- */
        .dashboard-loading, .dashboard-error {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 70vh;
          gap: 16px;
        }
        .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid rgba(255,255,255,0.1);
          border-top-color: #3b82f6;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* ----- Header ----- */
        .dashboard-header {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 28px;
          gap: 12px;
          background: linear-gradient(135deg, #030303, #414142);
        }
        .dashboard-header h1 {
          font-size: 26px;
          font-weight: 600;
          margin: 0;
          background: linear-gradient(135deg, #f8f8ff, #f8f8ff);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .dashboard-header p {
          margin: 0;
          color: var(--text-muted);
          font-size: 14px;
        }
        .header-right {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }
        .header-right .date-badge {
          background: var(--bg-card);
          padding: 6px 14px;
          border-radius: 20px;
          font-size: 13px;
          border: 1px solid var(--border-card);
          color: var(--text-muted);
        }

        /* ----- Stats Grid (cards) ----- */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          gap: 14px;
          margin-bottom: 22px;
        }
        .stat-card {
          background: var(--bg-card);
          backdrop-filter: blur(8px);
          border: 1px solid var(--border-card);
          border-radius: 14px;
          padding: 12px 12px;
          box-shadow: var(--shadow);
          transition: transform 0.22s ease, box-shadow 0.24s ease;
          display: flex;
          align-items: center;
          gap: 12px;
          animation: fadeUp 0.44s cubic-bezier(0.2, 0.9, 0.3, 1) both;
        }
        .stat-card:hover {
          transform: translateY(-4px) scale(1.01);
          box-shadow: 0 16px 48px rgba(0,0,0,0.7);
        }
        .stat-icon {
          width: 44px;
          height: 44px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          color: white;
          flex-shrink: 0;
        }
        .stat-content {
          flex: 1;
          min-width: 0;
        }
        .stat-content .label {
          font-size: 13px;
          color: var(--text-muted);
          margin-bottom: 2px;
        }
        .stat-content .value {
          font-size: 22px;
          font-weight: 600;
          letter-spacing: -0.3px;
        }

        /* ----- Charts Row ----- */
        .charts-row {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 18px;
          margin-bottom: 20px;
        }
        .chart-box {
          background: var(--bg-card);
          backdrop-filter: blur(8px);
          border: 1px solid var(--border-card);
          border-radius: 14px;
          padding: 14px;
          box-shadow: var(--shadow);
          transition: transform 0.18s ease;
          animation: fadeUp 0.52s both;
        }
        .chart-box h3 {
          margin: 0 0 12px 0;
          font-size: 16px;
          font-weight: 500;
          color: var(--text-muted);
          letter-spacing: 0.3px;
        }

        /* ----- Bottom Row (recent orders + top products) ----- */
        .bottom-row {
          display: grid;
          grid-template-columns: 1.6fr 1fr;
          gap: 16px;
        }
        .table-wrapper {
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
        }
        .orders-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 14px;
        }
        .orders-table th {
          text-align: left;
          padding: 10px 8px;
          color: var(--text-muted);
          font-weight: 500;
          border-bottom: 1px solid rgba(255,255,255,0.05);
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.6px;
          white-space: nowrap;
        }
        .orders-table td {
          padding: 10px 8px;
          border-bottom: 1px solid rgba(255,255,255,0.04);
          white-space: nowrap;
          max-width: 220px;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .orders-table tr:last-child td { border-bottom: none; }
        .status-badge {
          display: inline-block;
          padding: 2px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 500;
        }
        .status-completed { background: rgba(16,185,129,0.2); color: #34d399; }
        .status-pending   { background: rgba(245,158,11,0.2); color: #fbbf24; }
        .status-cancelled { background: rgba(239,68,68,0.2); color: #f87171; }
        .status-default   { background: rgba(148,163,184,0.15); color: #94a3b8; }

        .product-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .product-item {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .product-item .rank {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: rgba(255,255,255,0.06);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          color: var(--text-muted);
        }
        .product-item .name {
          flex: 1;
          font-weight: 500;
        }
        .product-item .qty {
          color: var(--text-muted);
          font-size: 14px;
        }

        /* ----- Responsive Adjustments ----- */
        @media (max-width: 1024px) {
          .charts-row { grid-template-columns: 1fr; }
          .bottom-row { grid-template-columns: 1fr; }
          .stats-grid { grid-template-columns: repeat(3, 1fr); }
        }
        @media (max-width: 768px) {
          .stats-grid { grid-template-columns: repeat(2, 1fr); }
          .dashboard-header h1 { font-size: 20px; }
          .stat-content .value { font-size: 16px; }
          .header-right { gap: 8px; }
        }
        @media (max-width: 480px) {
          .stats-grid { grid-template-columns: 1fr; }
          .dashboard-header { align-items: flex-start; gap: 8px; }
          .chart-box { padding: 12px; }
          .product-item .name { font-size: 14px; }
          .orders-table th, .orders-table td { font-size: 13px; }
          .header-right .date-badge { display: none; }
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          .stat-card, .chart-box { animation: none; transition: none; }
        }
      `}</style>

      {/* ----- HEADER ----- */}
      <div className="dashboard-header">
        <div>
          <h1>Super Admin Dashboard</h1>
          <p>Overview of all shops and platform metrics</p>
        </div>
        <div className="header-right">
          <span className="date-badge">{new Date().toLocaleDateString("en-IN", { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}</span>
        </div>
      </div>

      {/* ----- STATS CARDS ----- */}
      <div className="stats-grid">
        {stats && [
          { key: "total_orders", label: "Total Orders", icon: <FaShoppingBag />, color: "#3b82f6" },
          { key: "total_revenue", label: "Revenue", icon: <FaRupeeSign />, color: "#f59e0b", currency: true },
          { key: "total_customers", label: "Customers", icon: <FaUsers />, color: "#10b981" },
          { key: "total_shops", label: "Shops", icon: <FaStore />, color: "#8b5cf6" },
          { key: "total_products", label: "Products", icon: <FaUtensils />, color: "#ef4444" },
          { key: "pending_orders", label: "Pending", icon: <FaClock />, color: "#f97316" },
          { key: "completed_orders", label: "Completed", icon: <FaCheckCircle />, color: "#14b8a6" },
          { key: "cancelled_orders", label: "Cancelled", icon: <FaTimesCircle />, color: "#e11d48" },
        ].map((item, idx) => {
          const val = animatedStats[item.key] ?? 0;
          const display = item.currency ? formatCurrency(val) : formatNumber(val);
          return (
            <div className="stat-card" key={item.key} style={{ animationDelay: `${idx * 60}ms` }}>
              <div className="stat-icon" style={{ background: item.color }}>
                {item.icon}
              </div>
              <div className="stat-content">
                <div className="label">{item.label}</div>
                <div className="value">{display}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ----- CHARTS ROW ----- */}
      <div className="charts-row">
        {/* Revenue Trend */}
        <div className="chart-box" style={{ animationDelay: "0.2s" }}>
          <h3>📈 Revenue Trend (Last 30 Days)</h3>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={revenueTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" tick={{ fill: "#94a3b8", fontSize: 11 }} />
              <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} />
              <Tooltip
                formatter={(value) => `₹${Number(value).toLocaleString("en-IN")}`}
                contentStyle={{ background: "#0b1120", border: "1px solid rgba(255,255,255,0.1)" }}
              />
              <Legend verticalAlign="top" height={36} />
              <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} dot={false} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Orders by Shop (Pie) */}
        <div className="chart-box" style={{ animationDelay: "0.3s" }}>
          <h3>🏪 Orders by Shop</h3>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={ordersByShop}
                dataKey="order_count"
                nameKey="shop_name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={({ shop_name, percent }) => `${shop_name} ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {ordersByShop.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `${value} orders`} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ----- BOTTOM ROW ----- */}
      <div className="bottom-row">
        {/* Recent Orders */}
        <div className="chart-box" style={{ animationDelay: "0.4s" }}>
          <h3>🕒 Recent Orders</h3>
          <div className="table-wrapper">
            <table className="orders-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Shop</th>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id}>
                    <td>#{order.id}</td>
                    <td>{order.shop_name}</td>
                    <td>{order.customer_name}</td>
                    <td>{formatCurrency(order.total)}</td>
                    <td>
                      <span className={`status-badge status-${order.status}`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Products */}
        <div className="chart-box" style={{ animationDelay: "0.5s" }}>
          <h3>🔥 Top Selling Products</h3>
          <div className="product-list">
            {topProducts.map((product, idx) => (
              <div className="product-item" key={product.id}>
                <span className="rank">#{idx + 1}</span>
                <span className="name">{product.name}</span>
                <span className="qty">{product.total_quantity} sold</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;