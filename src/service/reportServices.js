// frontend/src/service/reportServices.js

import api from "./api";

/**
 * Get report data with filters
 */
export const getReport = async (params = {}) => {
  const response = await api.get("/reports/report/", { params });
  return response.data;
};

/**
 * Export report to Excel or PDF
 * @param {Object} params - { format, filter, start, end, shop }
 * @param {string} format - 'excel' or 'pdf'
 * @returns {Promise<Blob>}
 */
export const exportReport = async (params = {}) => {
  const response = await api.get("/reports/export/", {
    params,
    responseType: "blob",
    // 🔥 Ensure we don't transform the response
    transformResponse: [(data) => data],
  });
  // response.data is a Blob
  return response.data;
};


export const getPublicStats = async () => {
  const response = await api.get('/reports/stats/');
  return response.data;
};