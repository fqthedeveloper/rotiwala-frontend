import api from "./api";

export const getShops = async () => {
  const response = await api.get("/shops/");

  return response.data;
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