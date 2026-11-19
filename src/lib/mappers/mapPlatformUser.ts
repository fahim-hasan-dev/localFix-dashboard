import { resolveAssetUrl } from "@/lib/resolveAssetUrl";
import { pick, pickNumber, pickString } from "@/lib/unwrapList";
import type { User, UserRole, UserStatus } from "@/types/common.types";

function mapRole(raw: string): UserRole {
  const role = raw.toLowerCase();
  if (role === "home_owner" || role === "homeowner") return "homeowner";
  if (role === "professional" || role === "pro" || role === "contractor") return "pro";
  return "admin";
}

function mapStatus(raw: unknown): UserStatus {
  const status = String(pickString(raw, ["status"], "")).toLowerCase();
  const approval = String(pickString(raw, ["approvalStatus"], "")).toLowerCase();
  const display = String(pickString(raw, ["displayStatus"], "")).toLowerCase();
  const isBanned = pick<unknown>(raw, ["isBanned"]);

  if (
    isBanned === true ||
    status === "inactive" ||
    status === "banned" ||
    status === "blocked" ||
    display === "banned"
  ) {
    return "banned";
  }
  if (
    approval === "pending" ||
    approval === "pending_clearance" ||
    status === "pending_clearance" ||
    display === "pending"
  ) {
    return "pending_clearance";
  }
  return "active";
}

function mapLocation(raw: unknown): string {
  const explicit = pickString(raw, ["location.address", "location", "address"]);
  if (explicit) return explicit;

  const city = pickString(raw, ["city", "serviceLocation.city"]);
  const state = pickString(raw, ["state", "serviceLocation.state"]);
  const zip = pickString(raw, ["zipCode", "serviceLocation.zipCode"]);
  return [city, state, zip].filter(Boolean).join(", ");
}

/** Map backend user DTO → dashboard User model. */
export function mapPlatformUser(raw: unknown): User {
  const category = pick<unknown>(raw, ["category"]);
  const categoryName =
    typeof category === "string"
      ? category
      : pickString(category, ["name"], "");

  return {
    id: pickString(raw, ["_id", "id", "header._id", "header.id"]),
    name: pickString(raw, ["name", "fullName", "header.name"], ""),
    email: pickString(raw, ["email", "header.email"]),
    role: mapRole(pickString(raw, ["role", "header.role"], "home_owner")),
    status: mapStatus(
      pick<{ status?: unknown; approvalStatus?: unknown }>(raw, ["header"]) ?? raw
    ),
    avatar: resolveAssetUrl(
      pickString(raw, [
        "profileImage",
        "avatar",
        "image",
        "header.profileImage",
        "header.avatar",
      ])
    ),
    phone: pickString(raw, ["phone", "phoneNumber", "header.phone"]),
    location: mapLocation(pick(raw, ["header"]) ?? raw),
    joinedDate: pickString(raw, [
      "createdAt",
      "joinedDate",
      "joinedAt",
      "header.createdAt",
      "header.joinedDate",
    ]),
    lastActive: pickString(raw, [
      "updatedAt",
      "lastActive",
      "lastLoginAt",
      "header.updatedAt",
    ]),
    totalJobs: pickNumber(raw, ["completedJobs", "totalJobs", "localJobs"]),
    totalSpentOrEarned: pickNumber(raw, [
      "totalSpentOrEarned",
      "startingRate",
      "hourlyRate",
    ]),
    subscriptionPlan:
      pickString(raw, ["subscriptionPlan", "package.name"]) || undefined,
    banReason: pickString(raw, ["banReason", "rejectionReason"]) || undefined,
    bannedAt: pickString(raw, ["bannedAt"]) || undefined,
  };
}

export function toApiRole(role: "all" | "homeowner" | "pro"): string | undefined {
  if (role === "homeowner") return "home_owner";
  if (role === "pro") return "professional";
  return undefined;
}

export function toApiStatus(
  status: "all" | "active" | "banned" | "pending_clearance"
): string | undefined {
  if (status === "active") return "active";
  if (status === "banned") return "inactive";
  if (status === "pending_clearance") return "pending";
  return undefined;
}
