/**
 * First human-readable message in an API error body.
 *
 * The backend answers failures in a few shapes:
 *   {message: "Dolo 650 is out of stock."}
 *   {detail: "Authentication credentials were not provided."}
 *   {message: "Validation error.", errors: {additional_discount: ["Additional discount cannot exceed 20%."]}}
 *   {errors: ["..."]}
 * A field error is more useful than a generic "Validation error.", so
 * `errors` is looked at first, then any other field, then message/detail.
 */
const META_KEYS = new Set(["success", "statusCode", "status", "message", "detail", "data", "errors"]);

function firstText(value: unknown): string | null {
  if (typeof value === "string") return value.trim() || null;
  if (Array.isArray(value)) {
    for (const v of value) {
      const t = firstText(v);
      if (t) return t;
    }
    return null;
  }
  if (value && typeof value === "object") {
    return firstText(Object.values(value as Record<string, unknown>));
  }
  return null;
}

export function apiErrorMessage(data: unknown, fallback: string): string {
  if (typeof data === "string") return data.trim() || fallback;
  if (!data || typeof data !== "object") return fallback;
  const d = data as Record<string, unknown>;

  const fromErrors = firstText(d.errors);
  if (fromErrors) return fromErrors;

  // Plain DRF field errors: {quantity: ["Ensure this value is ..."]}.
  // Only arrays count, so an informational string like role_type is skipped.
  for (const [key, value] of Object.entries(d)) {
    if (META_KEYS.has(key) || !Array.isArray(value)) continue;
    const t = firstText(value);
    if (t) return t;
  }
  return firstText(d.detail) || firstText(d.message) || fallback;
}
