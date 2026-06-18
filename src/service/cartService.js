import api from "./api";

export const addToCart =
  async (data) => {

    const response =
      await api.post(
        "/cart/add/",
        data
      );

    return response.data;
  };