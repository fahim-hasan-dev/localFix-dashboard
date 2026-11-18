/**
 * Typed app config from env.
 * Reads values exactly as provided in `.env` — do not hardcode overrides here.
 */
function normalizeBaseUrl(value: string): string {
  const trimmed = value.trim().replace(/\/+$/, "");
  if (!trimmed) return "";
  // Allow host:port/... without scheme in .env; fetch still needs a protocol.
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `http://${trimmed}`;
}

/** Strip trailing `/api/vN` so uploads resolve against the server root. */
function deriveImageBaseUrl(apiBaseUrl: string): string {
  return apiBaseUrl.replace(/\/api\/v\d+$/i, "").replace(/\/+$/, "");
}

const apiBaseUrl = normalizeBaseUrl(import.meta.env.API_BASE_URL || "");
const imageBaseFromEnv = normalizeBaseUrl(import.meta.env.IMAGE_BASE_URL || "");

export const env = {
  apiBaseUrl,
  /** Server root for static uploads (no `/api/v1`). Falls back from `API_BASE_URL`. */
  imageBaseUrl: imageBaseFromEnv || deriveImageBaseUrl(apiBaseUrl),
  isDev: import.meta.env.DEV,
} as const;
