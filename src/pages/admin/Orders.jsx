import React, { useEffect, useState, useCallback } from "react";
import {
  FaSearch,
  FaTimes,
  FaChevronLeft,
  FaChevronRight,
  FaStore,
} from "react-icons/fa";
import { getSuperAdminOrders } from "../../service/orderService";
import { format } from "date-fns";

const SuperAdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filters, setFilters] = useState({
    status: "",
    shop_id: "",
    order_type: "",
    payment_status: "",
    search: "",
    start_date: "",
    end_date: "",
  });

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 15;

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page,
        page_size: pageSize,
        ...filters,
      };
      Object.keys(params).forEach(key => {
        if (params[key] === "" || params[key] === null || params[key] === undefined) {
          delete params[key];
        }
      });
      const response = await getSuperAdminOrders(params);
      // ✅ DRF paginated response
      setOrders(response.results || []);
      setTotalCount(response.count || 0);
      setTotalPages(Math.ceil((response.count || 0) / pageSize));
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError("Failed to load orders. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({
      status: "",
      shop_id: "",
      order_type: "",
      payment_status: "",
      search: "",
      start_date: "",
      end_date: "",
    });
    setPage(1);
  };

  const getStatusBadge = (status) => {
    const map = {
      pending: "bg-yellow-100 text-yellow-800",
      accepted: "bg-blue-100 text-blue-800",
      preparing: "bg-purple-100 text-purple-800",
      ready: "bg-green-100 text-green-800",
      collected: "bg-gray-100 text-gray-800",
      cancelled: "bg-red-100 text-red-800",
      rejected: "bg-red-200 text-red-900",
      completed: "bg-green-200 text-green-900",
    };
    return map[status] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="superadmin-orders">
      {/* Styles (same as before) */}
      <style>{`
        .superadmin-orders {
          padding: 20px;
          min-height: 100vh;
          background: linear-gradient(135deg, #f0f2f7 0%, #fafbff 100%);
          color: #020202;
          font-family: 'Inter', system-ui, sans-serif;
        }
        .orders-header {
          display: flex;
          flex-wrap: wrap;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          gap: 16px;
        }
        .orders-header h1 {
          font-size: 28px;
          font-weight: 600;
          margin: 0;
          background: linear-gradient(135deg, #0a0a0a, #272727);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .orders-header .count {
          font-size: 14px;
          color: #161718;
          background: rgba(255,255,255,0.05);
          padding: 6px 16px;
          border-radius: 20px;
        }
        .filter-bar {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          background: rgba(255,255,255,0.03);
          padding: 16px;
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.06);
          margin-bottom: 24px;
          align-items: center;
        }
        .filter-bar input,
        .filter-bar select {
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(17, 17, 17, 0.76);
          border-radius: 8px;
          padding: 8px 12px;
          color: #050505;
          font-size: 14px;
          outline: none;
          transition: border 0.2s;
        }
        .filter-bar input:focus,
        .filter-bar select:focus {
          border-color: #3b82f6;
        }
        .filter-bar input::placeholder {
          color: #0c0c0c;
        }
        .filter-bar select option {
          background: #080808;
          color: #e8f0fe;
        }
        .filter-bar .filter-group {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: wrap;
        }
        .filter-bar .clear-btn {
          background: rgba(239,68,68,0.2);
          border: none;
          color: #f87171;
          padding: 6px 14px;
          border-radius: 8px;
          cursor: pointer;
          transition: background 0.2s;
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
        }
        .filter-bar .clear-btn:hover {
          background: rgba(239,68,68,0.3);
        }
        .table-wrapper {
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.04);
          background: rgba(255,255,255,0.02);
        }
        table {
          width: 100%;
          border-collapse: collapse;
          font-size: 14px;
          min-width: 700px;
        }
        thead {
          background: rgba(255,255,255,0.03);
        }
        th {
          text-align: left;
          padding: 14px 12px;
          font-weight: 500;
          color: #272829;
          border-bottom: 1px solid rgba(255,255,255,0.05);
          white-space: nowrap;
        }
        td {
          padding: 12px;
          border-bottom: 1px solid rgba(255,255,255,0.03);
          vertical-align: middle;
        }
        tr:hover td {
          background: rgba(255,255,255,0.02);
        }
        .status-badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 500;
          text-transform: capitalize;
        }
        .order-number {
          font-weight: 600;
          color: #60a5fa;
        }
        .shop-name {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .shop-name svg {
          color: #94a3b8;
        }
        .customer-info {
          display: flex;
          flex-direction: column;
        }
        .customer-info .name {
          font-weight: 500;
        }
        .customer-info .phone {
          font-size: 12px;
          color: #94a3b8;
        }
        .amount {
          font-weight: 600;
        }
        .pagination {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 24px;
          flex-wrap: wrap;
          gap: 12px;
        }
        .pagination .info {
          font-size: 14px;
          color: #000000;
        }
        .pagination .controls {
          display: flex;
          gap: 8px;
        }
        .pagination button {
          background: rgba(0, 0, 0, 0.78);
          border: 1px solid rgba(255,255,255,0.08);
          color: #e8f0fe;
          padding: 8px 16px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .pagination button:hover:not(:disabled) {
          background: rgba(59,130,246,0.2);
          border-color: #3b82f6;
        }
        .pagination button:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }
        .loading-state, .error-state {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 300px;
          flex-direction: column;
          gap: 16px;
        }
        .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid rgba(255,255,255,0.1);
          border-top-color: #3b82f6;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 768px) {
          .filter-bar {
            flex-direction: column;
            align-items: stretch;
          }
          .filter-bar .filter-group {
            flex-wrap: wrap;
          }
          .orders-header h1 {
            font-size: 22px;
          }
          td, th {
            padding: 10px 8px;
            font-size: 13px;
          }
          .pagination {
            flex-direction: column;
            align-items: stretch;
            text-align: center;
          }
          .pagination .controls {
            justify-content: center;
          }
        }
        @media (max-width: 480px) {
          .superadmin-orders {
            padding: 12px;
          }
          .filter-bar input, .filter-bar select {
            width: 100%;
          }
        }
      `}</style>

      <div className="orders-header">
        <h1>All Orders</h1>
        <span className="count">{totalCount} orders</span>
      </div>

      <div className="filter-bar">
        <div className="filter-group">
          <FaSearch style={{ color: '#94a3b8' }} />
          <input
            type="text"
            placeholder="Search by order #, customer..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
          />
        </div>

        <select
          value={filters.status}
          onChange={(e) => handleFilterChange('status', e.target.value)}
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="accepted">Accepted</option>
          <option value="preparing">Preparing</option>
          <option value="ready">Ready</option>
          <option value="collected">Collected</option>
          <option value="cancelled">Cancelled</option>
          <option value="rejected">Rejected</option>
          <option value="completed">Completed</option>
        </select>

        <select
          value={filters.order_type}
          onChange={(e) => handleFilterChange('order_type', e.target.value)}
        >
          <option value="">All Types</option>
          <option value="online">Online</option>
          <option value="walkin">Walk‑In</option>
        </select>

        <select
          value={filters.payment_status}
          onChange={(e) => handleFilterChange('payment_status', e.target.value)}
        >
          <option value="">Payment</option>
          <option value="paid">Paid</option>
          <option value="unpaid">Unpaid</option>
        </select>

        <input
          type="date"
          value={filters.start_date}
          onChange={(e) => handleFilterChange('start_date', e.target.value)}
          title="Start date"
        />
        <span style={{ color: '#64748b' }}>to</span>
        <input
          type="date"
          value={filters.end_date}
          onChange={(e) => handleFilterChange('end_date', e.target.value)}
          title="End date"
        />

        <button className="clear-btn" onClick={clearFilters}>
          <FaTimes /> Clear
        </button>
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="spinner" />
          <p>Loading orders...</p>
        </div>
      ) : error ? (
        <div className="error-state">
          <p>⚠️ {error}</p>
          <button
            onClick={fetchOrders}
            style={{
              background: '#3b82f6',
              border: 'none',
              padding: '8px 24px',
              borderRadius: '8px',
              color: '#fff',
              cursor: 'pointer',
            }}
          >
            Retry
          </button>
        </div>
      ) : (
        <>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Shop</th>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Type</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                      No orders found.
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => (
                    <tr key={order.id}>
                      <td className="order-number">#{order.order_number}</td>
                      <td>
                        <div className="shop-name">
                          <FaStore size={14} />
                          {order.shop || 'N/A'}
                        </div>
                      </td>
                      <td>
                        <div className="customer-info">
                          <span className="name">
                            {order.customer?.first_name || order.customer_name || 'Guest'}
                          </span>
                          <span className="phone">{order.customer?.phone || order.customer_phone || ''}</span>
                        </div>
                      </td>
                      <td className="amount">₹{Number(order.total_amount).toFixed(2)}</td>
                      <td>
                        <span className={`status-badge ${getStatusBadge(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td>{order.order_type}</td>
                      <td>{format(new Date(order.ordered_at), 'dd/MM/yy HH:mm')}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="pagination">
            <div className="info">
              Showing {orders.length} of {totalCount} orders
            </div>
            <div className="controls">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <FaChevronLeft /> Previous
              </button>
              <span style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                Page {page} of {totalPages || 1}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages || totalPages === 0}
              >
                Next <FaChevronRight />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SuperAdminOrders;