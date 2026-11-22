import axios from "axios";

const API_ORIGIN = (import.meta.env.VITE_API_URL || "http://localhost:8080").replace(/\/+$/, "");

const api = axios.create({
  baseURL: API_ORIGIN,
  headers: {
    "Content-Type": "application/json",
  },
});

/* =========================================================
   CHECK JWT EXPIRATION
   ========================================================= */

const isTokenExpired = (token) => {
  try {
    const parts = token.split(".");

    if (parts.length !== 3) {
      return true;
    }

    const payload = JSON.parse(
      atob(parts[1])
    );

    if (!payload.exp) {
      return true;
    }

    const currentTime = Date.now() / 1000;

    return payload.exp <= currentTime;
  } catch (error) {
    console.error(
      "Invalid JWT token:",
      error
    );

    return true;
  }
};

/* =========================================================
   CLEAR AUTHENTICATION
   ========================================================= */

const clearAuthentication = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("userId");
  localStorage.removeItem("email");
  localStorage.removeItem("role");

  window.dispatchEvent(
    new Event("storage")
  );
};

/* =========================================================
   REQUEST INTERCEPTOR
   ========================================================= */

api.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem("token");

    if (token) {
      if (isTokenExpired(token)) {
        clearAuthentication();

        window.location.href = "/login";

        return Promise.reject(
          new Error("JWT token expired")
        );
      }

      config.headers =
        config.headers || {};

      config.headers.Authorization =
        `Bearer ${token}`;
    }

    return config;
  },

  (error) => {
    return Promise.reject(error);
  }
);

/* =========================================================
   RESPONSE INTERCEPTOR
   ========================================================= */

api.interceptors.response.use(
  (response) => {
    return response;
  },

  (error) => {
    /*
     * If backend says token is unauthorized,
     * remove the old authentication data.
     */
    if (error.response?.status === 401) {
      clearAuthentication();

      /*
       * Don't redirect when the failed request
       * itself is the login request.
       */
      if (
        !error.config?.url?.includes(
          "/api/auth/login"
        )
      ) {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default api;