// src/pages/admin/menu/AddMenuItem.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import Swal from 'sweetalert2';
import toast from 'react-hot-toast';
import { ArrowLeft, Upload, X, Check, Utensils, Plus, Trash2, Layers } from 'lucide-react';
import { createMenuItem } from '../../../service/menuItemService';
import { getCategories } from '../../../service/categoryService';
import { getShops } from '../../../service/shopService';
import { compressImageForUpload } from '../../../utils/imageCompressor';
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
  const [imageMeta, setImageMeta] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

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

  const [hasVariants, setHasVariants] = useState(false);
  const [variants, setVariants] = useState([]);

  const handleToggleVariants = (e) => {
    const checked = e.target.checked;
    setHasVariants(checked);
    if (checked && variants.length === 0) {
      setVariants([
        { name: 'Normal / Medium', price: formData.base_price || '', is_available: true },
        { name: 'Large', price: '', is_available: true },
        { name: 'Butter', price: '', is_available: true },
      ]);
    }
  };

  const handleAddVariant = () => {
    setVariants((prev) => [
      ...prev,
      { name: '', price: '', is_available: true },
    ]);
  };

  const handleRemoveVariant = (index) => {
    setVariants((prev) => prev.filter((_, i) => i !== index));
  };

  const handleVariantChange = (index, field, value) => {
    setVariants((prev) =>
      prev.map((v, i) => (i === index ? { ...v, [field]: value } : v))
    );
  };

  const handleTextChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 25 * 1024 * 1024) {
        toast.error(`Image size is ${(file.size / (1024 * 1024)).toFixed(1)} MB. Please select an image under 25 MB.`);
        return;
      }
      const rawSizeMB = file.size / (1024 * 1024);
      const rawSizeStr = rawSizeMB >= 1 ? `${rawSizeMB.toFixed(1)} MB` : `${Math.round(file.size / 1024)} KB`;
      setImagePreview(URL.createObjectURL(file));

      try {
        let compressed = file;
        if (file.size > 350 * 1024) {
          const toastId = toast.loading('Optimizing image for fast upload...');
          compressed = await compressImageForUpload(file, { maxWidth: 1200, maxHeight: 1200, quality: 0.88 });
          toast.dismiss(toastId);
        }
        setImageFile(compressed);
        const optSizeKB = Math.round(compressed.size / 1024);
        const optSizeStr = optSizeKB > 1024 ? `${(optSizeKB / 1024).toFixed(1)} MB` : `${optSizeKB} KB`;
        setImageMeta({
          name: file.name,
          rawSize: rawSizeStr,
          sizeStr: optSizeStr,
          isOptimized: compressed.size < file.size,
        });
        toast.success(`Image optimized & ready (${optSizeStr})`);
      } catch (err) {
        console.error('Compression error:', err);
        setImageFile(file);
        setImageMeta({ name: file.name, sizeStr: rawSizeStr, isOptimized: false });
      }
    }
  };

  const handleClearImage = (e) => {
    e.stopPropagation();
    setImageFile(null);
    setImagePreview(null);
    setImageMeta(null);
    setUploadProgress(0);
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
    let basePriceToSave = formData.base_price;
    let validVariants = [];

    if (hasVariants) {
      validVariants = variants
        .map((v) => ({
          name: v.name.trim(),
          price: Number(v.price),
          is_available: v.is_available !== false,
        }))
        .filter((v) => v.name && v.price > 0);

      if (validVariants.length === 0) {
        toast.error('Please add at least one variant with a valid name and price');
        return;
      }
      if (!basePriceToSave || Number(basePriceToSave) <= 0) {
        basePriceToSave = validVariants[0].price;
      }
    } else {
      if (!formData.base_price || Number(formData.base_price) <= 0) {
        toast.error('Please enter a valid price');
        return;
      }
    }

    const data = new FormData();
    data.append('category', formData.category);
    data.append('name', formData.name.trim());
    data.append('description', formData.description.trim());
    data.append('base_price', basePriceToSave);
    data.append('is_available', formData.is_available);
    data.append('is_active', true);

    if (hasVariants && validVariants.length > 0) {
      data.append('variants', JSON.stringify(validVariants));
    }

    if (userRole === 'super_admin' && formData.shop) {
      data.append('shop', formData.shop);
    }
    if (imageFile) {
      // Final guarantee against 413 Entity Too Large
      const finalImage = await compressImageForUpload(imageFile, { maxWidth: 1200, maxHeight: 1200, quality: 0.88 });
      data.append('image', finalImage);
    }

    try {
      setLoading(true);
      setUploadProgress(0);
      await createMenuItem(data, (progressEvent) => {
        if (progressEvent.total) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percent);
        }
      });
      toast.success('Menu item added successfully!');
      navigate(`${basePath}/menu-items`);
    } catch (error) {
      console.error(error);
      const is413 = error.response?.status === 413 || error.message?.includes('413');
      Swal.fire({
        icon: 'error',
        title: is413 ? 'Payload Too Large (413)' : 'Creation Failed',
        text: is413
          ? 'Server rejected file size (Nginx 413). The image is now auto-compressed to prevent this.'
          : error.response?.data?.detail || error.response?.data?.image?.[0] || 'Something went wrong while adding the item.',
      });
    } finally {
      setLoading(false);
      setUploadProgress(0);
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
                <label className="menu-form-label">
                  {hasVariants ? 'Base / Starting Price (₹)' : 'Price (₹) *'}
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  name="base_price"
                  className="menu-form-input"
                  placeholder={hasVariants ? 'Optional (auto-set from first variant)' : 'e.g. 25.00'}
                  value={formData.base_price}
                  onChange={handleTextChange}
                  required={!hasVariants}
                />
              </div>

              {/* Product Variants (Optional) */}
              <div className="menu-form-group" style={{ gridColumn: '1 / -1' }}>
                <div className="p-3 rounded-3 border" style={{ background: '#fdfbf7', borderColor: '#e2d9cc' }}>
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <label className="d-flex align-items-center gap-2 m-0 fw-bold text-dark" style={{ cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={hasVariants}
                        onChange={handleToggleVariants}
                        style={{ width: '18px', height: '18px', accentColor: '#731322' }}
                      />
                      <Layers size={18} className="text-warning" />
                      <span>Has Different Variants (e.g. Normal, Large, Butter)</span>
                    </label>
                    {hasVariants && (
                      <button
                        type="button"
                        onClick={handleAddVariant}
                        className="btn btn-sm btn-outline-dark d-inline-flex align-items-center gap-1 rounded-pill px-3"
                      >
                        <Plus size={14} /> Add Variant
                      </button>
                    )}
                  </div>

                  <p className="small text-muted mb-2">
                    Enable this if this food item comes in multiple sizes or varieties (e.g. Afghani Naan: Normal ₹15, Large ₹25, Butter ₹35). Customers will select a variant before adding to cart.
                  </p>

                  {hasVariants && (
                    <div className="d-flex flex-column gap-2 mt-2">
                      {variants.map((variant, idx) => (
                        <div
                          key={idx}
                          className="d-flex align-items-center gap-2 p-2 rounded-2 bg-white border"
                        >
                          <input
                            type="text"
                            placeholder="Variant Name (e.g. Normal, Large, Butter)"
                            className="form-control form-control-sm"
                            value={variant.name}
                            onChange={(e) => handleVariantChange(idx, 'name', e.target.value)}
                            required
                          />
                          <div className="input-group input-group-sm" style={{ maxWidth: '160px' }}>
                            <span className="input-group-text">₹</span>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              placeholder="Price"
                              className="form-control"
                              value={variant.price}
                              onChange={(e) => handleVariantChange(idx, 'price', e.target.value)}
                              required
                            />
                          </div>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger p-1"
                            onClick={() => handleRemoveVariant(idx)}
                            title="Remove variant"
                            disabled={variants.length <= 1}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
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
                    <div className="menu-upload-preview text-center">
                      <img
                        src={imagePreview}
                        alt="Dish Preview"
                        style={{ maxHeight: '200px', objectFit: 'contain', margin: '0 auto', display: 'block' }}
                      />
                      {imageMeta && (
                        <div className="mt-2 d-flex justify-content-center align-items-center gap-2 flex-wrap">
                          <span className="badge bg-secondary" style={{ maxWidth: '200px', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                            {imageMeta.name}
                          </span>
                          <span className={`badge ${imageMeta.isLarge ? 'bg-success' : 'bg-primary'}`}>
                            {imageMeta.sizeStr}
                          </span>
                        </div>
                      )}
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
                      <small className="text-muted">High-res PNG, JPG, or WEBP up to 20MB (Auto-optimized)</small>
                    </div>
                  )}
                </label>
              </div>

              {/* Upload Progress Bar */}
              {loading && uploadProgress > 0 && uploadProgress < 100 && (
                <div className="menu-form-group" style={{ gridColumn: '1 / -1' }}>
                  <div className="d-flex justify-content-between text-muted small mb-1">
                    <span>Uploading high-resolution image...</span>
                    <span className="fw-bold text-primary">{uploadProgress}%</span>
                  </div>
                  <div className="progress" style={{ height: '8px' }}>
                    <div
                      className="progress-bar progress-bar-striped progress-bar-animated bg-warning"
                      role="progressbar"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

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
                    <span className="spinner-border spinner-border-sm me-1" />
                    {uploadProgress > 0 && uploadProgress < 100
                      ? `Uploading (${uploadProgress}%)...`
                      : 'Processing & Optimizing...'}
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