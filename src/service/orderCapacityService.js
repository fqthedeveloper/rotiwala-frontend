import api from "./api";

export const getOnlineOrderStatus = async (shopId) => {
  const response = await api.get("/shop/online-order-status/", {
    params: shopId ? { shop_id: shopId } : undefined,
  });
  return response.data;
};

export const getManagerOrderCapacity = async () => {
  const response = await api.get("/manager/settings/order-capacity/");
  return response.data;
};

export const updateOrderCapacity = async (settings) => {
  const payload = typeof settings === "object"
    ? settings
    : { max_online_orders: settings };
  const response = await api.patch("/manager/settings/order-capacity/", {
    ...payload,
  });
  return response.data;
};

export const pauseOnlineOrders = async (reason = "") => {
  const response = await api.post("/manager/settings/order-capacity/pause/", {
    reason,
  });
  return response.data;
};

export const resumeOnlineOrders = async () => {
  const response = await api.post("/manager/settings/order-capacity/resume/");
  return response.data;
};
