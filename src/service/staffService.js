// frontend/src/service/staffService.js
import api from "./api";

/**
 * Get all preparing staff assigned to the manager's shop
 */
export const getPreparingStaff = async () => {
  const res = await api.get("/accounts/preparing-staff/");
  return res.data;
};

/**
 * Create a new preparing staff member for the manager's shop
 * @param {Object} data - { full_name, phone, password }
 */
export const createPreparingStaff = async (data) => {
  const res = await api.post("/accounts/preparing-staff/", data);
  return res.data;
};

/**
 * Update a preparing staff member (full_name, is_active, password)
 * @param {number} id - Profile ID
 * @param {Object} data - { full_name, is_active, password }
 */
export const updatePreparingStaff = async (id, data) => {
  const res = await api.patch(`/accounts/preparing-staff/${id}/`, data);
  return res.data;
};

/**
 * Toggle active/inactive status of a preparing staff member
 * @param {number} id - Profile ID
 * @param {boolean} isActive
 */
export const toggleStaffStatus = async (id, isActive) => {
  const res = await api.patch(`/accounts/preparing-staff/${id}/`, {
    is_active: isActive,
  });
  return res.data;
};

/**
 * Delete a preparing staff member account
 * @param {number} id - Profile ID
 */
export const deletePreparingStaff = async (id) => {
  const res = await api.delete(`/accounts/preparing-staff/${id}/`);
  return res.data;
};

/**
 * Get self profile for logged-in preparing staff member
 */
export const getStaffSelfProfile = async () => {
  const res = await api.get("/accounts/preparing-staff/me/");
  return res.data;
};

/**
 * Update self profile for logged-in preparing staff member
 * @param {Object} data - { full_name }
 */
export const updateStaffSelfProfile = async (data) => {
  const res = await api.patch("/accounts/preparing-staff/me/", data);
  return res.data;
};

/**
 * Get kitchen / manager dashboard statistics
 */
export const getKitchenDashboardStats = async () => {
  const res = await api.get("/orders/dashboard/");
  return res.data;
};
