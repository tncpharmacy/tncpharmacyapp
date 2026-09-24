/**
 * Delivery status helpers for the staff order screens (TNC-20).
 *
 *   1 In Process  ->  3 Dispatched  ->  2 Delivered
 *
 * "Dispatched" is what stops a buyer cancelling online; staff can still
 * cancel (with a reason) until the order is delivered.
 */
export const DELIVERY_LABEL: Record<string, string> = {
  "1": "In Process",
  "3": "Dispatched",
  "2": "Delivered",
};

export function nextDeliveryStatus(current: string | number): string {
  const c = String(current);
  if (c === "1") return "3";
  if (c === "3") return "2";
  return "1";
}

export function deliveryLabel(status: string | number): string {
  return DELIVERY_LABEL[String(status)] || "In Process";
}

/** Ask for the (required) cancellation reason. Returns null if the user backs out. */
export function askCancelReason(): string | null {
  const reason = window.prompt(
    "Cancel this order? Stock goes back to the shelf and the customer is notified.\n\nReason (required):",
    ""
  );
  if (reason === null) return null;
  const trimmed = reason.trim();
  if (!trimmed) {
    window.alert("A reason is required to cancel an order.");
    return null;
  }
  return trimmed;
}
