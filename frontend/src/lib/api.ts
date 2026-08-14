import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 globally — only redirect when no token exists at all
// (avoids false redirect on page refresh before store hydrates)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const token = localStorage.getItem('token');
      // Only wipe session and redirect if there really is no valid token
      if (!token) {
        window.location.href = '/login';
      } else {
        // Token exists but was rejected — clear it and redirect
        localStorage.removeItem('token');
        // use a small delay so any in-flight state can settle
        setTimeout(() => { window.location.href = '/login'; }, 100);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
