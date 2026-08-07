// frontend/src/pages/Report.jsx

import React, { useState, useEffect, useCallback } from "react";
import { getReport, exportReport } from "../service/reportServices";
import { getShops } from "../service/shopService";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import { useLoading } from "../context/LoadingContext";
import {
  FaChartLine,
  FaRupeeSign,
  FaShoppingCart,
  FaWallet,
  FaTools,
  FaFileExcel,
  FaFilePdf,
  FaSyncAlt,
  FaStore,
  FaUserCog,
} from "react-icons/fa";

const Report = () => {
  const { user } = useAuth();
  const { showLoading, hideLoading } = useLoading();
  const [filter, setFilter] = useState("today");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [shopId, setShopId] = useState("");
  const [shops, setShops] = useState([]);
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch shops if super_admin
  useEffect(() => {
    if (user?.role === "super_admin") {
      getShops()
        .then((data) => setShops(data))
        .catch((err) => {
          console.error("Failed to load shops", err);
          toast.error("Could not load shop list");
        });
    }
  }, [user]);

  const fetchReport = useCallback(async () => {
    setLoading(true);
    setError(null);
    showLoading("Loading report...");
    try {
      const params = { filter };
      if (filter === "custom" && startDate && endDate) {
        params.start = startDate;
        params.end = endDate;
      }
      if (user?.role === "manager") {
        params.shop = user.shop_id;
      } else if (user?.role === "super_admin" && shopId) {
        params.shop = shopId;
      }
      const data = await getReport(params);
      setReportData(data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Failed to load report");
      toast.error("Failed to load report");
    } finally {
      setLoading(false);
      hideLoading();
    }
  }, [filter, startDate, endDate, shopId, user, showLoading, hideLoading]);

  // Fetch on filter or shop change
  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  // 🔥 FIXED: Download handler with fallback
  const handleExport = async (format) => {
    try {
      const params = { format, filter };
      if (filter === "custom" && startDate && endDate) {
        params.start = startDate;
        params.end = endDate;
      }
      if (user?.role === "manager") {
        params.shop = user.shop_id;
      } else if (user?.role === "super_admin" && shopId) {
        params.shop = shopId;
      }

      const blob = await exportReport(params);

      // Check if blob is valid
      if (!blob || blob.size === 0) {
        toast.error("Generated file is empty. Please try again.");
        return;
      }

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      const ext = format === "excel" ? "xlsx" : "pdf";
      const filename = `report_${new Date().toISOString().slice(0, 10)}.${ext}`;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success(`Report downloaded as ${filename}`);
    } catch (err) {
      console.error("Export error:", err);
      // Fallback: try opening in new window if blob failed
      try {
        const url = `/api/reports/export/?format=${format}&filter=${filter}` +
          (filter === "custom" && startDate && endDate ? `&start=${startDate}&end=${endDate}` : "") +
          (shopId ? `&shop=${shopId}` : "");
        window.open(url, "_blank");
        toast.info("File opened in new tab. If it doesn't download, try right-click and 'Save as'.");
      } catch (fallbackErr) {
        toast.error("Export failed. Please try again.");
      }
    }
  };

  // Render loading state
  if (loading) {
    return (
      <div className="report-loading" style={{ padding: 40, textAlign: "center" }}>
        <div
          className="report-spinner"
          style={{
            display: "inline-block",
            width: 40,
            height: 40,
            border: "4px solid #e2e8f0",
            borderTop: "4px solid #3b82f6",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
          }}
        ></div>
        <p style={{ marginTop: 16, color: "#64748b" }}>Loading report...</p>
        <style>{`
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div style={{ padding: 40, textAlign: "center", color: "#b91c1c" }}>
        <FaChartLine size={48} style={{ color: "#ef4444" }} />
        <h3>Oops! Something went wrong</h3>
        <p>{error}</p>
        <button
          className="btn btn-primary"
          onClick={fetchReport}
          style={{
            padding: "10px 20px",
            border: "none",
            borderRadius: 8,
            background: "#3b82f6",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          <FaSyncAlt /> Retry
        </button>
      </div>
    );
  }

  // No data yet (first load)
  if (!reportData) {
    return (
      <div style={{ padding: 40, textAlign: "center", color: "#64748b" }}>
        <FaChartLine size={48} />
        <h3>No report data</h3>
        <p>Try adjusting your filters</p>
      </div>
    );
  }

  const { summary, shops: shopBreakdown } = reportData;

  return (
    <div className="report-page">
      <style>{`
        .report-page {
          padding: 24px;
          max-width: 1400px;
          margin: 0 auto;
          background: #f8fafc;
          min-height: 100vh;
          color: #111827;
        }
        .report-header {
          display: flex;
          flex-wrap: wrap;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          margin-bottom: 24px;
        }
        .report-header h1 {
          margin: 0;
          font-size: clamp(1.8rem, 2.5vw, 2.4rem);
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .report-actions {
          display: flex;
          gap: 12px;
        }
        .btn {
          padding: 10px 18px;
          border: none;
          border-radius: 10px;
          font-weight: 600;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition: transform 0.2s ease, background-color 0.2s ease;
          min-height: 44px;
          white-space: nowrap;
        }
        .btn:hover:not(:disabled) {
          transform: translateY(-1px);
        }
        .btn-primary {
          background: #3b82f6;
          color: #fff;
        }
        .btn-primary:hover:not(:disabled) {
          background: #2563eb;
        }
        .btn-success {
          background: #10b981;
          color: #fff;
        }
        .btn-success:hover:not(:disabled) {
          background: #059669;
        }
        .btn-danger {
          background: #ef4444;
          color: #fff;
        }
        .btn-danger:hover:not(:disabled) {
          background: #dc2626;
        }
        .btn-outline {
          background: transparent;
          color: #0f172a;
          border: 1px solid rgba(15,23,42,0.12);
        }
        .btn-outline:hover {
          background: #e2e8f0;
        }
        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* Filters */
        .report-filters {
          display: flex;
          flex-wrap: wrap;
          gap: 16px;
          background: #fff;
          border-radius: 16px;
          border: 1px solid rgba(15,23,42,0.08);
          padding: 16px 20px;
          box-shadow: 0 8px 24px rgba(15,23,42,0.05);
          margin-bottom: 24px;
          align-items: center;
        }
        .filter-group {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .filter-group label {
          font-weight: 600;
          font-size: 0.9rem;
          color: #475569;
        }
        .filter-group select,
        .filter-group input {
          padding: 8px 12px;
          border-radius: 10px;
          border: 1px solid rgba(15,23,42,0.12);
          background: #f8fafc;
          font-size: 14px;
          outline: none;
        }
        .filter-group select:focus,
        .filter-group input:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 4px rgba(59,130,246,0.12);
        }
        .export-buttons {
          display: flex;
          gap: 8px;
          margin-left: auto;
        }

        /* Summary Cards */
        .summary-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
          margin-bottom: 24px;
        }
        .card {
          background: #fff;
          padding: 20px;
          border-radius: 16px;
          border: 1px solid rgba(15,23,42,0.08);
          box-shadow: 0 8px 24px rgba(15,23,42,0.05);
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .card-icon {
          font-size: 2rem;
          width: 56px;
          height: 56px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .card-sales .card-icon {
          background: #dbeafe;
          color: #3b82f6;
        }
        .card-expenses .card-icon {
          background: #fce4ec;
          color: #ef4444;
        }
        .card-maintenance .card-icon {
          background: #fff3e0;
          color: #f59e0b;
        }
        .card-salary .card-icon {
          background: #e8f5e9;
          color: #43a047;
        }
        .card-profit .card-icon {
          background: #d1fae5;
          color: #10b981;
        }
        .card-content h3 {
          margin: 0;
          font-size: 0.95rem;
          color: #64748b;
        }
        .card-content .card-value {
          margin: 4px 0 0 0;
          font-size: 1.6rem;
          font-weight: 700;
        }
        .card-content small {
          color: #94a3b8;
          font-size: 0.85rem;
        }

        /* Shop Breakdown */
        .shop-breakdown {
          background: #fff;
          border-radius: 16px;
          border: 1px solid rgba(15,23,42,0.08);
          padding: 20px;
          box-shadow: 0 8px 24px rgba(15,23,42,0.05);
          margin-bottom: 24px;
        }
        .shop-breakdown h2 {
          margin: 0 0 16px 0;
          font-size: 1.3rem;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .table-responsive {
          overflow-x: auto;
        }
        .table {
          width: 100%;
          border-collapse: collapse;
        }
        .table th,
        .table td {
          padding: 12px 16px;
          text-align: left;
          border-bottom: 1px solid rgba(15,23,42,0.06);
        }
        .table th {
          background: #f8fafc;
          font-weight: 700;
          color: #475569;
        }
        .table tr:hover td {
          background: rgba(14,165,233,0.04);
        }

        .report-empty-data {
          text-align: center;
          padding: 40px;
          color: #94a3b8;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .report-page { padding: 16px; }
          .report-filters { flex-direction: column; align-items: stretch; }
          .filter-group { flex-direction: column; align-items: stretch; }
          .export-buttons { margin-left: 0; justify-content: stretch; }
          .export-buttons .btn { flex: 1; justify-content: center; }
          .summary-cards { grid-template-columns: 1fr 1fr; }
          .report-header { flex-direction: column; align-items: stretch; }
          .report-actions { justify-content: stretch; }
          .report-actions .btn { flex: 1; justify-content: center; }
        }
        @media (max-width: 480px) {
          .summary-cards { grid-template-columns: 1fr; }
          .card { flex-direction: column; text-align: center; }
          .card-icon { width: 48px; height: 48px; font-size: 1.5rem; }
        }
      `}</style>

      {/* Header */}
      <div className="report-header">
        <h1>
          <FaChartLine /> Financial Report
        </h1>
        <div className="report-actions">
          <button className="btn btn-outline" onClick={fetchReport} disabled={loading}>
            <FaSyncAlt className={loading ? "spin" : ""} /> Refresh
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="report-filters">
        <div className="filter-group">
          <label>Date Range</label>
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="custom">Custom</option>
          </select>
        </div>

        {filter === "custom" && (
          <>
            <div className="filter-group">
              <label>Start</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="filter-group">
              <label>End</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <button className="btn btn-primary" onClick={fetchReport}>
              Apply
            </button>
          </>
        )}

        {user?.role === "super_admin" && (
          <div className="filter-group">
            <label>Shop</label>
            <select value={shopId} onChange={(e) => setShopId(e.target.value)}>
              <option value="">All Shops</option>
              {shops.map((shop) => (
                <option key={shop.id} value={shop.id}>
                  {shop.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="export-buttons">
          <button className="btn btn-success" onClick={() => handleExport("excel")}>
            <FaFileExcel /> Excel
          </button>
          <button className="btn btn-danger" onClick={() => handleExport("pdf")}>
            <FaFilePdf /> PDF
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="summary-cards">
        <div className="card card-sales">
          <div className="card-icon">
            <FaRupeeSign />
          </div>
          <div className="card-content">
            <h3>Sales</h3>
            <p className="card-value">₹{Number(summary.sales).toFixed(2)}</p>
            <small>{summary.orders} orders</small>
          </div>
        </div>
        <div className="card card-expenses">
          <div className="card-icon">
            <FaWallet />
          </div>
          <div className="card-content">
            <h3>Expenses</h3>
            <p className="card-value">₹{Number(summary.expenses).toFixed(2)}</p>
          </div>
        </div>
        <div className="card card-maintenance">
          <div className="card-icon">
            <FaTools />
          </div>
          <div className="card-content">
            <h3>Maintenance</h3>
            <p className="card-value">₹{Number(summary.maintenance).toFixed(2)}</p>
          </div>
        </div>
        <div className="card card-salary">
          <div className="card-icon">
            <FaUserCog />
          </div>
          <div className="card-content">
            <h3>Staff Salary</h3>
            <p className="card-value">₹{Number(summary.staff_salary).toFixed(2)}</p>
          </div>
        </div>
        <div className="card card-profit">
          <div className="card-icon">
            <FaChartLine />
          </div>
          <div className="card-content">
            <h3>Profit</h3>
            <p
              className="card-value"
              style={{ color: Number(summary.profit) >= 0 ? "#10b981" : "#ef4444" }}
            >
              ₹{Number(summary.profit).toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      {/* Shop Breakdown (only for super_admin) */}
      {shopBreakdown && shopBreakdown.length > 0 && (
        <div className="shop-breakdown">
          <h2>
            <FaStore /> Shop Breakdown
          </h2>
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Shop</th>
                  <th>Sales</th>
                  <th>Expenses</th>
                  <th>Maintenance</th>
                  <th>Staff Salary</th>
                  <th>Profit</th>
                </tr>
              </thead>
              <tbody>
                {shopBreakdown.map((shop) => (
                  <tr key={shop.shop_id}>
                    <td>{shop.shop_name}</td>
                    <td>₹{Number(shop.sales).toFixed(2)}</td>
                    <td>₹{Number(shop.expenses).toFixed(2)}</td>
                    <td>₹{Number(shop.maintenance).toFixed(2)}</td>
                    <td>₹{Number(shop.staff_salary || 0).toFixed(2)}</td>
                    <td
                      style={{
                        color: Number(shop.profit) >= 0 ? "#10b981" : "#ef4444",
                      }}
                    >
                      ₹{Number(shop.profit).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* No data message */}
      {!shopBreakdown &&
        Number(summary.sales) === 0 &&
        Number(summary.expenses) === 0 &&
        Number(summary.maintenance) === 0 &&
        Number(summary.staff_salary) === 0 && (
          <div className="report-empty-data">
            <p>No transactions found for the selected period.</p>
          </div>
        )}
    </div>
  );
};

export default Report;