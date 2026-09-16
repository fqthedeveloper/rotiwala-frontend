// src/pages/admin/menu/MenuItems.jsx
import React, { useEffect, useState, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Swal from 'sweetalert2';
import toast from 'react-hot-toast';
import {
  Utensils,
  Plus,
  Search,
  Trash2,
  Edit,
  CheckCircle2,
  XCircle,
  LayoutGrid,
  List,
  RefreshCw,
  Tag,
  Package,
  X,
  Layers,
} from 'lucide-react';
import {
  getMenuItems,
  deleteMenuItem,
  updateMenuItem,
} from '../../../service/menuItemService';
import { getCategories } from '../../../service/categoryService';
import './CSS/MenuItems.css';

const MenuItems = () => {
  const location = useLocation();
  const isManager = location.pathname.startsWith('/manager');
  const basePath = isManager ? '/manager' : '/admin';

  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [stockFilter, setStockFilter] = useState('all'); // 'all' | 'in_stock' | 'out_of_stock'
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'

  useEffect(() => {
    document.title = 'Menu Items Management | Roti Wala';
    loadData();
  }, []);

  const loadData = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);

    try {
      const [itemsData, catsData] = await Promise.all([
        getMenuItems(),
        getCategories(),
      ]);
      setItems(Array.isArray(itemsData) ? itemsData : itemsData?.results || []);
      setCategories(Array.isArray(catsData) ? catsData : catsData?.results || []);
      if (isManual) toast.success('Menu items refreshed');
    } catch (error) {
      console.error(error);
      toast.error('Failed to load menu items');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // KPI Metrics
  const stats = useMemo(() => {
    const total = items.length;
    const inStock = items.filter((i) => i.is_available).length;
    const outOfStock = total - inStock;
    const totalCategories = categories.length;
    return { total, inStock, outOfStock, totalCategories };
  }, [items, categories]);

  // Filtered Items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch =
        item.name?.toLowerCase().includes(search.toLowerCase()) ||
        item.description?.toLowerCase().includes(search.toLowerCase());

      const matchesCat =
        selectedCategory === 'all' ||
        String(item.category) === String(selectedCategory) ||
        item.category_name === selectedCategory;

      const matchesStock =
        stockFilter === 'all' ||
        (stockFilter === 'in_stock' && item.is_available) ||
        (stockFilter === 'out_of_stock' && !item.is_available);

      return matchesSearch && matchesCat && matchesStock;
    });
  }, [items, search, selectedCategory, stockFilter]);

  // 1-Click Toggle Availability (Instant Stock Control)
  const handleToggleAvailability = async (item) => {
    const newStatus = !item.is_available;
    const formData = new FormData();
    formData.append('name', item.name);
    formData.append('base_price', item.base_price);
    if (item.category) formData.append('category', item.category);
    formData.append('is_available', newStatus);

    // Optimistic UI update
    setItems((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, is_available: newStatus } : i))
    );

    try {
      await updateMenuItem(item.id, formData);
      toast.success(
        `"${item.name}" marked as ${newStatus ? 'Available' : 'Out of Stock'}`
      );
    } catch (error) {
      console.error(error);
      toast.error('Failed to update availability');
      loadData();
    }
  };

  // Delete Item
  const handleDelete = async (id, name) => {
    const result = await Swal.fire({
      title: `Delete "${name}"?`,
      text: 'This item will be permanently removed from the menu.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, Delete',
    });

    if (!result.isConfirmed) return;

    try {
      await deleteMenuItem(id);
      setItems((prev) => prev.filter((i) => i.id !== id));
      toast.success('Item deleted successfully');
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: 'error',
        title: 'Delete Failed',
        text: error?.message || 'Could not delete item.',
      });
    }
  };

  return (
    <div className="menu-page-container">
      {/* Top Header */}
      <div className="menu-header">
        <div className="menu-header-title">
          <div className="d-flex align-items-center gap-2">
            <Utensils className="text-warning" size={28} />
            <h2>Menu Items Management</h2>
          </div>
          <p>Manage dish listings, pricing, live kitchen stock, and categories</p>
        </div>
        <div className="menu-header-actions">
          <button
            type="button"
            className="btn btn-outline-secondary d-flex align-items-center gap-2"
            onClick={() => loadData(true)}
            disabled={refreshing || loading}
          >
            <RefreshCw size={16} className={refreshing ? 'spinner-border spinner-border-sm' : ''} />
            Refresh
          </button>
          <Link to={`${basePath}/menu-items/add`} className="menu-btn-primary">
            <Plus size={18} /> Add Menu Item
          </Link>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="menu-kpi-grid">
        <div className="menu-kpi-card">
          <div className="menu-kpi-icon gold">
            <Utensils size={22} />
          </div>
          <div className="menu-kpi-info">
            <h4>{stats.total}</h4>
            <span>Total Dishes</span>
          </div>
        </div>

        <div className="menu-kpi-card">
          <div className="menu-kpi-icon green">
            <CheckCircle2 size={22} />
          </div>
          <div className="menu-kpi-info">
            <h4>{stats.inStock}</h4>
            <span>Available for Sale</span>
          </div>
        </div>

        <div className="menu-kpi-card">
          <div className="menu-kpi-icon red">
            <XCircle size={22} />
          </div>
          <div className="menu-kpi-info">
            <h4>{stats.outOfStock}</h4>
            <span>Out of Stock</span>
          </div>
        </div>

        <div className="menu-kpi-card">
          <div className="menu-kpi-icon blue">
            <Layers size={22} />
          </div>
          <div className="menu-kpi-info">
            <h4>{stats.totalCategories}</h4>
            <span>Total Categories</span>
          </div>
        </div>
      </div>

      {/* Category Pills Bar */}
      <div className="menu-pills-bar">
        <button
          type="button"
          className={`menu-pill ${selectedCategory === 'all' ? 'active' : ''}`}
          onClick={() => setSelectedCategory('all')}
        >
          All Items ({items.length})
        </button>
        {categories.map((cat) => {
          const count = items.filter(
            (i) => String(i.category) === String(cat.id) || i.category_name === cat.name
          ).length;
          return (
            <button
              key={cat.id}
              type="button"
              className={`menu-pill ${String(selectedCategory) === String(cat.id) ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat.id)}
            >
              {cat.name} ({count})
            </button>
          );
        })}
      </div>

      {/* Search & Filter Controls */}
      <div className="menu-controls-card">
        <div className="menu-search-wrapper">
          <Search size={18} className="menu-search-icon" />
          <input
            type="text"
            className="menu-search-input"
            placeholder="Search items by title or description..."
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
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
          >
            <option value="all">All Availability</option>
            <option value="in_stock">In Stock Only</option>
            <option value="out_of_stock">Out of Stock Only</option>
          </select>

          <div className="menu-view-switcher">
            <button
              className={`menu-view-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              title="Cards Grid View"
            >
              <LayoutGrid size={17} />
            </button>
            <button
              className={`menu-view-btn ${viewMode === 'table' ? 'active' : ''}`}
              onClick={() => setViewMode('table')}
              title="Data Table View"
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
          <p className="mt-3 text-muted fw-semibold">Loading menu items...</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="card border-0 shadow-sm rounded-4 text-center py-5 px-3">
          <Utensils size={52} className="text-muted mx-auto mb-3 opacity-50" />
          <h5 className="fw-bold text-dark">No Menu Items Found</h5>
          <p className="text-muted mb-4">
            {search || selectedCategory !== 'all' || stockFilter !== 'all'
              ? 'Try changing your search terms or category/stock filters.'
              : 'Add your first delicious dish to get your menu ready!'}
          </p>
          <Link to={`${basePath}/menu-items/add`} className="menu-btn-primary mx-auto">
            <Plus size={18} /> Add Menu Item
          </Link>
        </div>
      ) : viewMode === 'grid' ? (
        /* Cards Grid View */
        <motion.div
          className="menu-items-grid"
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
          {filteredItems.map((item) => (
            <motion.div
              key={item.id}
              className="menu-item-card"
              variants={{
                hidden: { opacity: 0, y: 15 },
                visible: { opacity: 1, y: 0 },
              }}
            >
              {/* Image & Badges */}
              <div className="menu-item-image-wrapper">
                {item.image_url || item.image ? (
                  <img
                    src={item.image_url || item.image}
                    alt={item.name}
                    className="menu-item-img"
                  />
                ) : (
                  <div className="menu-item-img-placeholder">
                    <Utensils size={36} />
                  </div>
                )}
                <span className="menu-item-price-tag">₹{item.base_price}</span>
                {item.category_name && (
                  <span className="menu-item-category-tag">
                    <Tag size={11} className="me-1" />
                    {item.category_name}
                  </span>
                )}
              </div>

              {/* Body */}
              <div className="menu-item-body">
                <div className="menu-item-title-row">
                  <h4 className="menu-item-title">{item.name}</h4>
                </div>

                <p className="menu-item-desc">
                  {item.description || 'Freshly prepared signature dish.'}
                </p>

                {/* Footer with Instant Stock Switch */}
                <div className="menu-item-footer">
                  <button
                    type="button"
                    className={`menu-availability-switch ${
                      item.is_available ? 'available' : 'unavailable'
                    }`}
                    onClick={() => handleToggleAvailability(item)}
                    title="Click to toggle availability"
                  >
                    {item.is_available ? (
                      <>
                        <CheckCircle2 size={14} /> In Stock
                      </>
                    ) : (
                      <>
                        <XCircle size={14} /> Out of Stock
                      </>
                    )}
                  </button>

                  <div className="menu-card-actions">
                    <Link
                      to={`${basePath}/menu-items/edit/${item.id}`}
                      className="menu-action-icon-btn edit"
                      title="Edit Item"
                    >
                      <Edit size={15} />
                    </Link>
                    <button
                      type="button"
                      className="menu-action-icon-btn delete"
                      onClick={() => handleDelete(item.id, item.name)}
                      title="Delete Item"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
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
                <th>Dish</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div className="d-flex align-items-center gap-3">
                      {item.image_url || item.image ? (
                        <img
                          src={item.image_url || item.image}
                          alt={item.name}
                          style={{
                            width: 46,
                            height: 46,
                            borderRadius: 10,
                            objectFit: 'cover',
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width: 46,
                            height: 46,
                            borderRadius: 10,
                            background: '#fef3c7',
                            color: '#d97706',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Utensils size={20} />
                        </div>
                      )}
                      <div>
                        <div className="fw-bold text-dark">{item.name}</div>
                        {item.description && (
                          <small className="text-muted d-block text-truncate" style={{ maxWidth: 260 }}>
                            {item.description}
                          </small>
                        )}
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="badge bg-light text-dark border">
                      {item.category_name || '—'}
                    </span>
                  </td>
                  <td>
                    <span className="fw-bold text-dark fs-6">₹{item.base_price}</span>
                  </td>
                  <td>
                    <button
                      type="button"
                      className={`menu-availability-switch ${
                        item.is_available ? 'available' : 'unavailable'
                      }`}
                      onClick={() => handleToggleAvailability(item)}
                      title="Click to toggle stock"
                    >
                      {item.is_available ? (
                        <>
                          <CheckCircle2 size={14} /> In Stock
                        </>
                      ) : (
                        <>
                          <XCircle size={14} /> Out of Stock
                        </>
                      )}
                    </button>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div className="d-inline-flex gap-2">
                      <Link
                        to={`${basePath}/menu-items/edit/${item.id}`}
                        className="menu-action-icon-btn edit"
                        title="Edit"
                      >
                        <Edit size={16} />
                      </Link>
                      <button
                        type="button"
                        className="menu-action-icon-btn delete"
                        onClick={() => handleDelete(item.id, item.name)}
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

export default MenuItems;