// src/lib/axios.js
import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL || "";

export const api = axios.create({
  baseURL,
  withCredentials: true,
  timeout: 8000,
  headers: { Accept: "application/json" },
});

api.interceptors.response.use(
  (r) => r,
  (error) => {
    if (!baseURL) {
      return Promise.reject(new Error("API no configurada (VITE_API_URL vacío)"));
    }
    if (error.code === "ECONNABORTED") {
      return Promise.reject(new Error("Tiempo de espera agotado al llamar a la API"));
    }
    return Promise.reject(error);
  }
);

export function assertAPI() {
  if (!baseURL) throw new Error("API no configurada (VITE_API_URL vacío)");
}
