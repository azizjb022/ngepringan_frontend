import axios from 'axios';

let apiTarget = import.meta.env.VITE_API_URL || 'https://ngepringan-backend.vercel.app/api';

// Failsafe: Jika dijalankan di browser (Production / Vercel), jangan biarkan memanggil localhost!
if (typeof window !== 'undefined') {
  const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  if (!isLocalhost && (!apiTarget || apiTarget.includes('localhost') || apiTarget.includes('127.0.0.1'))) {
    apiTarget = 'https://ngepringan-backend.vercel.app/api';
  }
}

const api = axios.create({
  baseURL: apiTarget,
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
    const isLoginRequest = error.config?.url?.includes('/auth/login');

    if (
      !isLoginRequest &&
      (status === 401 ||
        (status === 403 &&
          (msg.toLowerCase().includes('token') || msg.toLowerCase().includes('akses ditolak'))))
    ) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;