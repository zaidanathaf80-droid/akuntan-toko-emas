import axios from "axios";

// Backend API Configuration
// Production Backend: Laravel 11 @ http://127.0.0.1:8000/api
const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

console.log("🔌 API Configuration:", { API_URL });

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor untuk menambahkan token jika ada
api.interceptors.request.use((config) => {
  console.log("📤 API Request:", config.method.toUpperCase(), config.url);
  const token = localStorage.getItem("authToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor untuk handle error
api.interceptors.response.use(
  (response) => {
    console.log("📥 API Response:", response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error("❌ API Error:", {
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      message: error.message,
      data: error.response?.data,
    });
    if (error.response?.status === 401) {
      localStorage.removeItem("authToken");
    }
    return Promise.reject(error);
  },
);

// Transaction API
// All endpoints are tested and production-ready
export const transactionAPI = {
  getAll: () => api.get("/transactions"),
  getOne: (id) => api.get(`/transactions/${id}`),
  create: (data) => api.post("/transactions", data),
  update: (id, data) => api.put(`/transactions/${id}`, data),
  delete: (id) => api.delete(`/transactions/${id}`),
  filter: (filters) => api.post("/transactions/filter", filters),
};

// Dashboard API
export const dashboardAPI = {
  getSummary: (period = "monthly") =>
    api.get(`/dashboard/summary?period=${period}`),
  getStats: (period = "monthly") =>
    api.get(`/dashboard/stats?period=${period}`),
  getReports: () => api.get("/dashboard/reports"),
};

// Category API
export const categoryAPI = {
  getAll: () => api.get("/categories"),
};

// Locked Snapshot API
export const lockedSnapshotAPI = {
  getAll: (category) => api.get(category ? `/locked-snapshots?category=${category}` : "/locked-snapshots"),
  create: (data) => api.post("/locked-snapshots", data),
  update: (id, data) => api.put(`/locked-snapshots/${id}`, data),
  delete: (id) => api.delete(`/locked-snapshots/${id}`),
  restore: (id) => api.post(`/locked-snapshots/${id}/restore`),
  getTrash: () => api.get("/locked-snapshots/trash/list"),
};

// Laku Lock API — permanent checkbox lock for Data Terjual sidebar
export const lakuLockAPI = {
  getAll: () => api.get("/laku-locks"),
  lockIds: (ids) => api.post("/laku-locks", { ids }),
};

// Nota LAKU API
export const notaLakuAPI = {
  create: (data) => api.post("/nota-laku", data),
  markPrinted: (id) => api.post(`/nota-laku/${id}/print`),
  delete: (id) => api.delete(`/nota-laku/${id}`),
};

export default api;
