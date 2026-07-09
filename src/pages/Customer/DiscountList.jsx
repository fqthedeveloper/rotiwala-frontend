import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getDiscounts, deleteDiscount } from '../../../service/discountService';
import { toast } from 'react-toastify';

const DiscountList = () => {
  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDiscounts();
  }, []);

  const fetchDiscounts = async () => {
    try {
      const res = await getDiscounts();
      setDiscounts(res.data);
    } catch (err) {
      toast.error('Failed to load discounts');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure?')) {
      try {
        await deleteDiscount(id);
        toast.success('Discount deleted');
        fetchDiscounts();
      } catch (err) {
        toast.error('Failed to delete');
      }
    }
  };

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between mb-4">
        <h3>Discounts</h3>
        <Link to="/admin/discounts/new" className="btn btn-primary">
          Add Discount
        </Link>
      </div>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <table className="table table-bordered">
          <thead>
            <tr>
              <th>Name</th>
              <th>Shop</th>
              <th>Apply On</th>
              <th>Type</th>
              <th>Value</th>
              <th>Active</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {discounts.map((d) => (
              <tr key={d.id}>
                <td>{d.name}</td>
                <td>{d.shop_name}</td>
                <td>{d.apply_on}</td>
                <td>{d.discount_type}</td>
                <td>{d.value}</td>
                <td>{d.is_active ? '✅' : '❌'}</td>
                <td>
                  <Link to={`/admin/discounts/${d.id}`} className="btn btn-sm btn-info me-2">
                    Edit
                  </Link>
                  <button className="btn btn-sm btn-danger" onClick={() => handleDelete(d.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default DiscountList;