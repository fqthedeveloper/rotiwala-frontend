// src/pages/admin/MarqueeManagement.jsx
import React, { useState, useEffect } from 'react';
import {
  getAdminMarquee,
  createMarquee,
  updateMarquee,
  deleteMarquee,
} from '../../service/videoApi';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';

const MarqueeManagement = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    text: '',
    is_active: true,
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      const res = await getAdminMarquee();
      setItems(res.data);
    } catch (error) {
      toast.error('Failed to load marquee items');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openModal = (item = null) => {
    if (item) {
      setEditingId(item.id);
      setForm({
        text: item.text,
        is_active: item.is_active,
      });
    } else {
      setEditingId(null);
      setForm({
        text: '',
        is_active: true,
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setForm({ text: '', is_active: true });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.text.trim()) {
      toast.error('Text is required');
      return;
    }
    setSubmitting(true);
    try {
      if (editingId) {
        await updateMarquee(editingId, form);
        toast.success('Marquee updated');
      } else {
        await createMarquee(form);
        toast.success('Marquee created');
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
      title: 'Delete this marquee item?',
      text: 'This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete',
    });
    if (result.isConfirmed) {
      try {
        await deleteMarquee(id);
        toast.success('Deleted successfully');
        fetchData();
      } catch (error) {
        toast.error('Delete failed');
      }
    }
  };

  const toggleActive = async (id, current) => {
    try {
      await updateMarquee(id, { is_active: !current });
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
        <h2>Marquee Management</h2>
        <button className="btn btn-orange" onClick={() => openModal()}>
          + Add New
        </button>
      </div>

      <div className="table-responsive">
        <table className="table table-bordered table-hover">
          <thead className="table-light">
            <tr>
              <th>ID</th>
              <th>Text</th>
              <th>Active</th>
              <th>Created At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr><td colSpan="5" className="text-center">No marquee items found.</td></tr>
            ) : (
              items.map((item) => (
                <tr key={item.id}>
                  <td>{item.id}</td>
                  <td>{item.text}</td>
                  <td>
                    <span className={`badge bg-${item.is_active ? 'success' : 'secondary'}`}>
                      {item.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>{new Date(item.created_at).toLocaleDateString()}</td>
                  <td>
                    <button
                      className="btn btn-sm btn-outline-primary me-1"
                      onClick={() => openModal(item)}
                    >
                      Edit
                    </button>
                    <button
                      className={`btn btn-sm me-1 ${item.is_active ? 'btn-outline-warning' : 'btn-outline-success'}`}
                      onClick={() => toggleActive(item.id, item.is_active)}
                    >
                      {item.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleDelete(item.id)}
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
                <h5 className="modal-title">{editingId ? 'Edit' : 'Add'} Marquee Item</h5>
                <button type="button" className="btn-close" onClick={closeModal}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Text *</label>
                    <textarea
                      className="form-control"
                      name="text"
                      rows="3"
                      value={form.text}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="mb-3 form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      name="is_active"
                      checked={form.is_active}
                      onChange={handleChange}
                    />
                    <label className="form-check-label">Active</label>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={closeModal}>Cancel</button>
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

export default MarqueeManagement;