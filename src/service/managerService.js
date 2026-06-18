import api from "./api";

export const getManagers =
  async () => {

    const res =
      await api.get(
        "/accounts/managers/"
      );

    return res.data;
  };

export const createManager =
  async (data) => {

    const res =
      await api.post(
        "/accounts/create-manager/",
        data
      );

    return res.data;
  };

export const assignManager =
  async (data) => {

    const res =
      await api.post(
        "/accounts/assign-manager/",
        data
      );

    return res.data;
  };

export const assignManagerToShop =
  async (managerId, shopId) => {

    const res =
      await api.post(
        "/accounts/assign-manager/",
        {
          manager_id: managerId,
          shop_id: shopId,
        }
      );

    return res.data;
  };


export const getManager =
  async (id) => {

    const res =
      await api.get(
        `/accounts/managers/${id}/`
      );

    return res.data;
  };

export const updateManager =
  async (
    id,
    data
  ) => {

    const res =
      await api.put(
        `/accounts/managers/${id}/`,
        data
      );

    return res.data;
  };

export const deleteManager =
  async (id) => {

    const res =
      await api.delete(
        `/accounts/managers/${id}/`
      );

    return res.data;
  };