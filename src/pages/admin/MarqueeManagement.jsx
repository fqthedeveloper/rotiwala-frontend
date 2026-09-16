// src/pages/admin/MarqueeManagement.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  getAdminMarquee,
  createMarquee,
  updateMarquee,
  deleteMarquee,
} from '../../service/videoApi';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import {
  Sparkles,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Search,
  RefreshCw,
  LayoutGrid,
  List,
  Eye,
  EyeOff,
  X,
  Radio,
  Clock
} from 'lucide-react';
import './ContentManagement.css';

const MarqueeManagement = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState('all'); // 'all' | 'active' | 'inactive'
  const [viewMode, setViewMode] = useState(() => (window.innerWidth < 768 ? 'cards' : 'cards'));
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    text: '',
    is_active: true,
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getAdminMarquee();
      const data = res.data || [];
      setItems(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error('Failed to load marquee items');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Stats
  const stats = useMemo(() => {
    const total = items.length;
    const active = items.filter((it) => it.is_active).length;
    const inactive = total - active;
    return { total, active, inactive };
  }, [items]);

  // Active items for live banner preview
  const activeItems = useMemo(() => {
    return items.filter((it) => it.is_active);
  }, [items]);

  // Filtered & Searched items
  const filteredItems = useMemo(() => {
    let result = [...items];
    if (filterActive === 'active') result = result.filter((it) => it.is_active);
    else if (filterActive === 'inactive') result = result.filter((it) => !it.is_active);

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter((it) => (it.text || '').toLowerCase().includes(term));
    }
    return result;
  }, [items, filterActive, searchTerm]);

  // Modal Handlers
  const openModal = (item = null) => {
    if (item) {
      setEditingId(item.id);
      setForm({
        text: item.text || '',
        is_active: !!item.is_active,
      });
    } else {
      setEditingId(null);
      setForm({
        text: '',
        is_active: true,
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setForm({ text: '', is_active: true });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.text.trim()) {
      toast.error('Marquee announcement text is required');
      return;
    }
    setSubmitting(true);
    try {
      if (editingId) {
        await updateMarquee(editingId, form);
        toast.success('Marquee banner updated successfully');
      } else {
        await createMarquee(form);
        toast.success('Marquee banner created successfully');
      }
      closeModal();
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Delete Marquee Banner?',
      text: 'This announcement will be permanently removed from the website.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, Delete',
    });
    if (result.isConfirmed) {
      try {
        await deleteMarquee(id);
        toast.success('Marquee banner deleted');
        fetchData();
      } catch (error) {
        toast.error('Delete failed');
      }
    }
  };

  const toggleActive = async (id, current) => {
    try {
      // Optimistic update
      setItems((prev) =>
        prev.map((it) => (it.id === id ? { ...it, is_active: !current } : it))
      );
      await updateMarquee(id, { is_active: !current });
      toast.success(current ? 'Banner deactivated' : 'Banner activated & live');
    } catch {
      toast.error('Status update failed');
      fetchData();
    }
  };

  return (
    <div className="cnt-container">
      {/* Header */}
      <div className="cnt-header">
        <div className="cnt-title-row">
          <div>
            <h1 className="cnt-title">
              <Radio className="text-warning" size={30} />
              Marquee Banner Management
            </h1>
            <p className="cnt-subtitle">
              Manage real-time scrolling announcement headlines displayed on the customer home page.
            </p>
          </div>
          <div className="d-flex align-items-center gap-2 flex-wrap">
            <button className="cnt-btn cnt-btn-primary" onClick={() => openModal()}>
              <Plus size={18} /> Add New Banner
            </button>
            <button className="cnt-btn cnt-btn-outline" onClick={fetchData} disabled={loading}>
              <RefreshCw size={16} className={loading ? 'spin' : ''} /> Refresh
            </button>
          </div>
        </div>

        {/* Live Preview Strip */}
        <div className="cnt-preview-strip">
          <span className="cnt-preview-label">Live Preview</span>
          {activeItems.length > 0 ? (
            <div className="cnt-preview-track">
              {[...activeItems, ...activeItems, ...activeItems].map((item, idx) => (
                <span key={idx} className="cnt-preview-item">
                  {item.text} <i>✦</i>
                </span>
              ))}
            </div>
          ) : (
            <div style={{ color: '#fde68a', fontStyle: 'italic', paddingLeft: '130px', fontSize: '0.9rem' }}>
              No active marquees currently running on the website. Add or activate one below!
            </div>
          )}
        </div>

        {/* KPI Stats */}
        <div className="cnt-stats-grid">
          <div className="cnt-stat-card" onClick={() => setFilterActive('all')}>
            <div className="cnt-stat-icon total">
              <Radio size={22} />
            </div>
            <div className="cnt-stat-content">
              <h4>{stats.total}</h4>
              <p>Total Marquees</p>
            </div>
          </div>

          <div className="cnt-stat-card" onClick={() => setFilterActive('active')}>
            <div className="cnt-stat-icon success">
              <CheckCircle2 size={22} />
            </div>
            <div className="cnt-stat-content">
              <h4>{stats.active}</h4>
              <p>Live on Website</p>
            </div>
          </div>

          <div className="cnt-stat-card" onClick={() => setFilterActive('inactive')}>
            <div className="cnt-stat-icon warning">
              <XCircle size={22} />
            </div>
            <div className="cnt-stat-content">
              <h4>{stats.inactive}</h4>
              <p>Inactive / Hidden</p>
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
              placeholder="Search marquee announcements..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button className="cnt-search-clear" onClick={() => setSearchTerm('')}>
                <X size={16} />
              </button>
            )}
          </div>

          <div className="d-flex align-items-center gap-2">
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
          </div>
        </div>

        {/* Filter Pills */}
        <div className="cnt-filter-row">
          <div className="cnt-pills">
            <button
              className={`cnt-pill ${filterActive === 'all' ? 'active' : ''}`}
              onClick={() => setFilterActive('all')}
            >
              All ({items.length})
            </button>
            <button
              className={`cnt-pill ${filterActive === 'active' ? 'active' : ''}`}
              onClick={() => setFilterActive('active')}
            >
              <span className="badge-dot bg-success"></span> Active ({stats.active})
            </button>
            <button
              className={`cnt-pill ${filterActive === 'inactive' ? 'active' : ''}`}
              onClick={() => setFilterActive('inactive')}
            >
              <span className="badge-dot bg-warning"></span> Inactive ({stats.inactive})
            </button>
          </div>
          <small className="text-muted fw-semibold">
            Showing {filteredItems.length} of {items.length}
          </small>
        </div>
      </div>

      {/* Content Display */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-warning" role="status" />
          <p className="text-muted mt-2">Loading announcements...</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-5 bg-white rounded-4 border shadow-xs p-4">
          <Radio size={40} className="text-muted mb-2 opacity-50" />
          <h5 className="fw-bold text-dark">No Marquee Announcements Found</h5>
          <p className="text-muted small">No announcements match your search or filter.</p>
          <button className="btn btn-warning fw-bold px-4" onClick={() => openModal()}>
            Create First Banner
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
          {filteredItems.map((item) => (
            <motion.div
              key={item.id}
              className="cnt-card-item"
              variants={{
                hidden: { opacity: 0, y: 12 },
                show: { opacity: 1, y: 0 },
              }}
              whileHover={{ y: -2 }}
            >
              <div>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <span className={`cnt-badge ${item.is_active ? 'active' : 'inactive'}`}>
                    {item.is_active ? (
                      <>
                        <CheckCircle2 size={12} /> Live on Site
                      </>
                    ) : (
                      <>
                        <EyeOff size={12} /> Inactive
                      </>
                    )}
                  </span>
                  <small className="text-muted d-flex align-items-center gap-1">
                    <Clock size={12} />
                    {new Date(item.created_at).toLocaleDateString()}
                  </small>
                </div>

                <div
                  className="p-3 rounded-3 mb-3"
                  style={{
                    background: '#fffbeb',
                    border: '1px solid #fef3c7',
                    minHeight: '80px',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <p className="mb-0 fw-bold text-dark" style={{ fontStyle: 'italic' }}>
                    &ldquo;{item.text}&rdquo;
                  </p>
                </div>
              </div>

              <div className="cnt-card-actions">
                <button
                  className={`cnt-action-btn ${item.is_active ? 'reject' : 'approve'}`}
                  onClick={() => toggleActive(item.id, item.is_active)}
                  title={item.is_active ? 'Turn off banner' : 'Make live'}
                >
                  {item.is_active ? <EyeOff size={14} /> : <Eye size={14} />}
                  {item.is_active ? 'Deactivate' : 'Activate'}
                </button>

                <button
                  className="cnt-action-btn edit"
                  onClick={() => openModal(item)}
                  title="Edit text"
                >
                  <Edit2 size={14} /> Edit
                </button>

                <button
                  className="cnt-action-btn delete"
                  onClick={() => handleDelete(item.id)}
                  title="Delete banner"
                >
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        /* Table View */
        <div className="cnt-table-card">
          <div className="cnt-table-responsive">
            <table className="cnt-table">
              <thead>
                <tr>
                  <th style={{ width: '60px' }}>#</th>
                  <th>Announcement Text</th>
                  <th>Status</th>
                  <th>Date Added</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item, index) => (
                  <tr key={item.id}>
                    <td>{index + 1}</td>
                    <td>
                      <span className="fw-semibold text-dark" style={{ fontStyle: 'italic' }}>
                        {item.text}
                      </span>
                    </td>
                    <td>
                      <span className={`cnt-badge ${item.is_active ? 'active' : 'inactive'}`}>
                        {item.is_active ? 'Live' : 'Hidden'}
                      </span>
                    </td>
                    <td>{new Date(item.created_at).toLocaleDateString()}</td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="d-flex justify-content-end gap-1">
                        <button
                          className={`btn btn-sm ${item.is_active ? 'btn-outline-warning' : 'btn-outline-success'}`}
                          onClick={() => toggleActive(item.id, item.is_active)}
                        >
                          {item.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => openModal(item)}
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDelete(item.id)}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="cnt-modal-overlay" onClick={closeModal}>
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
                  <Radio size={22} className="text-warning" />
                  {editingId ? 'Edit Marquee Banner' : 'Add New Marquee Banner'}
                </h4>
                <button className="cnt-modal-close" onClick={closeModal}>
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="cnt-modal-body">
                  <div className="mb-3">
                    <label className="form-label fw-bold text-dark">Announcement Message *</label>
                    <textarea
                      className="form-control form-control-lg"
                      name="text"
                      rows={4}
                      placeholder="e.g. 🥖 Freshly baked Tandoori Rotis delivered hot to your doorstep! Free delivery above ₹199."
                      value={form.text}
                      onChange={handleChange}
                      required
                    />
                    <div className="d-flex justify-content-between text-muted small mt-1">
                      <span>Will display in the scrolling ticker on Home page.</span>
                      <span>{form.text.length} characters</span>
                    </div>
                  </div>

                  {/* Live Modal Preview */}
                  {form.text && (
                    <div className="mb-4">
                      <label className="form-label fw-semibold text-muted small">Live Banner Preview</label>
                      <div
                        className="p-3 rounded-3"
                        style={{
                          background: 'linear-gradient(90deg, #3d0f0f, #2b0b07)',
                          color: '#fde68a',
                          fontStyle: 'italic',
                          fontSize: '0.95rem',
                        }}
                      >
                        {form.text} <i>✦</i>
                      </div>
                    </div>
                  )}

                  <div className="form-check form-switch mb-2">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="marqueeActiveCheck"
                      name="is_active"
                      checked={form.is_active}
                      onChange={handleChange}
                      style={{ cursor: 'pointer' }}
                    />
                    <label
                      className="form-check-label fw-semibold text-dark"
                      htmlFor="marqueeActiveCheck"
                      style={{ cursor: 'pointer' }}
                    >
                      Active (Publish to live customer website immediately)
                    </label>
                  </div>
                </div>

                <div className="p-3 border-top d-flex justify-content-end gap-2 bg-light rounded-bottom-4">
                  <button type="button" className="btn btn-light" onClick={closeModal}>
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-warning fw-bold px-4"
                    disabled={submitting}
                  >
                    {submitting ? 'Saving...' : editingId ? 'Save Changes' : 'Create Banner'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MarqueeManagement;