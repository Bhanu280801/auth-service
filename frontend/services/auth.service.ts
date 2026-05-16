import api from '../lib/axios';

export const authService = {
  async register(data: any) {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  async verifyEmail(data: { email: string; otp: string }) {
    const response = await api.post('/auth/verify-email', data);
    return response.data;
  },

  async login(data: any) {
    const response = await api.post('/auth/login', data);
    return response.data;
  },

  async getProfile() {
    const response = await api.get('/auth/profile');
    return response.data;
  },

  async logout() {
    const response = await api.post('/auth/logout');
    return response.data;
  },

  async changePassword(data: any) {
    const response = await api.post('/auth/change-password', data);
    return response.data;
  },

  async setup2FA() {
    const response = await api.post('/auth/2fa/setup');
    return response.data;
  },

  async verify2FA(data: { token: string }) {
    const response = await api.post('/auth/2fa/verify', data);
    return response.data;
  },

  async disable2FA(data: { token: string }) {
    const response = await api.post('/auth/2fa/disable', data);
    return response.data;
  },

  async forgotPassword(data: { email: string }) {
    const response = await api.post('/auth/forgot-password', data);
    return response.data;
  },

  async verifyOTP(data: { email: string; otp: string }) {
    const response = await api.post('/auth/verify-otp', data);
    return response.data;
  },

  async resetPassword(data: any) {
    const response = await api.post('/auth/reset-password', data);
    return response.data;
  },
};
