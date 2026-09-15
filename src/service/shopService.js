import api from "./api";

export const getShops = async () => {
  const response = await api.get("/shops/");

  return response.data;
};

export const getAssignedShopIds = (user) => {
  if (!user) return [];

  const ids = new Set();
  const pushValue = (value) => {
    if (!value && value !== 0) return;

    if (typeof value === "object") {
      if (value.id) ids.add(String(value.id));
      return;
    }

    if (Array.isArray(value)) {
      value.forEach((entry) => {
        if (typeof entry === "object") {
          if (entry.id) ids.add(String(entry.id));
        } else {
          ids.add(String(entry));
        }
      });
      return;
    }

    ids.add(String(value));
  };

  pushValue(user.shop_id);
  pushValue(user.shop);
  pushValue(user.shop?.id);
  pushValue(user.shops);
  pushValue(user.assigned_shops);

  return Array.from(ids);
};

export const getShopsForUser = async (user) => {
  const role = user?.role;
  const isAdmin = role === "super_admin" || role === "admin" || role === "staff_admin";

  if (isAdmin) {
    try {
      return await getShops();
    } catch (error) {
      console.warn("Admin shop list unavailable:", error);
      return [];
    }
  }

  try {
    const publicShops = await getShopsPublic();
    const assignedShopIds = getAssignedShopIds(user);

    if (!assignedShopIds.length) {
      const fallbackShopId = user?.shop_id || user?.shop?.id || user?.shop;
      if (fallbackShopId) {
        return publicShops.filter((shop) => String(shop.id) === String(fallbackShopId));
      }
      return publicShops;
    }

    return publicShops.filter((shop) =>
      assignedShopIds.includes(String(shop.id))
    );
  } catch (error) {
    console.warn("Public shop list fallback failed:", error);
    return [];
  }
};

export const getShop = async (id) => {
  const res = await api.get(`/shops/${id}/`);

  return res.data;
};

export const createShop =
  async (data) => {

    const response =
      await api.post(
        "/shops/",
        data,
        {
          headers: {
            "Content-Type":
              "multipart/form-data",
          },
        }
      );

    return response.data;
  };

export const updateShop =
  async (id,data) => {

    const response =
      await api.put(
        `/shops/${id}/`,
        data,
        {
          headers:{
            "Content-Type":
              "multipart/form-data",
          },
        }
      );

    return response.data;
  };
export const deleteShop = async (id) => {
  const response = await api.delete(`/shops/${id}/`);

  return response.data;
};

export const assignManager = async (data) => {
  const response = await api.post("/shops/assign-manager/", data);

  return response.data;
};


export const getShopsPublic = async () => {

  const response =
    await api.get(
      "/shops/public/"
    );

  return response.data;
};

export const getNearestShop =
  async(latitude, longitude) => {

    const response =
      await api.post(
        "/shops/nearby/",
        {
          latitude,
          longitude
        }
      );

    return response.data;
  };


export const getCategoriesByShopPublic =
  async(shopId)=>{

    const response =
      await api.get(
        `/menu/public/shop/${shopId}/categories/`
      );

    return response.data;
  };

export const getItemsByCategoryPublic =
  async(categoryId)=>{

    const response =
      await api.get(
        `/menu/public/category/${categoryId}/items/`
      );

    return response.data;
  };

export const getMenuItemPublic =
  async(id)=>{

    const response =
      await api.get(
        `/menu/public/item/${id}/`
      );

    return response.data;
  };


export const getShopById = async (id) => {
  const response = await api.get(`/shops/${id}/`);
  return response.data;
};
/**
 * Update delivery assignment mode for a shop
 * @param {number} shopId
 * @param {string} mode - 'manual' or 'auto'
 */
export const updateDeliveryAssignmentMode = async (shopId, mode) => {
  const response = await api.patch(`/shops/${shopId}/`, {
    delivery_assignment_mode: mode,
  });
  return response.data;
};

/**
 * Update shop UPI settings (upi_id and/or upi_qr_image)
 * Sends multipart/form-data so the image file is uploaded
 * @param {number} shopId
 * @param {Object} data - { upi_id?: string, upi_qr_image?: File }
 */
export const updateShopUPI = async (shopId, data) => {
  const formData = new FormData();
  if (data.upi_id !== undefined) formData.append('upi_id', data.upi_id);
  if (data.upi_qr_image instanceof File) formData.append('upi_qr_image', data.upi_qr_image);

  const response = await api.patch(`/shops/${shopId}/`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};