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
};
