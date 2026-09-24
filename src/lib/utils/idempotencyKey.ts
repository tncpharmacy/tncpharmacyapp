/**
 * One random key per checkout attempt (TNC-22).
 *
 * The server stores it with the order; if the same request arrives twice —
 * a double tap, or a retry after the network dropped the first response — it
 * returns the order it already created instead of creating (and deducting
 * stock for) a second one. Reuse the key when retrying the SAME attempt;
 * make a new one only after the order went through.
 */
export function newIdempotencyKey(prefix = "chk"): string {
  const random =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
  return `${prefix}-${random}`;
}

export const IDEMPOTENCY_HEADER = "Idempotency-Key";
