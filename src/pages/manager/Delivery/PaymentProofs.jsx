// src/pages/manager/Delivery/PaymentProofs.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { FaImage, FaCheckCircle, FaTimesCircle, FaRupeeSign, FaFilter, FaSyncAlt, FaEye } from 'react-icons/fa';
import { MdQrCodeScanner } from 'react-icons/md';
import Swal from 'sweetalert2';
import { getAssignmentsWithProofs } from '../../../service/deliveryService';
import { API } from '../../../service/api';

const PaymentProofs = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all' | 'paid' | 'unpaid' | 'upi' | 'cash'
  const [previewUrl, setPreviewUrl] = useState(null);

  const loadAssignments = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filter === 'paid') params.is_paid = 'true';
      if (filter === 'unpaid') params.is_paid = 'false';
      if (filter === 'upi') params.payment_mode = 'upi';
      if (filter === 'cash') params.payment_mode = 'cash';
      const data = await getAssignmentsWithProofs(params);
      // Sort: newest first
      const sorted = (Array.isArray(data) ? data : []).sort(
        (a, b) => new Date(b.assigned_at) - new Date(a.assigned_at)
      );
      setAssignments(sorted);
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'Failed to load payment proofs', 'error');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    loadAssignments();
  }, [loadAssignments]);

  const openPreview = (url) => setPreviewUrl(url);
  const closePreview = () => setPreviewUrl(null);

  const getStatusBadge = (a) => {
    if (a.is_paid) {
      return (
        <span className="badge bg-success d-flex align-items-center gap-1" style={{ fontSize: '0.75rem' }}>
          <FaCheckCircle /> Paid ({a.payment_mode?.toUpperCase() || 'UPI'})
        </span>
      );
    }
    return (
      <span className="badge bg-danger d-flex align-items-center gap-1" style={{ fontSize: '0.75rem' }}>
        <FaTimesCircle /> Unpaid
      </span>
    );
  };

  // stats
  const total = assignments.length;
  const paidCount = assignments.filter(a => a.is_paid).length;
  const upiCount = assignments.filter(a => a.payment_mode === 'upi' && a.is_paid).length;
  const proofCount = assignments.filter(a => a.payment_proof).length;

  return (
    <div className="payment-proofs-page">
      {/* Stat Cards */}
      <div className="row g-3 mb-4">
        {[
          { label: 'Total Deliveries', value: total, icon: <FaImage />, color: '#6c757d' },
          { label: 'Paid', value: paidCount, icon: <FaCheckCircle />, color: '#198754' },
          { label: 'UPI Payments', value: upiCount, icon: <MdQrCodeScanner size={18} />, color: '#0d6efd' },
          { label: 'With Proof', value: proofCount, icon: <FaEye />, color: '#fd7e14' },
        ].map(({ label, value, icon, color }) => (
          <div className="col-6 col-md-3" key={label}>
            <div className="card border-0 shadow-sm h-100" style={{ borderLeft: `4px solid ${color}` }}>
              <div className="card-body py-3">
                <div className="d-flex align-items-center gap-2 mb-1" style={{ color }}>
                  {icon}
                  <small className="text-muted fw-semibold">{label}</small>
                </div>
                <h4 className="mb-0 fw-bold" style={{ color }}>{value}</h4>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
        <div className="d-flex align-items-center gap-2 flex-wrap">
          <FaFilter className="text-muted" />
          {[
            { key: 'all', label: 'All' },
            { key: 'paid', label: '✅ Paid' },
            { key: 'unpaid', label: '❌ Unpaid' },
            { key: 'upi', label: '📱 UPI' },
            { key: 'cash', label: '💵 Cash' },
          ].map(({ key, label }) => (
            <button
              key={key}
              className={`btn btn-sm ${filter === key ? 'btn-warning' : 'btn-outline-secondary'}`}
              onClick={() => setFilter(key)}
            >
              {label}
            </button>
          ))}
        </div>
        <button className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1" onClick={loadAssignments}>
          <FaSyncAlt /> Refresh
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-warning" role="status" />
        </div>
      ) : assignments.length === 0 ? (
        <div className="text-center py-5 text-muted">
          <FaImage size={40} className="mb-3 opacity-25" />
          <p className="mb-0">No assignments found for this filter.</p>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="d-none d-lg-block">
            <div className="table-responsive rounded shadow-sm">
              <table className="table table-hover table-bordered align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>#</th>
                    <th>Order</th>
                    <th>Delivery Boy</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Payment Proof</th>
                    <th>Collected At</th>
                  </tr>
                </thead>
                <tbody>
                  {assignments.map((a) => (
                    <tr key={a.id}>
                      <td className="text-muted small">{a.id}</td>
                      <td>
                        <strong>{a.order_number || `Order #${a.order}`}</strong>
                        {a.shop_name && <div className="small text-muted">{a.shop_name}</div>}
                      </td>
                      <td>
                        <div>{a.delivery_boy_name || `Boy #${a.delivery_boy}`}</div>
                        {a.delivery_boy_phone && (
                          <small className="text-muted">{a.delivery_boy_phone}</small>
                        )}
                      </td>
                      <td>
                        {a.collected_amount ? (
                          <span className="fw-bold text-success">
                            <FaRupeeSign size={12} />
                            {a.collected_amount}
                          </span>
                        ) : (
                          <span className="text-muted small">—</span>
                        )}
                      </td>
                      <td>{getStatusBadge(a)}</td>
                      <td>
                        {a.payment_proof ? (
                          <button
                            className="btn btn-sm btn-outline-success d-flex align-items-center gap-1"
                            onClick={() => openPreview(a.payment_proof)}
                            title="View payment proof"
                          >
                            <FaEye /> View Proof
                          </button>
                        ) : (
                          <span className="text-muted small">
                            {a.payment_mode === 'cash' ? '💵 Cash (no photo)' : 'No proof yet'}
                          </span>
                        )}
                      </td>
                      <td className="small text-muted">
                        {a.payment_collected_at
                          ? new Date(a.payment_collected_at).toLocaleString('en-IN', {
                              day: '2-digit', month: 'short', year: 'numeric',
                              hour: '2-digit', minute: '2-digit',
                            })
                          : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Cards */}
          <div className="d-lg-none">
            {assignments.map((a) => (
              <div key={a.id} className="card shadow-sm mb-3">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <strong>{a.order_number || `Order #${a.order}`}</strong>
                    {getStatusBadge(a)}
                  </div>
                  <div className="small text-muted mb-1">
                    🚴 {a.delivery_boy_name || `Boy #${a.delivery_boy}`}
                    {a.delivery_boy_phone ? ` — ${a.delivery_boy_phone}` : ''}
                  </div>
                  {a.collected_amount && (
                    <div className="fw-bold text-success mb-2">
                      <FaRupeeSign size={11} />{a.collected_amount}
                    </div>
                  )}
                  {a.payment_proof ? (
                    <button
                      className="btn btn-sm btn-outline-success w-100"
                      onClick={() => openPreview(a.payment_proof)}
                    >
                      <FaEye className="me-1" /> View Payment Proof
                    </button>
                  ) : (
                    <p className="text-muted small mb-0">
                      {a.payment_mode === 'cash' ? '💵 Cash — no photo required' : '📷 No proof uploaded yet'}
                    </p>
                  )}
                  {a.payment_collected_at && (
                    <p className="text-muted small mt-2 mb-0">
                      Collected: {new Date(a.payment_collected_at).toLocaleString('en-IN', {
                        day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
                      })}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Lightbox Preview Modal */}
      {previewUrl && (
        <div
          onClick={closePreview}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)',
            zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '20px',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#fff', borderRadius: '12px', padding: '16px',
              maxWidth: '500px', width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
            }}
          >
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="mb-0 fw-bold">
                <FaEye className="me-2 text-success" />Payment Proof
              </h6>
              <button className="btn-close" onClick={closePreview} />
            </div>
            <img
              src={previewUrl}
              alt="Payment proof"
              style={{ width: '100%', borderRadius: '8px', objectFit: 'contain', maxHeight: '60vh' }}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://via.placeholder.com/400x300?text=Image+Not+Found';
              }}
            />
            <div className="mt-3 text-center">
              <a
                href={previewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline-primary btn-sm"
              >
                Open Full Size
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentProofs;
