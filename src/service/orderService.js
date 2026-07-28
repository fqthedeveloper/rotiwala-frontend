// frontend/src/service/orderService.js
import api from "./api";

/*
=================================
CUSTOMER
=================================
*/

export const placeOrder = async (data) => {
  const response = await api.post("/orders/place/", data);
  return response.data;
};

export const getMyOrders = async () => {
  const response = await api.get("/orders/my-orders/");
  return response.data;
};

export const getOrderDetail = async (orderId) => {
  const response = await api.get(`/orders/${orderId}/`);
  return response.data;
};

export const cancelOrder = async (orderId) => {
  const response = await api.post(`/orders/${orderId}/cancel/`);
  return response.data;
};

/*
=================================
MANAGER DASHBOARD
=================================
*/

export const getManagerDashboard = async () => {
  const response = await api.get("/orders/dashboard/");
  return response.data;
};

/*
=================================
MANAGER ORDERS
=================================
*/

export const getManagerOrders = async (date = null) => {
  let url = "/orders/manager/";
  if (date) {
    url += `?date=${date}`;
  }
  const response = await api.get(url);
  return response.data;
};

export const acceptOrder = async (orderId) => {
  const response = await api.post(`/orders/${orderId}/accept/`);
  return response.data;
};

export const rejectOrder = async (orderId, reason) => {
  const response = await api.post(`/orders/${orderId}/reject/`, { reason });
  return response.data;
};

export const preparingOrder = async (orderId) => {
  const response = await api.post(`/orders/${orderId}/preparing/`);
  return response.data;
};

export const readyOrder = async (orderId) => {
  const response = await api.post(`/orders/${orderId}/ready/`);
  return response.data;
};

export const paymentReceived = async (orderId) => {
  const response = await api.post(`/orders/${orderId}/payment/`);
  return response.data;
};

export const collectedOrder = async (orderId) => {
  const response = await api.post(`/orders/${orderId}/collected/`);
  return response.data;
};

/*
=================================
RECEIPT SERVICES
=================================
*/

export const generateReceipt = async (orderId, billType = 'standard') => {
  const response = await api.get(`/orders/receipt/${orderId}/?bill_type=${billType}`);
  return response.data;
};

export const printReceipt = async (orderId, data = {}) => {
  const response = await api.post(`/orders/receipt/${orderId}/print/`, data);
  return response.data;
};


export const downloadReceiptPDF = async (orderId, billType = 'standard') => {
  try {
    const token = localStorage.getItem("access");
    if (!token) {
      throw new Error('Authentication token not found');
    }

    const baseURL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";
    const url = `${baseURL}/orders/receipt/${orderId}/download/pdf/?bill_type=${billType}`;
    
    // Use fetch with proper headers
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/pdf'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `HTTP ${response.status}`);
    }

    // Get the blob
    const blob = await response.blob();
    
    // Verify the blob is a PDF
    if (blob.type !== 'application/pdf') {
      // If not PDF, try to read as text (might be error)
      const text = await blob.text();
      throw new Error(text || 'Unexpected response format');
    }

    // Create download link
    const urlObject = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = urlObject;
    link.download = `receipt_${orderId}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up
    setTimeout(() => window.URL.revokeObjectURL(urlObject), 5000);
    
    return true;
  } catch (error) {
    console.error('Download PDF error:', error);
    throw error;
  }
};


// FIXED: Download Text
export const downloadReceiptText = async (orderId, billType = 'standard') => {
  try {
    const token = localStorage.getItem("access");
    if (!token) {
      throw new Error('Authentication token not found');
    }

    const response = await api.get(`/orders/receipt/${orderId}/download/text/?bill_type=${billType}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'text/plain'
      }
    });

    // Create download link
    const blob = new Blob([response.data], { type: 'text/plain;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `receipt_${orderId}.txt`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    return response.data;
  } catch (error) {
    console.error('Download Text error:', error);
    throw error;
  }
};


export const getBillTypes = async () => {
  const response = await api.get('/orders/receipt/bill-types/');
  return response.data;
};

export const bulkPrintReceipts = async (orderIds, billType = 'standard') => {
  const response = await api.post('/orders/receipt/bulk-print/', {
    order_ids: orderIds,
    bill_type: billType
  });
  return response.data;
};


// ----------------------------------------------
// SUPERADMIN DASHBOARD
// ----------------------------------------------

export const getSuperAdminStats = async () => {
  const response = await api.get("accounts/superadmin/dashboard/stats/");
  return response.data;
};

export const getSuperAdminRecentOrders = async (limit = 10) => {
  const response = await api.get(`accounts/superadmin/dashboard/recent_orders/?limit=${limit}`);
  return response.data;
};

export const getSuperAdminRevenueTrend = async (days = 30) => {
  const response = await api.get(`accounts/superadmin/dashboard/revenue_trend/?days=${days}`);
  return response.data;
};

export const getSuperAdminOrdersByShop = async () => {
  const response = await api.get("accounts/superadmin/dashboard/orders_by_shop/");
  return response.data;
};

export const getSuperAdminTopProducts = async () => {
  const response = await api.get("accounts/superadmin/dashboard/top_products/");
  return response.data;
};


export const getSuperAdminOrders = async (params = {}) => {
  const response = await api.get("/orders/superadmin/orders/", { params });
  return response.data;
};