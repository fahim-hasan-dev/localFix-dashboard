export interface UnwrappedList<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function readMeta(
  meta: Record<string, unknown> | null,
  itemCount: number
): Omit<UnwrappedList<unknown>, "items"> {
  const total = Number(meta?.total ?? meta?.totalCount ?? itemCount) || itemCount;
  const page = Number(meta?.page ?? meta?.currentPage ?? 1) || 1;
  const limit = Number(meta?.limit ?? meta?.pageSize ?? (itemCount || 10)) || 10;
  const totalPages =
    Number(meta?.totalPage ?? meta?.totalPages ?? Math.ceil(total / Math.max(limit, 1))) ||
    1;

  return { total, page, limit, totalPages };
}

/**
 * Normalize common backend list envelopes into one shape.
 * Supports: data[], data.result[], data.data[], data.users[], etc.
 */
export function unwrapList<T = unknown>(response: unknown): UnwrappedList<T> {
  const root = asRecord(response);
  if (!root) {
    return { items: [], total: 0, page: 1, limit: 10, totalPages: 0 };
  }

  const data = root.data;
  const rootMeta = asRecord(root.meta);

  if (Array.isArray(data)) {
    const meta = readMeta(rootMeta, data.length);
    return { items: data as T[], ...meta };
  }

  const dataObj = asRecord(data);
  if (!dataObj) {
    return { items: [], total: 0, page: 1, limit: 10, totalPages: 0 };
  }

  const nestedMeta = asRecord(dataObj.meta) ?? rootMeta;
  const candidates = [
    dataObj.result,
    dataObj.data,
    dataObj.items,
    dataObj.users,
    dataObj.clearances,
    dataObj.jobs,
    dataObj.orders,
    dataObj.docs,
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      const meta = readMeta(nestedMeta, candidate.length);
      return { items: candidate as T[], ...meta };
    }
  }

  return { items: [], total: 0, page: 1, limit: 10, totalPages: 0 };
}

/** Prefer first defined nested path. */
export function pick<T = unknown>(
  source: unknown,
  paths: string[],
  fallback?: T
): T | undefined {
  const root = asRecord(source);
  if (!root) return fallback;

  for (const path of paths) {
    const parts = path.split(".");
    let current: unknown = root;
    let ok = true;
    for (const part of parts) {
      const rec = asRecord(current);
      if (!rec || !(part in rec)) {
        ok = false;
        break;
      }
      current = rec[part];
    }
    if (ok && current !== undefined && current !== null && current !== "") {
      return current as T;
    }
  }

  return fallback;
}

export function pickString(source: unknown, paths: string[], fallback = ""): string {
  const value = pick<unknown>(source, paths);
  if (value === undefined || value === null) return fallback;
  return String(value);
}

export function pickNumber(source: unknown, paths: string[], fallback = 0): number {
  const value = pick<unknown>(source, paths);
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}
