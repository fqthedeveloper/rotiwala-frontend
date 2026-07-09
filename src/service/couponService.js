import api from './api';

export const getCoupons = (params = {}) => api.get('/coupons/', { params });
export const getCoupon = (id) => api.get(`/coupons/${id}/`);
export const createCoupon = (data) => api.post('/coupons/', data);
export const updateCoupon = (id, data) => api.patch(`/coupons/${id}/`, data);
export const deleteCoupon = (id) => api.delete(`/coupons/${id}/`);
export const generateBulkCoupons = (data) => api.post('/coupons/bulk/', data);

// Fetch available promotions (discounts + coupons) for a shop
export const fetchAvailablePromotions = async (shopId) => {
  const response = await api.get('/orders/available-promotions/', {
    params: { shop_id: shopId }
  });
  return response.data.promotions; // returns array of promotions
};

// Apply selected promotion and get preview
export const applyPromotionPreview = async (shopId, promotionType, promotionId, couponCode) => {
  const payload = {
    shop_id: shopId,
    promotion_type: promotionType,
    promotion_id: promotionId,   // only for discount
    coupon_code: couponCode,      // only for coupon
  };
  // Remove undefined fields
  Object.keys(payload).forEach(key => payload[key] === undefined && delete payload[key]);

  const response = await api.post('/orders/checkout/preview/', payload);
  return response.data;
};