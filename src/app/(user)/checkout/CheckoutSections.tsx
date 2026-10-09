"use client";

import Link from "next/link";
import { formatPrice } from "@/lib/utils/formatPrice";
import type { DeliveryFeeQuote } from "@/types/delivery";
import "../css/buy-flow.css";

/**
 * Payment + order placed building blocks — Figma B3 / M3 and B4 / M4
 * (section 6, node 69:4539). Like the bag's BagSections, these only draw:
 * the checkout page keeps the order / captcha / Razorpay logic.
 */

export type SummaryLine = {
  id: number;
  name: string;
  qty: number;
  pack?: string;
  lineTotal: number;
};

export type CheckoutAddress = {
  name?: string;
  address?: string;
  location?: string;
  pincode?: string;
  mobile?: string;
  address_type_id?: number;
} | null;

/** Everything the "Order placed" screen needs, captured before the bag is cleared. */
export type PlacedOrder = {
  orderId: number;
  orderNumber: string | null;
  amount: number;
  saved: number;
  paymentType: "cod" | "online";
  lines: SummaryLine[];
  address: CheckoutAddress;
  rxAttached: boolean;
  buyerName?: string;
  buyerMobile?: string;
};

const addressType = (a: CheckoutAddress) =>
  a?.address_type_id === 1 ? "Home" : a?.address_type_id === 2 ? "Work" : "Other";

const addressLine = (a: CheckoutAddress) =>
  [a?.address, a?.location, a?.pincode].filter(Boolean).join(", ");

/** "+91 98XXX XX210" — enough to recognise the number without printing it. */
const maskMobile = (m?: string) => {
  const d = (m || "").replace(/\D/g, "").slice(-10);
  if (d.length < 10) return "";
  return `+91 ${d.slice(0, 2)}XXX XX${d.slice(7)}`;
};

