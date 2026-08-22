// frontend/src/service/deliveryService.js

import api from './api';

// ============================================================
// DELIVERY BOYS
// ============================================================

/**
 * Get all delivery boys for the manager's shop
 */
export const getDeliveryBoys = async () => {
  const response = await api.get('/delivery/boys/');
  return response.data;
};

/**
 * Create a new delivery boy profile
 * @param {Object} data - { phone, full_name } (no user ID needed)
 */
export const createDeliveryBoy = async (data) => {
  const response = await api.post('/delivery/boys/', {
    phone: data.phone,
    full_name: data.full_name,
  });
  return response.data;
};

/**
 * Update a delivery boy profile
 * @param {number} id
 * @param {Object} data - { full_name, phone } (optional)
 */
export const updateDeliveryBoy = async (id, data) => {
  const response = await api.patch(`/delivery/boys/${id}/`, data);
  return response.data;
};

/**
 * Toggle online status
 * @param {number} id
 */
export const toggleOnline = async (id) => {
  const response = await api.post(`/delivery/boys/${id}/toggle_online/`);
  return response.data;
};

/**
 * Toggle availability
 * @param {number} id
 */
export const toggleAvailable = async (id) => {
  const response = await api.post(`/delivery/boys/${id}/toggle_available/`);
  return response.data;
};

// ============================================================
// ASSIGNMENTS
// ============================================================

/**
 * Get all assignments for the manager's shop
 */
export const getAssignments = async () => {
  const response = await api.get('/delivery/assignments/');
  return response.data;
};

/**
 * Get ready orders for delivery (not yet assigned)
 */
export const getReadyOrders = async () => {
  const response = await api.get('/delivery/orders/ready/');
  return response.data;
};

/**
 * Manually assign a delivery boy to an order
 * @param {number} orderId
 * @param {number} deliveryBoyId
 */
export const assignDeliveryBoy = async (orderId, deliveryBoyId) => {
  const response = await api.post('/delivery/assignments/assign/', {
    order_id: orderId,
    delivery_boy_id: deliveryBoyId,
  });
  return response.data;
};

/**
 * Auto-assign a delivery boy to an order
 * @param {number} orderId
 */
export const autoAssignDelivery = async (orderId) => {
  const response = await api.post('/delivery/assignments/auto_assign/', {
    order_id: orderId,
  });
  return response.data;
};

/**
 * Accept an assignment (delivery boy action)
 * @param {number} assignmentId
 */
export const acceptAssignment = async (assignmentId) => {
  const response = await api.post(`/delivery/assignments/${assignmentId}/accept/`);
  return response.data;
};

/**
 * Confirm pickup (delivery boy action)
 * @param {number} assignmentId
 */
export const confirmPickup = async (assignmentId) => {
  const response = await api.post(`/delivery/assignments/${assignmentId}/pickup/`);
  return response.data;
};

/**
 * Mark as out for delivery (delivery boy action)
 * @param {number} assignmentId
 */
export const markOutForDelivery = async (assignmentId) => {
  const response = await api.post(`/delivery/assignments/${assignmentId}/out_for_delivery/`);
  return response.data;
};

/**
 * Confirm delivery complete (delivery boy action)
 * @param {number} assignmentId
 */
export const confirmDelivery = async (assignmentId) => {
  const response = await api.post(`/delivery/assignments/${assignmentId}/deliver/`);
  return response.data;
};

// ============================================================
// PARCELS
// ============================================================

/**
 * Scan a parcel QR code (delivery boy action)
 * @param {string} qrToken
 */
export const scanParcel = async (qrToken) => {
  const response = await api.post('/delivery/parcels/scan/', { qr_token: qrToken });
  return response.data;
};

// ============================================================
// STATISTICS & DASHBOARD
// ============================================================

/**
 * Get delivery statistics
 */
export const getDeliveryStatistics = async () => {
  const response = await api.get('/delivery/statistics/');
  return response.data;
};

/**
 * Get delivery dashboard (active deliveries)
 */
export const getDeliveryDashboard = async () => {
  const response = await api.get('/delivery/dashboard/');
  return response.data;
};

// ============================================================
// LOCATION
// ============================================================

/**
 * Update delivery boy location (delivery boy action)
 * @param {Object} data - { latitude, longitude, accuracy, speed, assignment? }
 */
export const updateDeliveryLocation = async (data) => {
  const response = await api.post('/delivery/location/', data);
  return response.data;
};