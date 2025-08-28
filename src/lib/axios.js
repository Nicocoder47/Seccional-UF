import axios from 'axios';

// Base URL desde el .env
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true, // cookies si tu backend las usa
});

// Interceptor para inyectar token desde localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para manejar 401 y refresco de token
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      // opcional: redirigir al login
      window.dispatchEvent(new Event('auth-logout'));
    }
    return Promise.reject(err);
  }
);

export default api;
