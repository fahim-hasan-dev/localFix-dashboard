/** Human-readable message from RTK Query / ApiError-shaped failures. */
export function getApiErrorMessage(
  error: unknown,
  fallback = "Something went wrong. Please try again."
): string {
  if (!error || typeof error !== "object") return fallback;

  const err = error as {
    message?: string;
    data?:
      | {
          message?: string;
          errorMessages?: Array<{ message?: string }>;
        }
      | string
      | null;
  };

  if (err.data && typeof err.data === "object") {
    if (err.data.message) return err.data.message;
    const nested = err.data.errorMessages?.find((item) => item?.message)?.message;
    if (nested) return nested;
  }
  if (typeof err.data === "string" && err.data.trim()) {
    return err.data;
  }
  if (err.message?.trim()) {
    return err.message;
  }

  return fallback;
}
