// src/pages/admin/menu/EditCategory.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import Swal from 'sweetalert2';
import toast from 'react-hot-toast';
import { ArrowLeft, Upload, X, Check } from 'lucide-react';
import { getCategoryById, updateCategory } from '../../../service/categoryService';
import './CSS/MenuItems.css';

const EditCategory = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isManager = location.pathname.startsWith('/manager');
  const basePath = isManager ? '/manager' : '/admin';

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    is_active: true,
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    document.title = 'Edit Category | Roti Wala';
    loadCategory();
  }, [id]);

  const loadCategory = async () => {
    try {
      setFetching(true);
      const data = await getCategoryById(id);
      setFormData({
        name: data.name || '',
        is_active: data.is_active !== undefined ? data.is_active : true,
      });
      if (data.image) {
        setImagePreview(data.image);
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to load category data');
      navigate(`${basePath}/categories`);
    } finally {
      setFetching(false);
    }
  };

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
    if (!formData.name.trim()) {
      toast.error('Please enter a category name');
      return;
    }

    const data = new FormData();
    data.append('name', formData.name.trim());
    data.append('is_active', formData.is_active);
    if (imageFile) {
      data.append('image', imageFile);
    }

    try {
      setLoading(true);
      await updateCategory(id, data);
      toast.success('Category updated successfully!');
      navigate(`${basePath}/categories`);
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: 'error',
        title: 'Failed to Update Category',
        text: error.response?.data?.detail || 'An error occurred while saving the changes.',
      });
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="menu-page-container d-flex align-items-center justify-content-center" style={{ minHeight: '60vh' }}>
        <div className="text-center">
          <div className="spinner-border text-warning" style={{ width: '3rem', height: '3rem' }} />
          <p className="mt-3 text-muted fw-semibold">Loading category details...</p>
        </div>
      </div>
    );
  }

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
              onClick={() => navigate(`${basePath}/categories`)}
              title="Go Back"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="menu-form-title">
              <h3>Edit Category</h3>
              <p>Update category name, icon, or online availability</p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div className="menu-form-grid">
              {/* Category Name */}
              <div className="menu-form-group">
                <label className="menu-form-label">Category Name *</label>
                <input
                  type="text"
                  name="name"
                  className="menu-form-input"
                  placeholder="e.g. Afghani Special"
                  value={formData.name}
                  onChange={handleTextChange}
                  required
                />
              </div>

              {/* Category Image Dropzone */}
              <div className="menu-form-group">
                <label className="menu-form-label">Category Icon / Image</label>
                <label className="menu-upload-dropzone d-block">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="d-none"
                  />
                  {imagePreview ? (
                    <div className="menu-upload-preview">
                      <img src={imagePreview} alt="Category Preview" />
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
                      <div className="fw-bold text-dark">Click to browse or replace image</div>
                      <small className="text-muted">PNG, JPG, or WEBP up to 5MB</small>
                    </div>
                  )}
                </label>
              </div>

              {/* Active Toggle Switch */}
              <div className="menu-form-group">
                <label className="menu-form-label">Category Visibility</label>
                <div
                  className="p-3 rounded-3 d-flex align-items-center justify-content-between"
                  style={{ background: 'var(--menu-gray-50)', border: '1.5px solid var(--menu-gray-200)' }}
                >
                  <div>
                    <div className="fw-bold text-dark">Active for Ordering</div>
                    <small className="text-muted">Visible to customers on the online menu</small>
                  </div>
                  <div className="form-check form-switch fs-4 mb-0">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      checked={formData.is_active}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, is_active: e.target.checked }))
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
                onClick={() => navigate(`${basePath}/categories`)}
                disabled={loading}
              >
                Cancel
              </button>
              <button type="submit" className="menu-btn-primary" disabled={loading}>
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-1" /> Updating...
                  </>
                ) : (
                  <>
                    <Check size={18} /> Update Category
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

export default EditCategory;