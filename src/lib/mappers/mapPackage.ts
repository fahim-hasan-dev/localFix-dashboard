import { pick, pickNumber, pickString } from "@/lib/unwrapList";
import type { SubscriptionPackage } from "@/types/common.types";

function mapInterval(raw: string): SubscriptionPackage["billingInterval"] {
  const value = raw.toLowerCase();
  if (value.includes("year") || value.includes("annual")) return "annually";
  if (value.includes("free")) return "free";
  return "monthly";
}

export function mapPackage(raw: unknown): SubscriptionPackage {
  const featuresRaw = (raw as { features?: unknown })?.features;
  const features = Array.isArray(featuresRaw)
    ? featuresRaw.map(String)
    : typeof featuresRaw === "string"
      ? featuresRaw.split("\n").map((f) => f.trim()).filter(Boolean)
      : [];

  return {
    id: pickString(raw, ["_id", "id"]),
    name: pickString(raw, ["name", "title"], "Package"),
    description: pickString(raw, ["description"], ""),
    price: pickNumber(raw, ["price", "monthlyPrice", "amount"]),
    billingInterval: mapInterval(
      pickString(raw, ["billingCycle", "billingInterval", "planType"], "monthly")
    ),
    features,
    isActive: Boolean(
      (raw as { isActive?: boolean })?.isActive ??
        pickString(raw, ["status"], "active").toLowerCase() !== "inactive"
    ),
    isPopular: Boolean((raw as { isPopular?: boolean })?.isPopular),
    subscriberCount: pickNumber(raw, ["subscriberCount", "subscribers", "activeSubscribers"]),
    trialDays: pickNumber(raw, ["trialDays", "trial"]),
    badge: pickString(raw, ["badge"]) || undefined,
    leadLimit: pick(raw, ["leadLimit"]) !== undefined ? pickNumber(raw, ["leadLimit"]) : undefined,
    createdAt: pickString(raw, ["createdAt"]),
    updatedAt: pickString(raw, ["updatedAt"]),
  };
}

/** Payload matching Postman Create/Update Package contract. */
export interface PackageWritePayload {
  name: string;
  description: string;
  price: number;
  billingCycle: "monthly" | "yearly";
  leadLimit?: number;
  hasTrial?: boolean;
  trialDays?: number;
  isPopular?: boolean;
  isActive?: boolean;
  features: string[];
}

export function toPackageWriteBody(input: {
  name: string;
  description: string;
  price: number;
  billingInterval: "monthly" | "annually" | "free";
  trialDays: number;
  isPopular?: boolean;
  isActive?: boolean;
  features: string[];
  leadLimit?: number;
}): PackageWritePayload {
  return {
    name: input.name,
    description: input.description,
    price: input.price,
    billingCycle: input.billingInterval === "annually" ? "yearly" : "monthly",
    leadLimit: input.leadLimit ?? 35,
    hasTrial: input.trialDays > 0,
    trialDays: input.trialDays,
    isPopular: Boolean(input.isPopular),
    isActive: input.isActive ?? true,
    features: input.features,
  };
}
