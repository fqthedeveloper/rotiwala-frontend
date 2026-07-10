// frontend/src/service/api.js

import axios from "axios";

/* =========================================================
   API BASE URL
========================================================= */

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "http://127.0.0.1:8000/api";

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

export default api;