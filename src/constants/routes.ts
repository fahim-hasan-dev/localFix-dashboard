/**
 * Single source of truth for app routes.
 * Use these in router, Sidebar, Links — do not hardcode path strings elsewhere.
 */
export const ROUTES = {
  AUTH: {
    LOGIN: "/login",
    FORGOT_PASSWORD: "/forgot-password",
  },
  DASHBOARD: "/",
  ORDERS: {
    LIST: "/orders",
    DETAIL: (id: string) => `/orders/${id}`,
  },
  JOBS: {
    LIST: "/jobs",
    DETAIL: (id: string) => `/jobs/${id}`,
  },
  USERS: {
    LIST: "/users",
    DETAIL: (id: string) => `/users/${id}`,
  },
  TRANSACTIONS: "/transactions",
  SUBSCRIPTIONS: "/subscriptions",
  CLEARANCE: "/clearance",
  DISPUTES: {
    LIST: "/disputes",
    DETAIL: (id: string) => `/disputes/${id}`,
  },
  TICKETS: {
    LIST: "/tickets",
    DETAIL: (id: string) => `/tickets/${id}`,
  },
  CMS: "/cms",
  CATEGORIES: {
    LIST: "/categories",
    DETAIL: (id: string) => `/categories/${id}`,
  },
  SETTINGS: "/settings",
  REVIEWS: "/reviews",
} as const;
