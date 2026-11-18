import { ADMIN_ONLY_MESSAGE, isDashboardRole } from "@/lib/adminRole";
import { resolveAssetUrl } from "@/lib/resolveAssetUrl";
import type { AdminUser, AuthUserDto } from "@/types/auth.types";

/** Normalize backend user DTO → app AdminUser. Homeowner and professional accounts are rejected. */
export function mapAdminUser(dto: AuthUserDto): AdminUser {
  if (!isDashboardRole(dto.role)) {
    throw new Error(ADMIN_ONLY_MESSAGE);
  }

  return {
    id: dto._id,
    name: dto.name,
    email: dto.email,
    role: dto.role,
    avatar: resolveAssetUrl(dto.profileImage || ""),
  };
}
