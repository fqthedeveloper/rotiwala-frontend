import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { getCoupon, createCoupon, updateCoupon } from '../../../service/couponService';
import { getShops } from '../../../service/shopService';
import { toast } from 'react-toastify';

const CouponForm = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const initial = {
    code: '',
    name: '',
    description: '',
    shop: '',
    discount_type: 'percentage',
    value: '',
    minimum_order_amount: '0',
    maximum_discount_amount: '',
    first_order_only: false,
    auto_generate: false,
    send_notification: true,
    status: 'active',
    start_date: '',
    end_date: '',
  };

  const [form, setForm] = useState(initial);
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingShops, setLoadingShops] = useState(false);

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

  // ---------- Load Coupon when editing ----------
  useEffect(() => {
    if (isEdit) {
      const fetchCoupon = async () => {
        try {
          const res = await getCoupon(id);
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
          console.error('Failed to load coupon:', err);
          toast.error('Failed to load coupon');
        }
      };
      fetchCoupon();
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
        await updateCoupon(id, form);
        toast.success('Coupon updated');
      } else {
        await createCoupon(form);
        toast.success('Coupon created');
      }
      navigate('/admin/coupons');
    } catch (err) {
      console.error('Submit error:', err);
      toast.error(err.response?.data?.detail || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid py-4">
      <h3 className="mb-4">{isEdit ? 'Edit Coupon' : 'Create Coupon'}</h3>

      <form onSubmit={handleSubmit} className="row g-3">
        {/* ----- Code & Name ----- */}
        <div className="col-md-6">
          <label className="form-label">Code *</label>
          <input
            name="code"
            className="form-control"
            value={form.code}
            onChange={handleChange}
            required
            disabled={isEdit} // code cannot be changed after creation
          />
        </div>
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

        {/* ----- Description ----- */}
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

        {/* ----- Shop ----- */}
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

        {/* ----- Discount Type & Value ----- */}
        <div className="col-md-3">
          <label className="form-label">Discount Type</label>
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

        {/* ----- Min Order & Max Discount ----- */}
        <div className="col-md-4">
          <label className="form-label">Min. Order Amount</label>
          <input
            name="minimum_order_amount"
            type="number"
            step="0.01"
            className="form-control"
            value={form.minimum_order_amount}
            onChange={handleChange}
          />
        </div>

        <div className="col-md-4">
          <label className="form-label">Max Discount (optional)</label>
          <input
            name="maximum_discount_amount"
            type="number"
            step="0.01"
            className="form-control"
            value={form.maximum_discount_amount}
            onChange={handleChange}
          />
        </div>

        {/* ----- Status ----- */}
        <div className="col-md-4">
          <label className="form-label">Status</label>
          <select
            name="status"
            className="form-select"
            value={form.status}
            onChange={handleChange}
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="expired">Expired</option>
          </select>
        </div>

        {/* ----- Dates ----- */}
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

        {/* ----- Toggles ----- */}
        <div className="col-12">
          <div className="d-flex flex-wrap gap-4">
            <div className="form-check form-switch">
              <input
                className="form-check-input"
                type="checkbox"
                id="firstOrderOnly"
                name="first_order_only"
                checked={form.first_order_only}
                onChange={handleChange}
              />
              <label className="form-check-label" htmlFor="firstOrderOnly">
                First Order Only
              </label>
            </div>

            <div className="form-check form-switch">
              <input
                className="form-check-input"
                type="checkbox"
                id="autoGenerate"
                name="auto_generate"
                checked={form.auto_generate}
                onChange={handleChange}
              />
              <label className="form-check-label" htmlFor="autoGenerate">
                Auto Generate
              </label>
            </div>

            <div className="form-check form-switch">
              <input
                className="form-check-input"
                type="checkbox"
                id="sendNotification"
                name="send_notification"
                checked={form.send_notification}
                onChange={handleChange}
              />
              <label className="form-check-label" htmlFor="sendNotification">
                Send Notification
              </label>
            </div>
          </div>
        </div>

        {/* ----- Actions ----- */}
        <div className="col-12">
          <button type="submit" className="btn btn-primary me-2" disabled={loading}>
            {loading ? 'Saving...' : 'Save'}
          </button>
          <Link to="/admin/coupons" className="btn btn-outline-secondary">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
};

export default CouponForm;