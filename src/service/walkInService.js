import api from "./api";

/*
=========================================
CUSTOMER SEARCH
=========================================
*/

export const searchCustomer = async (phone) => {

  const response = await api.get(
    "/orders/customer-search/",
    {
      params: {
        phone,
      },
    }
  );

  return response.data;
};

/*
=========================================
CREATE NEW WALK-IN CART
=========================================
*/

export const createWalkInCart = async (data) => {

  const response = await api.post(
    "/orders/walkin/cart/create/",
    data
  );

  return response.data;
};

/*
=========================================
ALL ACTIVE CARTS
=========================================
*/

export const getWalkInCarts = async () => {

  const response = await api.get(
    "/orders/walkin/cart/"
  );

  return response.data;
};

/*
=========================================
SINGLE CART
=========================================
*/

export const getWalkInCart = async (cartId) => {

  const response = await api.get(
    `/orders/walkin/cart/${cartId}/`
  );

  return response.data;
};

/*
=========================================
UPDATE CUSTOMER
=========================================
*/

export const updateWalkInCart = async (
  cartId,
  data
) => {

  const response = await api.patch(
    `/orders/walkin/cart/${cartId}/update/`,
    data
  );

  return response.data;
};

/*
=========================================
ADD ITEM TO CART
=========================================
*/

export const addItemToCart = async (
  cartId,
  menuItem,
  quantity = 1
) => {

  const response = await api.post(
    `/orders/walkin/cart/${cartId}/add-item/`,
    {
      menu_item: menuItem,
      quantity,
    }
  );

  return response.data;
};

/*
=========================================
UPDATE CART ITEM
=========================================
*/

export const updateCartItem = async (
  itemId,
  quantity
) => {

  const response = await api.patch(
    `/orders/walkin/cart/item/${itemId}/`,
    {
      quantity,
    }
  );

  return response.data;
};

/*
=========================================
DELETE CART ITEM
=========================================
*/

export const deleteCartItem = async (
  itemId
) => {

  const response = await api.delete(
    `/orders/walkin/cart/item/${itemId}/delete/`
  );

  return response.data;
};

/*
=========================================
PLACE WALK-IN ORDER
=========================================
*/

export const placeWalkInCart = async (
  cartId
) => {

  const response = await api.post(
    `/orders/walkin/cart/${cartId}/place/`
  );

  return response.data;
};

/*
=========================================
UPDATE WALK-IN ORDER
=========================================
*/

export const updateWalkInOrder = async (
  orderId,
  data
) => {

  const response = await api.patch(
    `/orders/walkin/order/${orderId}/update/`,
    data
  );

  return response.data;
};

/*
=========================================
ADD ITEM TO WALK-IN ORDER
=========================================
*/

export const addItemToOrder = async (
  orderId,
  menuItem,
  quantity = 1
) => {

  const response = await api.post(
    `/orders/walkin/order/${orderId}/add-item/`,
    {
      menu_item: menuItem,
      quantity,
    }
  );

  return response.data;
};

/*
=========================================
UPDATE WALK-IN ORDER ITEM
=========================================
*/

export const updateOrderItem = async (
  itemId,
  quantity
) => {

  const response = await api.patch(
    `/orders/walkin/order/item/${itemId}/`,
    {
      quantity,
    }
  );

  return response.data;
};

/*
=========================================
DELETE WALK-IN ORDER ITEM
=========================================
*/

export const deleteOrderItem = async (
  itemId
) => {

  const response = await api.delete(
    `/orders/walkin/order/item/${itemId}/delete/`
  );

  return response.data;
};