import axios from 'axios';

// Use local backend when running on localhost (avoids CORS with Vercel)
const isLocalhost = typeof window !== 'undefined' && /localhost|127\.0\.0\.1/.test(window.location.origin);
const rawUrl = isLocalhost ? 'http://localhost:5000' : (import.meta.env.VITE_API_URL || 'http://localhost:5000');
const baseURL = rawUrl.endsWith('/api') ? rawUrl : `${rawUrl.replace(/\/$/, '')}/api`;

const api = axios.create({
  baseURL,                               // e.g. http://localhost:5000/api
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth expiry
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
