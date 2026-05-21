import axios from 'axios';
import Cookies from 'js-cookie';

const isProduction = process.env.NODE_ENV === 'production';

export const API_URL = process.env.NEXT_PUBLIC_API_URL
  ?? (() => {
      if (isProduction) throw new Error('NEXT_PUBLIC_API_URL is not set!');
      return 'http://localhost:5000/api';
    })();

const cookieOptions = {
  secure: isProduction,
  sameSite: 'Strict' as const,
};

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('accessToken');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = Cookies.get('refreshToken');

      if (refreshToken) {
        try {
          const response = await axios.post(`${API_URL}/auth/refresh-token`, { refreshToken });
          const { accessToken, refreshToken: newRefreshToken } = response.data;

          Cookies.set('accessToken', accessToken, { ...cookieOptions, expires: 1 });
          Cookies.set('refreshToken', newRefreshToken, { ...cookieOptions, expires: 7 });

          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        } catch (refreshError) {
          Cookies.remove('accessToken');
          Cookies.remove('refreshToken');
          if (typeof window !== 'undefined') window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api;