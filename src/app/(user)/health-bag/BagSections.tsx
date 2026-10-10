"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useMedicineCompare } from "../medicines-details/[id]/CompareBlock";
import { formatPrice } from "@/lib/utils/formatPrice";
import type { DeliveryFeeQuote } from "@/types/delivery";
import type { CompareItem } from "@/types/compare";
import "../css/buy-flow.css";

/**
 * Bag building blocks — Figma B2 / B2b / M2 (section 6).
 * The bag page (HealthBagClient) owns the data and the handlers; these only
 * draw, so the add/remove/quantity logic stays where it was.
 */

/* ---------------- Deliver to (address + server delivery fee) ------------- */
export function DeliverToCard({
  loggedIn,
  address,
  quote,
  loading,
  onLogin,
}: {
  loggedIn: boolean;
  address: { name?: string; address?: string; location?: string; pincode?: string; mobile?: string; address_type_id?: number } | null;
  quote: DeliveryFeeQuote | null;
  loading: boolean;
  onLogin: () => void;
}) {
  if (!loggedIn) {
    return (
      <section className="bf-card bf-section" aria-label="Deliver to">
        <div className="bf-section-head">
          <h2><i className="bi bi-geo-alt" aria-hidden="true" /> Deliver to</h2>
        </div>
        <p className="bf-muted mb-3">
          Log in to choose an address and see the delivery fee. Items in your
          bag stay saved.
        </p>
        <button type="button" className="bf-btn" onClick={onLogin}>
          Log in with mobile number
        </button>
      </section>
    );
  }

  const type =
    address?.address_type_id === 1 ? "Home" : address?.address_type_id === 2 ? "Work" : "Other";

  let fee: React.ReactNode = null;
  if (address) {
    if (loading || !quote) {
      fee = (
        <div className="bf-fee bf-fee--info">
          <i className="bi bi-truck" aria-hidden="true" />
          <span>Working out the delivery fee…</span>
        </div>
      );
    } else if (!quote.deliverable) {
      fee = (
        <div className="bf-fee bf-fee--danger">
          <i className="bi bi-exclamation-triangle-fill" aria-hidden="true" />
          <div>
            <strong>We can&apos;t deliver here yet</strong>
            <small>{quote.message || `We deliver within ${quote.max_radius_km} km of our pharmacy.`} Choose another address.</small>
          </div>
        </div>
      );
    } else {
      const km = quote.distance_km ? `${Number(quote.distance_km).toFixed(1)} km from our pharmacy` : "";
      fee = (
        <div className={`bf-fee ${quote.free ? "bf-fee--ok" : "bf-fee--info"}`}>
          <i className="bi bi-truck" aria-hidden="true" />
          <div>
            <strong>
              {quote.free ? "FREE delivery" : `Delivery fee ₹${formatPrice(Number(quote.fee))}`}
              {km ? ` · ${km}` : ""}
            </strong>
            <small>
              {quote.free
                ? `Delivery is free within ${quote.free_radius_km} km`
                : `Free within ${quote.free_radius_km} km; beyond that you pay the delivery partner's fare.`}
            </small>
          </div>
        </div>
      );
    }
  }

  return (
    <section className="bf-card bf-section" aria-label="Deliver to">
      <div className="bf-section-head">
        <h2><i className="bi bi-geo-alt" aria-hidden="true" /> Deliver to</h2>
        <Link href="/address" className="bf-link">
          {address ? "Change address" : "Add address"}
        </Link>
      </div>
      {address ? (
        <>
          <div className="d-flex align-items-center gap-2 flex-wrap">
            <strong>{type} — {address.name}</strong>
          </div>
          <p className="bf-muted small mb-3">
            {[address.address, address.location, address.pincode].filter(Boolean).join(", ")}
            {address.mobile ? ` · ${address.mobile}` : ""}
          </p>
          {fee}
        </>
      ) : (
        <p className="bf-muted mb-0">Add a delivery address to see the delivery fee.</p>
      )}
    </section>
  );
}

