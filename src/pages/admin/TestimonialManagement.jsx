// src/pages/admin/TestimonialManagement.jsx
import React, { useState, useEffect } from 'react';
import {
  getAdminTestimonials,
  updateTestimonial,
  deleteTestimonial,
  submitTestimonial,
} from '../../service/videoApi';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';

const TestimonialManagement = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    author: '',
    role: '',
    text: '',
    rating: 5,
    is_approved: false,
    show_in_marquee: false,
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      const res = await getAdminTestimonials();
      setTestimonials(res.data);
    } catch (error) {
      toast.error('Failed to load testimonials');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openModal = (testimonial = null) => {
    if (testimonial) {
      setEditingId(testimonial.id);
      setForm({
        author: testimonial.author,
        role: testimonial.role || '',
        text: testimonial.text,
        rating: testimonial.rating,
        is_approved: testimonial.is_approved,
        show_in_marquee: testimonial.show_in_marquee,
      });
    } else {
      setEditingId(null);
      setForm({
        author: '',
        role: '',
        text: '',
        rating: 5,
        is_approved: false,
        show_in_marquee: false,
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setForm({
      author: '',
      role: '',
      text: '',
      rating: 5,
      is_approved: false,
      show_in_marquee: false,
    });
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.author || !form.text) {
      toast.error('Author and text are required');
      return;
    }
    setSubmitting(true);
    try {
      if (editingId) {
        // Update existing
        await updateTestimonial(editingId, {
          is_approved: form.is_approved,
          show_in_marquee: form.show_in_marquee,
        });
        toast.success('Testimonial updated');
      } else {
        // Create new
        await submitTestimonial({
          author: form.author,
          role: form.role,
          text: form.text,
          rating: form.rating,
        });
        toast.success('Testimonial created');
      }
      closeModal();
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Delete Testimonial?',
      text: 'This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete',
    });
    if (result.isConfirmed) {
      try {
        await deleteTestimonial(id);
        toast.success('Deleted successfully');
        fetchData();
      } catch (error) {
        toast.error('Delete failed');
      }
    }
  };

  const toggleApproval = async (id, current) => {
    try {
      await updateTestimonial(id, { is_approved: !current });
      toast.success('Updated');
      fetchData();
    } catch {
      toast.error('Update failed');
    }
  };

  const toggleMarquee = async (id, current) => {
    try {
      await updateTestimonial(id, { show_in_marquee: !current });
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
        <h2>Testimonial Management</h2>
        <button className="btn btn-orange" onClick={() => openModal()}>
          + Add New
        </button>
      </div>

      <div className="table-responsive">
        <table className="table table-bordered table-hover">
          <thead className="table-light">
            <tr>
              <th>ID</th>
              <th>Author</th>
              <th>Text</th>
              <th>Rating</th>
              <th>Approved</th>
              <th>Marquee</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {testimonials.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center">
                  No testimonials found.
                </td>
              </tr>
            ) : (
              testimonials.map((t) => (
                <tr key={t.id}>
                  <td>{t.id}</td>
                  <td>{t.author}</td>
                  <td>{t.text}</td>
                  <td>{'⭐'.repeat(t.rating)}</td>
                  <td>
                    <span className={`badge bg-${t.is_approved ? 'success' : 'secondary'}`}>
                      {t.is_approved ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td>
                    <span className={`badge bg-${t.show_in_marquee ? 'info' : 'secondary'}`}>
                      {t.show_in_marquee ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn btn-sm btn-outline-primary me-1"
                      onClick={() => openModal(t)}
                    >
                      Edit
                    </button>
                    <button
                      className={`btn btn-sm me-1 ${t.is_approved ? 'btn-outline-warning' : 'btn-outline-success'}`}
                      onClick={() => toggleApproval(t.id, t.is_approved)}
                    >
                      {t.is_approved ? 'Unapprove' : 'Approve'}
                    </button>
                    <button
                      className={`btn btn-sm me-1 ${t.show_in_marquee ? 'btn-outline-secondary' : 'btn-outline-info'}`}
                      onClick={() => toggleMarquee(t.id, t.show_in_marquee)}
                    >
                      {t.show_in_marquee ? 'Hide' : 'Show in Marquee'}
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleDelete(t.id)}
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

      {/* Modal */}
      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{editingId ? 'Edit' : 'Add'} Testimonial</h5>
                <button type="button" className="btn-close" onClick={closeModal}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  {editingId ? (
                    // Edit mode: only allow toggle of approval and marquee (already handled via separate buttons)
                    // We'll keep the same form for consistency, but only these fields are editable.
                    <>
                      <div className="mb-3">
                        <label className="form-label">Author</label>
                        <input type="text" className="form-control" value={form.author} disabled />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Text</label>
                        <textarea className="form-control" value={form.text} disabled rows="3" />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Rating</label>
                        <input type="number" className="form-control" value={form.rating} disabled />
                      </div>
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
                      <div className="mb-3 form-check">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          name="show_in_marquee"
                          checked={form.show_in_marquee}
                          onChange={handleFormChange}
                        />
                        <label className="form-check-label">Show in Marquee</label>
                      </div>
                    </>
                  ) : (
                    // Add mode: all fields
                    <>
                      <div className="mb-3">
                        <label className="form-label">Author</label>
                        <input
                          type="text"
                          className="form-control"
                          name="author"
                          value={form.author}
                          onChange={handleFormChange}
                          required
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Role (optional)</label>
                        <input
                          type="text"
                          className="form-control"
                          name="role"
                          value={form.role}
                          onChange={handleFormChange}
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Text</label>
                        <textarea
                          className="form-control"
                          name="text"
                          value={form.text}
                          onChange={handleFormChange}
                          rows="3"
                          required
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Rating</label>
                        <select
                          className="form-select"
                          name="rating"
                          value={form.rating}
                          onChange={handleFormChange}
                        >
                          {[5,4,3,2,1].map(r => (
                            <option key={r} value={r}>{r} Star{r>1?'s':''}</option>
                          ))}
                        </select>
                      </div>
                    </>
                  )}
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={closeModal}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-orange" disabled={submitting}>
                    {submitting ? 'Saving...' : 'Save'}
                  </button>
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