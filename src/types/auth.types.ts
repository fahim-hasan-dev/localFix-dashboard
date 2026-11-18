export type AdminRole = "super_admin" | "compliance_admin" | "support_admin" | "admin";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  avatar: string;
}

export interface AuthSession {
  user: AdminUser;
  token: string;
  refreshToken?: string;
}

/** Raw user object nested under login `data.data` / profile `data`. */
export interface AuthUserDto {
  _id: string;
  name: string;
  email: string;
  role: string;
  profileImage?: string;
  status?: string;
  phone?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginPayload {
  token: string;
  refreshToken?: string;
  data: AuthUserDto;
}

export interface ForgetPasswordRequest {
  email: string;
}

export interface VerifyEmailRequest {
  email: string;
  oneTimeCode: string;
}

export interface ResendOtpRequest {
  email: string;
}

export interface ResetPasswordRequest {
  newPassword: string;
  confirmPassword: string;
  resetToken: string;
}
