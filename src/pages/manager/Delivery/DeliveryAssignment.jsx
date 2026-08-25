// frontend/src/components/manager/DeliveryAssignment.jsx

import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import {
  FaTruck,
  FaUser,
  FaMapMarkerAlt,
  FaCheck,
  FaTimes,
  FaClock,
  FaPhoneAlt,
  FaMoneyBillWave,
  FaToggleOn, // <--- Added this missing import
} from 'react-icons/fa';
import {
  getReadyOrders,
  assignDeliveryBoy,
  autoAssignDelivery,
  getDeliveryBoys,
} from '../../../service/deliveryService';
import '../CSS/DeliveryBoy.css';

const DeliveryAssignment = ({ autoAssignEnabled }) => {
  const [readyOrders, setReadyOrders] = useState([]);
  const [deliveryBoys, setDeliveryBoys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState({});
  const [selectedBoy, setSelectedBoy] = useState({});

  const loadData = async () => {
    try {
      const [orders, boys] = await Promise.all([
        getReadyOrders(),
        getDeliveryBoys(),
      ]);
      setReadyOrders(orders || []);
      // Filter only online AND available boys
      setDeliveryBoys((boys || []).filter((b) => b.is_online && b.is_available));
    } catch (error) {
      console.error(error);
      Swal.fire('Error', 'Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // Refresh every 30 seconds
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleAssign = async (orderId, boyId) => {
    if (!boyId) {
      Swal.fire('Warning', 'Please select a delivery boy', 'warning');
      return;
    }

    setAssigning((prev) => ({ ...prev, [orderId]: true }));
    try {
      await assignDeliveryBoy(orderId, boyId);
      Swal.fire('Success', 'Delivery assigned successfully!', 'success');
      setReadyOrders((prev) => prev.filter((o) => o.id !== orderId));
      // Refresh boys list after assignment
      const boys = await getDeliveryBoys();
      setDeliveryBoys((boys || []).filter((b) => b.is_online && b.is_available));
    } catch (error) {
      Swal.fire('Error', error.response?.data?.error || 'Assignment failed', 'error');
    } finally {
      setAssigning((prev) => ({ ...prev, [orderId]: false }));
    }
  };

  const handleAutoAssign = async (orderId) => {
    setAssigning((prev) => ({ ...prev, [orderId]: true }));
    try {
      const result = await autoAssignDelivery(orderId);
      Swal.fire('Success', `Auto-assigned to ${result.delivery_boy_name || 'delivery boy'}`, 'success');
      setReadyOrders((prev) => prev.filter((o) => o.id !== orderId));
      const boys = await getDeliveryBoys();
      setDeliveryBoys((boys || []).filter((b) => b.is_online && b.is_available));
    } catch (error) {
      Swal.fire('Error', error.response?.data?.error || 'Auto-assignment failed', 'error');
    } finally {
      setAssigning((prev) => ({ ...prev, [orderId]: false }));
    }
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return null;
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
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
    <div className="delivery-assignment">
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <h5 className="mb-0 dm-section-title">
          <FaTruck className="me-2 text-warning" /> Ready for Delivery ({readyOrders.length})
        </h5>
        <small className="text-muted dm-section-subtitle">
          Orders that are ready and need delivery
          {autoAssignEnabled && (
            <span className="text-success ms-2">
              <FaToggleOn className="me-1" /> Auto-assign ON
            </span>
          )}
        </small>
      </div>

      {readyOrders.length === 0 ? (
        <div className="text-center py-5 text-muted dm-empty-state">
          <FaClock size={40} className="mb-3 opacity-50" />
          <p className="mb-1 fw-bold">No orders ready for delivery</p>
          <small>Orders appear here when they are marked as READY.</small>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="d-none d-lg-block">
            <div className="table-responsive">
              <table className="table table-hover table-striped dm-table">
                <thead className="table-light">
                  <tr>
                    <th>Order #</th>
                    <th>Customer</th>
                    <th>Amount</th>
                    <th>Distance</th>
                    <th>Delivery Boy</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {readyOrders.map((order) => {
                    const distance = order.shop?.latitude && order.delivery_latitude
                      ? calculateDistance(
                          order.shop.latitude,
                          order.shop.longitude,
                          order.delivery_latitude,
                          order.delivery_longitude
                        )
                      : null;

                    return (
                      <tr key={order.id}>
                        <td>
                          <strong className="dm-order-number">{order.order_number}</strong>
                        </td>
                        <td>
                          <div className="dm-customer-info">
                            <FaUser className="me-1 text-muted" />
                            {order.customer_name || 'Guest'}
                          </div>
                          {order.customer_phone && (
                            <small className="text-muted d-flex align-items-center">
                              <FaPhoneAlt size={10} className="me-1" />
                              {order.customer_phone}
                            </small>
                          )}
                        </td>
                        <td>
                          <span className="dm-amount">
                            <FaMoneyBillWave className="me-1 text-success" />
                            ₹{order.total_amount}
                          </span>
                        </td>
                        <td>
                          {distance !== null ? (
                            <span className="dm-distance">
                              <FaMapMarkerAlt className="me-1 text-warning" />
                              {distance.toFixed(1)} km
                            </span>
                          ) : (
                            <span className="text-muted">N/A</span>
                          )}
                        </td>
                        <td>
                          <select
                            className="form-select form-select-sm dm-select"
                            value={selectedBoy[order.id] || ''}
                            onChange={(e) =>
                              setSelectedBoy((prev) => ({
                                ...prev,
                                [order.id]: e.target.value,
                              }))
                            }
                            disabled={autoAssignEnabled}
                          >
                            <option value="">Select boy</option>
                            {deliveryBoys.map((b) => (
                              <option key={b.id} value={b.id}>
                                {b.full_name} {!b.is_available ? '🔴' : '🟢'}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td>
                          <div className="d-flex gap-2 flex-wrap">
                            <button
                              className="btn btn-warning btn-sm dm-btn-assign"
                              disabled={assigning[order.id] || autoAssignEnabled}
                              onClick={() =>
                                handleAssign(
                                  order.id,
                                  parseInt(selectedBoy[order.id])
                                )
                              }
                            >
                              {assigning[order.id] ? (
                                <>
                                  <span className="spinner-border spinner-border-sm me-1" />
                                  Assigning...
                                </>
                              ) : (
                                <>
                                  <FaCheck className="me-1" /> Assign
                                </>
                              )}
                            </button>
                            <button
                              className="btn btn-outline-primary btn-sm dm-btn-auto"
                              disabled={assigning[order.id] || deliveryBoys.length === 0}
                              onClick={() => handleAutoAssign(order.id)}
                            >
                              <FaTruck className="me-1" /> Auto
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Card View */}
          <div className="d-lg-none dm-mobile-cards">
            {readyOrders.map((order) => {
              const distance = order.shop?.latitude && order.delivery_latitude
                ? calculateDistance(
                    order.shop.latitude,
                    order.shop.longitude,
                    order.delivery_latitude,
                    order.delivery_longitude
                  )
                : null;

              return (
                <div className="card mb-3 dm-card-item" key={order.id}>
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <strong className="dm-order-number">{order.order_number}</strong>
                      <span className="dm-amount">
                        <FaMoneyBillWave className="me-1 text-success" />
                        ₹{order.total_amount}
                      </span>
                    </div>
                    <div className="mb-2">
                      <FaUser className="me-1 text-muted" />
                      <span className="fw-medium">{order.customer_name || 'Guest'}</span>
                      {order.customer_phone && (
                        <small className="text-muted d-block ms-4">
                          {order.customer_phone}
                        </small>
                      )}
                    </div>
                    <div className="mb-3 d-flex flex-wrap gap-3">
                      {distance !== null ? (
                        <span className="dm-distance">
                          <FaMapMarkerAlt className="me-1 text-warning" />
                          {distance.toFixed(1)} km
                        </span>
                      ) : (
                        <span className="text-muted">Distance N/A</span>
                      )}
                      <span className="text-muted">
                        <FaClock className="me-1" /> Ready
                      </span>
                    </div>
                    <div className="mb-3">
                      <select
                        className="form-select form-select-sm"
                        value={selectedBoy[order.id] || ''}
                        onChange={(e) =>
                          setSelectedBoy((prev) => ({
                            ...prev,
                            [order.id]: e.target.value,
                          }))
                        }
                        disabled={autoAssignEnabled}
                      >
                        <option value="">Select delivery boy</option>
                        {deliveryBoys.map((b) => (
                          <option key={b.id} value={b.id}>
                            {b.full_name} {!b.is_available ? '🔴' : '🟢'}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="d-grid gap-2 d-sm-flex">
                      <button
                        className="btn btn-warning btn-sm"
                        disabled={assigning[order.id] || autoAssignEnabled}
                        onClick={() =>
                          handleAssign(
                            order.id,
                            parseInt(selectedBoy[order.id])
                          )
                        }
                      >
                        {assigning[order.id] ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-1" />
                            Assigning...
                          </>
                        ) : (
                          <>
                            <FaCheck className="me-1" /> Assign
                          </>
                        )}
                      </button>
                      <button
                        className="btn btn-outline-primary btn-sm"
                        disabled={assigning[order.id] || deliveryBoys.length === 0}
                        onClick={() => handleAutoAssign(order.id)}
                      >
                        <FaTruck className="me-1" /> Auto Assign
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {deliveryBoys.length === 0 && readyOrders.length > 0 && (
        <div className="alert alert-warning mt-3 dm-alert-warning">
          <FaTimes className="me-2" />
          No delivery boys are online and available.
          <span className="d-block mt-1">
            <strong>How to fix:</strong> Go to the <strong>Delivery Boys</strong> tab,
            toggle a boy <strong>Online</strong> (🟢), then click the <strong>Available</strong> button (✅).
          </span>
        </div>
      )}
    </div>
  );
};

export default DeliveryAssignment;