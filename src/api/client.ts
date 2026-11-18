import { env } from "@/config/env";
import { authStorage } from "@/lib/authStorage";
import { ApiError, type ApiErrorBody } from "@/types/api.types";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface RequestOptions {
  method?: HttpMethod;
  body?: unknown;
  headers?: Record<string, string>;
  /** Skip Authorization header (e.g. login) */
  skipAuth?: boolean;
  signal?: AbortSignal;
}

function buildUrl(path: string): string {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${env.apiBaseUrl}${normalized}`;
}

async function parseBody(response: Response): Promise<unknown> {
  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return response.json();
  }
  const text = await response.text();
  return text || null;
}

function toErrorMessage(status: number, body: unknown): string {
  if (body && typeof body === "object") {
    const record = body as ApiErrorBody & {
      errorMessages?: Array<{ message?: string }>;
    };
    if (record.message) return record.message;
    const first = record.errorMessages?.find((item) => item?.message)?.message;
    if (first) return first;
  }
  if (typeof body === "string" && body.trim()) return body;
  return `Request failed with status ${status}`;
}

/**
 * Shared HTTP client for one-off calls and RTK Query baseQuery.
 * Supports JSON bodies and multipart FormData uploads.
 */
export async function apiClient<T>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const { method = "GET", body, headers = {}, skipAuth = false, signal } = options;
  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;

  const requestHeaders: Record<string, string> = {
    Accept: "application/json",
    ...headers,
  };

  if (body !== undefined && !isFormData) {
    requestHeaders["Content-Type"] = "application/json";
  }

  // Browser sets multipart boundary when Content-Type is omitted for FormData
  if (isFormData) {
    delete requestHeaders["Content-Type"];
  }

  if (!skipAuth) {
    const token = authStorage.getToken();
    if (token) {
      requestHeaders.Authorization = `Bearer ${token}`;
    }
  }

  const response = await fetch(buildUrl(path), {
    method,
    headers: requestHeaders,
    body:
      body === undefined
        ? undefined
        : isFormData
          ? (body as FormData)
          : JSON.stringify(body),
    signal,
  });

  const parsed = await parseBody(response);

  if (!response.ok) {
    throw new ApiError(
      response.status,
      toErrorMessage(response.status, parsed),
      parsed && typeof parsed === "object" ? (parsed as ApiErrorBody) : null
    );
  }

  return parsed as T;
}

/** Build multipart body with a JSON `data` field + optional files (Postman pattern). */
export function buildDataFormData(
  data: Record<string, unknown>,
  files?: Record<string, File | Blob | null | undefined>
): FormData {
  const form = new FormData();
  form.append("data", JSON.stringify(data));
  if (files) {
    Object.entries(files).forEach(([key, file]) => {
      if (file) form.append(key, file);
    });
  }
  return form;
}
