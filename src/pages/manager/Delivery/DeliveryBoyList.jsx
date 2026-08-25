// frontend/src/components/manager/DeliveryBoyList.jsx

import React, { useState, useEffect } from 'react';
import {
  FaUserPlus, FaToggleOn, FaToggleOff, FaCheck, FaTimes, FaEdit,
  FaTruck, FaPhoneAlt, FaUser, FaMapMarkerAlt, FaExternalLinkAlt, FaTimesCircle, FaSyncAlt
} from 'react-icons/fa';
import Swal from 'sweetalert2';
import {
  getDeliveryBoys, toggleOnline, toggleAvailable,
  createDeliveryBoy, updateDeliveryBoy, getOrderTracking,
} from '../../../service/deliveryService';
import DeliveryTrackingMap from './DeliveryTrackingMap';
import '../CSS/DeliveryBoy.css';

const DeliveryBoyList = () => {
  const [boys, setBoys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingBoy, setEditingBoy] = useState(null);
  const [formData, setFormData] = useState({ full_name: '', phone: '' });
  const [submitting, setSubmitting] = useState(false);

  const [trackingModal, setTrackingModal] = useState({
    open: false,
    order: null,
    trackingData: null,
    loadingTracking: false,
  });

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
    setFormData({ full_name: '', phone: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingBoy) {
        await updateDeliveryBoy(editingBoy.id, { full_name: formData.full_name, phone: formData.phone });
        Swal.fire('Updated', 'Delivery boy updated successfully', 'success');
      } else {
        await createDeliveryBoy({ full_name: formData.full_name, phone: formData.phone });
        Swal.fire('Added', 'Delivery boy added successfully', 'success');
      }
      resetForm();
      loadBoys();
    } catch (error) {
      const errorMsg = error.response?.data?.phone?.[0] ||
                       error.response?.data?.full_name?.[0] ||
                       error.response?.data?.detail || 'Operation failed';
      Swal.fire('Error', errorMsg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (boy) => {
    setEditingBoy(boy);
    setFormData({ full_name: boy.full_name || '', phone: boy.phone || '' });
    setShowAddForm(true);
    setTimeout(() => {
      document.getElementById('delivery-boy-form')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
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

  // Open map modal and fetch tracking data
  const openTrackingModal = async (orderId, orderNumber) => {
    setTrackingModal({
      open: true,
      order: { id: orderId, order_number: orderNumber },
      trackingData: null,
      loadingTracking: true,
    });

    try {
      const data = await getOrderTracking(orderId);
      setTrackingModal((prev) => ({ ...prev, trackingData: data, loadingTracking: false }));
    } catch (error) {
      setTrackingModal((prev) => ({ ...prev, loadingTracking: false }));
      Swal.fire('Error', 'Failed to load tracking data', 'error');
    }
  };

  const closeTrackingModal = () => {
    setTrackingModal({ open: false, order: null, trackingData: null, loadingTracking: false });
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
      {/* Header with Add Button */}
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2 dm-list-header">
        <h5 className="mb-0 dm-section-title">
          <FaTruck className="me-2 text-warning" /> Delivery Boys ({boys.length})
        </h5>
        <button className="btn btn-warning btn-sm dm-btn-add" onClick={() => { resetForm(); setShowAddForm(true); setTimeout(() => document.getElementById('delivery-boy-form')?.scrollIntoView({ behavior: 'smooth' }), 100); }}>
          <FaUserPlus className="me-2" /> Add Boy
        </button>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="card p-3 mb-4 shadow-sm dm-form-card" id="delivery-boy-form">
          <div className="mb-2"><strong>{editingBoy ? 'Edit Delivery Boy' : 'Add New Delivery Boy'}</strong></div>
          <form onSubmit={handleSubmit}>
            <div className="row g-2 align-items-end">
              <div className="col-12 col-md-5">
                <label className="form-label small fw-medium mb-1">Full Name</label>
                <input type="text" className="form-control form-control-sm" placeholder="e.g., Ravi Kumar" name="full_name" value={formData.full_name} onChange={handleInputChange} required />
              </div>
              <div className="col-12 col-md-4">
                <label className="form-label small fw-medium mb-1">Phone Number</label>
                <input type="tel" className="form-control form-control-sm" placeholder="9876543210" name="phone" value={formData.phone} onChange={handleInputChange} required />
                <small className="text-muted d-block mt-1">+91 will be added automatically</small>
              </div>
              <div className="col-12 col-md-3 d-flex gap-2">
                <button type="submit" className="btn btn-success btn-sm flex-grow-1" disabled={submitting}>
                  {submitting ? <><span className="spinner-border spinner-border-sm me-1" /> Saving...</> : editingBoy ? <><FaCheck className="me-1" /> Update</> : <><FaCheck className="me-1" /> Save</>}
                </button>
                <button type="button" className="btn btn-secondary btn-sm" onClick={resetForm}><FaTimes /></button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Desktop Table View */}
      <div className="d-none d-lg-block">
        <div className="table-responsive">
          <table className="table table-hover table-striped dm-table">
            <thead className="table-light">
              <tr>
                <th>#</th><th>Name</th><th>Phone</th><th>Status</th>
                <th>Availability</th><th>Deliveries</th><th>Current Orders</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {boys.length === 0 ? (
                <tr><td colSpan="8" className="text-center py-4 text-muted"><FaUser size={40} className="mb-2 opacity-50" /><br />No delivery boys found. Add your first delivery boy!</td></tr>
              ) : (
                boys.map((boy, index) => (
                  <tr key={boy.id}>
                    <td>{index + 1}</td>
                    <td><strong className="dm-boy-name">{boy.full_name}</strong></td>
                    <td><span className="d-flex align-items-center"><FaPhoneAlt size={10} className="me-2 text-muted" />{boy.phone}</span></td>
                    <td><span className={`badge dm-status-badge ${boy.is_online ? 'bg-success' : 'bg-secondary'}`}>{boy.is_online ? <><FaCheck className="me-1" /> Online</> : <><FaTimes className="me-1" /> Offline</>}</span></td>
                    <td><span className={`badge dm-status-badge ${boy.is_available ? 'bg-success' : 'bg-danger'}`}>{boy.is_available ? 'Available' : 'Busy'}</span></td>
                    <td><span className="fw-medium">{boy.total_deliveries}</span></td>
                    <td>
                      {boy.current_assignments && boy.current_assignments.length > 0 ? (
                        <div className="d-flex flex-column gap-1">
                          {boy.current_assignments.map((assignment) => (
                            <button key={assignment.id} className="btn btn-link btn-sm p-0 text-start d-flex align-items-center gap-1 dm-order-link" onClick={() => openTrackingModal(assignment.order_id, assignment.order_number)}>
                              <FaMapMarkerAlt className="text-warning" size={12} />
                              <span className="text-primary">{assignment.order_number}</span>
                              <FaExternalLinkAlt size={10} className="text-muted" />
                            </button>
                          ))}
                        </div>
                      ) : (<span className="text-muted">—</span>)}
                    </td>
                    <td>
                      <div className="d-flex gap-1 flex-wrap">
                        <button className="btn btn-sm btn-outline-primary dm-action-btn" onClick={() => handleToggleOnline(boy.id)} title={boy.is_online ? 'Go Offline' : 'Go Online'}>{boy.is_online ? <FaToggleOn size={18} /> : <FaToggleOff size={18} />}</button>
                        <button className={`btn btn-sm dm-action-btn ${boy.is_available ? 'btn-outline-success' : 'btn-outline-danger'}`} onClick={() => handleToggleAvailable(boy.id)} disabled={!boy.is_online} title={boy.is_available ? 'Mark Busy' : 'Mark Available'}>{boy.is_available ? <FaCheck size={16} /> : <FaTimes size={16} />}</button>
                        <button className="btn btn-sm btn-outline-secondary dm-action-btn" onClick={() => handleEdit(boy)} title="Edit"><FaEdit size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="d-lg-none dm-mobile-cards">
        {boys.length === 0 ? (
          <div className="text-center py-5 text-muted dm-empty-state"><FaUser size={40} className="mb-3 opacity-50" /><p className="fw-bold mb-1">No delivery boys</p><small>Add your first delivery boy to start assigning orders.</small></div>
        ) : (
          boys.map((boy, index) => (
            <div className="card mb-3 dm-card-item" key={boy.id}>
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <div><strong className="dm-boy-name">{boy.full_name}</strong><div className="text-muted small d-flex align-items-center mt-1"><FaPhoneAlt size={10} className="me-2" />{boy.phone}</div></div>
                  <span className="text-muted small">#{index + 1}</span>
                </div>
                <div className="d-flex flex-wrap gap-2 mb-3">
                  <span className={`badge dm-status-badge ${boy.is_online ? 'bg-success' : 'bg-secondary'}`}>{boy.is_online ? <><FaCheck className="me-1" /> Online</> : <><FaTimes className="me-1" /> Offline</>}</span>
                  <span className={`badge dm-status-badge ${boy.is_available ? 'bg-success' : 'bg-danger'}`}>{boy.is_available ? 'Available' : 'Busy'}</span>
                  <span className="badge bg-light text-dark"><FaTruck className="me-1" /> {boy.total_deliveries} Deliv.</span>
                </div>
                <div className="mb-3">
                  {boy.current_assignments && boy.current_assignments.length > 0 ? (
                    <div className="small"><strong>Current Orders:</strong><div className="d-flex flex-column gap-1 mt-1">
                      {boy.current_assignments.map((assignment) => (
                        <button key={assignment.id} className="btn btn-link btn-sm p-0 text-start d-flex align-items-center gap-1 dm-order-link" onClick={() => openTrackingModal(assignment.order_id, assignment.order_number)}>
                          <FaMapMarkerAlt className="text-warning" size={12} /><span className="text-primary">{assignment.order_number}</span>
                        </button>
                      ))}
                    </div></div>
                  ) : (<div className="small text-muted">No current orders</div>)}
                </div>
                <div className="d-grid gap-2 d-sm-flex">
                  <button className={`btn btn-sm flex-grow-1 ${boy.is_online ? 'btn-outline-primary' : 'btn-primary'}`} onClick={() => handleToggleOnline(boy.id)}>{boy.is_online ? <><FaToggleOff className="me-1" /> Go Offline</> : <><FaToggleOn className="me-1" /> Go Online</>}</button>
                  <button className={`btn btn-sm flex-grow-1 ${boy.is_available ? 'btn-outline-success' : 'btn-outline-danger'}`} onClick={() => handleToggleAvailable(boy.id)} disabled={!boy.is_online}>{boy.is_available ? <><FaTimes className="me-1" /> Mark Busy</> : <><FaCheck className="me-1" /> Mark Avail.</>}</button>
                  <button className="btn btn-sm btn-outline-secondary" onClick={() => handleEdit(boy)}><FaEdit /></button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Responsive Tracking Modal */}
      {trackingModal.open && (
        <div className="tracking-modal-overlay" onClick={closeTrackingModal}>
          <div className="tracking-modal" onClick={(e) => e.stopPropagation()}>
            <div className="tracking-modal-header">
              <h5 className="mb-0"><FaMapMarkerAlt className="me-2 text-warning" /> Tracking Order #{trackingModal.order.order_number}</h5>
              <button className="modal-close-btn" onClick={closeTrackingModal}><FaTimesCircle size={24} /></button>
            </div>
            
            <div className="tracking-modal-body">
              {trackingModal.loadingTracking ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-warning" role="status"><span className="visually-hidden">Loading...</span></div>
                </div>
              ) : trackingModal.trackingData ? (
                <>
                  <DeliveryTrackingMap
                    shopLocation={trackingModal.trackingData.shop}
                    boyLocation={trackingModal.trackingData.delivery_boy}
                    customerLocation={trackingModal.trackingData.customer_location}
                    boyName={trackingModal.trackingData.delivery_boy.full_name}
                    orderNumber={trackingModal.order.order_number}
                  />

                  {!trackingModal.trackingData.delivery_boy.latitude && (
                    <div className="text-center mt-3">
                      <button className="btn btn-sm btn-warning" onClick={() => openTrackingModal(trackingModal.order.id, trackingModal.order.order_number)}>
                        <FaSyncAlt className="me-1" /> Refresh Location
                      </button>
                    </div>
                  )}

                  <div className="mt-3 row g-3">
                    <div className="col-md-6">
                      <div className="info-block"><strong>Status:</strong> {trackingModal.trackingData.status}</div>
                      <div className="info-block"><strong>Delivery Boy:</strong> {trackingModal.trackingData.delivery_boy.full_name}</div>
                      <div className="info-block"><strong>Phone:</strong> {trackingModal.trackingData.delivery_boy.phone}</div>
                    </div>
                    <div className="col-md-6">
                      <div className="info-block"><strong>Shop:</strong> {trackingModal.trackingData.shop.name}</div>
                      <div className="info-block"><strong>Delivery Address:</strong> {trackingModal.trackingData.customer_location.address}</div>
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-center text-muted py-4">Unable to load tracking data.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveryBoyList;