// src/service/videoApi.js
import api, { API } from './api';

// Base URL for media files (strip /api from API)
const MEDIA_BASE_URL = API.replace(/\/api\/?$/, '');

// Helper to get full media URL
export const getMediaUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${MEDIA_BASE_URL}${cleanPath}`;
};

// ----- MARQUEE -----
export const getMarqueeItems = () => api.get('/videos/marquee/');
export const getAdminMarquee = () => api.get('/videos/marquee/admin/');
export const createMarquee = (data) => api.post('/videos/marquee/admin/', data);
export const updateMarquee = (id, data) => api.patch(`/videos/marquee/admin/${id}/`, data); // ✅ PATCH for partial updates
export const deleteMarquee = (id) => api.delete(`/videos/marquee/admin/${id}/`);

// ----- TESTIMONIALS -----
export const getApprovedReviews = () => api.get('/videos/reviews/');
export const submitReview = (data) => api.post('/videos/reviews/submit/', data);
export const getAdminReviews = () => api.get('/videos/reviews/admin/');
export const updateReview = (id, data) => api.patch(`/videos/reviews/admin/${id}/`, data);
export const deleteReview = (id) => api.delete(`/videos/reviews/admin/${id}/`);

// ----- VIDEOS -----
export const getApprovedVideos = () => api.get('/videos/videos/');

// Submit video with FormData
export const submitVideo = (data) => {
  return api.post('/videos/videos/submit/', data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

// Admin endpoints
export const getAdminVideos = (status = '') => {
  const url = status ? `/videos/videos/admin/?status=${status}` : '/videos/videos/admin/';
  return api.get(url);
};

export const updateVideoStatus = (id, status) => api.patch(`/videos/videos/admin/${id}/`, { status });
export const deleteVideo = (id) => api.delete(`/videos/videos/admin/${id}/`);