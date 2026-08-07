// src/service/videoApi.js
import api from './api';

// ----- Testimonials -----
export const getMarqueeTestimonials = () => api.get('/videos/testimonials/marquee/');
export const submitTestimonial = (data) => api.post('/videos/testimonials/submit/', data);
export const getAdminTestimonials = () => api.get('/videos/testimonials/admin/');
export const updateTestimonial = (id, data) => api.patch(`/videos/testimonials/admin/${id}/`, data);
export const deleteTestimonial = (id) => api.delete(`/videos/testimonials/admin/${id}/`);

// ----- Videos -----
export const getApprovedVideos = () => api.get('/videos/');
export const submitVideo = (data) => api.post('/videos/submit/', data);
export const getAdminVideos = (status = '') => {
  const url = status ? `/videos/admin/?status=${status}` : '/videos/admin/';
  return api.get(url);
};
export const updateVideoStatus = (id, status) => api.patch(`/videos/admin/${id}/`, { status });
export const deleteVideo = (id) => api.delete(`/videos/admin/${id}/`);