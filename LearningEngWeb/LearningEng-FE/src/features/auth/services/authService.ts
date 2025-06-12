import axios from "axios";
import type {
  LoginPayload,
  AuthResponse,
  RegisterPayload,
  OtpVerificationPayload
} from "../../../types/auth.types";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const registerUser = async (data: RegisterPayload): Promise<any> => {
  const response = await apiClient.post("/auth/register", data);
  return response.data;
};

export const loginUser = async (data: LoginPayload): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>("/auth/login", data);
  return response.data;
};

export const confirmEmail = async (payload: OtpVerificationPayload): Promise<any> => {
  const response = await apiClient.post('/auth/confirm-email', payload);
  return response.data;
};

export const verifyAdminOtp = async (payload: OtpVerificationPayload): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>('/auth/verify-admin-otp', payload);
  return response.data;
};