import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 15000,
});

/* =========================================================
   ENDPOINTS THAT MUST *NOT* TRIGGER TOKEN REFRESH
   (a 401 from these means "wrong credentials", not "expired token")
   ========================================================= */
const AUTH_ENDPOINTS = [
  "/accounts/password-login/",
  "/accounts/firebase-login/",
  "/accounts/register/",
  "/accounts/send-otp/",
  "/accounts/verify-otp/",
  "/token/",
  "/token/refresh/",
];

const isAuthEndpoint = (url = "") =>
  AUTH_ENDPOINTS.some((path) => url.includes(path));

/* =========================================================
   REQUEST INTERCEPTOR — attach Bearer token
   ========================================================= */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access");
    if (token && !isAuthEndpoint(config.url)) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

/* =========================================================
   RESPONSE INTERCEPTOR — refresh only on protected APIs
   ========================================================= */
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;

    /* 🛑 Don't refresh / redirect for login endpoints */
    if (isAuthEndpoint(originalRequest?.url)) {
      return Promise.reject(error);
    }

    /* 🛑 Don't try to refresh if user isn't logged in */
    const refreshToken = localStorage.getItem("refresh");
    if (!refreshToken) {
      return Promise.reject(error);
    }

    /* ✅ Real expired-token case */
    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/token/refresh/`,
          { refresh: refreshToken },
        );

        const newAccessToken = response.data.access;
        localStorage.setItem("access", newAccessToken);
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        return api(originalRequest);
      } catch (refreshError) {
        console.warn("Refresh failed:", refreshError);

        ["access", "refresh", "user", "role", "user_id"].forEach((k) =>
          localStorage.removeItem(k),
        );

        window.dispatchEvent(new Event("authChanged"));

        /* Redirect only if not already on /login */
        if (!window.location.pathname.startsWith("/login")) {
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default api;
