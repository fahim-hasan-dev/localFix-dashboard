import { isDashboardRole, roleFromAccessToken } from "@/lib/adminRole";
import type { AdminUser, AuthSession } from "@/types/auth.types";

const TOKEN_KEY = "homefix_admin_token";
const REFRESH_KEY = "homefix_admin_refresh";
const USER_KEY = "homefix_admin_user";
const PERSIST_KEY = "homefix_admin_persist";

type PersistMode = "local" | "session";

function readPersistMode(): PersistMode {
  if (localStorage.getItem(PERSIST_KEY) === "local") return "local";
  if (sessionStorage.getItem(PERSIST_KEY) === "session") return "session";
  // Legacy / default: prefer local if token exists there
  if (localStorage.getItem(TOKEN_KEY)) return "local";
  if (sessionStorage.getItem(TOKEN_KEY)) return "session";
  return "local";
}

function activeStore(): Storage {
  return readPersistMode() === "session" ? sessionStorage : localStorage;
}

function readJson<T>(store: Storage, key: string): T | null {
  try {
    const raw = store.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function clearStore(store: Storage) {
  store.removeItem(TOKEN_KEY);
  store.removeItem(REFRESH_KEY);
  store.removeItem(USER_KEY);
  store.removeItem(PERSIST_KEY);
}

export const authStorage = {
  getToken(): string | null {
    return activeStore().getItem(TOKEN_KEY) ?? localStorage.getItem(TOKEN_KEY) ?? sessionStorage.getItem(TOKEN_KEY);
  },

  getRefreshToken(): string | null {
    return activeStore().getItem(REFRESH_KEY) ?? localStorage.getItem(REFRESH_KEY) ?? sessionStorage.getItem(REFRESH_KEY);
  },

  getUser(): AdminUser | null {
    return (
      readJson<AdminUser>(activeStore(), USER_KEY) ??
      readJson<AdminUser>(localStorage, USER_KEY) ??
      readJson<AdminUser>(sessionStorage, USER_KEY)
    );
  },

  getSession(): AuthSession | null {
    const token = authStorage.getToken();
    const user = authStorage.getUser();
    if (!token || !user) return null;
    if (!isDashboardRole(roleFromAccessToken(token)) || !isDashboardRole(user.role)) {
      authStorage.clear();
      return null;
    }
    return {
      token,
      user,
      refreshToken: authStorage.getRefreshToken() || undefined,
    };
  },

  setSession(session: AuthSession, options?: { remember?: boolean }): void {
    const remember = options?.remember ?? true;
    const store = remember ? localStorage : sessionStorage;
    const other = remember ? sessionStorage : localStorage;

    clearStore(other);
    store.setItem(PERSIST_KEY, remember ? "local" : "session");
    store.setItem(TOKEN_KEY, session.token);
    store.setItem(USER_KEY, JSON.stringify(session.user));
    if (session.refreshToken) {
      store.setItem(REFRESH_KEY, session.refreshToken);
    } else {
      store.removeItem(REFRESH_KEY);
    }
  },

  clear(): void {
    clearStore(localStorage);
    clearStore(sessionStorage);
  },
};
