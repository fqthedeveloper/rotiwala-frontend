import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getDiscounts, deleteDiscount } from '../../../service/discountService';
import { toast } from 'react-toastify';

const Discounts = () => {
  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchDiscounts = useCallback(async () => {
    try {
      setLoading(true);
      const params = search ? { search } : {};
      const res = await getDiscounts(params);
      setDiscounts(res.data);
    } catch (err) {
      toast.error('Failed to load discounts');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchDiscounts();
  }, [fetchDiscounts]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this discount?')) return;
    try {
      await deleteDiscount(id);
      toast.success('Discount deleted');
      fetchDiscounts();
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  const statusBadge = (discount) => {
    const now = new Date();
    const start = new Date(discount.start_date);
    const end = new Date(discount.end_date);
    if (!discount.is_active) return { text: 'Inactive', color: 'secondary' };
    if (now < start) return { text: 'Upcoming', color: 'info' };
    if (now > end) return { text: 'Expired', color: 'danger' };
    return { text: 'Active', color: 'success' };
  };

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="mb-0">Discount Management</h3>
        <Link to="/admin/discounts/add" className="btn btn-primary">
          + Add Discount
        </Link>
      </div>

      <div className="row g-2 mb-3">
        <div className="col-md-8">
          <input
            type="text"
            className="form-control"
            placeholder="Search by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="col-md-4">
          <button className="btn btn-outline-secondary w-100" onClick={fetchDiscounts}>
            Search
          </button>
        </div>
      </div>

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
                <th>Name</th>
                <th>Shop</th>
                <th>Apply On</th>
                <th>Target</th>
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
              {discounts.map((d) => {
                const { text, color } = statusBadge(d);
                return (
                  <tr key={d.id}>
                    <td>{d.name}</td>
                    <td>{d.shop_name || d.shop}</td>
                    <td>{d.apply_on}</td>
                    <td>
                      {d.apply_on === 'category'
                        ? d.category_name
                        : d.apply_on === 'item'
                        ? d.menu_item_name
                        : 'Entire Shop'}
                    </td>
                    <td>{d.discount_type}</td>
                    <td>
                      {d.discount_type === 'percentage'
                        ? `${d.value}%`
                        : `₹${d.value}`}
                    </td>
                    <td>₹{d.minimum_order_amount}</td>
                    <td>
                      {d.maximum_discount_amount
                        ? `₹${d.maximum_discount_amount}`
                        : '-'}
                    </td>
                    <td>
                      <span className={`badge bg-${color}`}>{text}</span>
                    </td>
                    <td>
                      <small>
                        {new Date(d.start_date).toLocaleDateString()} -{' '}
                        {new Date(d.end_date).toLocaleDateString()}
                      </small>
                    </td>
                    <td>
                      <div className="btn-group btn-group-sm">
                        <Link
                          to={`/admin/discounts/edit/${d.id}`}
                          className="btn btn-outline-primary"
                        >
                          Edit
                        </Link>
                        <button
                          className="btn btn-outline-danger"
                          onClick={() => handleDelete(d.id)}
                        >
                          Del
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {discounts.length === 0 && (
                <tr>
                  <td colSpan="11" className="text-center py-4 text-muted">
                    No discounts found.
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

export default Discounts;