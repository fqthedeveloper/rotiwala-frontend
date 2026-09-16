// src/pages/admin/menu/Categories.jsx
import React, { useEffect, useState, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Swal from 'sweetalert2';
import toast from 'react-hot-toast';
import {
  Layers,
  Plus,
  Search,
  Trash2,
  Edit,
  CheckCircle2,
  XCircle,
  LayoutGrid,
  List,
  RefreshCw,
  FolderOpen,
  X,
} from 'lucide-react';
import { getCategories, deleteCategory, updateCategory } from '../../../service/categoryService';
import './CSS/MenuItems.css';

const Categories = () => {
  const location = useLocation();
  const isManager = location.pathname.startsWith('/manager');
  const basePath = isManager ? '/manager' : '/admin';

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'active' | 'inactive'
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'

  useEffect(() => {
    document.title = 'Categories Management | Roti Wala';
    loadCategories();
  }, []);

  const loadCategories = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);

    try {
      const data = await getCategories();
      setCategories(Array.isArray(data) ? data : data?.results || []);
      if (isManual) toast.success('Categories refreshed');
    } catch (error) {
      console.error(error);
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // KPI Metrics
  const stats = useMemo(() => {
    const total = categories.length;
    const active = categories.filter((c) => c.is_active).length;
    const inactive = total - active;
    return { total, active, inactive };
  }, [categories]);

  // Filtered Categories
  const filteredCategories = useMemo(() => {
    return categories.filter((c) => {
      const matchesSearch = c.name?.toLowerCase().includes(search.toLowerCase());
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && c.is_active) ||
        (statusFilter === 'inactive' && !c.is_active);
      return matchesSearch && matchesStatus;
    });
  }, [categories, search, statusFilter]);

  // Toggle Category Status
  const handleToggleStatus = async (cat) => {
    const newStatus = !cat.is_active;
    const formData = new FormData();
    formData.append('name', cat.name);
    formData.append('is_active', newStatus);

    // Optimistic UI update
    setCategories((prev) =>
      prev.map((item) => (item.id === cat.id ? { ...item, is_active: newStatus } : item))
    );

    try {
      await updateCategory(cat.id, formData);
      toast.success(`Category is now ${newStatus ? 'Active' : 'Inactive'}`);
    } catch (error) {
      console.error(error);
      toast.error('Failed to update status');
      loadCategories();
    }
  };

  // Delete Category
  const handleDelete = async (id, name) => {
    const result = await Swal.fire({
      title: `Delete "${name}"?`,
      text: 'Items linked to this category may be affected.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, Delete',
    });

    if (!result.isConfirmed) return;

    try {
      await deleteCategory(id);
      setCategories((prev) => prev.filter((c) => c.id !== id));
      toast.success('Category deleted successfully');
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: 'error',
        title: 'Delete Failed',
        text: error?.message || 'Could not delete category.',
      });
    }
  };

  return (
    <div className="menu-page-container">
      {/* Top Header */}
      <div className="menu-header">
        <div className="menu-header-title">
          <div className="d-flex align-items-center gap-2">
            <Layers className="text-warning" size={28} />
            <h2>Categories Management</h2>
          </div>
          <p>Organize food categories, assign items, and manage online visibility</p>
        </div>
        <div className="menu-header-actions">
          <button
            type="button"
            className="btn btn-outline-secondary d-flex align-items-center gap-2"
            onClick={() => loadCategories(true)}
            disabled={refreshing || loading}
          >
            <RefreshCw size={16} className={refreshing ? 'spinner-border spinner-border-sm' : ''} />
            Refresh
          </button>
          <Link to={`${basePath}/categories/add`} className="menu-btn-primary">
            <Plus size={18} /> Add Category
          </Link>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="menu-kpi-grid">
        <div className="menu-kpi-card">
          <div className="menu-kpi-icon gold">
            <Layers size={22} />
          </div>
          <div className="menu-kpi-info">
            <h4>{stats.total}</h4>
            <span>Total Categories</span>
          </div>
        </div>

        <div className="menu-kpi-card">
          <div className="menu-kpi-icon green">
            <CheckCircle2 size={22} />
          </div>
          <div className="menu-kpi-info">
            <h4>{stats.active}</h4>
            <span>Active Categories</span>
          </div>
        </div>

        <div className="menu-kpi-card">
          <div className="menu-kpi-icon red">
            <XCircle size={22} />
          </div>
          <div className="menu-kpi-info">
            <h4>{stats.inactive}</h4>
            <span>Inactive / Hidden</span>
          </div>
        </div>

        <div className="menu-kpi-card">
          <div className="menu-kpi-icon blue">
            <FolderOpen size={22} />
          </div>
          <div className="menu-kpi-info">
            <h4>{stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0}%</h4>
            <span>Active Rate</span>
          </div>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="menu-controls-card">
        <div className="menu-search-wrapper">
          <Search size={18} className="menu-search-icon" />
          <input
            type="text"
            className="menu-search-input"
            placeholder="Search categories by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              className="menu-search-clear"
              onClick={() => setSearch('')}
              title="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className="menu-filter-actions">
          <select
            className="menu-select-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>

          <div className="menu-view-switcher">
            <button
              className={`menu-view-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              title="Grid / Cards View"
            >
              <LayoutGrid size={17} />
            </button>
            <button
              className={`menu-view-btn ${viewMode === 'table' ? 'active' : ''}`}
              onClick={() => setViewMode('table')}
              title="Table View"
            >
              <List size={17} />
            </button>
          </div>
        </div>
      </div>

      {/* Content Rendering */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-warning" style={{ width: '3rem', height: '3rem' }} />
          <p className="mt-3 text-muted fw-semibold">Loading categories...</p>
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="card border-0 shadow-sm rounded-4 text-center py-5 px-3">
          <Layers size={52} className="text-muted mx-auto mb-3 opacity-50" />
          <h5 className="fw-bold text-dark">No Categories Found</h5>
          <p className="text-muted mb-4">
            {search || statusFilter !== 'all'
              ? 'Try changing your search keywords or status filter.'
              : 'Create your first category to start organizing your menu items.'}
          </p>
          <Link to={`${basePath}/categories/add`} className="menu-btn-primary mx-auto">
            <Plus size={18} /> Add Category
          </Link>
        </div>
      ) : viewMode === 'grid' ? (
        /* Cards Grid View */
        <motion.div
          className="row g-3"
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
          {filteredCategories.map((cat) => (
            <motion.div
              key={cat.id}
              className="col-12 col-sm-6 col-lg-4 col-xl-3"
              variants={{
                hidden: { opacity: 0, y: 15 },
                visible: { opacity: 1, y: 0 },
              }}
            >
              <div className="category-card h-100">
                <div className="category-card-top">
                  {cat.image ? (
                    <img src={cat.image} alt={cat.name} className="category-img-box" />
                  ) : (
                    <div className="category-icon-box">
                      <Layers size={26} />
                    </div>
                  )}
                  <div className="category-title-wrap flex-fill">
                    <h5 className="text-truncate" title={cat.name}>
                      {cat.name}
                    </h5>
                    <button
                      type="button"
                      className={`category-status-pill ${cat.is_active ? 'active' : 'inactive'}`}
                      onClick={() => handleToggleStatus(cat)}
                      title="Click to toggle visibility"
                    >
                      {cat.is_active ? (
                        <>
                          <CheckCircle2 size={12} /> Active
                        </>
                      ) : (
                        <>
                          <XCircle size={12} /> Inactive
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="category-card-actions">
                  <Link
                    to={`${basePath}/categories/edit/${cat.id}`}
                    className="menu-action-icon-btn edit"
                    title="Edit Category"
                  >
                    <Edit size={16} />
                  </Link>
                  <button
                    type="button"
                    className="menu-action-icon-btn delete"
                    onClick={() => handleDelete(cat.id, cat.name)}
                    title="Delete Category"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        /* Table View */
        <div className="menu-table-card table-responsive">
          <table className="menu-table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCategories.map((cat) => (
                <tr key={cat.id}>
                  <td>
                    <div className="d-flex align-items-center gap-3">
                      {cat.image ? (
                        <img
                          src={cat.image}
                          alt={cat.name}
                          style={{
                            width: 42,
                            height: 42,
                            borderRadius: 10,
                            objectFit: 'cover',
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width: 42,
                            height: 42,
                            borderRadius: 10,
                            background: '#fef3c7',
                            color: '#d97706',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Layers size={20} />
                        </div>
                      )}
                      <span className="fw-bold text-dark">{cat.name}</span>
                    </div>
                  </td>
                  <td>
                    <button
                      type="button"
                      className={`category-status-pill ${cat.is_active ? 'active' : 'inactive'}`}
                      onClick={() => handleToggleStatus(cat)}
                      title="Click to toggle status"
                    >
                      {cat.is_active ? (
                        <>
                          <CheckCircle2 size={12} /> Active
                        </>
                      ) : (
                        <>
                          <XCircle size={12} /> Inactive
                        </>
                      )}
                    </button>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div className="d-inline-flex gap-2">
                      <Link
                        to={`${basePath}/categories/edit/${cat.id}`}
                        className="menu-action-icon-btn edit"
                        title="Edit"
                      >
                        <Edit size={16} />
                      </Link>
                      <button
                        type="button"
                        className="menu-action-icon-btn delete"
                        onClick={() => handleDelete(cat.id, cat.name)}
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Categories;