/**
 * Small, pure helpers the account pages use to turn an order from the API
 * into what the card shows. Kept separate from the components so they are
 * easy to read and to reuse (e.g. on a future order-details page).
 */
import type { OrderDetails } from "@/types/order";

/** One key per badge colour / tracker step. */
export type OrderStage = "process" | "dispatched" | "delivered" | "cancelled";

/**
 * The backend sends `orderStatus` ("Buy" | "Cancelled") and
 * `deliveryStatusName` ("In Process" | "Dispatched" | "Delivered"), which come
 * from MasterTableOrder.status and .delivery_status (1 / 3 / 2).
 */
export function orderStage(o: Pick<OrderDetails, "orderStatus" | "deliveryStatusName">): OrderStage {
  if (o.orderStatus === "Cancelled") return "cancelled";
  if (o.deliveryStatusName === "Delivered") return "delivered";
  if (o.deliveryStatusName === "Dispatched") return "dispatched";
  return "process";
}

export const STAGE_LABEL: Record<OrderStage, string> = {
  process: "In Process",
  dispatched: "Dispatched",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

/** Tracker progress: 0 = Placed, 1 = Dispatched, 2 = Delivered. */
export function stageStep(stage: OrderStage): number {
  return stage === "delivered" ? 2 : stage === "dispatched" ? 1 : 0;
}

/**
 * "2026-10-08 16:40:00" -> "08 Oct 2026, 4:40 PM".
 * The API's space-separated format is not parsed by every browser (Safari
 * returns Invalid Date), so the parts are read by hand.
 */
export function formatOrderDateTime(value?: string): string {
  if (!value) return "";
  const m = value.match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})/);
  if (!m) return value;
  const [, y, mo, d, hh, mm] = m;
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const h = Number(hh);
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${d} ${months[Number(mo) - 1]} ${y}, ${h12}:${mm} ${h < 12 ? "AM" : "PM"}`;
}

/** "Dolo 650 × 2, Pan 40 × 1" plus how many more lines were left out. */
export function itemsSummary(o: Pick<OrderDetails, "products">, max = 2): { text: string; more: number } {
  const list = o.products || [];
  const text = list
    .slice(0, max)
    .map((p) => `${p.productName || "Item"} × ${Number(p.quantity) || 1}`)
    .join(",  ");
  return { text: text || "Order items", more: Math.max(0, list.length - max) };
}

/** The status line under the item names. */
export function stageNote(o: OrderDetails, stage: OrderStage): { text: string; tone: "ok" | "muted" } {
  switch (stage) {
    case "process":
      return { text: "Your pharmacist is preparing this order", tone: "ok" };
    case "dispatched":
      return { text: "On the way to you", tone: "ok" };
    case "delivered":
      return { text: "Delivered", tone: "ok" };
    default:
      return { text: o.cancel_reason ? `Cancelled · ${o.cancel_reason}` : "This order was cancelled", tone: "muted" };
  }
}

/** Full image URL for a product image path the API returns. */
export function productImageUrl(path?: string | null): string | null {
  if (!path) return null;
  const base = (process.env.NEXT_PUBLIC_MEDIA_BASE_URL || "").replace(/\/+$/, "");
  const cleaned = path.replace(/^https?:\/\/[^/]+/i, "").replace(/^\/+/, "");
  return `${base}/${cleaned}`;
}

export function initialOf(name?: string | null): string {
  const n = (name || "").trim();
  return n ? n[0].toUpperCase() : "U";
}
