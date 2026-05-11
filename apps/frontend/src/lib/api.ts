import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '/api/v1',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((cfg) => {
  const key = localStorage.getItem('admin_key');
  if (key) cfg.headers['x-admin-key'] = key;
  return cfg;
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    const msg = err.response?.data?.error ?? err.message;
    return Promise.reject(new Error(msg));
  },
);