/* ---------------- Prescription (attached / required) --------------------- */
export function PrescriptionCard({
  rxItemNames,
  attached,
  fileName,
  uploading,
  loggedIn,
  onUpload,
  onLogin,
}: {
  rxItemNames: string[];
  attached: boolean;
  fileName: string | null;
  uploading: boolean;
  loggedIn: boolean;
  onUpload: (file: File) => void;
  onLogin: () => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  if (!rxItemNames.length) return null;

  const pick = () => (loggedIn ? input.current?.click() : onLogin());
  const names = rxItemNames.join(", ");

  return (
    <section className="bf-card bf-section" id="bag-rx" aria-label="Prescription">
      <div className="bf-section-head">
        <h2><i className="bi bi-file-earmark-medical" aria-hidden="true" /> Prescription</h2>
        {attached ? (
          <button type="button" className="bf-link" onClick={pick} disabled={uploading}>
            Replace
          </button>
        ) : (
          <span className="bf-chip bf-chip--rx">Required</span>
        )}
      </div>
      <p className="bf-muted small mb-3">
        Needed for {rxItemNames.length === 1 ? "1 item" : `${rxItemNames.length} items`}: {names}. Our
        pharmacist checks it before packing.
      </p>

      <input
        ref={input}
        type="file"
        accept="image/jpeg,image/png,application/pdf"
        className="d-none"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onUpload(f);
          e.target.value = "";
        }}
      />

      {attached ? (
        <div className="bf-rx-ok">
          <i className="bi bi-file-earmark-check" aria-hidden="true" />
          <div className="flex-grow-1">
            <strong>{fileName || "Prescription uploaded"}</strong>
            <small className="bf-ok d-block">
              <i className="bi bi-check2-circle" aria-hidden="true" /> Attached to this order
            </small>
          </div>
        </div>
      ) : (
        <button type="button" className="bf-dropzone" onClick={pick} disabled={uploading}>
          <i className="bi bi-upload" aria-hidden="true" />
          <strong>{uploading ? "Uploading…" : loggedIn ? "Upload prescription" : "Log in to upload prescription"}</strong>
          <small>Photo or PDF · max 5 MB</small>
        </button>
      )}
    </section>
  );
}

/* ---------------- One bag row ------------------------------------------- */
export type BagRowItem = {
  productid: number;
  id: number;
  name: string;
  manufacturer: string;
  pack_size: string;
  prescription_required: number;
  in_stock?: boolean;
  mrp: number;
  discount: number;
  discountMrp: number;
};

