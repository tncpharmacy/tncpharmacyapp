"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { getAddress } from "@/lib/features/addressSlice/addressSlice";
import { useDeliveryQuote } from "@/lib/hooks/useDeliveryQuote";
import { formatPrice } from "@/lib/utils/formatPrice";
import type { CompareItem } from "@/types/compare";
import "../../css/buy-flow.css";

/**
 * Medicine page buy box — Figma B1 (right column) and B1b state D.
 *
 *  - price, MRP and the offer % once; price per tablet from the compare API
 *  - quantity stepper + Add to bag; once in the bag: stepper (trash at 1),
 *    a green "Added to bag" and "Go to bag"
 *  - delivery check for the default address (server fee: free within 12 km,
 *    partner fare to 50 km, not deliverable beyond)
 *  - "Same medicine from ₹x per tablet" teaser that scrolls to the comparison
 */
export default function BuyBox(props: {
  loading: boolean;
  rx: boolean;
  price: number;
  mrp?: number | string | null;
  discount?: number | string | null;
  unitPrice: string | null;
  unitLabel: string | null;
  inStock: boolean;
  isInBag: boolean;
  quantity: number;
  busy: boolean;
  onIncrease: () => void;
  onDecrease: () => void;
  onRemove: () => void;
  onAdd: () => void;
  onGoToBag: () => void;
  cheapest: CompareItem | null;
  onCompare: () => void;
}) {
  const {
    loading, rx, price, mrp, discount, unitPrice, unitLabel, inStock, isInBag,
    quantity, busy, onIncrease, onDecrease, onRemove, onAdd, onGoToBag,
    cheapest, onCompare,
  } = props;

  const dispatch = useAppDispatch();
  const buyerState = useAppSelector((s) => s.buyer.buyer);
  // The server renders as a guest; read the login only after hydration so
  // the first client render matches the HTML.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const buyer = mounted ? buyerState : null;
  const addresses = useAppSelector((s) => s.address.addresses) || [];
  useEffect(() => {
    if (buyer?.id && addresses.length === 0) dispatch(getAddress(buyer.id));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [buyer?.id, dispatch]);
  const address = addresses.find((a) => a.default_address === 1) || addresses[0];
  const { quote, loading: quoteLoading } = useDeliveryQuote(
    buyer?.id ? address?.id : null
  );

  const off = Number(discount) || 0;
  const hasPrice = price > 0;

  const stepper = (
    <div className="bf-qty" aria-label="Quantity">
      <button
        type="button"
        onClick={isInBag && quantity <= 1 ? onRemove : onDecrease}
        disabled={busy || (!isInBag && quantity <= 1)}
        className={isInBag && quantity <= 1 ? "is-trash" : undefined}
        aria-label={isInBag && quantity <= 1 ? "Remove from bag" : "Decrease quantity"}
      >
        <i className={`bi ${isInBag && quantity <= 1 ? "bi-trash3" : "bi-dash-lg"}`} />
      </button>
      <span>{quantity}</span>
      <button type="button" onClick={onIncrease} disabled={busy} aria-label="Increase quantity">
        <i className="bi bi-plus-lg" />
      </button>
    </div>
  );

  let delivery: React.ReactNode;
  if (!buyer?.id) {
    delivery = (
      <>
        <strong className="d-block">Free delivery within 12 km of our pharmacy</strong>
        <span className="bf-muted">Log in to check your address</span>
      </>
    );
  } else if (!address) {
    delivery = (
      <>
        <strong className="d-block">Add an address to check delivery</strong>
        <Link href="/profile?tab=address" className="bf-link">Add address</Link>
      </>
    );
  } else if (quoteLoading || !quote) {
    delivery = <span className="bf-muted">Checking delivery to {address.pincode}…</span>;
  } else if (!quote.deliverable) {
    delivery = (
      <>
        <strong className="d-block bf-danger">We can&apos;t deliver to {address.pincode} yet</strong>
        <span className="bf-muted">We deliver within {quote.max_radius_km} km of our pharmacy</span>
      </>
    );
  } else {
    const km = quote.distance_km ? `${Number(quote.distance_km).toFixed(1)} km` : null;
    delivery = (
      <>
        <strong className="d-block">
          Deliver to {address.pincode} ·{" "}
          {quote.free ? "FREE delivery" : `Delivery ₹${formatPrice(Number(quote.fee))}`}
        </strong>
        <span className={quote.free ? "bf-ok" : "bf-muted"}>
          {km ? `${km} from our pharmacy` : quote.message}
        </span>
      </>
    );
  }

  return (
    <div className="bf-buybox">
      {rx && (
        <span className="bf-chip bf-chip--rx mb-2">
          <b>Rx</b> Prescription required
        </span>
      )}

      {loading ? (
        <div className="skeleton price-skeleton" />
      ) : hasPrice ? (
        <>
          <div className="bf-price-row">
            <span className="bf-price-now">₹{formatPrice(price)}</span>
            {off > 0 && mrp ? (
              <>
                <del className="bf-price-was">MRP ₹{formatPrice(Number(mrp))}</del>
                <span className="bf-price-off">{off}% off</span>
              </>
            ) : null}
          </div>
          <div className="bf-sub">
            {unitPrice ? `₹${Number(unitPrice).toFixed(2)} per ${unitLabel || "unit"} · ` : ""}
            Inclusive of all taxes
          </div>
        </>
      ) : (
        <div className="bf-muted">Price unavailable</div>
      )}

      <div className={`bf-stock my-2 ${inStock ? "bf-ok" : "bf-danger"}`}>
        {inStock ? "In stock" : "Out of stock"}
      </div>

      {isInBag ? (
        <div className="my-3">
          <div className="bf-added-line">
            <i className="bi bi-check2-circle" aria-hidden="true" /> Added to bag
          </div>
          <div className="d-flex gap-2">
            {stepper}
            <button type="button" className="bf-btn flex-grow-1" onClick={onGoToBag}>
              Go to bag <i className="bi bi-arrow-right" aria-hidden="true" />
            </button>
          </div>
        </div>
      ) : (
        <div className="d-flex gap-2 my-3">
          {stepper}
          <button
            type="button"
            className="bf-btn flex-grow-1"
            onClick={onAdd}
            disabled={busy || !inStock || !hasPrice}
          >
            {busy ? "Adding…" : !inStock ? "Out of stock" : "Add to bag"}
          </button>
        </div>
      )}

      {cheapest && (
        <button type="button" className="bf-teaser mb-3" onClick={onCompare}>
          <i className="bi bi-cash-coin" aria-hidden="true" />
          <span className="text-start">
            <strong>
              Same medicine from ₹{Number(cheapest.unit_price).toFixed(2)} per{" "}
              {cheapest.unit_label || "unit"}
            </strong>
            <small>Same salt, strength and form · </small>
            <small className="bf-link">Compare ↓</small>
          </span>
        </button>
      )}

      <div className="bf-delivery mb-3">
        <i className="bi bi-geo-alt" aria-hidden="true" />
        <div className="flex-grow-1" style={{ fontSize: 12 }}>
          {delivery}
        </div>
        {buyer?.id && address && (
          <Link href="/profile?tab=address" className="bf-link">
            Change
          </Link>
        )}
      </div>

      <ul className="bf-assure">
        <li>
          <i className="bi bi-truck" aria-hidden="true" />
          Free delivery within 12 km; fare shown in the bag beyond that
        </li>
        <li>
          <i className="bi bi-shield-check" aria-hidden="true" />
          Dispensed by a registered pharmacist
        </li>
        {rx && (
          <li>
            <i className="bi bi-file-earmark-medical" aria-hidden="true" />
            Prescription checked by our pharmacist before dispatch
          </li>
        )}
      </ul>
    </div>
  );
}
