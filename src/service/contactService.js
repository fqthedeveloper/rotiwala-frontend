// src/service/contactService.js
import api from './api';

export const getContactInfo = async () => {
  const response = await api.get('/contact/');
  return response.data;
};

export const submitFeedback = async (data) => {
  const response = await api.post('/contact/feedback/', data);
  return response.data;
};

// --- Admin/Manager feedback management ---
export const getAdminFeedback = async (params = {}) => {
  const response = await api.get('/contact/admin/feedback/', { params });
  return response.data;
};

export const updateFeedback = async (id, data) => {
  const response = await api.patch(`/contact/admin/feedback/${id}/`, data);
  return response.data;
};