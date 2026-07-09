import api from "./api";

/*
=================================
CUSTOMER
=================================
*/

export const placeOrder = async (data) => {
  const response = await api.post(
    "/orders/place/",
    data
  );

  return response.data;
};

export const getMyOrders = async () => {
  const response = await api.get(
    "/orders/my-orders/"
  );

  return response.data;
};

export const getOrderDetail = async (
  orderId
) => {
  const response = await api.get(
    `/orders/${orderId}/`
  );

  return response.data;
};

export const cancelOrder = async (
  orderId
) => {
  const response = await api.post(
    `/orders/${orderId}/cancel/`
  );

  return response.data;
};

/*
=================================
MANAGER DASHBOARD
=================================
*/

export const getManagerDashboard =
  async () => {

    const response =
      await api.get(
        "/orders/dashboard/"
      );

    return response.data;
  };

/*
=================================
MANAGER ORDERS
=================================
*/

export const getManagerOrders =
  async (
    date = null
  ) => {

    let url =
      "/orders/manager/";

    if (date) {

      url += `?date=${date}`;

    }

    const response =
      await api.get(url);

    return response.data;
  };

export const acceptOrder =
  async (orderId) => {

    const response =
      await api.post(
        `/orders/${orderId}/accept/`
      );

    return response.data;
  };

export const rejectOrder =
  async (
    orderId,
    reason
  ) => {

    const response =
      await api.post(
        `/orders/${orderId}/reject/`,
        {
          reason,
        }
      );

    return response.data;
  };

export const preparingOrder =
  async (orderId) => {

    const response =
      await api.post(
        `/orders/${orderId}/preparing/`
      );

    return response.data;
  };

export const readyOrder =
  async (orderId) => {

    const response =
      await api.post(
        `/orders/${orderId}/ready/`
      );

    return response.data;
  };

export const paymentReceived =
  async (orderId) => {

    const response =
      await api.post(
        `/orders/${orderId}/payment/`
      );

    return response.data;
  };

export const collectedOrder =
  async (orderId) => {

    const response =
      await api.post(
        `/orders/${orderId}/collected/`
      );

    return response.data;
  };


export const generateReceipt = async (orderId) => {
  const response = await api.get(`/orders/receipt/${orderId}/`);
  return response.data;
};

export const printReceipt = async (orderId, printerData = {}) => {
  const response = await api.post(`/orders/receipt/${orderId}/print/`, printerData);
  return response.data;
};

export const bulkPrintReceipts = async (orderIds) => {
  const response = await api.post('/orders/receipt/bulk-print/', { order_ids: orderIds });
  return response.data;
};