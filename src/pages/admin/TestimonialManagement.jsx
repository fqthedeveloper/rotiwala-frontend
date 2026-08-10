// src/pages/admin/TestimonialManagement.jsx
import React, { useState, useEffect } from 'react';
import {
  getAdminReviews,
  updateReview,
  deleteReview,
} from '../../service/videoApi';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';

const TestimonialManagement = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    is_approved: false,
  });

  const fetchData = async () => {
    try {
      const res = await getAdminReviews();
      setReviews(res.data);
    } catch (error) {
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openModal = (review) => {
    setEditingId(review.id);
    setForm({ is_approved: review.is_approved });
  };

  const closeModal = () => {
    setEditingId(null);
    setForm({ is_approved: false });
  };

  const handleFormChange = (e) => {
    const { name, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateReview(editingId, { is_approved: form.is_approved });
      toast.success('Review updated');
      closeModal();
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Update failed');
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Delete Review?',
      text: 'This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete',
    });
    if (result.isConfirmed) {
      try {
        await deleteReview(id);
        toast.success('Deleted successfully');
        fetchData();
      } catch (error) {
        toast.error('Delete failed');
      }
    }
  };

  const toggleApproval = async (id, current) => {
    try {
      await updateReview(id, { is_approved: !current });
      toast.success('Updated');
      fetchData();
    } catch {
      toast.error('Update failed');
    }
  };

  if (loading) return <div className="text-center py-5">Loading...</div>;

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Customer Reviews Management</h2>
      </div>

      <div className="table-responsive">
        <table className="table table-bordered table-hover">
          <thead className="table-light">
            <tr>
              <th>ID</th>
              <th>Customer</th>
              <th>Role</th>
              <th>Text</th>
              <th>Rating</th>
              <th>Approved</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {reviews.length === 0 ? (
              <tr><td colSpan="7" className="text-center">No reviews found.</td></tr>
            ) : (
              reviews.map((r) => (
                <tr key={r.id}>
                  <td>{r.id}</td>
                  <td>{r.customer_name || r.customer}</td>
                  <td>{r.role || '-'}</td>
                  <td>{r.text}</td>
                  <td>{'⭐'.repeat(r.rating)}</td>
                  <td>
                    <span className={`badge bg-${r.is_approved ? 'success' : 'secondary'}`}>
                      {r.is_approved ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn btn-sm btn-outline-primary me-1"
                      onClick={() => openModal(r)}
                    >
                      Edit
                    </button>
                    <button
                      className={`btn btn-sm me-1 ${r.is_approved ? 'btn-outline-warning' : 'btn-outline-success'}`}
                      onClick={() => toggleApproval(r.id, r.is_approved)}
                    >
                      {r.is_approved ? 'Unapprove' : 'Approve'}
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleDelete(r.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Modal – only for toggling approval */}
      {editingId && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-sm">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Update Review Approval</h5>
                <button type="button" className="btn-close" onClick={closeModal}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="mb-3 form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      name="is_approved"
                      checked={form.is_approved}
                      onChange={handleFormChange}
                    />
                    <label className="form-check-label">Approved</label>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={closeModal}>Cancel</button>
                  <button type="submit" className="btn btn-orange">Save</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestimonialManagement;