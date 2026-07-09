import axios from 'axios';
import { getVisitorInfo } from './visitor';
import { ADMIN_TOKEN_KEY } from './constants';

/**
 * Axios instance with base URL and automatic visitor info injection.
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request interceptor — injects visitor info and auth token.
 * Only injects visitor info into public POST endpoints (track/submissions).
 * Admin GET endpoints should NOT have visitor params polluting query strings.
 */
api.interceptors.request.use(
  (config) => {
    // Only inject visitor info for public tracking/submission POST requests
    const isPublicPost = config.method === 'post' && (
      config.url?.includes('/visitors/track') ||
      config.url?.includes('/submissions') ||
      config.url?.includes('/visitors/location')
    );

    if (isPublicPost) {
      const visitorInfo = getVisitorInfo();
      config.data = { ...config.data, ...visitorInfo };
    }

    // Inject auth token for admin requests
    const token = localStorage.getItem(ADMIN_TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Response interceptor — handles common error cases.
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (!window.location.pathname.includes('/admin/login')) {
        localStorage.removeItem(ADMIN_TOKEN_KEY);
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
