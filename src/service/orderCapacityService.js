import api from "./api";

export const getOnlineOrderStatus = async () => {
  const response = await api.get("/shop/online-order-status/");
  return response.data;
};

export const getManagerOrderCapacity = async () => {
  const response = await api.get("/manager/settings/order-capacity/");
  return response.data;
};

export const updateOrderCapacity = async (maxOnlineOrders) => {
  const response = await api.patch("/manager/settings/order-capacity/", {
    max_online_orders: maxOnlineOrders,
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
