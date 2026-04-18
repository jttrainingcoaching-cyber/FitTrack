import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// If the server says the token is invalid or the user no longer exists,
// clear everything and send them to login automatically.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('fittrack_prefs');
      localStorage.removeItem('fittrack_theme');
      localStorage.removeItem('steps_today');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
