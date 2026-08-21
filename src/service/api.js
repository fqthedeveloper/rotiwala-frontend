// frontend/src/service/api.js

import axios from "axios";

/* =========================================================
   API BASE URL
========================================================= */

const normalizeApiBaseUrl = (value = "") => {
  const trimmed = value?.trim();
  if (!trimmed) return VITE_API_URL;

  const withoutPrefix = trimmed.replace(/^VITE_API_URL=/i, "").trim();
  return withoutPrefix.replace(/\/+$/, "");
};

const API_BASE_URL = normalizeApiBaseUrl(
  import.meta.env.VITE_API_URL
);


// ✅ Add named export for the base URL
export const API = API_BASE_URL;
/* =========================================================
   CREATE AXIOS INSTANCE
========================================================= */

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

/* =========================================================
   AUTH ENDPOINTS
========================================================= */

const AUTH_ENDPOINTS = [
  "/accounts/password-login/",
  "/accounts/firebase-login/",
  "/accounts/register/",
  "/accounts/send-otp/",
  "/accounts/verify-otp/",
  "/token/",
];

const isAuthEndpoint = (url = "") =>
  AUTH_ENDPOINTS.some((path) => url.includes(path));

/* =========================================================
   REQUEST INTERCEPTOR
========================================================= */

api.interceptors.request.use(
  (config) => {
    const accessToken =
      localStorage.getItem("access");

    if (
      accessToken &&
      !isAuthEndpoint(config.url)
    ) {
      config.headers.Authorization =
        `Bearer ${accessToken}`;
    }

    if (config.responseType === "blob") {
      config.headers.Accept =
        "application/pdf";
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/* =========================================================
   RESPONSE INTERCEPTOR
========================================================= */

api.interceptors.response.use(
  (response) => response,

  (error) => {
    const originalRequest =
      error.config;

    const status =
      error.response?.status;

    if (
      status === 401 &&
      !isAuthEndpoint(originalRequest?.url)
    ) {
      console.warn(
        "Access token expired. Logging out..."
      );

      localStorage.removeItem("access");
      localStorage.removeItem("refresh");
      localStorage.removeItem("user");
      localStorage.removeItem("role");
      localStorage.removeItem("user_id");
      localStorage.removeItem("selected_shop");

      window.dispatchEvent(
        new Event("authChanged")
      );

      if (
        !window.location.pathname.startsWith(
          "/login"
        )
      ) {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

// ===================== PROFILE & PASSWORD =====================

/**
 * Change or assign password (authenticated)
 * @param {string} oldPassword - Required only if user already has a password
 * @param {string} newPassword
 */
export const changePassword = async (oldPassword, newPassword) => {
  const payload = { new_password: newPassword };
  if (oldPassword) payload.old_password = oldPassword;
  return api.put('/accounts/change-password/', payload);
};

export const updateProfile = async (profileData) => {
  return api.put('/accounts/profile/', profileData);
};

// ===================== PHONE UPDATE WITH OTP =====================

/**
 * Send OTP to new phone number (authenticated)
 * @param {string} newPhone
 */
export const sendPhoneUpdateOTP = async (newPhone) => {
  return api.post('/accounts/send-phone-update-otp/', { new_phone: newPhone });
};

/**
 * Verify OTP and update phone (authenticated)
 * @param {string} newPhone
 * @param {string} otp
 */
export const verifyPhoneUpdateOTP = async (newPhone, otp) => {
  return api.post('/accounts/verify-phone-update-otp/', { new_phone: newPhone, otp });
};

// ===================== FORGOT PASSWORD (RESET) =====================

/**
 * Send OTP for password reset (no auth)
 * @param {string} phone
 */
export const sendPasswordResetOTP = async (phone) => {
  return api.post('/accounts/send-password-reset-otp/', { phone });
};

/**
 * Verify OTP and reset password (no auth)
 * @param {string} phone
 * @param {string} otp
 * @param {string} newPassword
 */
export const verifyPasswordResetOTP = async (phone, otp, newPassword) => {
  return api.post('/accounts/verify-password-reset-otp/', { phone, otp, new_password: newPassword });
};

// ===================== DELIVERY ADDRESSES =====================

/**
 * Get all saved addresses for the authenticated customer.
 */
export const getAddresses = async () => {
  const response = await api.get('/accounts/addresses/');
  return response.data;
};

/**
 * Create a new delivery address.
 * @param {Object} addressData - { label, address, latitude, longitude, is_default? }
 */
export const createAddress = async (addressData) => {
  const response = await api.post('/accounts/addresses/', addressData);
  return response.data;
};

/**
 * Update an existing delivery address.
 * @param {number} addressId
 * @param {Object} addressData - { label, address, latitude, longitude, is_default? }
 */
export const updateAddress = async (addressId, addressData) => {
  const response = await api.patch(`/accounts/addresses/${addressId}/`, addressData);
  return response.data;
};

/**
 * Delete a delivery address.
 * @param {number} addressId
 */
export const deleteAddress = async (addressId) => {
  await api.delete(`/accounts/addresses/${addressId}/`);
};

/**
 * Set an address as default.
 * @param {number} addressId
 */
export const setDefaultAddress = async (addressId) => {
  const response = await api.post(`/accounts/addresses/${addressId}/set_default/`);
  return response.data;
};

/**
 * Get the default address for the customer.
 */
export const getDefaultAddress = async () => {
  const response = await api.get('/accounts/addresses/default/');
  return response.data;
};

export default api;

