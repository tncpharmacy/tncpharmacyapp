"use client";

import { deliveryLabel } from "@/lib/utils/orderStatus";

/**
 * Delivery-state badge for the staff order screens.
 *
 * Figma: the existing "Order status badge" component — deliberately the SAME
 * one the buyer-facing screens use, so patient and admin can never disagree
 * about what a stage looks like.
 *
 * It takes the raw delivery_status code and runs it through deliveryLabel()
 * from lib/utils/orderStatus.ts for the wording (one source of truth):
 *   1 New -> 4 Confirmed -> 5 Packed -> 6 Rider Assigned
 *     -> 3 Out for Delivery -> 2 Delivered        (7 Delivery Failed)
 * The colour is chosen from the code, not the label, so renaming a label can
 * never change a colour. `cancelled` wins over everything, because a
 * cancelled order keeps whatever delivery code it had when it was cancelled.
 */

type Tone = "process" | "ready" | "onTheWay" | "delivered" | "failed" | "cancelled";

const TONE: Record<Tone, { bg: string; fg: string; icon: string }> = {
  process:   { bg: "#FFF8E1", fg: "#8A6100", icon: "bi-hourglass-split" },
  ready:     { bg: "#EAF0FB", fg: "#264B8C", icon: "bi-box-seam" },
  onTheWay:  { bg: "#E6F7FB", fg: "#0A6C7E", icon: "bi-truck" },
  delivered: { bg: "#E8F5EE", fg: "#146C43", icon: "bi-check-circle-fill" },
  failed:    { bg: "#FDE9E7", fg: "#B02A37", icon: "bi-exclamation-triangle-fill" },
  cancelled: { bg: "#FDE9E7", fg: "#B02A37", icon: "bi-x-circle-fill" },
};

function toneFor(code: string): Tone {
  if (code === "2") return "delivered";
  if (code === "7") return "failed";
  if (code === "3" || code === "6") return "onTheWay";
  if (code === "4" || code === "5") return "ready";
  return "process";
}

export default function StatusBadge({
  deliveryStatus,
  cancelled = false,
  title,
}: {
  deliveryStatus?: string | number | null;
  cancelled?: boolean;
  title?: string;
}) {
  const code = String(deliveryStatus ?? "1");
  const label = cancelled ? "Cancelled" : deliveryLabel(code);
  const t = TONE[cancelled ? "cancelled" : toneFor(code)];

  return (
    <span className="adm-badge" style={{ background: t.bg, color: t.fg }} title={title}>
      <i className={`bi ${t.icon}`} aria-hidden="true" />
      {label}
    </span>
  );
}
