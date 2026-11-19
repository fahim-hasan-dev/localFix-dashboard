import { mapPlatformUser } from "@/lib/mappers/mapPlatformUser";
import { pick, pickNumber, pickString } from "@/lib/unwrapList";
import type { User } from "@/types/common.types";

export interface UserDetailStatCard {
  key: string;
  label: string;
  value: string | number;
  subtext?: string;
}

export interface UserDetailOrder {
  id: string;
  jobId: string;
  service: string;
  amount: number;
  status: string;
  date: string;
  rawDate?: string;
}

export interface UserDetailTransaction {
  id: string;
  transactionId: string;
  description: string;
  amount: number;
  status: string;
  date: string;
  rawDate?: string;
}

export interface UserDetailReview {
  id: string;
  reviewerName: string;
  rating: number;
  feedback: string;
  jobTitle: string;
  createdAt: string;
  reply?: string | null;
}

export interface UserDetailProfile {
  about: string;
  tradeSpecialty: string;
  serviceTerritory: string;
  membershipPlan: string;
  responseSpeed: string;
  availability: string;
}

export interface UserDetails {
  user: User;
  statCards: UserDetailStatCard[];
  orders: UserDetailOrder[];
  transactions: UserDetailTransaction[];
  reviews: UserDetailReview[];
  profile: UserDetailProfile | null;
  galleryCount: number;
}

function unwrapPayload(response: unknown): Record<string, unknown> {
  const root = (response as { data?: unknown })?.data ?? response;
  const nested = (root as { data?: unknown })?.data;
  const payload =
    nested && typeof nested === "object"
      ? (nested as Record<string, unknown>)
      : root && typeof root === "object"
        ? (root as Record<string, unknown>)
        : {};

  const header =
    payload.header && typeof payload.header === "object"
      ? (payload.header as Record<string, unknown>)
      : null;

  return header ? { ...payload, ...header } : payload;
}

function mapStatCards(raw: unknown): UserDetailStatCard[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((item, index) => {
    const value = pick<unknown>(item, ["value"]);
    return {
      key: pickString(item, ["key"], `stat-${index}`),
      label: pickString(item, ["label"], "STAT"),
      value:
        typeof value === "number" || typeof value === "string"
          ? value
          : String(value ?? "—"),
      subtext: pickString(item, ["subtext"]) || undefined,
    };
  });
}

function mapOrders(raw: unknown): UserDetailOrder[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((item) => {
    const id = pickString(item, ["_id", "id", "bookingId", "jobRequestId"]);
    return {
      id,
      jobId: pickString(item, ["jobId"], id ? `JOB-${id.slice(-4).toUpperCase()}` : "—"),
      service: pickString(item, ["service", "jobTitle"], "Service"),
      amount: pickNumber(item, ["amount"]),
      status: pickString(item, ["status"], "scheduled").toLowerCase(),
      date: pickString(item, ["rawDate", "date", "createdAt"]),
      rawDate: pickString(item, ["rawDate"]) || undefined,
    };
  });
}

function mapTransactions(raw: unknown): UserDetailTransaction[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((item) => {
    const id = pickString(item, ["_id", "id", "transactionId"]);
    return {
      id,
      transactionId: pickString(item, ["transactionId"], id),
      description: pickString(item, ["description"], "Transaction"),
      amount: pickNumber(item, ["amount"]),
      status: pickString(item, ["status"], "settled").toLowerCase(),
      date: pickString(item, ["rawDate", "date", "createdAt"]),
      rawDate: pickString(item, ["rawDate"]) || undefined,
    };
  });
}

function mapReviews(raw: unknown): UserDetailReview[] {
  const list = Array.isArray(raw)
    ? raw
    : Array.isArray((raw as { reviews?: unknown })?.reviews)
      ? ((raw as { reviews: unknown[] }).reviews)
      : [];

  return list.map((item) => {
    const reviewer = pick<unknown>(item, ["reviewer"]);
    return {
      id: pickString(item, ["_id", "id"]),
      reviewerName: pickString(reviewer, ["name"], pickString(item, ["reviewerName"], "Homeowner")),
      rating: pickNumber(item, ["rating"], 5),
      feedback: pickString(item, ["feedback", "comment"]),
      jobTitle: pickString(item, ["jobTitle", "title"], "Service"),
      createdAt: pickString(item, ["createdAt", "rawDate", "date"]),
      reply:
        pickString(pick(item, ["response"]), ["message"]) ||
        pickString(item, ["reply"]) ||
        null,
    };
  });
}

function mapProfile(raw: unknown): UserDetailProfile | null {
  if (!raw || typeof raw !== "object") return null;
  const metrics = pick<unknown>(raw, ["operationalMetrics"]);
  return {
    about: pickString(raw, ["about"]),
    tradeSpecialty: pickString(raw, ["tradeSpecialty"]),
    serviceTerritory: pickString(raw, ["serviceTerritory"]),
    membershipPlan: pickString(raw, ["membershipPlan"]),
    responseSpeed: pickString(metrics, ["responseSpeed"], pickString(raw, ["responseSpeed"])),
    availability: pickString(metrics, ["availability"], pickString(raw, ["availability"])),
  };
}

/** Map GET /users/:id nested detail payload → dashboard model. */
export function mapUserDetails(response: unknown): UserDetails {
  const payload = unwrapPayload(response);
  const user = mapPlatformUser(payload);

  // Prefer ISO createdAt for date formatting (backend also sends "Joined …" text)
  if (!user.joinedDate || Number.isNaN(Date.parse(user.joinedDate))) {
    const createdAt = pickString(payload, ["createdAt", "header.createdAt"]);
    if (createdAt) user.joinedDate = createdAt;
  }

  const gallery = pick<unknown>(payload, ["projectGallery"]);

  return {
    user,
    statCards: mapStatCards(payload.statCards),
    orders: mapOrders(payload.ordersAndJobs),
    transactions: mapTransactions(payload.financialRecords),
    reviews: mapReviews(payload.reviewsAndRatings),
    profile: mapProfile(payload.profileDetails),
    galleryCount: Array.isArray(gallery) ? gallery.length : 0,
  };
}
