import { createApi, type BaseQueryFn } from "@reduxjs/toolkit/query/react";
import { apiClient, type RequestOptions } from "@/api/client";
import { ApiError } from "@/types/api.types";
import { logout } from "@/store/slices/authSlice";

type ApiBaseQueryArgs = {
  url: string;
  method?: RequestOptions["method"];
  body?: unknown;
  headers?: Record<string, string>;
  skipAuth?: boolean;
};

type ApiBaseQueryError = {
  status: number;
  data: unknown;
  message: string;
};

const rawBaseQuery: BaseQueryFn<
  ApiBaseQueryArgs,
  unknown,
  ApiBaseQueryError
> = async ({ url, method = "GET", body, headers, skipAuth }, api) => {
  try {
    const data = await apiClient(url, {
      method,
      body,
      headers,
      skipAuth,
      signal: api.signal,
    });
    return { data };
  } catch (error) {
    if (error instanceof ApiError) {
      // Never clear session on public auth calls (wrong password, etc.)
      if (error.status === 401 && !skipAuth) {
        api.dispatch(logout());
        api.dispatch(baseApi.util.resetApiState());
      }
      return {
        error: {
          status: error.status,
          data: error.body,
          message: error.message,
        },
      };
    }

    return {
      error: {
        status: 0,
        data: null,
        message: error instanceof Error ? error.message : "Network error",
      },
    };
  }
};

/**
 * Single RTK Query API.
 * Feature endpoints should use `baseApi.injectEndpoints(...)` — do not create extra createApi instances.
 */
export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: rawBaseQuery,
  tagTypes: [
    "Auth",
    "Users",
    "Orders",
    "Jobs",
    "Transactions",
    "Subscriptions",
    "Clearance",
    "Disputes",
    "Tickets",
    "Cms",
    "Categories",
    "Settings",
    "Reviews",
    "Audit",
  ],
  endpoints: () => ({}),
});
