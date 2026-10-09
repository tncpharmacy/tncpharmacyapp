import React from "react";
import { OrderStage, STAGE_LABEL } from "../orderView";

/**
 * Order status chip (Figma: "Order status badge").
 *
 * Each stage has its own icon + soft colour so it reads at a glance and does
 * not rely on colour alone: In Process (hourglass, amber), Dispatched (truck,
 * blue), Delivered (tick, green), Cancelled (cross, red). Dark text on a light
 * tint keeps contrast above WCAG AA.
 *
 * Keeps the `badge acct-badge` classes the E2E suite looks for.
 */
const ICON: Record<OrderStage, string> = {
  process: "bi-hourglass-split",
  dispatched: "bi-truck",
  delivered: "bi-check-circle-fill",
  cancelled: "bi-x-circle-fill",
};

export default function StatusChip({
  stage,
  size = "md",
  label,
}: {
  stage: OrderStage;
  size?: "md" | "lg";
  /** Precise wording (e.g. "Packed", "Rider assigned"); defaults to the bucket name. */
  label?: string;
}) {
  return (
    <span className={`badge acct-badge acct-chip-status s-${stage} ${size === "lg" ? "lg" : ""}`} role="status">
      <i className={`bi ${ICON[stage]}`} aria-hidden />
      {label || STAGE_LABEL[stage]}
    </span>
  );
}
