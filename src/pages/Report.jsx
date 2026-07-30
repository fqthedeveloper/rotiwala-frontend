import React, { useState, useEffect, useCallback } from 'react';
import { getReport, exportReport } from '../service/reportServices';
import { getShops } from '../service/shopService';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { useLoading } from '../context/LoadingContext';
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
} from 'react-icons/fa';
import './CSS/Report.css'; // We'll create this CSS file below

const Report = () => {
  const { user } = useAuth();
  const { showLoading, hideLoading } = useLoading();
  const [filter, setFilter] = useState('today');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [shopId, setShopId] = useState('');
  const [shops, setShops] = useState([]);
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch shops if super_admin
  useEffect(() => {
    if (user?.role === 'super_admin') {
      getShops()
        .then(data => setShops(data))
        .catch(err => {
          console.error('Failed to load shops', err);
          toast.error('Could not load shop list');
        });
    }
  }, [user]);

  const fetchReport = useCallback(async () => {
    setLoading(true);
    setError(null);
    showLoading('Loading report...');
    try {
      const params = { filter };
      if (filter === 'custom' && startDate && endDate) {
        params.start = startDate;
        params.end = endDate;
      }
      // For manager: send shop_id automatically (backend will use it)
      if (user?.role === 'manager') {
        params.shop = user.shop_id;
      } else if (user?.role === 'super_admin' && shopId) {
        params.shop = shopId;
      }
      const data = await getReport(params);
      setReportData(data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to load report');
      toast.error('Failed to load report');
    } finally {
      setLoading(false);
      hideLoading();
    }
  }, [filter, startDate, endDate, shopId, user, showLoading, hideLoading]);

  // Fetch on filter or shop change
  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const handleExport = async (format) => {
    try {
      const params = { format, filter };
      if (filter === 'custom' && startDate && endDate) {
        params.start = startDate;
        params.end = endDate;
      }
      if (user?.role === 'manager') {
        params.shop = user.shop_id;
      } else if (user?.role === 'super_admin' && shopId) {
        params.shop = shopId;
      }
      const response = await exportReport(params);
            const blob = new Blob([response.data], {
          type: response.headers["content-type"],
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const ext = format === 'excel' ? 'xlsx' : 'pdf';
      link.setAttribute('download', `report.${ext}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Report downloaded');
    } catch (err) {
      console.error(err);
      toast.error('Export failed');
    }
  };

  // Render loading state
  if (loading) {
    return (
      <div className="report-loading">
        <div className="report-spinner"></div>
        <p>Loading report...</p>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="report-error">
        <FaChartLine className="error-icon" />
        <h3>Oops! Something went wrong</h3>
        <p>{error}</p>
        <button className="btn btn-primary" onClick={fetchReport}>
          <FaSyncAlt /> Retry
        </button>
      </div>
    );
  }

  // No data yet (first load)
  if (!reportData) {
    return (
      <div className="report-empty">
        <FaChartLine className="empty-icon" />
        <h3>No report data</h3>
        <p>Try adjusting your filters</p>
      </div>
    );
  }

  const { summary, shops: shopBreakdown } = reportData;

  return (
    <div className="report-page">
      {/* Header */}
      <div className="report-header">
        <h1>
          <FaChartLine /> Financial Report
        </h1>
        <div className="report-actions">
          <button
            className="btn btn-outline"
            onClick={fetchReport}
            disabled={loading}
          >
            <FaSyncAlt className={loading ? 'spin' : ''} /> Refresh
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

        {filter === 'custom' && (
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

        {user?.role === 'super_admin' && (
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
          <button
            className="btn btn-success"
            onClick={() => handleExport('excel')}
          >
            <FaFileExcel /> Excel
          </button>
          <button
            className="btn btn-danger"
            onClick={() => handleExport('pdf')}
          >
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
            <p className="card-value">₹{summary.sales}</p>
            <small>{summary.orders} orders</small>
          </div>
        </div>
        <div className="card card-expenses">
          <div className="card-icon">
            <FaWallet />
          </div>
          <div className="card-content">
            <h3>Expenses</h3>
            <p className="card-value">₹{summary.expenses}</p>
          </div>
        </div>
        <div className="card card-maintenance">
          <div className="card-icon">
            <FaTools />
          </div>
          <div className="card-content">
            <h3>Maintenance</h3>
            <p className="card-value">₹{summary.maintenance}</p>
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
              style={{ color: summary.profit >= 0 ? 'var(--success)' : 'var(--danger)' }}
            >
              ₹{summary.profit}
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
                  <th>Profit</th>
                </tr>
              </thead>
              <tbody>
                {shopBreakdown.map((shop) => (
                  <tr key={shop.shop_id}>
                    <td>{shop.shop_name}</td>
                    <td>₹{shop.sales}</td>
                    <td>₹{shop.expenses}</td>
                    <td>₹{shop.maintenance}</td>
                    <td style={{ color: shop.profit >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                      ₹{shop.profit}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* No data message */}
      {!shopBreakdown && summary.sales === 0 && summary.expenses === 0 && (
        <div className="report-empty-data">
          <p>No transactions found for the selected period.</p>
        </div>
      )}
    </div>
  );
};

export default Report;