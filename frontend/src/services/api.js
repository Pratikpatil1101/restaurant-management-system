import axios from "axios";

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000/api",
  headers: { "Content-Type": "application/json" }
});

API.interceptors.request.use((request) => {
  const token = localStorage.getItem("token");
  if (token) {
    request.headers.Authorization = `Bearer ${token}`;
  }
  return request;
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("restaurant-auth");
      if (window.location.pathname !== "/") {
        window.location.href = "/";
      }
    }
    return Promise.reject(error);
  }
);

export function getApiErrorMessage(error, fallback = "Something went wrong") {
  return error?.response?.data?.msg || error?.response?.data?.message || error?.message || fallback;
}

export const authApi = {
  login: (payload) => API.post("/auth/login", payload)
};

export const menuApi = {
  getAll: () => API.get("/menu")
};

export const orderApi = {
  getAll: () => API.get("/orders"),
  create: (payload) => API.post("/orders", payload),
  update: (id, payload) => API.put(`/orders/${id}`, payload),
  remove: (id) => API.delete(`/orders/${id}`)
};

export const userApi = {
  createStaff: (payload) => API.post("/users/create", payload)
};

export const adminApi = {
  getStats: () => API.get("/admin/stats")
};

export default API;
