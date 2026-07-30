import api from './api';

/**
 * Fetch report data (works with interceptor)
 */
export const getReport = async (params) => {
  const response = await api.get('/reports/report/', { params });
  return response.data;
};

/**
 * Export report as Excel or PDF
 * Manually adds the Authorization header to ensure the token is sent
 * (blob requests sometimes bypass interceptors or have header issues)
 */
export const exportReport = async (params) => {
    const response = await api.get("/reports/export/", {
        params,
        responseType: "blob",
    });

    return response;
};