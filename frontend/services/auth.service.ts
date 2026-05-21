import api from '../lib/axios';
import { AxiosError } from 'axios';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  isVerified: boolean;
  isTwoFactorEnabled: boolean;
}

interface ApiErrorBody {
  message?: string;
  require2FA?: boolean;
}

export interface BlacklistedToken {
  token: string;
  createdAt: string;
  expiresAt: string;
}

export interface AdminUser {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  isVerified: boolean;
  isTwoFactorEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

interface LoginPayload {
  email: string;
  password: string;
  totp?: string;
}

interface ChangePasswordPayload {
  oldPassword: string;
  newPassword: string;
}

interface ResetPasswordPayload {
  email: string;
  newPassword: string;
}

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

interface ProfileResponse {
  success: boolean;
  user: User;
}

export const getAuthErrorMessage = (error: unknown, fallback: string) => {
  const axiosError = error as AxiosError<ApiErrorBody>;
  return axiosError.response?.data?.message || fallback;
};

export const isTwoFactorRequiredError = (error: unknown) => {
  const axiosError = error as AxiosError<ApiErrorBody>;
  return axiosError.response?.data?.require2FA === true;
};

export const authService = {
  async register(data: RegisterPayload) {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  async verifyEmail(data: { email: string; otp: string }) {
    const response = await api.post('/auth/verify-email', data);
    return response.data;
  },

  async login(data: LoginPayload): Promise<AuthTokens> {
    const response = await api.post('/auth/login', data);
    return response.data;
  },

  async getProfile(): Promise<ProfileResponse> {
    const response = await api.get('/auth/profile');
    return response.data;
  },

  async logout() {
    const response = await api.post('/auth/logout');
    return response.data;
  },

  async changePassword(data: ChangePasswordPayload) {
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

  async resetPassword(data: ResetPasswordPayload) {
    const response = await api.post('/auth/reset-password', data);
    return response.data;
  },

  // ── Admin endpoints ──────────────────────────────────────────────
  async getAdminDashboard() {
    const response = await api.get('/auth/admin/dashboard');
    return response.data;
  },

  async getBlacklist(): Promise<{ success: boolean; data: BlacklistedToken[] }> {
    const response = await api.get('/auth/admin/blacklist');
    return response.data;
  },

  async getAdminUsers(): Promise<{ success: boolean; data: AdminUser[] }> {
    const response = await api.get('/auth/admin/users');
    return response.data;
  },

  async updateUserRole(userId: string, role: 'user' | 'admin'): Promise<{ success: boolean; message: string; data: AdminUser }> {
    const response = await api.patch(`/auth/admin/users/${userId}/role`, { role });
    return response.data;
  },

  async deleteUser(userId: string): Promise<{ success: boolean; message: string }> {
    const response = await api.delete(`/auth/admin/users/${userId}`);
    return response.data;
  },
};
