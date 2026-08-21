// frontend/src/components/manager/DeliveryBoyList.jsx

import React, { useState, useEffect } from 'react';
import {
  FaUserPlus,
  FaToggleOn,
  FaToggleOff,
  FaCheck,
  FaTimes,
  FaEdit,
  FaTrash,
  FaTruck,
  FaUser,
} from 'react-icons/fa';
import Swal from 'sweetalert2';
import {
  getDeliveryBoys,
  toggleOnline,
  toggleAvailable,
  createDeliveryBoy,
  updateDeliveryBoy,
} from '../../service/deliveryService';
import './CSS/DeliveryBoy.css';

const DeliveryBoyList = () => {
  const [boys, setBoys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingBoy, setEditingBoy] = useState(null);
  const [formData, setFormData] = useState({
    user: '',
    full_name: '',
    phone: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const loadBoys = async () => {
    setLoading(true);
    try {
      const data = await getDeliveryBoys();
      setBoys(data);
    } catch (error) {
      console.error(error);
      Swal.fire('Error', 'Failed to load delivery boys', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBoys();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setShowAddForm(false);
    setEditingBoy(null);
    setFormData({ user: '', full_name: '', phone: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingBoy) {
        await updateDeliveryBoy(editingBoy.id, {
          full_name: formData.full_name,
          phone: formData.phone,
        });
        Swal.fire('Updated', 'Delivery boy updated successfully', 'success');
      } else {
        await createDeliveryBoy({
          user: parseInt(formData.user),
          full_name: formData.full_name,
          phone: formData.phone,
        });
        Swal.fire('Added', 'Delivery boy added successfully', 'success');
      }
      resetForm();
      loadBoys();
    } catch (error) {
      Swal.fire(
        'Error',
        error.response?.data?.error || error.response?.data?.detail || 'Operation failed',
        'error'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (boy) => {
    setEditingBoy(boy);
    setFormData({
      user: boy.user_id || '',
      full_name: boy.full_name || '',
      phone: boy.phone || '',
    });
    setShowAddForm(true);
  };

  const handleToggleOnline = async (id) => {
    try {
      const updated = await toggleOnline(id);
      setBoys(boys.map((b) => (b.id === id ? updated : b)));
    } catch (error) {
      Swal.fire('Error', 'Failed to toggle online status', 'error');
    }
  };

  const handleToggleAvailable = async (id) => {
    try {
      const updated = await toggleAvailable(id);
      setBoys(boys.map((b) => (b.id === id ? updated : b)));
    } catch (error) {
      Swal.fire('Error', 'Failed to toggle availability', 'error');
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-warning" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="delivery-boy-list">
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <h5 className="mb-0">
          <FaTruck className="me-2" /> Delivery Boys ({boys.length})
        </h5>
        <button
          className="btn btn-warning btn-sm"
          onClick={() => {
            resetForm();
            setShowAddForm(true);
          }}
        >
          <FaUserPlus className="me-2" /> Add Boy
        </button>
      </div>

      {showAddForm && (
        <div className="card p-3 mb-3 shadow-sm">
          <form onSubmit={handleSubmit}>
            <div className="row g-2">
              <div className="col-md-3">
                <input
                  type="number"
                  className="form-control form-control-sm"
                  placeholder="User ID"
                  name="user"
                  value={formData.user}
                  onChange={handleInputChange}
                  required={!editingBoy}
                  disabled={!!editingBoy}
                />
                {!editingBoy && (
                  <small className="text-muted">Existing user ID with role 'delivery_boy'</small>
                )}
              </div>
              <div className="col-md-3">
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="Full Name"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="col-md-3">
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="Phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="col-md-3 d-flex gap-2">
                <button type="submit" className="btn btn-success btn-sm" disabled={submitting}>
                  {submitting ? 'Saving...' : editingBoy ? 'Update' : 'Save'}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={resetForm}
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      <div className="table-responsive">
        <table className="table table-hover table-striped">
          <thead className="table-light">
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Phone</th>
              <th>Status</th>
              <th>Availability</th>
              <th>Deliveries</th>
              <th>Current Assignment</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {boys.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center py-4 text-muted">
                  No delivery boys found. Add your first delivery boy!
                </td>
              </tr>
            ) : (
              boys.map((boy, index) => (
                <tr key={boy.id}>
                  <td>{index + 1}</td>
                  <td>
                    <strong>{boy.full_name}</strong>
                  </td>
                  <td>{boy.phone}</td>
                  <td>
                    <span
                      className={`badge ${boy.is_online ? 'bg-success' : 'bg-secondary'}`}
                    >
                      {boy.is_online ? (
                        <>
                          <FaCheck className="me-1" /> Online
                        </>
                      ) : (
                        <>
                          <FaTimes className="me-1" /> Offline
                        </>
                      )}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`badge ${boy.is_available ? 'bg-success' : 'bg-danger'}`}
                    >
                      {boy.is_available ? 'Available' : 'Busy'}
                    </span>
                  </td>
                  <td>{boy.total_deliveries}</td>
                  <td>
                    {boy.current_assignment ? (
                      <span className="text-primary small">
                        Order #{boy.current_assignment.order_number}
                        <br />
                        <span className="text-muted">{boy.current_assignment.status}</span>
                      </span>
                    ) : (
                      <span className="text-muted">—</span>
                    )}
                  </td>
                  <td>
                    <div className="d-flex gap-1 flex-wrap">
                      <button
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => handleToggleOnline(boy.id)}
                        title={boy.is_online ? 'Go Offline' : 'Go Online'}
                      >
                        {boy.is_online ? <FaToggleOn /> : <FaToggleOff />}
                      </button>
                      <button
                        className={`btn btn-sm ${boy.is_available ? 'btn-outline-success' : 'btn-outline-danger'}`}
                        onClick={() => handleToggleAvailable(boy.id)}
                        disabled={!boy.is_online}
                        title={boy.is_available ? 'Mark Busy' : 'Mark Available'}
                      >
                        {boy.is_available ? <FaCheck /> : <FaTimes />}
                      </button>
                      <button
                        className="btn btn-sm btn-outline-secondary"
                        onClick={() => handleEdit(boy)}
                      >
                        <FaEdit />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DeliveryBoyList;