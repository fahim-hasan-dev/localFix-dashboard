import type { AdminRole } from "@/types/auth.types";

const DASHBOARD_ROLES: readonly AdminRole[] = [
  "super_admin",
  "admin",
  "compliance_admin",
  "support_admin",
];

export function isDashboardRole(role: string | null | undefined): role is AdminRole {
  return !!role && (DASHBOARD_ROLES as readonly string[]).includes(role);
}

/** Role claim from the access token. The stored user object is not trusted for this. */
export function roleFromAccessToken(token: string | null | undefined): string | null {
  if (!token) return null;
  try {
    const part = token.split(".")[1];
    if (!part) return null;
    const padded = part.replace(/-/g, "+").replace(/_/g, "/");
    const json = atob(padded.padEnd(padded.length + ((4 - (padded.length % 4)) % 4), "="));
    const payload = JSON.parse(json) as { role?: unknown };
    return typeof payload.role === "string" ? payload.role : null;
  } catch {
    return null;
  }
}

export const ADMIN_ONLY_MESSAGE = "This dashboard is only for admin accounts.";
