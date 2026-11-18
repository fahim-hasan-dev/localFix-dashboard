import { useSearchParams } from "react-router-dom";

/** Keeps a tab key in the query string so a reload stays on the same tab. */
export function useUrlTab<T extends string>(
  allowed: readonly T[],
  fallback: T,
  param = "tab",
): [T, (next: T) => void] {
  const [searchParams, setSearchParams] = useSearchParams();
  const raw = searchParams.get(param);
  const value = raw && (allowed as readonly string[]).includes(raw) ? (raw as T) : fallback;

  const setValue = (next: T) => {
    const nextParams = new URLSearchParams(searchParams);
    if (next === fallback) nextParams.delete(param);
    else nextParams.set(param, next);
    setSearchParams(nextParams, { replace: true });
  };

  return [value, setValue];
}
