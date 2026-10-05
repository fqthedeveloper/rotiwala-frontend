import api from "./api";

export const getMenuItems =
  async () => {

    const res =
      await api.get(
        "/menu/items/"
      );

    return res.data;
  };

export const createMenuItem = async (formData, onUploadProgress) => {
  const res = await api.post("/menu/items/", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    timeout: 180000, // 3 minutes for high-res 20MB image uploads
    maxContentLength: Infinity,
    maxBodyLength: Infinity,
    onUploadProgress,
  });
  return res.data;
};

export const updateMenuItem = async (id, formData, onUploadProgress) => {
  const res = await api.patch(`/menu/items/${id}/`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    timeout: 180000, // 3 minutes for high-res 20MB image uploads
    maxContentLength: Infinity,
    maxBodyLength: Infinity,
    onUploadProgress,
  });
  return res.data;
};

export const deleteMenuItem =
  async (id) => {

    const res =
      await api.delete(
        `/menu/items/${id}/`
      );

    return res.data;
  };


export const getMenuItemById =
  async (id) => {

    const res =
      await api.get(
        `/menu/items/${id}/`
      );

    return res.data;
  };


export const getCategoriesByShop =
  async (shopId) => {

    const response =
      await api.get(
        `/menu/shop/${shopId}/categories/`
      );

    return response.data;
  };

export const getItemsByCategory = async (categoryId) => {
  const response = await api.get(
    `/menu/public/category/${categoryId}/items/`   // ✅ added "public/"
  );
  return response.data;
};



export const getCategoriesByShopPublic =
  async (shopId) => {

    const response =
      await api.get(
        `/menu/shop/${shopId}/categories/`
      );

    return response.data;
  };

export const getItemsByCategoryPublic =
  async (categoryId) => {

    const response =
      await api.get(
        `/menu/public/category/${categoryId}/items/`
      );

    return response.data;
  };



export const getItemsPublic = async () => {
  const response = await api.get(
    "/menu/public/items/"
  );

  return response.data;
};

export const getPublicCategories = async () => {
  const response = await api.get("/menu/public/categories/");
  return response.data;
};

export const getPublicMenuItems = async (params = {}) => {
  const normalized = { ...params };
  const shopVal = params.shop || params.shop_id || params.shopId;
  if (shopVal) {
    normalized.shop = shopVal;
    normalized.shop_id = shopVal;
  }

  const query = new URLSearchParams(normalized).toString();
  const url = `/menu/public/items/${query ? `?${query}` : ""}`;
  const res = await api.get(url);
  return res.data;
};