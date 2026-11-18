import { baseApi } from "@/api/baseApi";
import { API_ENDPOINTS } from "@/api/endpoints";
import { mapAdminUser } from "@/lib/mapAdminUser";
import type { ApiResponse } from "@/types/api.types";
import type {
  AuthSession,
  AuthUserDto,
  ForgetPasswordRequest,
  LoginPayload,
  LoginRequest,
  ResendOtpRequest,
  ResetPasswordRequest,
  VerifyEmailRequest,
} from "@/types/auth.types";

function toSession(payload: LoginPayload): AuthSession {
  return {
    token: payload.token,
    refreshToken: payload.refreshToken,
    user: mapAdminUser(payload.data),
  };
}

function extractResetToken(body: unknown): string {
  if (!body || typeof body !== "object") return "";
  const root = body as Record<string, unknown>;

  // API returns: { success, message, data: "<resetTokenString>" }
  if (typeof root.data === "string" && root.data.trim()) {
    return root.data.trim();
  }

  if (root.data && typeof root.data === "object") {
    const data = root.data as Record<string, unknown>;
    const nested = [data.resetToken, data.resettoken, data.token];
    for (const value of nested) {
      if (typeof value === "string" && value.trim()) return value.trim();
    }
  }

  if (typeof root.resetToken === "string" && root.resetToken.trim()) {
    return root.resetToken.trim();
  }

  return "";
}

export const authApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    login: build.mutation<AuthSession, LoginRequest>({
      query: (body) => ({
        url: API_ENDPOINTS.auth.login,
        method: "POST",
        body,
        skipAuth: true,
      }),
      transformResponse: (response: ApiResponse<LoginPayload>) => toSession(response.data),
      invalidatesTags: ["Auth"],
    }),

    getProfile: build.query<AuthSession["user"], void>({
      query: () => ({
        url: API_ENDPOINTS.users.profile,
        method: "GET",
      }),
      transformResponse: (response: ApiResponse<AuthUserDto | { data: AuthUserDto }>) => {
        const payload = response.data;
        const dto =
          payload && typeof payload === "object" && "data" in payload && payload.data?._id
            ? payload.data
            : (payload as AuthUserDto);
        return mapAdminUser(dto);
      },
      providesTags: ["Auth"],
    }),

    forgetPassword: build.mutation<{ message?: string }, ForgetPasswordRequest>({
      query: (body) => ({
        url: API_ENDPOINTS.auth.forgetPassword,
        method: "POST",
        body,
        skipAuth: true,
      }),
      transformResponse: (response: ApiResponse<unknown>) => ({
        message: response.message,
      }),
    }),

    verifyEmailOtp: build.mutation<{ resetToken: string; message?: string }, VerifyEmailRequest>({
      query: (body) => ({
        url: API_ENDPOINTS.auth.verifyEmail,
        method: "POST",
        body,
        skipAuth: true,
      }),
      transformResponse: (response: ApiResponse<unknown>) => ({
        message: response.message,
        resetToken: extractResetToken(response),
      }),
    }),

    resendOtp: build.mutation<{ message?: string }, ResendOtpRequest>({
      query: (body) => ({
        url: API_ENDPOINTS.auth.resendOtp,
        method: "POST",
        body,
        skipAuth: true,
      }),
      transformResponse: (response: ApiResponse<unknown>) => ({
        message: response.message,
      }),
    }),

    resetPassword: build.mutation<{ message?: string }, ResetPasswordRequest>({
      query: ({ resetToken, newPassword, confirmPassword }) => ({
        url: API_ENDPOINTS.auth.resetPassword,
        method: "POST",
        body: { newPassword, confirmPassword },
        headers: { resettoken: resetToken },
        skipAuth: true,
      }),
      transformResponse: (response: ApiResponse<unknown>) => ({
        message: response.message,
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useLazyGetProfileQuery,
  useForgetPasswordMutation,
  useVerifyEmailOtpMutation,
  useResendOtpMutation,
  useResetPasswordMutation,
} = authApi;
