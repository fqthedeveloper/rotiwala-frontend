// src/service/customerService.js (or add to existing)
import api from './api';

export const getCustomers = (params = {}) => api.get('/accounts/customers/', { params });
export const getCustomer = (id) => api.get(`/accounts/customers/${id}/`);
export const toggleBlockCustomer = (id, isActive) => api.patch(`/accounts/customers/${id}/toggle-block/`, { is_active: isActive });
export const createFlag = (customerId, reason) => api.post(`/accounts/customers/${customerId}/flag/`, { reason });
export const deleteFlag = (customerId, flagId) => api.delete(`/accounts/customers/${customerId}/flag/${flagId}/`);