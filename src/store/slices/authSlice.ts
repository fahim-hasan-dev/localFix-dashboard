import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { authStorage } from "@/lib/authStorage";
import type { AdminUser, AuthSession } from "@/types/auth.types";

interface AuthState {
  isAuthenticated: boolean;
  user: AdminUser | null;
  token: string | null;
  refreshToken: string | null;
}

interface LoginPayload extends AuthSession {
  remember?: boolean;
}

function getInitialState(): AuthState {
  const session = authStorage.getSession();
  if (!session) {
    return {
      isAuthenticated: false,
      user: null,
      token: null,
      refreshToken: null,
    };
  }

  return {
    isAuthenticated: true,
    user: session.user,
    token: session.token,
    refreshToken: session.refreshToken ?? null,
  };
}

export const authSlice = createSlice({
  name: "auth",
  initialState: getInitialState(),
  reducers: {
    login: (state, action: PayloadAction<LoginPayload>) => {
      const { user, token, refreshToken, remember = true } = action.payload;
      state.isAuthenticated = true;
      state.user = user;
      state.token = token;
      state.refreshToken = refreshToken ?? null;
      authStorage.setSession({ user, token, refreshToken }, { remember });
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      authStorage.clear();
    },
    setUser: (state, action: PayloadAction<AdminUser>) => {
      if (!state.token) return;
      state.user = action.payload;
      authStorage.setSession({
        user: action.payload,
        token: state.token,
        refreshToken: state.refreshToken ?? undefined,
      });
    },
    updateProfile: (
      state,
      action: PayloadAction<{ name: string; email: string; avatar?: string }>
    ) => {
      if (!state.user || !state.token) return;

      state.user.name = action.payload.name;
      state.user.email = action.payload.email;
      if (action.payload.avatar) {
        state.user.avatar = action.payload.avatar;
      }

      authStorage.setSession({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken ?? undefined,
      });
    },
  },
});

export const { login, logout, setUser, updateProfile } = authSlice.actions;
export default authSlice.reducer;
