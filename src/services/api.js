import axios from 'axios';

const api = axios.create({
  baseURL: 'https://renthub-production-dce2.up.railway.app/api', 
  headers: {
    'Content-Type': 'application/json'
  }
});

// Автоматически добавляем токен
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Обработка 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('admin_token');
      if (window.location.pathname.startsWith('/admin')) {
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(err);
  }
);

export default api;