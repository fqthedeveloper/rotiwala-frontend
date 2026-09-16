// src/pages/admin/menu/AddMenuItem.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import Swal from 'sweetalert2';
import toast from 'react-hot-toast';
import { ArrowLeft, Upload, X, Check, Utensils } from 'lucide-react';
import { createMenuItem } from '../../../service/menuItemService';
import { getCategories } from '../../../service/categoryService';
import { getShops } from '../../../service/shopService';
import './CSS/MenuItems.css';

const AddMenuItem = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isManager = location.pathname.startsWith('/manager');
  const basePath = isManager ? '/manager' : '/admin';

  const [categories, setCategories] = useState([]);
  const [shops, setShops] = useState([]);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    shop: '',
    category: '',
    name: '',
    description: '',
    base_price: '',
    is_available: true,
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    document.title = 'Add Menu Item | Roti Wala';

    const loadData = async () => {
      try {
        const cats = await getCategories();
        setCategories(Array.isArray(cats) ? cats : cats?.results || []);

        const userStr = localStorage.getItem('user');
        if (userStr) {
          const user = JSON.parse(userStr);
          setUserRole(user.role);
          if (user.role === 'super_admin') {
            const shopsData = await getShops();
            setShops(Array.isArray(shopsData) ? shopsData : shopsData?.results || []);
          }
        }
      } catch (error) {
        console.error(error);
        toast.error('Failed to load initial form data');
      }
    };

    loadData();
  }, []);

  const handleTextChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleClearImage = (e) => {
    e.stopPropagation();
    setImageFile(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (userRole === 'super_admin' && !formData.shop) {
      toast.error('Please select a shop');
      return;
    }
    if (!formData.category) {
      toast.error('Please select a category');
      return;
    }
    if (!formData.name.trim()) {
      toast.error('Please enter the dish name');
      return;
    }
    if (!formData.base_price || Number(formData.base_price) <= 0) {
      toast.error('Please enter a valid price');
      return;
    }

    const data = new FormData();
    data.append('category', formData.category);
    data.append('name', formData.name.trim());
    data.append('description', formData.description.trim());
    data.append('base_price', formData.base_price);
    data.append('is_available', formData.is_available);

    if (userRole === 'super_admin' && formData.shop) {
      data.append('shop', formData.shop);
    }
    if (imageFile) {
      data.append('image', imageFile);
    }

    try {
      setLoading(true);
      await createMenuItem(data);
      toast.success('Menu item added successfully!');
      navigate(`${basePath}/menu-items`);
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: 'error',
        title: 'Creation Failed',
        text: error.response?.data?.detail || 'Something went wrong while adding the item.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="menu-page-container">
      <div className="menu-form-container">
        <motion.div
          className="menu-form-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Header */}
          <div className="menu-form-header">
            <button
              type="button"
              className="menu-form-back-btn"
              onClick={() => navigate(`${basePath}/menu-items`)}
              title="Go Back"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="menu-form-title">
              <h3>Add New Menu Item</h3>
              <p>Add a new dish to your restaurant catalogue</p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div className="menu-form-grid two-col">
              {/* Shop Selector (Only Super Admin) */}
              {userRole === 'super_admin' && (
                <div className="menu-form-group">
                  <label className="menu-form-label">Shop *</label>
                  <select
                    name="shop"
                    className="menu-form-select"
                    value={formData.shop}
                    onChange={handleTextChange}
                    required
                  >
                    <option value="">Select Shop</option>
                    {shops.map((shop) => (
                      <option key={shop.id} value={shop.id}>
                        {shop.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Category Selector */}
              <div className="menu-form-group">
                <label className="menu-form-label">Category *</label>
                <select
                  name="category"
                  className="menu-form-select"
                  value={formData.category}
                  onChange={handleTextChange}
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Dish Name */}
              <div className="menu-form-group">
                <label className="menu-form-label">Dish Name *</label>
                <input
                  type="text"
                  name="name"
                  className="menu-form-input"
                  placeholder="e.g. Butter Garlic Naan"
                  value={formData.name}
                  onChange={handleTextChange}
                  required
                />
              </div>

              {/* Price */}
              <div className="menu-form-group">
                <label className="menu-form-label">Price (₹) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  name="base_price"
                  className="menu-form-input"
                  placeholder="e.g. 25.00"
                  value={formData.base_price}
                  onChange={handleTextChange}
                  required
                />
              </div>

              {/* Description */}
              <div className="menu-form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="menu-form-label">Description</label>
                <textarea
                  rows="3"
                  name="description"
                  className="menu-form-textarea"
                  placeholder="Ingredients, preparation style, or taste profile..."
                  value={formData.description}
                  onChange={handleTextChange}
                />
              </div>

              {/* Image Upload Dropzone */}
              <div className="menu-form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="menu-form-label">Dish Photo (Optional)</label>
                <label className="menu-upload-dropzone d-block">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="d-none"
                  />
                  {imagePreview ? (
                    <div className="menu-upload-preview">
                      <img src={imagePreview} alt="Dish Preview" />
                      <button
                        type="button"
                        className="menu-upload-clear-btn"
                        onClick={handleClearImage}
                        title="Remove image"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <div className="py-2 text-center">
                      <Upload size={32} className="text-warning mb-2 mx-auto d-block" />
                      <div className="fw-bold text-dark">Click to browse or drop an appetizing photo</div>
                      <small className="text-muted">PNG, JPG, or WEBP up to 5MB</small>
                    </div>
                  )}
                </label>
              </div>

              {/* Available for Sale Switch */}
              <div className="menu-form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="menu-form-label">Availability Status</label>
                <div
                  className="p-3 rounded-3 d-flex align-items-center justify-content-between"
                  style={{ background: 'var(--menu-gray-50)', border: '1.5px solid var(--menu-gray-200)' }}
                >
                  <div>
                    <div className="fw-bold text-dark">Available for Sale</div>
                    <small className="text-muted">Customers and cashier can order this item</small>
                  </div>
                  <div className="form-check form-switch fs-4 mb-0">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      checked={formData.is_available}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, is_available: e.target.checked }))
                      }
                      role="switch"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="menu-form-actions">
              <button
                type="button"
                className="menu-btn-secondary"
                onClick={() => navigate(`${basePath}/menu-items`)}
                disabled={loading}
              >
                Cancel
              </button>
              <button type="submit" className="menu-btn-primary" disabled={loading}>
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-1" /> Creating...
                  </>
                ) : (
                  <>
                    <Check size={18} /> Create Menu Item
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default AddMenuItem;