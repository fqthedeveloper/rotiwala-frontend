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
} from 'react-icons/fa';
import {
  getReadyOrders,
  assignDeliveryBoy,
  autoAssignDelivery,
  getDeliveryBoys,
} from '../../service/deliveryService';
import './CSS/DeliveryBoy.css';

const DeliveryAssignment = () => {
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
      // Filter only online and available boys
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
      // Remove assigned order from list
      setReadyOrders((prev) => prev.filter((o) => o.id !== orderId));
      // Refresh boys list
      const boys = await getDeliveryBoys();
      setDeliveryBoys((boys || []).filter((b) => b.is_online && b.is_available));
    } catch (error) {
      Swal.fire(
        'Error',
        error.response?.data?.error || 'Assignment failed',
        'error'
      );
    } finally {
      setAssigning((prev) => ({ ...prev, [orderId]: false }));
    }
  };

  const handleAutoAssign = async (orderId) => {
    setAssigning((prev) => ({ ...prev, [orderId]: true }));
    try {
      const result = await autoAssignDelivery(orderId);
      Swal.fire(
        'Success',
        `Auto-assigned to ${result.delivery_boy_name || 'delivery boy'}`,
        'success'
      );
      setReadyOrders((prev) => prev.filter((o) => o.id !== orderId));
      const boys = await getDeliveryBoys();
      setDeliveryBoys((boys || []).filter((b) => b.is_online && b.is_available));
    } catch (error) {
      Swal.fire(
        'Error',
        error.response?.data?.error || 'Auto-assignment failed',
        'error'
      );
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
        <h5 className="mb-0">
          <FaTruck className="me-2" /> Ready for Delivery ({readyOrders.length})
        </h5>
        <small className="text-muted">Orders that are ready and need delivery</small>
      </div>

      {readyOrders.length === 0 ? (
        <div className="text-center py-5 text-muted">
          <FaClock size={40} className="mb-3" />
          <p>No orders ready for delivery at the moment.</p>
          <small>Orders appear here when they are marked as READY.</small>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover table-striped">
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
                      <strong>{order.order_number}</strong>
                    </td>
                    <td>
                      <div>
                        <FaUser className="me-1 text-muted" />
                        {order.customer_name || 'Guest'}
                      </div>
                      {order.customer_phone && (
                        <small className="text-muted">{order.customer_phone}</small>
                      )}
                    </td>
                    <td>₹{order.total_amount}</td>
                    <td>
                      {distance !== null ? (
                        <span>
                          <FaMapMarkerAlt className="me-1 text-warning" />
                          {distance.toFixed(1)} km
                        </span>
                      ) : (
                        <span className="text-muted">N/A</span>
                      )}
                    </td>
                    <td>
                      <select
                        className="form-select form-select-sm"
                        value={selectedBoy[order.id] || ''}
                        onChange={(e) =>
                          setSelectedBoy((prev) => ({
                            ...prev,
                            [order.id]: e.target.value,
                          }))
                        }
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
                          className="btn btn-warning btn-sm"
                          disabled={assigning[order.id]}
                          onClick={() =>
                            handleAssign(
                              order.id,
                              parseInt(selectedBoy[order.id])
                            )
                          }
                        >
                          {assigning[order.id] ? (
                            'Assigning...'
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
      )}

      {deliveryBoys.length === 0 && readyOrders.length > 0 && (
        <div className="alert alert-warning mt-3">
          <FaTimes className="me-2" />
          No delivery boys are online and available. Please activate a delivery boy first.
        </div>
      )}
    </div>
  );
};

export default DeliveryAssignment;