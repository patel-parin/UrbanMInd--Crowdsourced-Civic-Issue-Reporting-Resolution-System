import axios from "axios";

const baseURL = "http://localhost:5000/api";

const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ Add token ONLY for protected APIs
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    // 🚫 DO NOT attach token to auth routes
    if (
      token &&
      !config.url.includes("/auth/login") &&
      !config.url.includes("/auth/register")
    ) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Auto logout on 401 (this part is OK)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
