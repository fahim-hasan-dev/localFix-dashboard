import { env } from "@/config/env";

/**
 * Turn API-relative upload paths (`/uploads/...`) into absolute URLs
 * using `IMAGE_BASE_URL` (server root, no `/api/v1`).
 */
export function resolveAssetUrl(path?: string | null): string {
  if (!path) return "";
  const trimmed = path.trim();
  if (!trimmed) return "";

  // Already absolute / local preview
  if (/^(https?:|data:|blob:)/i.test(trimmed)) return trimmed;
  if (trimmed.startsWith("//")) return `http:${trimmed}`;

  const base = env.imageBaseUrl.replace(/\/+$/, "");
  if (!base) return trimmed;

  const relative = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  return `${base}${relative}`;
}

export function resolveAssetUrls(paths?: Array<string | null | undefined> | null): string[] {
  if (!paths?.length) return [];
  return paths.map((p) => resolveAssetUrl(p)).filter(Boolean);
}
