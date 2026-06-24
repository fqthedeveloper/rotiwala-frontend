import api from "./api";

/*
=================================
CUSTOMER SEARCH
=================================
*/

export const searchCustomer =
  async (phone) => {

    const response =
      await api.get(
        `/orders/customer-search/?phone=${phone}`
      );

    return response.data;
  };

/*
=================================
WALK IN ORDER
=================================
*/

export const createWalkInOrder =
  async (data) => {

    const response =
      await api.post(
        "/orders/walkin/",
        data
      );

    return response.data;
  };