/**
 * Delivery status helpers for the staff order screens.
 *
 *   1 New -> 4 Confirmed -> 5 Packed -> 6 Rider Assigned
 *         -> 3 Out for Delivery -> 2 Delivered        (7 Delivery Failed)
 *
 * The codes are the API's MasterTableOrder.delivery_status values; they are
 * not in journey order because 1-3 existed before the delivery partner.
 * Confirm and Pack are pharmacist actions; 6, 3 and 2 come from the delivery
 * partner once a rider is booked (see DeliveryPanel).
 */
export const DELIVERY_LABEL: Record<string, string> = {
  "1": "New",
  "4": "Confirmed",
  "5": "Packed",
  "6": "Rider Assigned",
  "3": "Out for Delivery",
  "2": "Delivered",
  "7": "Delivery Failed",
};

/** Pill colour for each stage (classes in pharmacy-style.css). */
export function deliveryPillClass(status: string | number): string {
  const s = String(status);
  if (s === "2") return "delivered";
  if (s === "7") return "failed";
  if (s === "3" || s === "6") return "on-the-way";
  if (s === "4" || s === "5") return "ready";
  return "processing";
}

export function deliveryLabel(status: string | number): string {
  return DELIVERY_LABEL[String(status)] || "New";
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
