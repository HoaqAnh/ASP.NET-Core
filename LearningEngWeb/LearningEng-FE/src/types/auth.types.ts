export interface RegisterPayload {
  fullName: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface User {
  email: string;
  fullName: string;
  role: "Admin" | "Student";
}

export interface AuthResponse {
  token: string;
  email: string;
  fullName: string;
  role: "Admin" | "Student";
}

export interface OtpVerificationPayload {
  email: string;
  otpCode: string;
}