export function BagRow({
  item,
  qty,
  imageUrl,
  onOpen,
  onIncrease,
  onDecrease,
  onRemove,
  onReplace,
}: {
  item: BagRowItem;
  qty: number;
  imageUrl: string;
  onOpen: () => void;
  onIncrease: () => void;
  onDecrease: () => void;
  onRemove: () => void;
  onReplace: (alt: CompareItem) => Promise<void> | void;
}) {
  const off = Number(item.discount) || 0;
  return (
    <div className="bf-row">
      <div className="bf-row-main">
        <button type="button" className="bf-row-img" onClick={onOpen} aria-label={`Open ${item.name}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt=""
            className={imageUrl.includes("tnc-default") ? "is-placeholder" : undefined}
            onError={(e) => {
              e.currentTarget.src = "/images/tnc-default.png";
              e.currentTarget.classList.add("is-placeholder");
            }}
          />
        </button>
        <div className="bf-row-info">
          <button type="button" className="bf-row-name" onClick={onOpen}>
            {item.name}
          </button>
          <div className="bf-muted small">
            {[item.manufacturer, item.pack_size].filter(Boolean).join(" · ")}
          </div>
          <div className="d-flex flex-wrap gap-2 mt-1">
            {item.prescription_required === 1 && (
              <span className="bf-chip bf-chip--rx"><b>Rx</b> Prescription required</span>
            )}
            {item.in_stock === false && (
              <span className="bf-chip bf-chip--muted">Out of stock — remove to continue</span>
            )}
          </div>
        </div>
        <div className="bf-qty" aria-label="Quantity">
          <button
            type="button"
            onClick={qty <= 1 ? onRemove : onDecrease}
            className={qty <= 1 ? "is-trash" : undefined}
            aria-label={qty <= 1 ? `Remove ${item.name}` : "Decrease quantity"}
          >
            <i className={`bi ${qty <= 1 ? "bi-trash3" : "bi-dash-lg"}`} />
          </button>
          <span>{qty}</span>
          <button type="button" onClick={onIncrease} aria-label="Increase quantity">
            <i className="bi bi-plus-lg" />
          </button>
        </div>
        <div className="bf-row-price">
          <strong>₹{formatPrice(item.discountMrp * qty)}</strong>
          {off > 0 && (
            <small>
              <del>MRP ₹{formatPrice(item.mrp * qty)}</del>{" "}
              <span className="bf-ok">{off}% off</span>
            </small>
          )}
        </div>
      </div>
      {item.prescription_required === 1 && (
        <SwitchNudge productId={item.productid} itemName={item.name} onReplace={onReplace} />
      )}
    </div>
  );
}

/** "Same medicine for less" under an Rx bag row (strict equivalents only). */
function SwitchNudge({
  productId,
  itemName,
  onReplace,
}: {
  productId: number;
  itemName: string;
  onReplace: (alt: CompareItem) => Promise<void> | void;
}) {
  const { compare } = useMedicineCompare(productId);
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const alt =
    [compare?.cheapest, compare?.tnc_trusted]
      .filter((c): c is CompareItem => !!c && (c.saving_percent ?? 0) > 0)
      .sort((a, b) => Number(a.unit_price) - Number(b.unit_price))[0] ?? null;
  if (!alt || dismissed || !compare?.selected.unit_price) return null;

  const per = alt.unit_label || "unit";
  const save = (Number(compare.selected.unit_price) - Number(alt.unit_price)).toFixed(2);

  return (
    <div className="bf-nudge">
      <i className="bi bi-cash-coin" aria-hidden="true" />
      <div className="flex-grow-1">
        {confirming ? (
          <strong>Replace {itemName} with {alt.name} in your bag?</strong>
        ) : (
          <>
            <strong>
              Same medicine for less: {alt.name}
              {alt.manufacturer ? ` (${alt.manufacturer})` : ""} at ₹{Number(alt.unit_price).toFixed(2)}/{per}
            </strong>
            <small className="bf-ok d-block">
              Same salt, strength and dose form · save ₹{save} per {per}
              {alt.is_tnc_trusted ? " · TnC Trusted" : ""}
            </small>
          </>
        )}
      </div>
      {confirming ? (
        <>
          <button type="button" className="bf-link" onClick={() => setConfirming(false)} disabled={busy}>
            Cancel
          </button>
          <button
            type="button"
            className="bf-btn bf-btn--sm"
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              try {
                await onReplace(alt);
              } finally {
                setBusy(false);
                setConfirming(false);
              }
            }}
          >
            {busy ? "Replacing…" : "Replace"}
          </button>
        </>
      ) : (
        <>
          <button type="button" className="bf-link bf-muted" onClick={() => setDismissed(true)}>
            Keep mine
          </button>
          <button type="button" className="bf-btn bf-btn--outline bf-btn--sm" onClick={() => setConfirming(true)}>
            Switch
          </button>
        </>
      )}
    </div>
  );
}

/* ---------------- Bill summary + mobile sticky bar ----------------------- */
export function BillSummary({
  totalMrp,
  totalDiscount,
  quote,
  loading,
  loggedIn,
  hasAddress,
  toPay,
  blockReason,
  onContinue,
  ctaLabel,
}: {
  totalMrp: number;
  totalDiscount: number;
  quote: DeliveryFeeQuote | null;
  loading: boolean;
  loggedIn: boolean;
  hasAddress: boolean;
  toPay: number;
  blockReason: string | null;
  onContinue: () => void;
  ctaLabel: string;
}) {
  let feeValue: React.ReactNode;
  let feeSub: string | null = null;
  if (loading) feeValue = <span className="bf-muted">Calculating…</span>;
  else if (!loggedIn) { feeValue = <span className="bf-muted">—</span>; feeSub = "After login"; }
  else if (!hasAddress || !quote) { feeValue = <span className="bf-muted">—</span>; feeSub = "Select an address"; }
  else if (!quote.deliverable) feeValue = <span className="bf-danger">Not deliverable</span>;
  else if (quote.free) {
    feeValue = <span className="bf-ok fw-semibold">FREE</span>;
    feeSub = quote.distance_km ? `${Number(quote.distance_km).toFixed(1)} km · free within ${quote.free_radius_km} km` : null;
  } else {
    feeValue = <span>₹{formatPrice(Number(quote.fee))}</span>;
    feeSub = quote.distance_km ? `${Number(quote.distance_km).toFixed(1)} km` : null;
  }

  return (
    <aside className="bf-card bf-bill" aria-label="Bill summary">
      <h2>Bill summary</h2>
      <div className="bf-bill-row"><span>Item total (MRP)</span><span>₹{formatPrice(totalMrp)}</span></div>
      <div className="bf-bill-row"><span>Discount</span><span className="bf-ok">− ₹{formatPrice(totalDiscount)}</span></div>
      <div className="bf-bill-row">
        <span>Delivery fee{feeSub && <small className="d-block">{feeSub}</small>}</span>
        {feeValue}
      </div>
      <hr />
      <div className="bf-bill-row bf-bill-total"><span>To pay</span><span>₹{formatPrice(toPay)}</span></div>
      {totalDiscount > 0 && (
        <div className="bf-save">
          <i className="bi bi-check-circle-fill" aria-hidden="true" /> You save ₹{formatPrice(totalDiscount)} on this order
        </div>
      )}
      <button type="button" className="bf-btn bf-btn--block" onClick={onContinue} disabled={!!blockReason && loggedIn}>
        {ctaLabel}
      </button>
      {blockReason && loggedIn && (
        <p className="bf-block-reason"><i className="bi bi-exclamation-triangle-fill" aria-hidden="true" /> {blockReason}</p>
      )}
      <ul className="bf-trust">
        <li><i className="bi bi-shield-check" aria-hidden="true" /> Genuine medicines from a licensed pharmacy</li>
        <li><i className="bi bi-file-earmark-medical" aria-hidden="true" /> Every prescription is checked by our pharmacist</li>
      </ul>
    </aside>
  );
}

export function StickyPayBar({
  amount,
  sub,
  cta,
  onClick,
  disabled,
}: {
  amount: number;
  sub?: string;
  cta: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="bf-sticky d-md-none">
      <div>
        <strong>₹{formatPrice(amount)}</strong>
        {sub && <small>{sub}</small>}
      </div>
      <button type="button" className="bf-btn" onClick={onClick} disabled={disabled}>
        {cta}
      </button>
    </div>
  );
}

/* ---------------- Checkout steps (Bag · Payment · Order placed) ---------- */
export function CheckoutSteps({ active }: { active: 0 | 1 | 2 }) {
  const steps = ["Bag", "Payment", "Order placed"];
  return (
    <nav className="bf-steps" aria-label="Checkout steps">
      {steps.map((label, i) => {
        const done = i < active || active === 2;
        const cls = done ? "is-done" : i === active ? "is-active" : "";
        return (
          <span key={label} className="d-flex align-items-center gap-2">
            {i > 0 && <span className={`bf-line ${i <= active ? "is-done" : ""}`} />}
            <span className={`bf-step ${cls}`} aria-current={i === active ? "step" : undefined}>
              <span className="bf-dot">
                {done ? <i className="bi bi-check-lg" aria-hidden="true" /> : i + 1}
              </span>
              <span>{label}</span>
            </span>
          </span>
        );
      })}
    </nav>
  );
}
