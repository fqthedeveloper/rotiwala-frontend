// src/pages/admin/TestimonialManagement.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  getAdminReviews,
  updateReview,
  deleteReview,
} from '../../service/videoApi';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import {
  Star,
  Quote,
  CheckCircle2,
  Clock,
  Trash2,
  Search,
  RefreshCw,
  LayoutGrid,
  List,
  User,
  Check,
  X,
  Sparkles,
  SlidersHorizontal,
  ArrowUpDown
} from 'lucide-react';
import './ContentManagement.css';

const TestimonialManagement = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // 'all' | 'pending' | 'approved' | '5stars' | 'lowstars'
  const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'rating_high' | 'rating_low'
  const [viewMode, setViewMode] = useState(() => (window.innerWidth < 768 ? 'cards' : 'cards'));

  // Edit / Details Modal
  const [selectedReview, setSelectedReview] = useState(null);
  const [savingApproval, setSavingApproval] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getAdminReviews();
      const data = res.data || [];
      setReviews(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error('Failed to load customer reviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Stats
  const stats = useMemo(() => {
    const total = reviews.length;
    const approved = reviews.filter((r) => r.is_approved).length;
    const pending = total - approved;
    const avgRating =
      total > 0
        ? (reviews.reduce((acc, r) => acc + (Number(r.rating) || 5), 0) / total).toFixed(1)
        : '5.0';
    return { total, approved, pending, avgRating };
  }, [reviews]);

  // Filter & Sort
  const filteredReviews = useMemo(() => {
    let result = [...reviews];

    if (filterStatus === 'pending') {
      result = result.filter((r) => !r.is_approved);
    } else if (filterStatus === 'approved') {
      result = result.filter((r) => r.is_approved);
    } else if (filterStatus === '5stars') {
      result = result.filter((r) => Number(r.rating) === 5);
    } else if (filterStatus === 'lowstars') {
      result = result.filter((r) => Number(r.rating) < 4);
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (r) =>
          (r.customer_name || r.customer || '').toLowerCase().includes(term) ||
          (r.role || '').toLowerCase().includes(term) ||
          (r.text || '').toLowerCase().includes(term)
      );
    }

    if (sortBy === 'rating_high') {
      result.sort((a, b) => (Number(b.rating) || 0) - (Number(a.rating) || 0));
    } else if (sortBy === 'rating_low') {
      result.sort((a, b) => (Number(a.rating) || 0) - (Number(b.rating) || 0));
    } else {
      result.sort((a, b) => (b.id || 0) - (a.id || 0));
    }

    return result;
  }, [reviews, filterStatus, searchTerm, sortBy]);

  // Fast 1-click Approval Toggle
  const toggleApproval = async (id, currentStatus) => {
    try {
      setReviews((prev) =>
        prev.map((r) => (r.id === id ? { ...r, is_approved: !currentStatus } : r))
      );
      await updateReview(id, { is_approved: !currentStatus });
      toast.success(!currentStatus ? 'Review approved & live on website!' : 'Review unapproved');
      if (selectedReview?.id === id) {
        setSelectedReview((prev) => ({ ...prev, is_approved: !currentStatus }));
      }
    } catch {
      toast.error('Failed to update review approval');
      fetchData();
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Delete Customer Review?',
      text: 'This review will be permanently deleted.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, Delete',
    });
    if (result.isConfirmed) {
      try {
        await deleteReview(id);
        toast.success('Review deleted');
        if (selectedReview?.id === id) setSelectedReview(null);
        fetchData();
      } catch (error) {
        toast.error('Delete failed');
      }
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="cnt-container">
      {/* Header */}
      <div className="cnt-header">
        <div className="cnt-title-row">
          <div>
            <h1 className="cnt-title">
              <Star className="text-warning fill-warning" size={30} />
              Customer Reviews &amp; Testimonials
            </h1>
            <p className="cnt-subtitle">
              Moderate and approve customer feedback to feature authentic testimonials on your home page.
            </p>
          </div>
          <div className="d-flex align-items-center gap-2 flex-wrap">
            <button className="cnt-btn cnt-btn-outline" onClick={fetchData} disabled={loading}>
              <RefreshCw size={16} className={loading ? 'spin' : ''} /> Refresh Reviews
            </button>
          </div>
        </div>

        {/* KPI Stats */}
        <div className="cnt-stats-grid">
          <div className="cnt-stat-card" onClick={() => setFilterStatus('all')}>
            <div className="cnt-stat-icon total">
              <Quote size={22} />
            </div>
            <div className="cnt-stat-content">
              <h4>{stats.total}</h4>
              <p>Total Reviews</p>
            </div>
          </div>

          <div className="cnt-stat-card" onClick={() => setFilterStatus('approved')}>
            <div className="cnt-stat-icon success">
              <CheckCircle2 size={22} />
            </div>
            <div className="cnt-stat-content">
              <h4>{stats.approved}</h4>
              <p>Live on Website</p>
            </div>
          </div>

          <div className="cnt-stat-card" onClick={() => setFilterStatus('pending')}>
            <div className="cnt-stat-icon warning">
              <Clock size={22} />
            </div>
            <div className="cnt-stat-content">
              <h4>{stats.pending}</h4>
              <p>Pending Approval</p>
            </div>
          </div>

          <div className="cnt-stat-card" onClick={() => setFilterStatus('5stars')}>
            <div className="cnt-stat-icon total" style={{ background: '#fffbeb', color: '#d97706' }}>
              <Star size={22} className="fill-warning" />
            </div>
            <div className="cnt-stat-content">
              <h4>{stats.avgRating} / 5.0</h4>
              <p>Average Rating</p>
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar & Filters */}
      <div className="cnt-toolbar">
        <div className="cnt-search-row">
          <div className="cnt-search-box">
            <Search size={18} className="cnt-search-icon" />
            <input
              type="text"
              placeholder="Search by customer name, role, review text..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button className="cnt-search-clear" onClick={() => setSearchTerm('')}>
                <X size={16} />
              </button>
            )}
          </div>

          <div className="d-flex align-items-center gap-2 flex-wrap">
            <div className="cnt-view-toggle">
              <button
                className={`cnt-view-btn ${viewMode === 'cards' ? 'active' : ''}`}
                onClick={() => setViewMode('cards')}
              >
                <LayoutGrid size={16} /> Grid
              </button>
              <button
                className={`cnt-view-btn ${viewMode === 'table' ? 'active' : ''}`}
                onClick={() => setViewMode('table')}
              >
                <List size={16} /> Table
              </button>
            </div>

            <div className="d-flex align-items-center gap-1">
              <ArrowUpDown size={16} className="text-muted" />
              <select
                className="cm-sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="newest">Sort: Newest</option>
                <option value="rating_high">Highest Rating (5★)</option>
                <option value="rating_low">Lowest Rating (1★)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="cnt-filter-row">
          <div className="cnt-pills">
            <button
              className={`cnt-pill ${filterStatus === 'all' ? 'active' : ''}`}
              onClick={() => setFilterStatus('all')}
            >
              All ({reviews.length})
            </button>
            <button
              className={`cnt-pill ${filterStatus === 'pending' ? 'active' : ''}`}
              onClick={() => setFilterStatus('pending')}
            >
              <Clock size={13} className="text-warning" /> Pending ({stats.pending})
            </button>
            <button
              className={`cnt-pill ${filterStatus === 'approved' ? 'active' : ''}`}
              onClick={() => setFilterStatus('approved')}
            >
              <CheckCircle2 size={13} className="text-success" /> Approved ({stats.approved})
            </button>
            <button
              className={`cnt-pill ${filterStatus === '5stars' ? 'active' : ''}`}
              onClick={() => setFilterStatus('5stars')}
            >
              ⭐ 5 Stars Only
            </button>
            <button
              className={`cnt-pill ${filterStatus === 'lowstars' ? 'active' : ''}`}
              onClick={() => setFilterStatus('lowstars')}
            >
              ⚠️ Under 4 Stars
            </button>
          </div>
          <small className="text-muted fw-semibold">
            Showing {filteredReviews.length} of {reviews.length}
          </small>
        </div>
      </div>

      {/* Main Reviews View */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-warning" role="status" />
          <p className="text-muted mt-2">Loading customer reviews...</p>
        </div>
      ) : filteredReviews.length === 0 ? (
        <div className="text-center py-5 bg-white rounded-4 border shadow-xs p-4">
          <Quote size={40} className="text-muted mb-2 opacity-50" />
          <h5 className="fw-bold text-dark">No Reviews Found</h5>
          <p className="text-muted small">No customer reviews match your search or filter.</p>
          <button
            className="btn btn-warning fw-bold px-4"
            onClick={() => {
              setSearchTerm('');
              setFilterStatus('all');
            }}
          >
            Clear Filters
          </button>
        </div>
      ) : viewMode === 'cards' ? (
        /* Cards View (Mobile & Desktop) */
        <motion.div
          className="cnt-cards-grid"
          initial="hidden"
          animate="show"
          variants={{
            hidden: { opacity: 0 },
            show: { opacity: 1, transition: { staggerChildren: 0.05 } },
          }}
        >
          {filteredReviews.map((r) => {
            const customerName = r.customer_name || r.customer || 'Valued Customer';
            const rating = Number(r.rating) || 5;

            return (
              <motion.div
                key={r.id}
                className="cnt-card-item"
                variants={{
                  hidden: { opacity: 0, y: 12 },
                  show: { opacity: 1, y: 0 },
                }}
                whileHover={{ y: -2 }}
              >
                <div>
                  {/* Card Header: Avatar & Status */}
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div className="d-flex align-items-center gap-2">
                      <div
                        className="rounded-circle d-flex align-items-center justify-content-center fw-bold text-white shadow-xs"
                        style={{
                          width: '42px',
                          height: '42px',
                          background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                          fontSize: '1rem',
                        }}
                      >
                        {getInitials(customerName)}
                      </div>
                      <div>
                        <h6 className="fw-bold text-dark mb-0">{customerName}</h6>
                        <small className="text-muted">{r.role || 'Verified Foodie'}</small>
                      </div>
                    </div>

                    <span className={`cnt-badge ${r.is_approved ? 'approved' : 'pending'}`}>
                      {r.is_approved ? (
                        <>
                          <CheckCircle2 size={12} /> Live on Site
                        </>
                      ) : (
                        <>
                          <Clock size={12} /> Pending
                        </>
                      )}
                    </span>
                  </div>

                  {/* Star Rating */}
                  <div className="cnt-stars">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={16}
                        className={i < rating ? 'text-warning fill-warning' : 'text-muted opacity-25'}
                        style={{ fill: i < rating ? '#f59e0b' : 'none' }}
                      />
                    ))}
                    <span className="ms-1 fw-bold text-dark small">{rating}.0</span>
                  </div>

                  {/* Review Text */}
                  <div className="cnt-review-text">
                    &ldquo;{r.text}&rdquo;
                  </div>
                </div>

                {/* Card Actions */}
                <div className="cnt-card-actions">
                  <button
                    className={`cnt-action-btn ${r.is_approved ? 'reject' : 'approve'}`}
                    onClick={() => toggleApproval(r.id, r.is_approved)}
                    title={r.is_approved ? 'Remove from public website' : 'Publish to website'}
                  >
                    {r.is_approved ? (
                      <>
                        <X size={14} /> Unapprove
                      </>
                    ) : (
                      <>
                        <Check size={14} /> Approve &amp; Show
                      </>
                    )}
                  </button>

                  <button
                    className="cnt-action-btn edit"
                    onClick={() => setSelectedReview(r)}
                    title="View full text"
                  >
                    Details
                  </button>

                  <button
                    className="cnt-action-btn delete"
                    onClick={() => handleDelete(r.id)}
                    title="Delete review"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      ) : (
        /* Table View */
        <div className="cnt-table-card">
          <div className="cnt-table-responsive">
            <table className="cnt-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Role</th>
                  <th>Rating</th>
                  <th>Review Feedback</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredReviews.map((r) => {
                  const customerName = r.customer_name || r.customer || 'Customer';
                  const rating = Number(r.rating) || 5;

                  return (
                    <tr key={r.id}>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <div
                            className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold"
                            style={{ width: '32px', height: '32px', background: '#f59e0b', fontSize: '0.8rem' }}
                          >
                            {getInitials(customerName)}
                          </div>
                          <span className="fw-bold text-dark">{customerName}</span>
                        </div>
                      </td>
                      <td>
                        <span className="text-muted small">{r.role || 'Foodie'}</span>
                      </td>
                      <td>
                        <span className="fw-bold text-warning d-flex align-items-center gap-1">
                          <Star size={14} style={{ fill: '#f59e0b' }} /> {rating}.0
                        </span>
                      </td>
                      <td>
                        <div style={{ maxWidth: '400px', fontStyle: 'italic' }}>
                          &ldquo;{r.text}&rdquo;
                        </div>
                      </td>
                      <td>
                        <span className={`cnt-badge ${r.is_approved ? 'approved' : 'pending'}`}>
                          {r.is_approved ? 'Live' : 'Pending'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div className="d-flex justify-content-end gap-1">
                          <button
                            className={`btn btn-sm ${r.is_approved ? 'btn-outline-warning' : 'btn-outline-success'}`}
                            onClick={() => toggleApproval(r.id, r.is_approved)}
                          >
                            {r.is_approved ? 'Unapprove' : 'Approve'}
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDelete(r.id)}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Review Details Modal */}
      <AnimatePresence>
        {selectedReview && (
          <div className="cnt-modal-overlay" onClick={() => setSelectedReview(null)}>
            <motion.div
              className="cnt-modal-panel"
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.94, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 15 }}
              transition={{ duration: 0.2 }}
            >
              <div className="cnt-modal-header">
                <h4 className="cnt-modal-title d-flex align-items-center gap-2">
                  <Quote size={22} className="text-warning" /> Customer Review Details
                </h4>
                <button className="cnt-modal-close" onClick={() => setSelectedReview(null)}>
                  <X size={20} />
                </button>
              </div>

              <div className="cnt-modal-body">
                <div className="p-3 rounded-3 bg-light border mb-3 d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center gap-3">
                    <div
                      className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold fs-5 shadow-xs"
                      style={{ width: '52px', height: '52px', background: '#f59e0b' }}
                    >
                      {getInitials(selectedReview.customer_name || selectedReview.customer)}
                    </div>
                    <div>
                      <h5 className="fw-bold mb-0 text-dark">
                        {selectedReview.customer_name || selectedReview.customer || 'Customer'}
                      </h5>
                      <small className="text-muted">{selectedReview.role || 'Verified Foodie'}</small>
                    </div>
                  </div>
                  <div className="text-end">
                    <div className="d-flex align-items-center gap-1 text-warning fw-bold fs-5">
                      <Star size={20} style={{ fill: '#f59e0b' }} /> {selectedReview.rating || 5}.0
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-3 border mb-4 bg-white shadow-xs">
                  <Quote size={28} className="text-warning mb-2 opacity-50" />
                  <p className="fs-5 mb-0 fw-medium text-dark" style={{ fontStyle: 'italic', lineHeight: 1.6 }}>
                    &ldquo;{selectedReview.text}&rdquo;
                  </p>
                </div>

                <div className="p-3 bg-light rounded-3 border d-flex align-items-center justify-content-between">
                  <div>
                    <span className="text-muted small d-block">Website Display Status</span>
                    <strong>
                      {selectedReview.is_approved ? '✅ Currently Visible on Home Page' : '⏳ Hidden from Home Page'}
                    </strong>
                  </div>
                  <button
                    className={`btn ${selectedReview.is_approved ? 'btn-outline-warning' : 'btn-success'} fw-bold`}
                    onClick={() => toggleApproval(selectedReview.id, selectedReview.is_approved)}
                  >
                    {selectedReview.is_approved ? 'Unapprove Review' : 'Approve & Publish'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TestimonialManagement;