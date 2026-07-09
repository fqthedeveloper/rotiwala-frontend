import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getCoupons, deleteCoupon } from '../../../service/couponService';
import { toast } from 'react-toastify';   // or use alert()

const Coupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchCoupons = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      const res = await getCoupons(params);
      setCoupons(res.data);
    } catch (err) {
      toast.error('Failed to load coupons');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this coupon?')) return;
    try {
      await deleteCoupon(id);
      toast.success('Coupon deleted');
      fetchCoupons();
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="mb-0">Coupon Management</h3>
        <Link to="/admin/coupons/add" className="btn btn-primary">
          + Add Coupon
        </Link>
      </div>

      {/* Filters */}
      <div className="row g-2 mb-3">
        <div className="col-md-6">
          <input
            type="text"
            className="form-control"
            placeholder="Search by code or name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="col-md-4">
          <select
            className="form-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="expired">Expired</option>
          </select>
        </div>
        <div className="col-md-2">
          <button className="btn btn-outline-secondary w-100" onClick={fetchCoupons}>
            Filter
          </button>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center mt-5">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th>Code</th>
                <th>Name</th>
                <th>Shop</th>
                <th>Type</th>
                <th>Value</th>
                <th>Min. Order</th>
                <th>Max Discount</th>
                <th>Status</th>
                <th>Dates</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((c) => (
                <tr key={c.id}>
                  <td><strong>{c.code}</strong></td>
                  <td>{c.name}</td>
                  <td>{c.shop_name || c.shop}</td>
                  <td>{c.discount_type}</td>
                  <td>
                    {c.discount_type === 'percentage'
                      ? `${c.value}%`
                      : `₹${c.value}`}
                  </td>
                  <td>₹{c.minimum_order_amount}</td>
                  <td>{c.maximum_discount_amount ? `₹${c.maximum_discount_amount}` : '-'}</td>
                  <td>
                    <span
                      className={`badge bg-${
                        c.status === 'active'
                          ? 'success'
                          : c.status === 'expired'
                          ? 'danger'
                          : 'secondary'
                      }`}
                    >
                      {c.status}
                    </span>
                  </td>
                  <td>
                    <small>
                      {new Date(c.start_date).toLocaleDateString()} -{' '}
                      {new Date(c.end_date).toLocaleDateString()}
                    </small>
                  </td>
                  <td>
                    <div className="btn-group btn-group-sm">
                      <Link to={`/admin/coupons/edit/${c.id}`} className="btn btn-outline-primary">
                        Edit
                      </Link>
                      <button
                        className="btn btn-outline-danger"
                        onClick={() => handleDelete(c.id)}
                      >
                        Del
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {coupons.length === 0 && (
                <tr>
                  <td colSpan="10" className="text-center py-4 text-muted">
                    No coupons found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Coupons;