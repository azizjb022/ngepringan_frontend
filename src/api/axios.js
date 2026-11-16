import axios from 'axios';

const api = axios.create({
  
  baseURL: import.meta.env.VITE_API_URL || 'https://ngepringan-backend.vercel.app//api',
  //baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const msg = String(error.response?.data?.message || '');
    if (
      status === 401 ||
      (status === 403 &&
        (msg.toLowerCase().includes('token') || msg.toLowerCase().includes('akses ditolak')))
    ) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;