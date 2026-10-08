"use client";

import React from "react";
import type { OrderDetails } from "@/types/order";
import {
  STAGE_LABEL,
  formatOrderDateTime,
  itemsSummary,
  orderStage,
  productImageUrl,
  stageNote,
  stageStep,
} from "../orderView";

/** 277.5 -> "277.50", 1234 -> "1,234.00" (Indian grouping). */
const rupees = (v: string | number) =>
  Number(v || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// Plain <div>s, not <header>/<footer>: the site CSS styles those tags as the
// page header and footer.
const STEPS = ["Placed", "Dispatched", "Delivered"];

/** Placed -> Dispatched -> Delivered, filled up to the order's stage. */
export function OrderStepper({ step }: { step: number }) {
  return (
    <div className="acct-steps" aria-label={`Order progress: ${STEPS[step]}`}>
      {STEPS.map((label, i) => (
        <React.Fragment key={label}>
          <div className={`acct-step ${i === 1 ? "mid" : i === 2 ? "end" : ""} ${i <= step ? "done" : ""}`}>
            <span className="acct-dot">{i <= step && <i className="bi bi-check-lg" />}</span>
            {label}
          </div>
          {i < STEPS.length - 1 && <span className={`acct-line ${i < step ? "done" : ""}`} />}
        </React.Fragment>
      ))}
    </div>
  );
}

interface Props {
  order: OrderDetails;
  onView: (orderId: number) => void;
  onReorder: (orderId: number) => void;
  onCancel: (orderId: number) => void;
  cancelling?: boolean;
}

/** One order in My Orders (Figma: "Order card"). */
export default function OrderCard({ order, onView, onReorder, onCancel, cancelling }: Props) {
  const stage = orderStage(order);
  const { text, more } = itemsSummary(order);
  const note = stageNote(order, stage);
  const number = `#${order.order_number || order.orderId}`;
  const thumbs = (order.products || []).slice(0, 2);
  const helpText = encodeURIComponent(`Hi TnC Pharmacy, I need help with my order ${number}.`);

  return (
    <article className="acct-card acct-order" data-order-id={order.orderId}>
      <div className="acct-order-head">
        <div className="flex-grow-1">
          {/* h6 + .badge are what the E2E suite looks for */}
          <h6>
            Order {number}
            <span className={`badge acct-badge s-${stage}`}>{STAGE_LABEL[stage]}</span>
          </h6>
          <div className="date">Placed on {formatOrderDateTime(order.orderDate)}</div>
        </div>
      </div>

      <div className="acct-order-body">
        <div className="acct-thumbs">
          {thumbs.map((p, i) => {
            const src = productImageUrl(p.image);
            return (
              <div className="acct-thumb" key={p.id ?? i}>
                {src ? <img src={src} alt={p.productName || "medicine"} /> : <i className="bi bi-box-seam" />}
              </div>
            );
          })}
          {more > 0 && <div className="acct-thumb more">+{more}</div>}
        </div>

        <div className="acct-items">
          <div className="names">{text}{more > 0 ? `  +${more} more` : ""}</div>
          <div className={`acct-note ${note.tone}`}>
            <i className={`bi ${stage === "cancelled" ? "bi-x-circle" : stage === "delivered" ? "bi-check-circle" : "bi-truck"}`} />
            {note.text}
          </div>
          {order.prescription_url && (
            <button type="button" className="acct-rx" onClick={() => window.open(order.prescription_url, "_blank")}>
              <i className="bi bi-file-earmark-medical" /> Prescription attached
            </button>
          )}
        </div>

        <div className="acct-amount">
          <b>₹{rupees(order.amount)}</b>
          <span>{order.paymentMode || ""}</span>
        </div>
      </div>

      {stage !== "cancelled" && <OrderStepper step={stageStep(stage)} />}

      <div className="acct-order-foot">
        <button
          type="button"
          className="acct-btn primary"
          onClick={() => onView(order.orderId)}
          title="Order Details"
        >
          {stage === "process" || stage === "dispatched" ? "Track order" : "View details"}
        </button>
        <button type="button" className="acct-btn" onClick={() => onReorder(order.orderId)} title="Reorder">
          <i className="bi bi-arrow-repeat" /> Reorder
        </button>
        {order.buyer_can_cancel && (
          <button
            type="button"
            className="acct-btn-danger"
            onClick={() => onCancel(order.orderId)}
            disabled={cancelling}
            title="Cancel order"
          >
            {cancelling ? "Cancelling…" : "Cancel order"}
          </button>
        )}
        <a className="help" href={`https://wa.me/917042079595?text=${helpText}`} target="_blank" rel="noreferrer">
          <i className="bi bi-headset" /> Need help?
        </a>
      </div>
    </article>
  );
}
