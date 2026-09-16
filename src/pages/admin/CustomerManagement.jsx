// src/pages/admin/CustomerManagement.jsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Phone,
  MessageSquare,
  Shield,
  AlertTriangle,
  Flag,
  Check,
  X,
  RefreshCw,
  Download,
  Eye,
  Lock,
  Unlock,
  Copy,
  CheckCircle2,
  User,
  Users,
  UserCheck,
  UserX,
  AlertCircle,
  LayoutGrid,
  List,
  ArrowUpDown,
  ShoppingBag,
  Clock,
  ExternalLink
} from 'lucide-react';
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';
import {
  getCustomers,
  getCustomer,
  toggleBlockCustomer,
  createFlag,
  deleteFlag
} from '../../service/customerService';
import './CustomerManagement.css';

const CustomerManagement = () => {
  // User info & roles
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const userRole = localStorage.getItem('role') || user?.role;
  const isAdmin = userRole === 'super_admin' || userRole === 'admin';
  const isManager = userRole === 'manager';

  // State
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'active' | 'blocked' | 'flagged' | 'high_trust' | 'low_trust'
  const [sortBy, setSortBy] = useState('default'); // 'default' | 'name' | 'orders' | 'trust' | 'flags'
  const [viewMode, setViewMode] = useState(() => (window.innerWidth < 768 ? 'cards' : 'cards'));
  const [copiedId, setCopiedId] = useState(null);

  // Modals
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [flagModalCustomer, setFlagModalCustomer] = useState(null);
  const [flagReason, setFlagReason] = useState('');
  const [submittingFlag, setSubmittingFlag] = useState(false);

  // Preset reasons for fast flagging
  const PRESET_REASONS = [
    'Frequent order cancellations',
    'Unreachable / Incorrect phone number',
    'Failed payment or fake UPI proof',
    'Abusive behavior towards delivery boy',
    'Fake address / Delivery refusal',
  ];

  // Auto-adapt view on resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768 && viewMode === 'table') {
        setViewMode('cards');
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [viewMode]);

  // Fetch customers
  const fetchCustomerList = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (searchTerm.trim()) params.search = searchTerm.trim();
      const res = await getCustomers(params);
      const data = res.data?.results || res.data || [];
      setCustomers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load customers:', err);
      toast.error('Failed to load customer list');
    } finally {
      setLoading(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCustomerList();
    }, 250);
    return () => clearTimeout(timer);
  }, [fetchCustomerList]);

  // Copy phone number
  const handleCopyPhone = (phone, id, e) => {
    if (e) e.stopPropagation();
    if (!phone) return;
    navigator.clipboard.writeText(phone);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  // WhatsApp link helper
  const getWhatsAppLink = (phone, name) => {
    if (!phone) return '#';
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const formatted = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    const msg = encodeURIComponent(`Hello ${name || 'Customer'}, greetings from Roti Wala!`);
    return `https://wa.me/${formatted}?text=${msg}`;
  };

  // Toggle Block / Unblock (Admin Only)
  const handleToggleBlock = async (cust, e) => {
    if (e) e.stopPropagation();
    if (!isAdmin) {
      toast.error('Only administrators can block or unblock accounts.');
      return;
    }

    const willBlock = cust.is_active;
    const result = await Swal.fire({
      title: willBlock ? 'Block Customer?' : 'Unblock Customer?',
      text: willBlock
        ? `Are you sure you want to block ${cust.full_name || cust.username}? They will not be able to place new orders.`
        : `Unblock ${cust.full_name || cust.username}? They will be restored to active status.`,
      icon: willBlock ? 'warning' : 'question',
      showCancelButton: true,
      confirmButtonColor: willBlock ? '#ef4444' : '#10b981',
      cancelButtonColor: '#64748b',
      confirmButtonText: willBlock ? 'Yes, Block' : 'Yes, Unblock',
    });

    if (result.isConfirmed) {
      try {
        await toggleBlockCustomer(cust.id, !cust.is_active);
        toast.success(`Customer ${willBlock ? 'blocked' : 'unblocked'} successfully!`);
        setCustomers((prev) =>
          prev.map((c) => (c.id === cust.id ? { ...c, is_active: !willBlock } : c))
        );
        if (selectedCustomer?.id === cust.id || selectedCustomer?.user_id === cust.id) {
          setSelectedCustomer((prev) => ({ ...prev, is_active: !willBlock }));
        }
      } catch (err) {
        console.error('Failed to update block status:', err);
        toast.error('Failed to change customer status');
      }
    }
  };

  // Open Full Detail Modal
  const handleOpenDetails = async (customer) => {
    setDetailLoading(true);
    try {
      const res = await getCustomer(customer.id);
      setSelectedCustomer(res.data);
    } catch (err) {
      console.error('Failed to load details:', err);
      // Fallback to customer summary
      setSelectedCustomer(customer);
    } finally {
      setDetailLoading(false);
    }
  };

  // Flag Customer Modal Handlers
  const handleOpenFlagModal = (cust, e) => {
    if (e) e.stopPropagation();
    setFlagModalCustomer(cust);
    setFlagReason('');
  };

  const handleCloseFlagModal = () => {
    setFlagModalCustomer(null);
    setFlagReason('');
  };

  const handleSubmitFlag = async () => {
    if (!flagReason.trim()) {
      toast.warning('Please enter or select a reason for flagging.');
      return;
    }
    setSubmittingFlag(true);
    try {
      const custId = flagModalCustomer.id || flagModalCustomer.user_id;
      await createFlag(custId, flagReason.trim());
      toast.success('Flag added successfully');
      handleCloseFlagModal();
      fetchCustomerList();
      if (selectedCustomer && (selectedCustomer.id === custId || selectedCustomer.user_id === custId)) {
        const updated = await getCustomer(custId);
        setSelectedCustomer(updated.data);
      }
    } catch (err) {
      console.error('Failed to add flag:', err);
      toast.error(err.response?.data?.error || 'Failed to submit flag');
    } finally {
      setSubmittingFlag(false);
    }
  };

  // Remove Flag
  const handleDeleteFlag = async (flagId) => {
    const result = await Swal.fire({
      title: 'Remove Flag?',
      text: 'Are you sure you want to remove this flag record?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Remove',
    });

    if (result.isConfirmed) {
      try {
        const custId = selectedCustomer.id || selectedCustomer.user_id;
        await deleteFlag(custId, flagId);
        toast.success('Flag removed');
        const updated = await getCustomer(custId);
        setSelectedCustomer(updated.data);
        fetchCustomerList();
      } catch (err) {
        console.error('Failed to remove flag:', err);
        toast.error('Failed to remove flag');
      }
    }
  };

  // CSV Export
  const handleExportCSV = () => {
    if (!filteredCustomers.length) {
      toast.info('No customers to export.');
      return;
    }
    const headers = ['ID', 'Full Name', 'Username', 'Phone', 'Email', 'Trust Score', 'Total Orders', 'Flags', 'Status'];
    const rows = filteredCustomers.map((c) => [
      c.id,
      `"${(c.full_name || '').replace(/"/g, '""')}"`,
      `"${(c.username || '').replace(/"/g, '""')}"`,
      `"${(c.phone || '').replace(/"/g, '""')}"`,
      `"${(c.email || '').replace(/"/g, '""')}"`,
      c.trust_score ?? 100,
      c.total_orders ?? 0,
      c.flag_count ?? (c.is_flagged ? 1 : 0),
      c.is_active ? 'Active' : 'Blocked',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `rotiwala_customers_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Exported ${filteredCustomers.length} customers to CSV!`);
  };

  // Computed Metrics
  const stats = useMemo(() => {
    const total = customers.length;
    const active = customers.filter((c) => c.is_active).length;
    const blocked = customers.filter((c) => !c.is_active).length;
    const flagged = customers.filter((c) => c.is_flagged || c.flag_count > 0).length;
    const avgTrust = total > 0 ? Math.round(customers.reduce((acc, c) => acc + (c.trust_score ?? 100), 0) / total) : 100;
    return { total, active, blocked, flagged, avgTrust };
  }, [customers]);

  // Filtering & Sorting
  const filteredCustomers = useMemo(() => {
    let result = [...customers];

    // Tab Filter
    if (activeTab === 'active') {
      result = result.filter((c) => c.is_active);
    } else if (activeTab === 'blocked') {
      result = result.filter((c) => !c.is_active);
    } else if (activeTab === 'flagged') {
      result = result.filter((c) => c.is_flagged || (c.flag_count && c.flag_count > 0));
    } else if (activeTab === 'high_trust') {
      result = result.filter((c) => (c.trust_score ?? 100) >= 75);
    } else if (activeTab === 'low_trust') {
      result = result.filter((c) => (c.trust_score ?? 100) < 50);
    }

    // Sort
    if (sortBy === 'name') {
      result.sort((a, b) => (a.full_name || a.username || '').localeCompare(b.full_name || b.username || ''));
    } else if (sortBy === 'orders') {
      result.sort((a, b) => (b.total_orders || 0) - (a.total_orders || 0));
    } else if (sortBy === 'trust') {
      result.sort((a, b) => (b.trust_score ?? 100) - (a.trust_score ?? 100));
    } else if (sortBy === 'flags') {
      result.sort((a, b) => (b.flag_count || (b.is_flagged ? 1 : 0)) - (a.flag_count || (a.is_flagged ? 1 : 0)));
    }

    return result;
  }, [customers, activeTab, sortBy]);

  // Get Avatar Initials
  const getInitials = (name) => {
    if (!name) return 'C';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  // Framer Motion Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.04 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 14 },
    show: { opacity: 1, y: 0, transition: { duration: 0.25 } },
  };

  return (
    <div className="cm-container">
      {/* Title & Context Header */}
      <div className="cm-header">
        <div className="cm-title-area">
          <div>
            <h1 className="cm-title">
              <Users className="text-warning" size={32} />
              Customer Management
            </h1>
            <p className="cm-subtitle">
              {isAdmin
                ? 'Comprehensive directory of all registered customers across all branches.'
                : 'Manage and connect with customers associated with your shop.'}
            </p>
          </div>
          <div className="d-flex align-items-center gap-2 flex-wrap">
            <button className="cm-btn cm-btn-outline" onClick={handleExportCSV} title="Export current list to CSV">
              <Download size={16} /> Export CSV
            </button>
            <button
              className="cm-btn cm-btn-primary"
              onClick={fetchCustomerList}
              disabled={loading}
              title="Refresh customer data"
            >
              <RefreshCw size={16} className={loading ? 'spin' : ''} /> Refresh
            </button>
          </div>
        </div>

        {/* Animated KPI Stats Row */}
        <motion.div
          className="cm-stats-grid"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="cm-stat-card" onClick={() => setActiveTab('all')} style={{ cursor: 'pointer' }}>
            <div className="cm-stat-icon total">
              <Users size={24} />
            </div>
            <div className="cm-stat-content">
              <h4>{stats.total}</h4>
              <p>Total Customers</p>
            </div>
          </div>

          <div className="cm-stat-card" onClick={() => setActiveTab('active')} style={{ cursor: 'pointer' }}>
            <div className="cm-stat-icon active">
              <UserCheck size={24} />
            </div>
            <div className="cm-stat-content">
              <h4>{stats.active}</h4>
              <p>Active Customers</p>
            </div>
          </div>

          <div className="cm-stat-card" onClick={() => setActiveTab('flagged')} style={{ cursor: 'pointer' }}>
            <div className="cm-stat-icon flagged">
              <AlertTriangle size={24} />
            </div>
            <div className="cm-stat-content">
              <h4>{stats.flagged}</h4>
              <p>Flagged / Suspicious</p>
            </div>
          </div>

          <div className="cm-stat-card" onClick={() => setActiveTab('blocked')} style={{ cursor: 'pointer' }}>
            <div className="cm-stat-icon blocked">
              <UserX size={24} />
            </div>
            <div className="cm-stat-content">
              <h4>{stats.blocked}</h4>
              <p>Blocked Users</p>
            </div>
          </div>

          <div className="cm-stat-card" onClick={() => setActiveTab('high_trust')} style={{ cursor: 'pointer' }}>
            <div className="cm-stat-icon trust">
              <Shield size={24} />
            </div>
            <div className="cm-stat-content">
              <h4>{stats.avgTrust}%</h4>
              <p>Avg Trust Score</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Toolbar & Filters Card */}
      <div className="cm-toolbar-card">
        <div className="cm-search-row">
          <div className="cm-search-box">
            <Search size={18} className="cm-search-icon" />
            <input
              type="text"
              placeholder="Search by name, phone, email, username..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button className="cm-search-clear" onClick={() => setSearchTerm('')}>
                <X size={16} />
              </button>
            )}
          </div>

          <div className="cm-actions-group">
            {/* View Mode Toggle */}
            <div className="cm-view-toggle">
              <button
                className={`cm-view-btn ${viewMode === 'cards' ? 'active' : ''}`}
                onClick={() => setViewMode('cards')}
                title="Cards View"
              >
                <LayoutGrid size={16} /> Grid
              </button>
              <button
                className={`cm-view-btn ${viewMode === 'table' ? 'active' : ''}`}
                onClick={() => setViewMode('table')}
                title="Table View"
              >
                <List size={16} /> Table
              </button>
            </div>

            {/* Sort Select */}
            <div className="d-flex align-items-center gap-1">
              <ArrowUpDown size={16} className="text-muted" />
              <select
                className="cm-sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="default">Sort: Default</option>
                <option value="name">Name (A-Z)</option>
                <option value="orders">Most Orders</option>
                <option value="trust">Highest Trust</option>
                <option value="flags">Most Flags</option>
              </select>
            </div>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="cm-filter-row">
          <div className="cm-pills-list">
            <button
              className={`cm-pill ${activeTab === 'all' ? 'active' : ''}`}
              onClick={() => setActiveTab('all')}
            >
              All ({customers.length})
            </button>
            <button
              className={`cm-pill ${activeTab === 'active' ? 'active' : ''}`}
              onClick={() => setActiveTab('active')}
            >
              <span className="badge-dot bg-success"></span> Active ({stats.active})
            </button>
            <button
              className={`cm-pill ${activeTab === 'flagged' ? 'active' : ''}`}
              onClick={() => setActiveTab('flagged')}
            >
              <Flag size={13} className="text-danger" /> Flagged ({stats.flagged})
            </button>
            <button
              className={`cm-pill ${activeTab === 'blocked' ? 'active' : ''}`}
              onClick={() => setActiveTab('blocked')}
            >
              <Lock size={13} /> Blocked ({stats.blocked})
            </button>
            <button
              className={`cm-pill ${activeTab === 'high_trust' ? 'active' : ''}`}
              onClick={() => setActiveTab('high_trust')}
            >
              <Shield size={13} className="text-success" /> High Trust
            </button>
            <button
              className={`cm-pill ${activeTab === 'low_trust' ? 'active' : ''}`}
              onClick={() => setActiveTab('low_trust')}
            >
              <AlertCircle size={13} className="text-danger" /> At Risk
            </button>
          </div>
          <small className="text-muted fw-semibold">
            Showing {filteredCustomers.length} of {customers.length}
          </small>
        </div>
      </div>

      {/* Main Customers List / Grid */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-warning" role="status" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-muted mt-3 fw-medium">Loading customers...</p>
        </div>
      ) : filteredCustomers.length === 0 ? (
        <motion.div
          className="text-center py-5 bg-white rounded-4 border shadow-sm p-4"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="bg-warning bg-opacity-10 p-3 rounded-circle d-inline-block mb-3">
            <Users size={48} className="text-warning" />
          </div>
          <h4 className="fw-bold text-dark">No customers found</h4>
          <p className="text-muted mb-3" style={{ maxWidth: '420px', margin: '0 auto' }}>
            No customer accounts matched your search keyword or selected filter criteria.
          </p>
          <button
            className="btn btn-warning fw-bold px-4"
            onClick={() => {
              setSearchTerm('');
              setActiveTab('all');
            }}
          >
            Clear All Filters
          </button>
        </motion.div>
      ) : viewMode === 'cards' ? (
        /* ================= CARDS VIEW (Responsive on all devices) ================= */
        <motion.div
          className="cm-cards-grid"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          {filteredCustomers.map((cust) => {
            const trust = cust.trust_score ?? 100;
            const trustClass = trust >= 75 ? 'cm-trust-high' : trust >= 50 ? 'cm-trust-med' : 'cm-trust-low';
            const isFlagged = cust.is_flagged || (cust.flag_count && cust.flag_count > 0);

            return (
              <motion.div
                key={cust.id}
                className="cm-customer-card"
                variants={itemVariants}
                whileHover={{ y: -3 }}
              >
                <div>
                  {/* Card Header: Avatar, Name, Status Badge */}
                  <div className="cm-card-top">
                    <div className="cm-avatar-wrapper">
                      <div className="cm-avatar">{getInitials(cust.full_name)}</div>
                      <div className="cm-user-info">
                        <h5>{cust.full_name || 'Customer'}</h5>
                        <span className="cm-username-tag">@{cust.username || `user_${cust.id}`}</span>
                      </div>
                    </div>
                    <div className="d-flex flex-column align-items-end gap-1">
                      <span className={`cm-badge ${cust.is_active ? 'active' : 'blocked'}`}>
                        {cust.is_active ? (
                          <>
                            <Check size={12} /> Active
                          </>
                        ) : (
                          <>
                            <Lock size={12} /> Blocked
                          </>
                        )}
                      </span>
                      {isFlagged && (
                        <span className="cm-badge flagged">
                          <Flag size={12} /> Flagged ({cust.flag_count || 1})
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Direct Contact Chips: Call, WhatsApp, Copy */}
                  {cust.phone && (
                    <div className="cm-contact-chips">
                      <a href={`tel:${cust.phone}`} className="cm-contact-chip call" title="Call directly">
                        <Phone size={13} /> {cust.phone}
                      </a>
                      <a
                        href={getWhatsAppLink(cust.phone, cust.full_name)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="cm-contact-chip whatsapp"
                        title="Chat on WhatsApp"
                      >
                        <MessageSquare size={13} /> WhatsApp
                      </a>
                      <button
                        type="button"
                        className="cm-contact-chip"
                        onClick={(e) => handleCopyPhone(cust.phone, cust.id, e)}
                        title="Copy phone"
                      >
                        {copiedId === cust.id ? (
                          <>
                            <CheckCircle2 size={13} className="text-success" /> Copied
                          </>
                        ) : (
                          <>
                            <Copy size={13} /> Copy
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {/* Metrics Bar: Trust Score, Total Orders, Flags */}
                  <div className="cm-metrics-bar">
                    <div className="cm-metric-item">
                      <span className="cm-metric-label">Trust Score</span>
                      <span className={`cm-trust-meter ${trustClass}`}>
                        <Shield size={14} /> {trust}%
                      </span>
                    </div>
                    <div className="cm-metric-item">
                      <span className="cm-metric-label">Orders</span>
                      <span className="cm-metric-val">
                        <ShoppingBag size={14} className="text-primary me-1" />
                        {cust.total_orders ?? 0}
                      </span>
                    </div>
                    <div className="cm-metric-item">
                      <span className="cm-metric-label">Flags</span>
                      <span className={`cm-metric-val ${isFlagged ? 'text-danger' : 'text-muted'}`}>
                        {cust.flag_count || (cust.is_flagged ? 1 : 0)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div className="cm-card-actions">
                  <button
                    className="cm-card-btn details"
                    onClick={() => handleOpenDetails(cust)}
                    title="View Customer Profile"
                  >
                    <Eye size={15} /> Details
                  </button>

                  <button
                    className="cm-card-btn flag"
                    onClick={(e) => handleOpenFlagModal(cust, e)}
                    title="Add Flag"
                  >
                    <Flag size={15} /> Flag
                  </button>

                  {isAdmin && (
                    <button
                      className={`cm-card-btn ${cust.is_active ? 'block' : 'unblock'}`}
                      onClick={(e) => handleToggleBlock(cust, e)}
                      title={cust.is_active ? 'Block account' : 'Unblock account'}
                    >
                      {cust.is_active ? (
                        <>
                          <Lock size={15} /> Block
                        </>
                      ) : (
                        <>
                          <Unlock size={15} /> Unblock
                        </>
                      )}
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      ) : (
        /* ================= TABLE VIEW (Desktop / Tablet) ================= */
        <motion.div
          className="cm-table-card"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="cm-table-responsive">
            <table className="cm-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Contact Info</th>
                  <th>Trust Score</th>
                  <th>Orders</th>
                  <th>Flags</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((cust) => {
                  const trust = cust.trust_score ?? 100;
                  const trustClass = trust >= 75 ? 'cm-trust-high' : trust >= 50 ? 'cm-trust-med' : 'cm-trust-low';
                  const isFlagged = cust.is_flagged || (cust.flag_count && cust.flag_count > 0);

                  return (
                    <tr key={cust.id}>
                      <td>
                        <div className="cm-table-avatar-cell">
                          <div className="cm-table-avatar">{getInitials(cust.full_name)}</div>
                          <div>
                            <div className="fw-bold text-dark">{cust.full_name || 'Customer'}</div>
                            <small className="text-muted">@{cust.username || `user_${cust.id}`}</small>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div>
                          {cust.phone ? (
                            <div className="d-flex align-items-center gap-2">
                              <span className="fw-medium">{cust.phone}</span>
                              <a
                                href={getWhatsAppLink(cust.phone, cust.full_name)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-success"
                                title="Chat on WhatsApp"
                              >
                                <MessageSquare size={15} />
                              </a>
                            </div>
                          ) : (
                            <span className="text-muted">-</span>
                          )}
                          {cust.email && <small className="text-muted d-block">{cust.email}</small>}
                        </div>
                      </td>
                      <td>
                        <span className={`cm-trust-meter ${trustClass}`}>
                          <Shield size={14} /> {trust}%
                        </span>
                      </td>
                      <td>
                        <span className="fw-bold">
                          <ShoppingBag size={14} className="text-primary me-1" />
                          {cust.total_orders ?? 0}
                        </span>
                      </td>
                      <td>
                        {isFlagged ? (
                          <span className="badge bg-danger-subtle text-danger border border-danger-subtle px-2 py-1 rounded-pill">
                            <Flag size={12} className="me-1" /> {cust.flag_count || 1}
                          </span>
                        ) : (
                          <span className="text-muted small">None</span>
                        )}
                      </td>
                      <td>
                        <span className={`cm-badge ${cust.is_active ? 'active' : 'blocked'}`}>
                          {cust.is_active ? 'Active' : 'Blocked'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div className="cm-table-actions justify-content-end">
                          <button
                            className="cm-icon-btn"
                            onClick={() => handleOpenDetails(cust)}
                            title="View full details"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            className="cm-icon-btn"
                            onClick={(e) => handleOpenFlagModal(cust, e)}
                            title="Add Flag"
                          >
                            <Flag size={16} className="text-danger" />
                          </button>
                          {isAdmin && (
                            <button
                              className={`cm-icon-btn ${cust.is_active ? 'danger' : 'success'}`}
                              onClick={(e) => handleToggleBlock(cust, e)}
                              title={cust.is_active ? 'Block customer' : 'Unblock customer'}
                            >
                              {cust.is_active ? <Lock size={16} /> : <Unlock size={16} />}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* ================= CUSTOMER DETAIL MODAL ================= */}
      <AnimatePresence>
        {selectedCustomer && (
          <div className="cm-modal-overlay" onClick={() => setSelectedCustomer(null)}>
            <motion.div
              className="cm-modal-panel"
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.94, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 20 }}
              transition={{ duration: 0.25 }}
            >
              <div className="cm-modal-header">
                <h4 className="cm-modal-title d-flex align-items-center gap-2">
                  <User size={22} className="text-warning" /> Customer Profile
                </h4>
                <button className="cm-modal-close" onClick={() => setSelectedCustomer(null)}>
                  <X size={20} />
                </button>
              </div>

              <div className="cm-modal-body">
                {/* Profile Hero */}
                <div className="cm-profile-hero">
                  <div className="cm-profile-avatar">{getInitials(selectedCustomer.full_name)}</div>
                  <div className="cm-profile-info flex-grow-1">
                    <h3>{selectedCustomer.full_name || 'Customer'}</h3>
                    <p className="text-muted mb-2">@{selectedCustomer.username || 'user'}</p>
                    <div className="d-flex align-items-center gap-2 flex-wrap">
                      <span className={`cm-badge ${selectedCustomer.is_active ? 'active' : 'blocked'}`}>
                        {selectedCustomer.is_active ? 'Active Customer' : 'Blocked Account'}
                      </span>
                      <span className="cm-badge active">
                        <Shield size={12} /> Trust Score: {selectedCustomer.trust_score ?? 100}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Direct Contact Bar */}
                <div className="p-3 bg-light rounded-3 mb-4 border d-flex align-items-center justify-content-between flex-wrap gap-2">
                  <div>
                    <span className="text-muted small d-block">Phone Number</span>
                    <strong className="fs-6 text-dark">{selectedCustomer.phone || 'No phone'}</strong>
                    {selectedCustomer.email && (
                      <span className="text-muted small d-block">{selectedCustomer.email}</span>
                    )}
                  </div>
                  {selectedCustomer.phone && (
                    <div className="d-flex align-items-center gap-2">
                      <a
                        href={`tel:${selectedCustomer.phone}`}
                        className="btn btn-sm btn-outline-success d-flex align-items-center gap-1"
                      >
                        <Phone size={14} /> Call
                      </a>
                      <a
                        href={getWhatsAppLink(selectedCustomer.phone, selectedCustomer.full_name)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-sm btn-success d-flex align-items-center gap-1"
                      >
                        <MessageSquare size={14} /> WhatsApp
                      </a>
                    </div>
                  )}
                </div>

                {/* Orders Breakdown */}
                <h6 className="fw-bold mb-3 d-flex align-items-center gap-2">
                  <ShoppingBag size={18} className="text-warning" /> Order History Performance
                </h6>
                <div className="cm-orders-breakdown">
                  <div className="cm-breakdown-card">
                    <div className="cm-breakdown-val">{selectedCustomer.total_orders ?? 0}</div>
                    <div className="cm-breakdown-label">Total Orders</div>
                  </div>
                  <div className="cm-breakdown-card completed">
                    <div className="cm-breakdown-val text-success">
                      {selectedCustomer.total_completed_orders ?? 0}
                    </div>
                    <div className="cm-breakdown-label text-success">Completed</div>
                  </div>
                  <div className="cm-breakdown-card cancelled">
                    <div className="cm-breakdown-val text-warning">
                      {selectedCustomer.total_cancelled_orders ?? 0}
                    </div>
                    <div className="cm-breakdown-label text-warning">Cancelled</div>
                  </div>
                  <div className="cm-breakdown-card rejected">
                    <div className="cm-breakdown-val text-danger">
                      {selectedCustomer.total_rejected_orders ?? 0}
                    </div>
                    <div className="cm-breakdown-label text-danger">Rejected</div>
                  </div>
                </div>

                {/* Flags History Section */}
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <h6 className="fw-bold mb-0 d-flex align-items-center gap-2">
                    <Flag size={18} className="text-danger" /> Flags & Alerts
                  </h6>
                  <button
                    className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1"
                    onClick={() => handleOpenFlagModal(selectedCustomer)}
                  >
                    <Flag size={14} /> Add Flag
                  </button>
                </div>

                <div className="cm-flags-container">
                  {selectedCustomer.flags && selectedCustomer.flags.length > 0 ? (
                    selectedCustomer.flags.map((fl) => (
                      <div key={fl.id} className="cm-flag-item">
                        <div>
                          <p className="cm-flag-reason">{fl.reason}</p>
                          <div className="cm-flag-meta">
                            By {fl.flagged_by_name || 'Staff'} · {new Date(fl.created_at).toLocaleDateString()}
                          </div>
                        </div>
                        {(isAdmin || (isManager && fl.flagged_by === user?.id)) && (
                          <button
                            className="btn btn-sm btn-link text-danger p-0"
                            onClick={() => handleDeleteFlag(fl.id)}
                            title="Remove flag"
                          >
                            <X size={18} />
                          </button>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="p-3 text-center bg-light rounded text-muted small">
                      <CheckCircle2 size={22} className="text-success mb-1" />
                      <p className="mb-0">This customer has a clean record with zero flags.</p>
                    </div>
                  )}
                </div>

                {/* Admin Block Action Bar inside Modal */}
                {isAdmin && (
                  <div className="pt-3 mt-4 border-top d-flex justify-content-between align-items-center">
                    <div>
                      <small className="text-muted d-block">Account Status Control</small>
                      <span className="fw-bold">
                        {selectedCustomer.is_active ? 'Currently Active' : 'Currently Blocked'}
                      </span>
                    </div>
                    <button
                      className={`btn ${selectedCustomer.is_active ? 'btn-danger' : 'btn-success'} d-flex align-items-center gap-2`}
                      onClick={() => handleToggleBlock(selectedCustomer)}
                    >
                      {selectedCustomer.is_active ? (
                        <>
                          <Lock size={16} /> Block Customer
                        </>
                      ) : (
                        <>
                          <Unlock size={16} /> Unblock Customer
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================= ADD FLAG MODAL ================= */}
      <AnimatePresence>
        {flagModalCustomer && (
          <div className="cm-modal-overlay" onClick={handleCloseFlagModal}>
            <motion.div
              className="cm-modal-panel"
              style={{ maxWidth: '520px' }}
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.94, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 20 }}
              transition={{ duration: 0.25 }}
            >
              <div className="cm-modal-header">
                <h4 className="cm-modal-title d-flex align-items-center gap-2 text-danger">
                  <Flag size={20} /> Flag Customer
                </h4>
                <button className="cm-modal-close" onClick={handleCloseFlagModal}>
                  <X size={20} />
                </button>
              </div>

              <div className="cm-modal-body">
                <p className="text-muted small mb-3">
                  Flagging alerts other staff and managers when orders arrive from this customer:
                  <strong className="d-block text-dark mt-1">
                    {flagModalCustomer.full_name} ({flagModalCustomer.phone || flagModalCustomer.username})
                  </strong>
                </p>

                {/* Quick Presets */}
                <label className="form-label fw-semibold text-dark small">Quick Preset Reasons:</label>
                <div className="cm-presets-list">
                  {PRESET_REASONS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      className="cm-preset-btn"
                      onClick={() => setFlagReason(preset)}
                    >
                      {preset}
                    </button>
                  ))}
                </div>

                {/* Custom Textarea */}
                <div className="mb-4">
                  <label className="form-label fw-semibold text-dark small">Flag Reason / Note:</label>
                  <textarea
                    rows={4}
                    className="form-control"
                    placeholder="Describe why this customer is being flagged..."
                    value={flagReason}
                    onChange={(e) => setFlagReason(e.target.value)}
                  />
                </div>

                <div className="d-flex justify-content-end gap-2">
                  <button className="btn btn-light" onClick={handleCloseFlagModal}>
                    Cancel
                  </button>
                  <button
                    className="btn btn-danger fw-bold d-flex align-items-center gap-2"
                    onClick={handleSubmitFlag}
                    disabled={submittingFlag}
                  >
                    {submittingFlag ? (
                      <>
                        <span className="spinner-border spinner-border-sm" /> Submitting...
                      </>
                    ) : (
                      <>
                        <Flag size={16} /> Submit Flag
                      </>
                    )}
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

export default CustomerManagement;