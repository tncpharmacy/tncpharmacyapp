/**
 * Small, pure helpers the account pages use to turn an order from the API
 * into what the card shows. Kept separate from the components so they are
 * easy to read and to reuse (e.g. on a future order-details page).
 */
import type { OrderDetails } from "@/types/order";

/** One key per badge colour and order filter ("bucket"). */
export type OrderStage = "process" | "dispatched" | "delivered" | "cancelled";

type StageInput = Pick<OrderDetails, "orderStatus" | "deliveryStatusName">;

/**
 * The backend sends `orderStatus` ("Buy" | "Cancelled") and
 * `deliveryStatusName`, from MasterTableOrder.status and .delivery_status:
 *
 *   In Process -> Confirmed -> Packed -> Rider Assigned -> Dispatched -> Delivered
 *   (+ Delivery Failed)
 *
 * Confirmed / Packed / Rider Assigned / Delivery Failed all count as "in
 * process" for the badge colour and the My Orders filter; `stageLabel` gives
 * the precise wording.
 */
export function orderStage(o: StageInput): OrderStage {
  if (o.orderStatus === "Cancelled") return "cancelled";
  if (o.deliveryStatusName === "Delivered") return "delivered";
  if (o.deliveryStatusName === "Dispatched") return "dispatched";
  return "process";
}

export const STAGE_LABEL: Record<OrderStage, string> = {
  process: "In Process",
  dispatched: "Out for delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const DETAIL_LABEL: Record<string, string> = {
  "In Process": "Order placed",
  Confirmed: "Confirmed",
  Packed: "Packed",
  "Rider Assigned": "Rider assigned",
  Dispatched: "Out for delivery",
  Delivered: "Delivered",
  "Delivery Failed": "Delivery attempt failed",
};

/** The precise words for the order's stage, for the status chip. */
export function stageLabel(o: StageInput): string {
  if (o.orderStatus === "Cancelled") return "Cancelled";
  return DETAIL_LABEL[o.deliveryStatusName || ""] || STAGE_LABEL[orderStage(o)];
}

/** The four steps of the tracker on the order card and details page. */
export const TRACKER_STEPS = ["Placed", "Packed", "Out for delivery", "Delivered"];

/** Tracker progress: 0 Placed, 1 Packed (or rider assigned), 2 Out for delivery, 3 Delivered. */
export function stageStep(o: StageInput): number {
  switch (o.deliveryStatusName) {
    case "Delivered":
      return 3;
    case "Dispatched":
      return 2;
    case "Packed":
    case "Rider Assigned":
    case "Delivery Failed":
      return 1;
    default:
      return 0;
  }
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
export function stageNote(o: Pick<OrderDetails, "deliveryStatusName" | "cancel_reason">, stage: OrderStage): { text: string; tone: "ok" | "muted" } {
  switch (stage) {
    case "process":
      switch (o.deliveryStatusName) {
        case "Confirmed":
          return { text: "Your pharmacist has confirmed this order", tone: "ok" };
        case "Packed":
          return { text: "Packed and waiting for a delivery rider", tone: "ok" };
        case "Rider Assigned":
          return { text: "A rider is on the way to the pharmacy to collect it", tone: "ok" };
        case "Delivery Failed":
          return { text: "The rider couldn't deliver. The pharmacy will contact you", tone: "muted" };
        default:
          return { text: "Your pharmacist is preparing this order", tone: "ok" };
      }
    case "dispatched":
      return { text: "Out for delivery — on the way to you", tone: "ok" };
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
