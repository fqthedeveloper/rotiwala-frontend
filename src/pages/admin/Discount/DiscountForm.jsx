import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { getDiscount, createDiscount, updateDiscount } from '../../../service/discountService';
import { getItemsByCategory, getCategoriesByShop } from '../../../service/menuItemService';
import { getShops } from '../../../service/shopService';
import { toast } from 'react-toastify';

const DiscountForm = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const initial = {
    name: '',
    description: '',
    shop: '',
    apply_on: 'shop',
    category: '',
    menu_item: '',
    discount_type: 'percentage',
    value: '',
    minimum_order_amount: '0',
    maximum_discount_amount: '',
    is_active: true,
    start_date: '',
    end_date: '',
    badge_text: 'SALE',
    banner_color: '#FF9800',
    featured: false,
    send_notification: false,
    notification_title: '',
    notification_body: '',
    terms_and_conditions: '',
  };

  const [form, setForm] = useState(initial);
  const [shops, setShops] = useState([]);
  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingShops, setLoadingShops] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [loadingItems, setLoadingItems] = useState(false);

  // ---------- Load Shops ----------
  useEffect(() => {
    setLoadingShops(true);
    getShops()
      .then((data) => {
        setShops(data);
        setLoadingShops(false);
      })
      .catch((err) => {
        console.error('Failed to load shops:', err);
        toast.error('Failed to load shops');
        setLoadingShops(false);
      });
  }, []);

  // ---------- Load Categories when shop changes ----------
  useEffect(() => {
    if (form.shop && form.apply_on === 'category') {
      setLoadingCategories(true);
      getCategoriesByShop(form.shop)
        .then((data) => {
          setCategories(data);
          setLoadingCategories(false);
        })
        .catch((err) => {
          console.error('Failed to load categories:', err);
          toast.error('Failed to load categories');
          setLoadingCategories(false);
        });
    } else {
      setCategories([]); // clear when not needed
    }
  }, [form.shop, form.apply_on]);

  // ---------- Load Menu Items when category changes ----------
  useEffect(() => {
    if (form.category && form.apply_on === 'item') {
      setLoadingItems(true);
      getItemsByCategory(form.category)
        .then((data) => {
          setMenuItems(data);
          setLoadingItems(false);
        })
        .catch((err) => {
          console.error('Failed to load menu items:', err);
          toast.error('Failed to load menu items');
          setLoadingItems(false);
        });
    } else {
      setMenuItems([]);
    }
  }, [form.category, form.apply_on]);

  // ---------- Load existing discount when editing ----------
  useEffect(() => {
    if (isEdit) {
      const fetchDiscount = async () => {
        try {
          const res = await getDiscount(id);
          const d = res.data;
          setForm({
            ...d,
            // Ensure numeric fields are never null (React controlled input issue)
            value: d.value ?? '',
            minimum_order_amount: d.minimum_order_amount ?? '0',
            maximum_discount_amount: d.maximum_discount_amount ?? '',
            start_date: d.start_date ? d.start_date.substring(0, 16) : '',
            end_date: d.end_date ? d.end_date.substring(0, 16) : '',
          });
        } catch (err) {
          console.error('Failed to load discount:', err);
          toast.error('Failed to load discount');
        }
      };
      fetchDiscount();
    }
  }, [id, isEdit]);

  // ---------- Handle form field changes ----------
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // ---------- Submit ----------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEdit) {
        await updateDiscount(id, form);
        toast.success('Discount updated');
      } else {
        await createDiscount(form);
        toast.success('Discount created');
      }
      navigate('/admin/discounts');
    } catch (err) {
      console.error('Submit error:', err);
      toast.error(err.response?.data?.detail || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid py-4">
      <h3 className="mb-4">{isEdit ? 'Edit Discount' : 'Create Discount'}</h3>

      <form onSubmit={handleSubmit} className="row g-3">
        {/* ----- Basic Info ----- */}
        <div className="col-md-6">
          <label className="form-label">Name *</label>
          <input
            name="name"
            className="form-control"
            value={form.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="col-md-6">
          <label className="form-label">Shop *</label>
          <select
            name="shop"
            className="form-select"
            value={form.shop}
            onChange={handleChange}
            required
            disabled={loadingShops}
          >
            <option value="">-- Select Shop --</option>
            {shops.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
          {loadingShops && <small className="text-muted">Loading shops...</small>}
        </div>

        <div className="col-12">
          <label className="form-label">Description</label>
          <textarea
            name="description"
            className="form-control"
            rows="2"
            value={form.description}
            onChange={handleChange}
          />
        </div>

        {/* ----- Apply On ----- */}
        <div className="col-md-4">
          <label className="form-label">Apply On</label>
          <select
            name="apply_on"
            className="form-select"
            value={form.apply_on}
            onChange={handleChange}
          >
            <option value="shop">Entire Shop</option>
            <option value="category">Category</option>
            <option value="item">Menu Item</option>
          </select>
        </div>

        {form.apply_on === 'category' && (
          <div className="col-md-4">
            <label className="form-label">Category *</label>
            <select
              name="category"
              className="form-select"
              value={form.category}
              onChange={handleChange}
              required
              disabled={loadingCategories}
            >
              <option value="">-- Select Category --</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            {loadingCategories && <small className="text-muted">Loading categories...</small>}
          </div>
        )}

        {form.apply_on === 'item' && (
          <div className="col-md-4">
            <label className="form-label">Menu Item *</label>
            <select
              name="menu_item"
              className="form-select"
              value={form.menu_item}
              onChange={handleChange}
              required
              disabled={loadingItems}
            >
              <option value="">-- Select Item --</option>
              {menuItems.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
            {loadingItems && <small className="text-muted">Loading items...</small>}
          </div>
        )}

        {/* ----- Discount Details ----- */}
        <div className="col-md-3">
          <label className="form-label">Type</label>
          <select
            name="discount_type"
            className="form-select"
            value={form.discount_type}
            onChange={handleChange}
          >
            <option value="percentage">Percentage</option>
            <option value="fixed">Fixed Amount</option>
          </select>
        </div>

        <div className="col-md-3">
          <label className="form-label">Value *</label>
          <input
            name="value"
            type="number"
            step="0.01"
            className="form-control"
            value={form.value}
            onChange={handleChange}
            required
          />
        </div>

        <div className="col-md-3">
          <label className="form-label">Min. Order</label>
          <input
            name="minimum_order_amount"
            type="number"
            step="0.01"
            className="form-control"
            value={form.minimum_order_amount}
            onChange={handleChange}
          />
        </div>

        <div className="col-md-3">
          <label className="form-label">Max Discount</label>
          <input
            name="maximum_discount_amount"
            type="number"
            step="0.01"
            className="form-control"
            value={form.maximum_discount_amount}
            onChange={handleChange}
          />
        </div>

        {/* ----- Dates & Status ----- */}
        <div className="col-md-6">
          <label className="form-label">Start Date *</label>
          <input
            type="datetime-local"
            name="start_date"
            className="form-control"
            value={form.start_date}
            onChange={handleChange}
            required
          />
        </div>

        <div className="col-md-6">
          <label className="form-label">End Date *</label>
          <input
            type="datetime-local"
            name="end_date"
            className="form-control"
            value={form.end_date}
            onChange={handleChange}
            required
          />
        </div>

        <div className="col-md-4">
          <div className="form-check form-switch mt-4">
            <input
              className="form-check-input"
              type="checkbox"
              id="isActive"
              name="is_active"
              checked={form.is_active}
              onChange={handleChange}
            />
            <label className="form-check-label" htmlFor="isActive">
              Active
            </label>
          </div>
        </div>

        <div className="col-md-4">
          <div className="form-check form-switch mt-4">
            <input
              className="form-check-input"
              type="checkbox"
              id="featured"
              name="featured"
              checked={form.featured}
              onChange={handleChange}
            />
            <label className="form-check-label" htmlFor="featured">
              Featured
            </label>
          </div>
        </div>

        <div className="col-md-4">
          <div className="form-check form-switch mt-4">
            <input
              className="form-check-input"
              type="checkbox"
              id="sendNotif"
              name="send_notification"
              checked={form.send_notification}
              onChange={handleChange}
            />
            <label className="form-check-label" htmlFor="sendNotif">
              Send Notification
            </label>
          </div>
        </div>

        {/* ----- Banner & Badge ----- */}
        <div className="col-md-4">
          <label className="form-label">Badge Text</label>
          <input
            name="badge_text"
            className="form-control"
            value={form.badge_text}
            onChange={handleChange}
          />
        </div>

        <div className="col-md-4">
          <label className="form-label">Banner Color</label>
          <input
            type="color"
            name="banner_color"
            className="form-control form-control-color"
            value={form.banner_color}
            onChange={handleChange}
          />
        </div>

        {/* ----- Notification ----- */}
        <div className="col-md-6">
          <label className="form-label">Notification Title</label>
          <input
            name="notification_title"
            className="form-control"
            value={form.notification_title}
            onChange={handleChange}
          />
        </div>

        <div className="col-md-6">
          <label className="form-label">Notification Body</label>
          <input
            name="notification_body"
            className="form-control"
            value={form.notification_body}
            onChange={handleChange}
          />
        </div>

        {/* ----- Terms ----- */}
        <div className="col-12">
          <label className="form-label">Terms & Conditions</label>
          <textarea
            name="terms_and_conditions"
            className="form-control"
            rows="3"
            value={form.terms_and_conditions}
            onChange={handleChange}
          />
        </div>

        {/* ----- Actions ----- */}
        <div className="col-12">
          <button type="submit" className="btn btn-primary me-2" disabled={loading}>
            {loading ? 'Saving...' : 'Save'}
          </button>
          <Link to="/admin/discounts" className="btn btn-outline-secondary">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
};

export default DiscountForm;