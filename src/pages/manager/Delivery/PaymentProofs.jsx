// src/pages/manager/Delivery/PaymentProofs.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Image as ImageIcon,
  CheckCircle2,
  XCircle,
  QrCode,
  Eye,
  Search,
  RefreshCw,
  LayoutGrid,
  List,
  Phone,
  Clock,
  ExternalLink,
  X,
  CreditCard,
  Banknote,
  DollarSign,
  AlertCircle,
  FileCheck,
} from 'lucide-react';
import Swal from 'sweetalert2';
import toast from 'react-hot-toast';
import { getAssignmentsWithProofs } from '../../../service/deliveryService';
import './PaymentProofs.css';

const PaymentProofs = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all'); // 'all' | 'paid' | 'unpaid' | 'upi' | 'cash' | 'proof'
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'grid'
  const [previewData, setPreviewData] = useState(null); // { url, assignment }

  const loadAssignments = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);

    try {
      const params = {};
      if (filter === 'paid') params.is_paid = 'true';
      if (filter === 'unpaid') params.is_paid = 'false';
      if (filter === 'upi') params.payment_mode = 'upi';
      if (filter === 'cash') params.payment_mode = 'cash';

      const data = await getAssignmentsWithProofs(params);
      const sorted = (Array.isArray(data) ? data : []).sort(
        (a, b) => new Date(b.assigned_at || 0) - new Date(a.assigned_at || 0)
      );
      setAssignments(sorted);
      if (isManual) toast.success('Delivery payment proofs refreshed');
    } catch (err) {
      console.error(err);
      toast.error('Failed to load payment proofs');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filter]);

  useEffect(() => {
    loadAssignments();
  }, [loadAssignments]);

  // Overall counts regardless of active filter
  const stats = useMemo(() => {
    const total = assignments.length;
    const paidCount = assignments.filter((a) => a.is_paid).length;
    const upiCount = assignments.filter((a) => a.payment_mode === 'upi' && a.is_paid).length;
    const proofCount = assignments.filter((a) => !!a.payment_proof).length;
    return { total, paidCount, upiCount, proofCount };
  }, [assignments]);

  // Filtered by Search & Local 'proof' filter
  const filteredAssignments = useMemo(() => {
    return assignments.filter((a) => {
      const q = search.toLowerCase().trim();
      const matchesSearch =
        !q ||
        a.order_number?.toLowerCase().includes(q) ||
        String(a.order || '').toLowerCase().includes(q) ||
        a.delivery_boy_name?.toLowerCase().includes(q) ||
        a.delivery_boy_phone?.includes(q) ||
        a.shop_name?.toLowerCase().includes(q);

      const matchesProofOnly = filter !== 'proof' || !!a.payment_proof;

      return matchesSearch && matchesProofOnly;
    });
  }, [assignments, search, filter]);

  const openPreview = (assignment) => {
    setPreviewData({
      url: assignment.payment_proof,
      assignment,
    });
  };

  const closePreview = () => setPreviewData(null);

  // Status Badge Helper
  const renderStatusBadge = (a) => {
    if (a.is_paid) {
      const isUpi = a.payment_mode === 'upi';
      return (
        <span className={`pp-badge ${isUpi ? 'paid-upi' : 'paid-cash'}`}>
          <CheckCircle2 size={13} />
          <span>Paid ({a.payment_mode ? a.payment_mode.toUpperCase() : 'PAID'})</span>
        </span>
      );
    }
    return (
      <span className="pp-badge unpaid">
        <XCircle size={13} />
        <span>Unpaid</span>
      </span>
    );
  };

  return (
    <div className="pp-container">
      {/* KPI Metric Stat Cards */}
      <motion.div
        className="pp-stats-grid"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: { staggerChildren: 0.05 },
          },
        }}
      >
        {/* Total Deliveries */}
        <motion.div
          className={`pp-stat-card ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
          variants={{
            hidden: { opacity: 0, y: 15 },
            visible: { opacity: 1, y: 0 },
          }}
          whileHover={{ y: -3 }}
          title="Click to view all deliveries"
        >
          <div className="pp-stat-icon total">
            <ImageIcon size={22} />
          </div>
          <div className="pp-stat-content">
            <h4>{stats.total}</h4>
            <span>Total Deliveries</span>
          </div>
        </motion.div>

        {/* Paid */}
        <motion.div
          className={`pp-stat-card ${filter === 'paid' ? 'active' : ''}`}
          onClick={() => setFilter(filter === 'paid' ? 'all' : 'paid')}
          variants={{
            hidden: { opacity: 0, y: 15 },
            visible: { opacity: 1, y: 0 },
          }}
          whileHover={{ y: -3 }}
          title="Click to filter paid orders"
        >
          <div className="pp-stat-icon paid">
            <CheckCircle2 size={22} />
          </div>
          <div className="pp-stat-content">
            <h4>{stats.paidCount}</h4>
            <span>Paid</span>
          </div>
        </motion.div>

        {/* UPI Payments */}
        <motion.div
          className={`pp-stat-card ${filter === 'upi' ? 'active' : ''}`}
          onClick={() => setFilter(filter === 'upi' ? 'all' : 'upi')}
          variants={{
            hidden: { opacity: 0, y: 15 },
            visible: { opacity: 1, y: 0 },
          }}
          whileHover={{ y: -3 }}
          title="Click to filter UPI payments"
        >
          <div className="pp-stat-icon upi">
            <QrCode size={22} />
          </div>
          <div className="pp-stat-content">
            <h4>{stats.upiCount}</h4>
            <span>UPI Payments</span>
          </div>
        </motion.div>

        {/* With Proof */}
        <motion.div
          className={`pp-stat-card ${filter === 'proof' ? 'active' : ''}`}
          onClick={() => setFilter(filter === 'proof' ? 'all' : 'proof')}
          variants={{
            hidden: { opacity: 0, y: 15 },
            visible: { opacity: 1, y: 0 },
          }}
          whileHover={{ y: -3 }}
          title="Click to filter orders with photo proof"
        >
          <div className="pp-stat-icon proof">
            <Eye size={22} />
          </div>
          <div className="pp-stat-content">
            <h4>{stats.proofCount}</h4>
            <span>With Proof</span>
          </div>
        </motion.div>
      </motion.div>

      {/* Controls Bar: Search, Filters, Switcher, Refresh */}
      <div className="pp-controls-card">
        {/* Search */}
        <div className="pp-search-box">
          <Search size={16} className="pp-search-icon" />
          <input
            type="text"
            className="pp-search-input"
            placeholder="Search order #, driver, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button className="pp-search-clear" onClick={() => setSearch('')} title="Clear">
              <X size={14} />
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="pp-pills-bar">
          {[
            { key: 'all', label: 'All' },
            { key: 'paid', label: '✅ Paid' },
            { key: 'unpaid', label: '❌ Unpaid' },
            { key: 'upi', label: '📱 UPI' },
            { key: 'cash', label: '💵 Cash' },
            { key: 'proof', label: '📷 With Proof' },
          ].map(({ key, label }) => (
            <button
              key={key}
              type="button"
              className={`pp-pill ${filter === key ? 'active' : ''}`}
              onClick={() => setFilter(key)}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Right Actions: View Switcher & Refresh */}
        <div className="pp-right-actions">
          <div className="pp-view-switcher">
            <button
              type="button"
              className={`pp-view-btn ${viewMode === 'table' ? 'active' : ''}`}
              onClick={() => setViewMode('table')}
              title="Table View"
            >
              <List size={16} />
            </button>
            <button
              type="button"
              className={`pp-view-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              title="Cards View"
            >
              <LayoutGrid size={16} />
            </button>
          </div>

          <button
            type="button"
            className="pp-refresh-btn"
            onClick={() => loadAssignments(true)}
            disabled={refreshing || loading}
          >
            <RefreshCw size={14} className={refreshing ? 'spinner-border spinner-border-sm' : ''} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Content Rendering */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-warning" style={{ width: '2.75rem', height: '2.75rem' }} />
          <p className="mt-3 text-muted fw-semibold">Loading delivery payment records...</p>
        </div>
      ) : filteredAssignments.length === 0 ? (
        <div className="card border-0 shadow-sm rounded-4 text-center py-5 px-3">
          <ImageIcon size={48} className="text-muted mx-auto mb-3 opacity-30" />
          <h5 className="fw-bold text-dark">No Delivery Records Found</h5>
          <p className="text-muted mb-3">
            {search || filter !== 'all'
              ? 'No deliveries matched your filter criteria.'
              : 'Delivery assignments and payment proofs will appear here once orders are dispatched.'}
          </p>
          {(search || filter !== 'all') && (
            <button
              type="button"
              className="btn btn-outline-warning btn-sm mx-auto fw-bold"
              onClick={() => {
                setSearch('');
                setFilter('all');
              }}
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Desktop & Tablet Table (Displayed in table mode or >= 992px) */}
          <div className={viewMode === 'table' ? 'd-none d-md-block' : 'd-none'}>
            <div className="pp-table-card table-responsive">
              <table className="pp-table">
                <thead>
                  <tr>
                    <th style={{ width: '45px' }}>#</th>
                    <th>Order</th>
                    <th>Delivery Boy</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Payment Proof</th>
                    <th>Collected At</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAssignments.map((a, idx) => (
                    <tr key={a.id}>
                      <td className="text-muted small fw-bold">{idx + 1}</td>
                      <td>
                        <div className="pp-order-num">
                          {a.order_number || `Order #${a.order}`}
                        </div>
                        {a.shop_name && <span className="pp-shop-tag">{a.shop_name}</span>}
                      </td>
                      <td>
                        <div className="pp-driver-wrap">
                          <div className="pp-driver-avatar">
                            {(a.delivery_boy_name || 'DB')
                              .split(' ')
                              .map((n) => n[0])
                              .join('')
                              .substring(0, 2)
                              .toUpperCase()}
                          </div>
                          <div>
                            <div className="fw-bold text-dark line-clamp-1">
                              {a.delivery_boy_name || `Boy #${a.delivery_boy}`}
                            </div>
                            {a.delivery_boy_phone ? (
                              <a
                                href={`tel:${a.delivery_boy_phone}`}
                                className="pp-driver-phone"
                                title="Call Driver"
                              >
                                <Phone size={10} />
                                {a.delivery_boy_phone}
                              </a>
                            ) : (
                              <span className="text-muted small">—</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>
                        {a.collected_amount ? (
                          <span className="fw-bold text-success fs-6">
                            ₹{a.collected_amount}
                          </span>
                        ) : (
                          <span className="text-muted small">—</span>
                        )}
                      </td>
                      <td>{renderStatusBadge(a)}</td>
                      <td>
                        {a.payment_proof ? (
                          <button
                            type="button"
                            className="pp-view-proof-btn"
                            onClick={() => openPreview(a)}
                            title="View screenshot proof"
                          >
                            <img
                              src={a.payment_proof}
                              alt="thumb"
                              className="pp-mini-thumb"
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                            />
                            <Eye size={13} />
                            <span>View Proof</span>
                          </button>
                        ) : a.payment_mode === 'cash' ? (
                          <span className="pp-cash-chip">
                            <Banknote size={12} className="text-success" />
                            Cash (no photo)
                          </span>
                        ) : (
                          <span className="pp-no-proof-chip">No proof yet</span>
                        )}
                      </td>
                      <td>
                        {a.payment_collected_at ? (
                          <div className="text-muted small d-flex align-items-center gap-1">
                            <Clock size={12} className="opacity-75" />
                            {new Date(a.payment_collected_at).toLocaleString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                              hour12: true,
                            })}
                          </div>
                        ) : (
                          <span className="text-muted small">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Cards Grid (Mobile or when Grid View selected on tablet/desktop) */}
          <div className={viewMode === 'grid' ? 'd-block' : 'd-md-none'}>
            <motion.div
              className="pp-cards-grid"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: { staggerChildren: 0.04 },
                },
              }}
            >
              {filteredAssignments.map((a) => (
                <motion.div
                  key={a.id}
                  className="pp-card"
                  variants={{
                    hidden: { opacity: 0, y: 15 },
                    visible: { opacity: 1, y: 0 },
                  }}
                >
                  {/* Card Header */}
                  <div className="pp-card-header">
                    <div>
                      <div className="pp-order-num">
                        {a.order_number || `Order #${a.order}`}
                      </div>
                      {a.shop_name && <span className="pp-shop-tag">{a.shop_name}</span>}
                    </div>
                    <div>{renderStatusBadge(a)}</div>
                  </div>

                  {/* Driver Row */}
                  <div className="pp-card-driver-row">
                    <div className="pp-driver-wrap">
                      <div className="pp-driver-avatar">
                        {(a.delivery_boy_name || 'DB')
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .substring(0, 2)
                          .toUpperCase()}
                      </div>
                      <div>
                        <div className="fw-bold text-dark fs-6">
                          {a.delivery_boy_name || `Boy #${a.delivery_boy}`}
                        </div>
                        {a.delivery_boy_phone && (
                          <a
                            href={`tel:${a.delivery_boy_phone}`}
                            className="pp-driver-phone"
                          >
                            <Phone size={10} />
                            {a.delivery_boy_phone}
                          </a>
                        )}
                      </div>
                    </div>
                    {a.delivery_boy_phone && (
                      <a
                        href={`tel:${a.delivery_boy_phone}`}
                        className="btn btn-sm btn-outline-primary rounded-pill px-2 py-1 d-flex align-items-center gap-1"
                        title="Call Delivery Boy"
                      >
                        <Phone size={12} /> Call
                      </a>
                    )}
                  </div>

                  {/* Amount & Payment Mode */}
                  <div className="pp-card-amount-row">
                    <div className="d-flex flex-column">
                      <small className="text-muted" style={{ fontSize: '0.72rem' }}>
                        COLLECTED AMOUNT
                      </small>
                      <span className="fw-bold text-success fs-5">
                        {a.collected_amount ? `₹${a.collected_amount}` : '—'}
                      </span>
                    </div>
                    <div>
                      {a.payment_mode === 'cash' ? (
                        <span className="pp-cash-chip">
                          <Banknote size={12} className="text-success" />
                          Cash Payment
                        </span>
                      ) : (
                        <span className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 px-2 py-1">
                          <QrCode size={12} className="me-1" />
                          UPI Payment
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Proof Action or Notice */}
                  {a.payment_proof ? (
                    <button
                      type="button"
                      className="btn btn-outline-success w-100 d-flex align-items-center justify-content-center gap-2 py-2 fw-bold"
                      onClick={() => openPreview(a)}
                    >
                      <Eye size={15} />
                      <span>View Payment Screenshot Proof</span>
                    </button>
                  ) : (
                    <div className="text-muted small text-center py-1">
                      {a.payment_mode === 'cash'
                        ? '💵 Cash payment — no photo proof needed'
                        : '📷 No screenshot proof uploaded yet'}
                    </div>
                  )}

                  {/* Timestamp Footer */}
                  {a.payment_collected_at && (
                    <div className="pp-card-footer text-muted small">
                      <span className="d-flex align-items-center gap-1">
                        <Clock size={12} />
                        Collected:
                      </span>
                      <span className="fw-semibold">
                        {new Date(a.payment_collected_at).toLocaleString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: true,
                        })}
                      </span>
                    </div>
                  )}
                </motion.div>
              ))}
            </motion.div>
          </div>
        </>
      )}

      {/* Spring Animated Lightbox Modal */}
      <AnimatePresence>
        {previewData && (
          <motion.div
            className="pp-lightbox-backdrop"
            onClick={closePreview}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="pp-lightbox-dialog"
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            >
              {/* Header */}
              <div className="pp-lightbox-header">
                <div>
                  <h6 className="fw-bold mb-0 text-dark d-flex align-items-center gap-2">
                    <FileCheck size={18} className="text-success" />
                    Payment Proof •{' '}
                    {previewData.assignment?.order_number ||
                      `Order #${previewData.assignment?.order}`}
                  </h6>
                  <small className="text-muted">
                    Driver: {previewData.assignment?.delivery_boy_name || 'Assigned Driver'}
                    {previewData.assignment?.collected_amount
                      ? ` · ₹${previewData.assignment.collected_amount}`
                      : ''}
                  </small>
                </div>
                <button
                  type="button"
                  className="btn-close"
                  onClick={closePreview}
                  aria-label="Close"
                />
              </div>

              {/* Photo Canvas */}
              <div className="pp-lightbox-body">
                <img
                  src={previewData.url}
                  alt="Proof Document"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src =
                      'https://placehold.co/500x350/1e293b/ffffff?text=Proof+Image+Not+Found';
                  }}
                />
              </div>

              {/* Footer */}
              <div className="pp-lightbox-footer">
                <div className="text-muted small">
                  {previewData.assignment?.payment_collected_at && (
                    <span>
                      Collected:{' '}
                      {new Date(
                        previewData.assignment.payment_collected_at
                      ).toLocaleString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true,
                      })}
                    </span>
                  )}
                </div>
                <div className="d-flex align-items-center gap-2">
                  <a
                    href={previewData.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline-primary btn-sm d-flex align-items-center gap-1 fw-bold"
                  >
                    <ExternalLink size={14} /> Open Full Size
                  </a>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm fw-bold"
                    onClick={closePreview}
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PaymentProofs;
