import axios from 'axios';

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || '/api' });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const onAuthPage = ['/login', '/register'].includes(window.location.pathname);
    if (err.response?.status === 401 && !onAuthPage) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  },
);

/** Turns an axios error into a readable message (includes field-level validation errors). */
export function errMsg(err) {
  const data = err?.response?.data;
  if (data?.errors) {
    return Object.entries(data.errors)
      .map(([field, msg]) => `${field}: ${msg}`)
      .join('; ');
  }
  return data?.message || err?.message || 'Something went wrong';
}

export default api;
