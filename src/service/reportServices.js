import api from './api';

/**
 * Fetch report data (works with interceptor)
 */
export const getReport = async (params) => {
  const response = await api.get('/reports/report/', { params });
  return response.data;
};

export const exportReport = async (params) => {
  const token = localStorage.getItem('accessToken'); // or however you store it
  const response = await api.get('/reports/export/', {
    params,
    responseType: 'blob',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response;
};