/* ---------------- How would you like to pay? ---------------------------- */
export function PaymentOptions({
  paymentType,
  onSelect,
  onlineEnabled,
  amount,
  captcha,
  captchaAns,
  onCaptchaChange,
  onCaptchaRefresh,
}: {
  paymentType: "cod" | "online";
  onSelect: (t: "cod" | "online") => void;
  onlineEnabled: boolean;
  amount: number;
  captcha: { a: number; b: number };
  captchaAns: string;
  onCaptchaChange: (v: string) => void;
  onCaptchaRefresh: () => void;
}) {
  const cod = paymentType === "cod";
  return (
    <section className="bf-card bf-section" aria-label="Payment method">
      <div className="bf-section-head">
        <h2><i className="bi bi-cash-coin" aria-hidden="true" /> How would you like to pay?</h2>
      </div>

      <div role="radiogroup" aria-label="Payment method" className="bf-payopts">
        {/* Cash on delivery: the default, with the quick check inside it */}
        <div className={`bf-payopt ${cod ? "is-selected" : ""}`}>
          <label className="bf-payopt-head">
            <input
              type="radio"
              name="payment"
              checked={cod}
              onChange={() => onSelect("cod")}
            />
            <i className="bi bi-truck bf-payopt-icon" aria-hidden="true" />
            <span className="bf-payopt-text">
              <span className="bf-payopt-title">
                Cash on delivery <span className="bf-chip bf-chip--ok">Most used</span>
              </span>
              <small>
                Pay ₹{formatPrice(amount)} to the rider in cash or by UPI when your order arrives.
              </small>
            </span>
          </label>

          {cod && (
            <div className="bf-qcheck">
              <div>
                <strong>Quick check</strong>
                <small>Answer to confirm a real cash order</small>
              </div>
              <div className="bf-qcheck-input">
                <label htmlFor="cod-captcha" className="bf-qcheck-q">
                  {captcha.a} + {captcha.b} =
                </label>
                <input
                  id="cod-captcha"
                  type="number"
                  inputMode="numeric"
                  className="form-control"
                  value={captchaAns}
                  onChange={(e) => onCaptchaChange(e.target.value)}
                  aria-label={`What is ${captcha.a} plus ${captcha.b}?`}
                />
                <button
                  type="button"
                  className="bf-icon-btn"
                  onClick={onCaptchaRefresh}
                  title="New question"
                  aria-label="New question"
                >
                  <i className="bi bi-arrow-clockwise" aria-hidden="true" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Pay online: Razorpay, only when the server has keys */}
        <div
          className={`bf-payopt ${!cod ? "is-selected" : ""} ${!onlineEnabled ? "is-disabled" : ""}`}
        >
          <label className="bf-payopt-head">
            <input
              type="radio"
              name="payment"
              checked={!cod}
              disabled={!onlineEnabled}
              onChange={() => onlineEnabled && onSelect("online")}
            />
            <i className="bi bi-receipt bf-payopt-icon" aria-hidden="true" />
            <span className="bf-payopt-text">
              <span className="bf-payopt-title">
                Pay online
                {!onlineEnabled && <span className="bf-chip bf-chip--muted">Coming soon</span>}
              </span>
              <small>UPI, cards, net banking and wallets · secured by Razorpay</small>
            </span>
          </label>
        </div>
      </div>

      {!onlineEnabled && (
        <p className="bf-muted small mb-0 mt-2">
          <i className="bi bi-question-circle me-1" aria-hidden="true" />
          Online payment isn&apos;t switched on yet, so please use cash on delivery.
        </p>
      )}
    </section>
  );
}

/* ---------------- Delivering to (read-only on this step) ---------------- */
export function DeliveringToSummary({
  address,
  quote,
  loading,
}: {
  address: CheckoutAddress;
  quote: DeliveryFeeQuote | null;
  loading: boolean;
}) {
  const km = quote?.distance_km ? ` · ${Number(quote.distance_km).toFixed(1)} km` : "";
  return (
    <section className="bf-card bf-section" aria-label="Delivering to">
      <div className="bf-section-head">
        <h2><i className="bi bi-geo-alt" aria-hidden="true" /> Delivering to</h2>
        <Link href="/health-bag" className="bf-link">Change</Link>
      </div>
      {address ? (
        <p className="mb-2">
          {addressType(address)} — {address.name} · {addressLine(address)}
        </p>
      ) : (
        <p className="bf-muted mb-2">Loading your address…</p>
      )}
      {loading || !quote ? null : quote.deliverable ? (
        <p className={`small mb-0 ${quote.free ? "bf-ok" : "bf-muted"}`}>
          <i className="bi bi-truck me-1" aria-hidden="true" />
          {quote.free ? "FREE delivery" : `Delivery fee ₹${formatPrice(Number(quote.fee))}`}
          {km}
        </p>
      ) : (
        <p className="small mb-0 bf-danger">
          <i className="bi bi-exclamation-triangle-fill me-1" aria-hidden="true" />
          {quote.message || "We can't deliver to this address."}
        </p>
      )}
    </section>
  );
}

/* ---------------- Prescription (only when an item needs one) ------------ */
export function PrescriptionSummary({ attached }: { attached: boolean }) {
  return (
    <section className="bf-card bf-section" aria-label="Prescription">
      <div className="bf-section-head">
        <h2><i className="bi bi-file-earmark-medical" aria-hidden="true" /> Prescription</h2>
        {!attached && <Link href="/health-bag" className="bf-link">Upload</Link>}
      </div>
      {attached ? (
        <p className="small mb-0">
          <i className="bi bi-check-circle bf-ok me-1" aria-hidden="true" />
          Prescription attached · checked by our pharmacist before packing
        </p>
      ) : (
        <p className="small mb-0 bf-danger">
          <i className="bi bi-exclamation-triangle-fill me-1" aria-hidden="true" />
          Upload the prescription in your bag before placing the order.
        </p>
      )}
    </section>
  );
}

/* ---------------- Order summary column --------------------------------- */
export function OrderSummary({
  lines,
  totalMrp,
  totalDiscount,
  deliveryFee,
  quote,
  toPay,
  paymentType,
  placing,
  blockReason,
  onPlace,
}: {
  lines: SummaryLine[];
  totalMrp: number;
  totalDiscount: number;
  deliveryFee: number;
  quote: DeliveryFeeQuote | null;
  toPay: number;
  paymentType: "cod" | "online";
  placing: boolean;
  /** Why the order can't be placed yet (shown under the button). */
  blockReason?: string | null;
  onPlace: () => void;
}) {
  const km = quote?.distance_km ? `${Number(quote.distance_km).toFixed(1)} km` : null;
  return (
    <aside className="bf-card bf-bill" aria-label="Order summary">
      <div className="d-flex justify-content-between align-items-baseline mb-2">
        <h2 className="mb-0">Order summary</h2>
        <span className="bf-muted small">
          {lines.length} {lines.length === 1 ? "item" : "items"}
        </span>
      </div>

      <ul className="bf-sumlines">
        {lines.map((l) => (
          <li key={l.id}>
            <span className="bf-sumlines-img" aria-hidden="true"><i className="bi bi-capsule" /></span>
            <span className="bf-sumlines-name">
              <strong>{l.name}</strong>
              <small>{l.qty} × {l.pack || "pack"}</small>
            </span>
            <span className="bf-sumlines-price">₹{formatPrice(l.lineTotal)}</span>
          </li>
        ))}
      </ul>

      <div className="bf-bill-row"><span>Item total (MRP)</span><span>₹{formatPrice(totalMrp)}</span></div>
      <div className="bf-bill-row"><span>Discount</span><span className="bf-ok">− ₹{formatPrice(totalDiscount)}</span></div>
      <div className="bf-bill-row">
        <span>Delivery fee{km && <small className="d-block">{km}</small>}</span>
        {quote && !quote.deliverable ? (
          <span className="bf-danger">Not deliverable</span>
        ) : deliveryFee > 0 ? (
          <span>₹{formatPrice(deliveryFee)}</span>
        ) : (
          <span className="bf-ok fw-semibold">FREE</span>
        )}
      </div>
      <hr />
      <div className="bf-bill-row bf-bill-total">
        <span>{paymentType === "cod" ? "To pay on delivery" : "To pay now"}</span>
        <span>₹{formatPrice(toPay)}</span>
      </div>

      <button
        type="button"
        className="bf-btn bf-btn--block mt-2"
        onClick={onPlace}
        disabled={placing || !!blockReason}
      >
        {placing ? "Placing order…" : paymentType === "online" ? "Place order & pay" : "Place order"}
      </button>
      {blockReason && (
        <p className="bf-block-reason">
          <i className="bi bi-exclamation-triangle-fill" aria-hidden="true" /> {blockReason}
        </p>
      )}
      <p className="bf-muted small mt-2 mb-0">
        By placing this order you agree to our{" "}
        <Link href="/terms-and-conditions" className="bf-link">Terms and conditions</Link> and{" "}
        <Link href="/privacy-policy" className="bf-link">Privacy policy</Link>.
      </p>
    </aside>
  );
}

/* ---------------- Order placed (B4 / M4) -------------------------------- */
const NEXT_STEPS = ["Placed", "Packed", "Out for delivery", "Delivered"];

export function OrderPlacedView({
  order,
  onTrack,
  onShop,
}: {
  order: PlacedOrder;
  onTrack: () => void;
  onShop: () => void;
}) {
  const mobile = maskMobile(order.buyerMobile);
  const cod = order.paymentType === "cod";
  return (
    <div className="bf-placed">
      <section className="bf-card bf-placed-hero" aria-live="polite">
        <span className="bf-placed-tick"><i className="bi bi-check-lg" aria-hidden="true" /></span>
        <h1>Order placed</h1>
        <p className="bf-muted">
          Thank you{order.buyerName ? `, ${order.buyerName.split(" ")[0]}` : ""}.
          {mobile ? ` We have sent the order details to ${mobile}.` : " We have sent you the order details."}
        </p>
        <div className="bf-placed-chips">
          <span className="bf-chip bf-chip--brand">
            <i className="bi bi-receipt" aria-hidden="true" /> Order #{order.orderNumber || order.orderId}
          </span>
          <span className="bf-chip bf-chip--ok">
            <i className="bi bi-check-circle-fill" aria-hidden="true" />
            {cod ? `Cash on delivery · pay ₹${formatPrice(order.amount)} to the rider` : `Paid ₹${formatPrice(order.amount)} online`}
          </span>
          {order.saved > 0 && (
            <span className="bf-chip bf-chip--accent">
              <i className="bi bi-piggy-bank" aria-hidden="true" /> You saved ₹{formatPrice(order.saved)}
            </span>
          )}
        </div>
      </section>

      <section className="bf-card bf-section" aria-label="What happens next">
        <h2 className="bf-placed-h2">What happens next</h2>
        <ol className="bf-timeline">
          {NEXT_STEPS.map((s, i) => (
            <li key={s} className={i === 0 ? "is-done" : ""}>
              <span className="bf-timeline-dot">
                {i === 0 && <i className="bi bi-check-lg" aria-hidden="true" />}
              </span>
              <span>{s}</span>
            </li>
          ))}
        </ol>
        <div className="bf-placed-note">
          <i className="bi bi-file-earmark-medical" aria-hidden="true" />
          {order.rxAttached ? (
            <div>
              <strong>Our pharmacist is reviewing your prescription</strong>
              <small>Your order is packed once it is approved. If anything needs checking, we will call you before dispatch.</small>
            </div>
          ) : (
            <div>
              <strong>We are packing your order</strong>
              <small>A pharmacist checks every order before it leaves. We will let you know when it is out for delivery.</small>
            </div>
          )}
        </div>
      </section>

      <div className="row g-3 mb-3">
        <div className="col-md-6">
          <section className="bf-card bf-section h-100 mb-0" aria-label="Delivering to">
            <h2 className="bf-placed-h2">Delivering to</h2>
            {order.address ? (
              <div className="d-flex gap-2">
                <i className="bi bi-geo-alt text-primary" aria-hidden="true" />
                <p className="mb-0">
                  {addressType(order.address)} — {order.address.name}
                  <br />
                  {addressLine(order.address)}
                </p>
              </div>
            ) : (
              <p className="bf-muted mb-0">Your saved address</p>
            )}
          </section>
        </div>
        <div className="col-md-6">
          <section className="bf-card bf-section h-100 mb-0" aria-label="Items">
            <h2 className="bf-placed-h2">Items ({order.lines.length})</h2>
            {order.lines.map((l) => (
              <div key={l.id} className="bf-bill-row">
                <span>
                  <strong className="d-block text-dark fw-medium">{l.name}</strong>
                  <small>{l.qty} × {l.pack || "pack"}</small>
                </span>
                <span>₹{formatPrice(l.lineTotal)}</span>
              </div>
            ))}
            <hr />
            <div className="bf-bill-row bf-bill-total mb-0">
              <span>{cod ? "To pay on delivery" : "Paid"}</span>
              <span>₹{formatPrice(order.amount)}</span>
            </div>
          </section>
        </div>
      </div>

      <div className="bf-placed-actions">
        <button type="button" className="bf-btn" onClick={onTrack}>Track order</button>
        <button type="button" className="bf-btn bf-btn--outline" onClick={onShop}>Continue shopping</button>
      </div>
      <p className="bf-muted small text-center mt-3 mb-0">
        <i className="bi bi-headset me-1" aria-hidden="true" />
        Questions about your order? <Link href="/contact-us" className="bf-link">Chat with a pharmacist</Link>
      </p>
    </div>
  );
}
