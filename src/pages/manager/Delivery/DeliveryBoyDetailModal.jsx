// frontend/src/pages/manager/Delivery/DeliveryBoyDetailModal.jsx

import React, { useState, useEffect } from 'react';
import {
  FaTimes, FaUser, FaPhoneAlt, FaStore, FaTruck, FaRoad,
  FaCheckCircle, FaClock, FaMoneyBillWave, FaMapMarkerAlt,
  FaCalendarAlt, FaCalendarDay, FaExchangeAlt, FaTimesCircle,
  FaSearch, FaFilter, FaMotorcycle, FaRupeeSign
} from 'react-icons/fa';
import { getDeliveryBoyHistory } from '../../../service/deliveryService';

const DeliveryBoyDetailModal = ({ boyId, boyName, boyPhone, onClose }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'km' | 'summary'
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    let isMounted = true;
    const fetchHistory = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await getDeliveryBoyHistory(boyId);
        if (isMounted) {
          setData(res);
        }
      } catch (err) {
        console.error('Failed to load delivery boy history:', err);
        if (isMounted) {
          setError(err.response?.data?.detail || err.message || 'Failed to load details');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    if (boyId) {
      fetchHistory();
    }

    return () => {
      isMounted = false;
    };
  }, [boyId]);

  const formatDateTime = (dateStr) => {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    } catch {
      return dateStr;
    }
  };

  const getStatusBadge = (st) => {
    switch (st) {
      case 'delivered':
        return <span className="badge bg-success"><FaCheckCircle className="me-1" /> Delivered</span>;
      case 'out_for_delivery':
        return <span className="badge bg-warning text-dark"><FaTruck className="me-1" /> Out For Delivery</span>;
      case 'picked_up':
        return <span className="badge bg-info text-dark"><FaMotorcycle className="me-1" /> Picked Up</span>;
      case 'accepted':
        return <span className="badge bg-primary">Accepted</span>;
      case 'assigned':
        return <span className="badge bg-secondary">Assigned</span>;
      case 'cancelled':
        return <span className="badge bg-danger"><FaTimesCircle className="me-1" /> Cancelled</span>;
      default:
        return <span className="badge bg-light text-dark">{st}</span>;
    }
  };

  const profile = data?.profile || {};
  const summary = data?.summary || {
    total_orders: 0,
    delivered_orders: 0,
    active_orders: 0,
    cancelled_orders: 0,
    total_distance_km: profile.total_distance_km || 0,
    recorded_trip_km: 0,
    today_distance_km: 0,
    total_cash_collected: 0,
  };
  const orders = data?.orders || [];

  // Filtered orders
  const filteredOrders = orders.filter((ord) => {
    const matchStatus = statusFilter === 'all' || ord.status === statusFilter;
    const query = searchTerm.toLowerCase();
    const matchSearch =
      !searchTerm ||
      (ord.order_number && ord.order_number.toLowerCase().includes(query)) ||
      (ord.customer_name && ord.customer_name.toLowerCase().includes(query)) ||
      (ord.customer_phone && ord.customer_phone.toLowerCase().includes(query)) ||
      (ord.delivery_address && ord.delivery_address.toLowerCase().includes(query));
    return matchStatus && matchSearch;
  });

  return (
    <div className="db-modal-overlay" onClick={onClose}>
      <div className="db-modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="db-modal-header">
          <div className="d-flex align-items-center gap-3">
            <div className="db-header-avatar">
              <FaUser size={22} className="text-warning" />
            </div>
            <div>
              <h5 className="mb-0 fw-bold db-header-name">
                {profile.full_name || boyName || 'Delivery Boy'}
              </h5>
              <div className="d-flex align-items-center gap-2 mt-1 flex-wrap small text-muted">
                <span className="d-flex align-items-center">
                  <FaPhoneAlt size={11} className="me-1 text-primary" />
                  <a href={`tel:${profile.phone || boyPhone}`} className="text-decoration-none text-muted">
                    {profile.phone || boyPhone || '—'}
                  </a>
                </span>
                {profile.shop_name && (
                  <span className="d-flex align-items-center">
                    <FaStore size={11} className="me-1 text-secondary" />
                    {profile.shop_name}
                  </span>
                )}
                <span className={`badge ${profile.is_online ? 'bg-success' : 'bg-secondary'}`}>
                  {profile.is_online ? 'Online' : 'Offline'}
                </span>
                <span className={`badge ${profile.is_available ? 'bg-success' : 'bg-danger'}`}>
                  {profile.is_available ? 'Available' : 'Busy'}
                </span>
              </div>
            </div>
          </div>
          <button className="db-modal-close" onClick={onClose} title="Close">
            <FaTimes size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="db-modal-body">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-warning" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-2 text-muted">Loading delivery details &amp; history...</p>
            </div>
          ) : error ? (
            <div className="alert alert-danger m-3">{error}</div>
          ) : (
            <>
              {/* Stat Metric Cards */}
              <div className="db-metrics-grid">
                <div className="db-metric-card stat-km">
                  <div className="db-metric-icon">
                    <FaRoad size={20} />
                  </div>
                  <div className="db-metric-info">
                    <span className="db-metric-label">Total Distance</span>
                    <h4 className="db-metric-val">{summary.total_distance_km} <small>km</small></h4>
                    <span className="db-metric-sub">Lifetime logged</span>
                  </div>
                </div>

                <div className="db-metric-card stat-today">
                  <div className="db-metric-icon">
                    <FaCalendarDay size={20} />
                  </div>
                  <div className="db-metric-info">
                    <span className="db-metric-label">Today's Distance</span>
                    <h4 className="db-metric-val">{summary.today_distance_km} <small>km</small></h4>
                    <span className="db-metric-sub">Today's deliveries</span>
                  </div>
                </div>

                <div className="db-metric-card stat-orders">
                  <div className="db-metric-icon">
                    <FaTruck size={20} />
                  </div>
                  <div className="db-metric-info">
                    <span className="db-metric-label">Delivered Orders</span>
                    <h4 className="db-metric-val">{summary.delivered_orders}</h4>
                    <span className="db-metric-sub">{summary.total_orders} total assigned</span>
                  </div>
                </div>

                <div className="db-metric-card stat-cash">
                  <div className="db-metric-icon">
                    <FaMoneyBillWave size={20} />
                  </div>
                  <div className="db-metric-info">
                    <span className="db-metric-label">Cash Collected</span>
                    <h4 className="db-metric-val">₹{summary.total_cash_collected}</h4>
                    <span className="db-metric-sub">Delivered orders</span>
                  </div>
                </div>
              </div>

              {/* Sub navigation tabs */}
              <div className="db-tabs-bar">
                <button
                  className={`db-tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
                  onClick={() => setActiveTab('orders')}
                >
                  <FaTruck className="me-1" /> Orders History ({orders.length})
                </button>
                <button
                  className={`db-tab-btn ${activeTab === 'km' ? 'active' : ''}`}
                  onClick={() => setActiveTab('km')}
                >
                  <FaRoad className="me-1" /> KM &amp; Trip Distance History
                </button>
                <button
                  className={`db-tab-btn ${activeTab === 'summary' ? 'active' : ''}`}
                  onClick={() => setActiveTab('summary')}
                >
                  <FaUser className="me-1" /> Profile &amp; Capacity Details
                </button>
              </div>

              {/* TAB: Orders History */}
              {activeTab === 'orders' && (
                <div className="db-tab-pane">
                  {/* Filter Toolbar */}
                  <div className="db-filter-bar">
                    <div className="db-search-box">
                      <FaSearch className="text-muted me-2" />
                      <input
                        type="text"
                        placeholder="Search order #, customer, phone, address..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <div className="db-select-filter">
                      <FaFilter className="text-muted me-2" />
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                      >
                        <option value="all">All Statuses ({orders.length})</option>
                        <option value="delivered">Delivered ({summary.delivered_orders})</option>
                        <option value="out_for_delivery">Out for Delivery</option>
                        <option value="picked_up">Picked Up</option>
                        <option value="assigned">Assigned</option>
                        <option value="cancelled">Cancelled ({summary.cancelled_orders})</option>
                      </select>
                    </div>
                  </div>

                  {/* Desktop Table View */}
                  <div className="d-none d-md-block db-table-container">
                    <table className="table table-hover table-striped align-middle mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>Order #</th>
                          <th>Customer</th>
                          <th>Status</th>
                          <th>Amount</th>
                          <th>Trip KM</th>
                          <th>Delivery Address</th>
                          <th>Assigned / Delivered</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredOrders.length === 0 ? (
                          <tr>
                            <td colSpan="7" className="text-center py-4 text-muted">
                              No orders found matching filters.
                            </td>
                          </tr>
                        ) : (
                          filteredOrders.map((ord) => (
                            <tr key={ord.assignment_id}>
                              <td>
                                <strong className="text-primary">{ord.order_number || `#${ord.order_id}`}</strong>
                              </td>
                              <td>
                                <div className="fw-medium">{ord.customer_name || 'Walk-in / Online'}</div>
                                {ord.customer_phone && (
                                  <small className="text-muted d-block">{ord.customer_phone}</small>
                                )}
                              </td>
                              <td>{getStatusBadge(ord.status)}</td>
                              <td>
                                <div><strong>₹{ord.total_amount}</strong></div>
                                <small className="text-muted text-uppercase">
                                  {ord.payment_mode} • {ord.is_paid ? 'Paid' : 'Unpaid'}
                                </small>
                              </td>
                              <td>
                                <span className="badge bg-light text-dark border">
                                  <FaRoad className="me-1 text-secondary" />
                                  {ord.distance_km > 0 ? `${ord.distance_km} km` : '—'}
                                </span>
                              </td>
                              <td style={{ maxWidth: '200px' }}>
                                <small className="text-truncate d-block" title={ord.delivery_address}>
                                  <FaMapMarkerAlt className="text-danger me-1" size={10} />
                                  {ord.delivery_address || '—'}
                                </small>
                              </td>
                              <td>
                                <small className="text-muted d-block">
                                  <FaClock className="me-1" size={10} />
                                  {formatDateTime(ord.delivered_at || ord.assigned_at)}
                                </small>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Cards View */}
                  <div className="d-md-none db-mobile-orders-list">
                    {filteredOrders.length === 0 ? (
                      <div className="text-center py-4 text-muted">No orders found.</div>
                    ) : (
                      filteredOrders.map((ord) => (
                        <div className="db-order-card" key={ord.assignment_id}>
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <div>
                              <strong className="text-primary">{ord.order_number}</strong>
                              <div className="small text-muted">{ord.customer_name} ({ord.customer_phone || '—'})</div>
                            </div>
                            <div>{getStatusBadge(ord.status)}</div>
                          </div>
                          <div className="small text-muted mb-2">
                            <FaMapMarkerAlt className="text-danger me-1" size={11} />
                            {ord.delivery_address || 'No address provided'}
                          </div>
                          <div className="d-flex justify-content-between align-items-center pt-2 border-top small">
                            <span>
                              <strong>₹{ord.total_amount}</strong> ({ord.payment_mode})
                            </span>
                            <span className="badge bg-light text-dark border">
                              <FaRoad className="me-1" /> {ord.distance_km > 0 ? `${ord.distance_km} km` : '—'}
                            </span>
                            <span className="text-muted">
                              {formatDateTime(ord.delivered_at || ord.assigned_at)}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* TAB: KM & Distance History */}
              {activeTab === 'km' && (
                <div className="db-tab-pane">
                  <div className="row g-3 mb-4">
                    <div className="col-sm-4">
                      <div className="p-3 bg-light rounded border text-center">
                        <div className="text-muted small">Total Profile Distance</div>
                        <h4 className="fw-bold my-1 text-primary">{summary.total_distance_km} km</h4>
                        <small className="text-muted">Accumulated recorded</small>
                      </div>
                    </div>
                    <div className="col-sm-4">
                      <div className="p-3 bg-light rounded border text-center">
                        <div className="text-muted small">Today's Distance</div>
                        <h4 className="fw-bold my-1 text-success">{summary.today_distance_km} km</h4>
                        <small className="text-muted">Completed today</small>
                      </div>
                    </div>
                    <div className="col-sm-4">
                      <div className="p-3 bg-light rounded border text-center">
                        <div className="text-muted small">Total Orders Logged</div>
                        <h4 className="fw-bold my-1 text-dark">{orders.length}</h4>
                        <small className="text-muted">Deliveries in history</small>
                      </div>
                    </div>
                  </div>

                  <h6 className="fw-bold mb-3 d-flex align-items-center">
                    <FaRoad className="me-2 text-warning" /> Trip-by-Trip Distance Breakdown
                  </h6>

                  <div className="db-table-container">
                    <table className="table table-hover table-striped align-middle mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>Trip Date &amp; Time</th>
                          <th>Order #</th>
                          <th>Customer &amp; Destination</th>
                          <th>Trip Distance (KM)</th>
                          <th>Delivery Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.length === 0 ? (
                          <tr>
                            <td colSpan="5" className="text-center py-4 text-muted">
                              No delivery trips logged yet.
                            </td>
                          </tr>
                        ) : (
                          orders.map((ord) => (
                            <tr key={ord.assignment_id}>
                              <td>
                                <div className="fw-medium">{formatDateTime(ord.assigned_at)}</div>
                                {ord.delivered_at && (
                                  <small className="text-success d-block">
                                    Delivered: {formatDateTime(ord.delivered_at)}
                                  </small>
                                )}
                              </td>
                              <td>
                                <strong className="text-primary">{ord.order_number}</strong>
                              </td>
                              <td>
                                <div className="fw-medium">{ord.customer_name}</div>
                                <small className="text-muted d-block text-truncate" style={{ maxWidth: '240px' }}>
                                  {ord.delivery_address || '—'}
                                </small>
                              </td>
                              <td>
                                <span className="fw-bold text-dark fs-6">
                                  {ord.distance_km > 0 ? `${ord.distance_km} km` : '0.00 km'}
                                </span>
                              </td>
                              <td>{getStatusBadge(ord.status)}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB: Profile Details */}
              {activeTab === 'summary' && (
                <div className="db-tab-pane">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <div className="card h-100 border p-3">
                        <h6 className="fw-bold mb-3 border-bottom pb-2">
                          <FaUser className="me-2 text-warning" /> Personal &amp; Account Details
                        </h6>
                        <div className="mb-2 d-flex justify-content-between">
                          <span className="text-muted">Full Name:</span>
                          <strong>{profile.full_name || '—'}</strong>
                        </div>
                        <div className="mb-2 d-flex justify-content-between">
                          <span className="text-muted">Phone Number:</span>
                          <strong className="text-primary">{profile.phone || '—'}</strong>
                        </div>
                        <div className="mb-2 d-flex justify-content-between">
                          <span className="text-muted">Assigned Shop:</span>
                          <strong>{profile.shop_name || '—'}</strong>
                        </div>
                        <div className="mb-2 d-flex justify-content-between">
                          <span className="text-muted">Account Registered:</span>
                          <span>{formatDateTime(profile.created_at)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="card h-100 border p-3">
                        <h6 className="fw-bold mb-3 border-bottom pb-2">
                          <FaTruck className="me-2 text-warning" /> Delivery &amp; Realtime Metrics
                        </h6>
                        <div className="mb-2 d-flex justify-content-between">
                          <span className="text-muted">Online Status:</span>
                          <span className={`badge ${profile.is_online ? 'bg-success' : 'bg-secondary'}`}>
                            {profile.is_online ? 'Online' : 'Offline'}
                          </span>
                        </div>
                        <div className="mb-2 d-flex justify-content-between">
                          <span className="text-muted">Availability:</span>
                          <span className={`badge ${profile.is_available ? 'bg-success' : 'bg-danger'}`}>
                            {profile.is_available ? 'Available' : 'Busy'}
                          </span>
                        </div>
                        <div className="mb-2 d-flex justify-content-between">
                          <span className="text-muted">Max Concurrent Orders:</span>
                          <strong>{profile.max_active_orders || 3}</strong>
                        </div>
                        <div className="mb-2 d-flex justify-content-between">
                          <span className="text-muted">Current Active Orders:</span>
                          <strong>{profile.active_order_count || 0}</strong>
                        </div>
                        <div className="mb-2 d-flex justify-content-between">
                          <span className="text-muted">Total Lifetime Deliveries:</span>
                          <strong className="text-success">{profile.total_deliveries || summary.delivered_orders}</strong>
                        </div>
                        <div className="mb-2 d-flex justify-content-between">
                          <span className="text-muted">Total Lifetime KM:</span>
                          <strong className="text-primary">{summary.total_distance_km} km</strong>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="db-modal-footer">
          <button className="btn btn-secondary px-4" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeliveryBoyDetailModal;
