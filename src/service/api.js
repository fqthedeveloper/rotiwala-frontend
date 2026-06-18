import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 15000,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access");

    console.log("TOKEN:", token);
    console.log("URL:", config.url);

    if (token) {
      config.headers.Authorization =
        `Bearer ${token}`;
    }

    console.log(
      "AUTH HEADER:",
      config.headers.Authorization
    );

    return config;
  }
);

api.interceptors.response.use(
  (response) => response,

  async (error) => {

    const originalRequest =
      error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry
    ) {

      originalRequest._retry =
        true;

      try {

        const refreshToken =
          localStorage.getItem(
            "refresh"
          );

        if (!refreshToken) {

          throw new Error(
            "No refresh token"
          );
        }

        const response =
          await axios.post(
            `${import.meta.env.VITE_API_URL}/token/refresh/`,
            {
              refresh:
                refreshToken,
            }
          );

        const newAccessToken =
          response.data.access;

        localStorage.setItem(
          "access",
          newAccessToken
        );

        originalRequest.headers.Authorization =
          `Bearer ${newAccessToken}`;

        return api(
          originalRequest
        );

      } catch (refreshError) {

        console.log(
          "Refresh Failed",
          refreshError
        );

        localStorage.removeItem(
          "access"
        );

        localStorage.removeItem(
          "refresh"
        );

        localStorage.removeItem(
          "role"
        );

        localStorage.removeItem(
          "user"
        );

        localStorage.removeItem(
          "user_id"
        );

        window.location.href =
          "/login";

        return Promise.reject(
          refreshError
        );
      }
    }

    return Promise.reject(
      error
    );
  }
);

export default api;