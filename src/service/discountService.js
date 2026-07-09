import api from './api';

export const getDiscounts = (params = {}) => api.get('/discounts/', { params });
export const createDiscount = (data) => api.post('/discounts/', data);
export const getDiscount = (id) => api.get(`/discounts/${id}/`);
export const updateDiscount = (id, data) => api.patch(`/discounts/${id}/`, data);
export const deleteDiscount = (id) => api.delete(`/discounts/${id}/`);