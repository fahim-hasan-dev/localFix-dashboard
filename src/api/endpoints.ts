/**
 * Central API path map (Postman Admin / Auth contracts).
 * Pages must not hardcode these paths.
 */
export const API_ENDPOINTS = {
  auth: {
    login: "/auth/login",
    forgetPassword: "/auth/forget-password",
    verifyEmail: "/auth/verify-email",
    resendOtp: "/auth/resend-otp",
    resetPassword: "/auth/reset-password",
    changePassword: "/auth/change-password",
  },
  users: {
    root: "/users",
    byId: (id: string) => `/users/${id}`,
    status: (id: string) => `/users/status/${id}`,
    approvalStatus: (id: string) => `/users/approval-status/${id}`,
    clearances: "/users/clearances",
    clearanceById: (id: string) => `/users/clearances/${id}`,
    profile: "/users/profile",
    createAdmin: "/users/create-admin",
    admins: "/users/admins",
    adminById: (id: string) => `/users/admins/${id}`,
    adminStatus: (id: string) => `/users/admin/status/${id}`,
  },
  admin: {
    stats: "/admin/stats",
    revenue: "/admin/revenue",
    userGrowth: "/admin/user-growth",
    jobs: "/admin/jobs",
    jobById: (id: string) => `/admin/jobs/${id}`,
    orders: "/admin/orders",
    orderById: (id: string) => `/admin/orders/${id}`,
    transactions: "/admin/transactions",
    transactionById: (id: string) => `/admin/transactions/${id}`,
    transactionStats: "/admin/transactions/stats",
  },
  packages: {
    root: "/packages",
    byId: (id: string) => `/packages/${id}`,
  },
  subscriptions: {
    root: "/subscriptions",
  },
  supportTickets: {
    root: "/support-tickets",
    byId: (id: string) => `/support-tickets/${id}`,
    reply: (id: string) => `/support-tickets/${id}/reply`,
  },
  contact: {
    root: "/contact",
    byId: (id: string) => `/contact/${id}`,
  },

  notifications: {
    admin: "/notifications/admin",
    adminById: (id: string) => `/notifications/admin/${id}`,
    adminReadById: (id: string) => `/notifications/admin/${id}/read`,
  },
  faqs: {
    root: "/faqs",
    byId: (id: string) => `/faqs/${id}`,
  },
  categories: {
    root: "/categories",
    byId: (id: string) => `/categories/${id}`,
  },
  marquees: {
    root: "/marquees",
    byId: (id: string) => `/marquees/${id}`,
  },
  banners: {
    root: "/banners",
  },
  siteSettings: {
    root: "/site-settings",
  },
  rules: {
    root: "/rules",
    byType: (type: string) => `/rules/${type}`,
  },
} as const;
