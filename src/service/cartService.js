import api from "./api";

/*
==================================
GET CART
==================================
*/

export const getCart = async () => {
  const response = await api.get("/cart/");
  return response.data;
};

export const addToCart = async (
  menuItemId,
  quantity = 1
) => {
  const response = await api.post(
    "/cart/add/",
    {
      menu_item: menuItemId,
      quantity,
    }
  );

  return response.data;
};

export const updateCartItem = async (
  cartItemId,
  quantity
) => {
  const response = await api.patch(
    `/cart/update/${cartItemId}/`,
    {
      quantity,
    }
  );

  return response.data;
};

export const removeCartItem = async (
  cartItemId
) => {
  const response = await api.delete(
    `/cart/remove/${cartItemId}/`
  );

  return response.data;
};

export const clearCart = async () => {
  const response = await api.delete(
    "/cart/clear/"
  );

  return response.data;
};

export const getCartCount = async () => {
  const response = await api.get(
    "/cart/count/"
  );

  return response.data;
};