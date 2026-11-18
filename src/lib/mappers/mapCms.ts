import { resolveAssetUrl } from "@/lib/resolveAssetUrl";
import { pickNumber, pickString } from "@/lib/unwrapList";
import type {
  FaqItem,
  MarqueeItem,
  ServiceCategory,
  SiteBrandingConfig,
  SliderBanner,
} from "@/types/common.types";

export type FaqApiRole = "home_owner" | "professional";

export function mapFaq(raw: unknown): FaqItem {
  const role = pickString(raw, ["role", "audience"], "home_owner").toLowerCase();
  const audience: FaqItem["audience"] =
    role.includes("pro") || role.includes("contractor")
      ? "pro"
      : role.includes("general")
        ? "general"
        : "homeowner";

  return {
    id: pickString(raw, ["_id", "id"]),
    question: pickString(raw, ["question", "title"]),
    answer: pickString(raw, ["answer", "content", "body"]),
    audience,
    category: audience === "pro" ? "pro" : "customer",
    order: pickNumber(raw, ["order", "sortOrder"]),
    isPublished: Boolean((raw as { isPublished?: boolean })?.isPublished ?? true),
  };
}

export function toFaqRole(audience: "homeowner" | "pro" | "customer" | "general"): FaqApiRole {
  return audience === "pro" ? "professional" : "home_owner";
}

export function mapMarqueeItem(raw: unknown): MarqueeItem {
  const keyword = pickString(raw, ["keyword", "label", "text", "name"]);
  return {
    id: pickString(raw, ["_id", "id"]),
    label: keyword,
    href: pickString(raw, ["href", "link"], `/browse-pros?category=${encodeURIComponent(keyword)}`),
    isActive: Boolean((raw as { isActive?: boolean })?.isActive ?? true),
    order: pickNumber(raw, ["order", "sortOrder"]),
  };
}

export function mapBanner(raw: unknown): SliderBanner {
  return {
    id: pickString(raw, ["_id", "id"], "banner-1"),
    title: pickString(raw, ["headline", "title"], ""),
    subtitle: pickString(raw, ["description", "subtitle"], ""),
    imageUrl: resolveAssetUrl(pickString(raw, ["image", "imageUrl", "bannerImage"], "")),
    ctaText: pickString(raw, ["ctaText"], "Get Started"),
    ctaLink: pickString(raw, ["ctaLink"], "/"),
    isActive: Boolean((raw as { isActive?: boolean })?.isActive ?? true),
    order: pickNumber(raw, ["order"], 0),
  };
}

export function mapCategory(raw: unknown): ServiceCategory {
  const name = pickString(raw, ["name", "title"], "Category");
  const slug =
    pickString(raw, ["slug"]) ||
    name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  return {
    id: pickString(raw, ["_id", "id"]),
    name,
    slug,
    description: pickString(raw, ["description"], ""),
    iconName: pickString(raw, ["icon", "iconUrl", "iconName"], "Wrench"),
    coverImage: resolveAssetUrl(pickString(raw, ["coverImage", "image", "imageUrl"], "")),
    baseStartingPrice: pickNumber(raw, ["baseStartingPrice", "startingPrice"]),
    priceUnit: "custom_quote",
    isActive: Boolean((raw as { isActive?: boolean })?.isActive ?? true),
    isPopular: Boolean((raw as { isPopular?: boolean })?.isPopular),
    activeProsCount: pickNumber(raw, ["activeProsCount", "professionalsCount"]),
    completedJobsCount: pickNumber(raw, ["completedJobsCount", "jobsCount"]),
    questions: [],
    createdAt: pickString(raw, ["createdAt"]),
    updatedAt: pickString(raw, ["updatedAt"]),
  };
}

export function mapSiteSettings(raw: unknown): Partial<SiteBrandingConfig> {
  const data = (raw as { data?: unknown })?.data ?? raw;
  return {
    siteName: pickString(data, ["platformBrandName", "siteName", "brandName"]),
    siteLogoUrl: resolveAssetUrl(pickString(data, ["headerLogo", "siteLogoUrl", "logo"])),
    siteFooterLogoUrl: resolveAssetUrl(pickString(data, ["footerLogo", "siteFooterLogoUrl"])) || undefined,
    siteFaviconUrl: resolveAssetUrl(pickString(data, ["favicon", "siteFaviconUrl"])),
    supportEmail: pickString(data, ["supportEmail", "email"]),
    contactPhone: pickString(data, ["supportPhone", "contactPhone", "phone"]),
    physicalAddress: pickString(data, ["address", "physicalAddress"]),
    socialMedia: {
      facebook: pickString(data, ["facebookUrl", "socialMedia.facebook", "facebook"]),
      instagram: pickString(data, ["instagramUrl", "socialMedia.instagram", "instagram"]),
      linkedin: pickString(data, ["linkedinUrl", "socialMedia.linkedin", "linkedin"]),
      twitter: pickString(data, ["twitterUrl", "socialMedia.twitter", "twitter"]),
      youtube: pickString(data, ["youtubeUrl", "socialMedia.youtube", "youtube"]),
    },
  };
}

export function mapRuleContent(raw: unknown): string {
  const data = (raw as { data?: unknown })?.data ?? raw;
  if (typeof data === "string") return data;
  return pickString(data, ["content", "body", "text", "html"], "");
}

export interface TeamAdmin {
  id: string;
  name: string;
  email: string;
  role: string;
  status: "active" | "inactive";
  avatar: string;
  addedDate: string;
  lastActive: string;
}

export function mapTeamAdmin(raw: unknown): TeamAdmin {
  const statusRaw = pickString(raw, ["status"], "active").toLowerCase();
  return {
    id: pickString(raw, ["_id", "id"]),
    name: pickString(raw, ["name"], "Admin"),
    email: pickString(raw, ["email"]),
    role: pickString(raw, ["role"], "admin"),
    status: statusRaw === "inactive" ? "inactive" : "active",
    avatar: resolveAssetUrl(pickString(raw, ["profileImage", "avatar"], "")),
    addedDate: pickString(raw, ["createdAt", "addedDate"]),
    lastActive: pickString(raw, ["updatedAt", "lastActive", "lastLoginAt"]),
  };
}
