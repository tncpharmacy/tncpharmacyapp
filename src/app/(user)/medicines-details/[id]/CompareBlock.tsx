"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { fetchMedicineCompare } from "@/lib/api/medicine";
import { resolveMediaUrl } from "@/lib/media";
import { encodeId } from "@/lib/utils/encodeDecode";
import type { CompareItem, MedicineCompare } from "@/types/compare";
import "../../css/buy-flow.css";

/**
 * "Compare before you buy" — Figma B1 / B1b (section 6).
 *
 * Shows the medicine the customer opened next to its TnC Trusted brand and
 * the cheapest strict equivalent, all priced per unit. The server decides
 * what counts as an equivalent (medicine/compare.py); this file only draws.
 *
 * States:
 *   default   selected + TnC Trusted + cheapest
 *   A         no TnC Trusted in stock  -> "Unavailable" card in its slot
 *   B         opened one is already the cheapest -> reassurance banner
 *   C         no strict equivalent -> one explanation row
 */

const PLACEHOLDER = "/images/tnc-default.png";

/** Load the comparison for a medicine. `null` while loading or on error. */
export function useMedicineCompare(medicineId?: number | null) {
  const [data, setData] = useState<MedicineCompare | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!medicineId) return;
    let alive = true;
    setLoading(true);
    setData(null);
    fetchMedicineCompare(Number(medicineId))
      .then((d) => alive && setData(d))
      // An older API without the endpoint, or a network error: the page
      // simply renders without the comparison.
      .catch(() => alive && setData(null))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [medicineId]);

  return { compare: data, loading };
}

const money = (v: string | null | undefined) => {
  const n = Number(v);
  if (!Number.isFinite(n)) return "";
  return Number.isInteger(n) ? String(n) : n.toFixed(2);
};

const unitWord = (label: string | null) => label || "unit";

type Kind = "selected" | "trusted" | "cheapest";

function CompareCard({
  item,
  kind,
  selectedPrice,
  isInBag,
  onAdd,
  onGoToBag,
}: {
  item: CompareItem;
  kind: Kind;
  selectedPrice: number | null;
  isInBag: boolean;
  onAdd: () => void;
  onGoToBag: () => void;
}) {
  const router = useRouter();
  const img = item.image ? resolveMediaUrl(item.image) : PLACEHOLDER;
  const chip =
    kind === "selected" ? (
      <span className="bf-chip bf-chip--brand">
        {item.is_tnc_trusted ? "You selected · TnC Trusted" : "You selected"}
      </span>
    ) : kind === "trusted" ? (
      <span className="bf-chip bf-chip--ok">
        <i className="bi bi-patch-check-fill" aria-hidden="true" /> TnC Trusted
      </span>
    ) : (
      <span className="bf-chip bf-chip--accent">
        <i className="bi bi-cash-coin" aria-hidden="true" /> Lowest price
      </span>
    );

  const unit = item.unit_price ? Number(item.unit_price) : null;
  const moreBy =
    kind !== "selected" && unit !== null && selectedPrice !== null && unit > selectedPrice
      ? unit - selectedPrice
      : null;
  const off = Number(item.discount) || 0;

  return (
    <article
      className={`bf-ccard${kind === "selected" ? " is-selected" : ""}${
        kind === "trusted" ? " is-trusted" : ""
      }`}
    >
      <div className="bf-ccard-media">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={img}
          alt={item.name}
          className={img === PLACEHOLDER ? "is-placeholder" : undefined}
          onError={(e) => {
            e.currentTarget.src = PLACEHOLDER;
            e.currentTarget.classList.add("is-placeholder");
          }}
        />
        {chip}
      </div>
      {item.rx_required && (
        <div className="bf-ccard-rx">
          <b>Rx</b>Prescription required
        </div>
      )}
      <div className="bf-ccard-body">
        <h3 className="bf-ccard-name" title={item.name}>
          {item.name}
        </h3>
        <div className="bf-ccard-sub">
          {[item.manufacturer, item.pack_size].filter(Boolean).join(" · ")}
        </div>
        {kind === "selected" ? null : (
          <div className="bf-ccard-match bf-ok">
            <i className="bi bi-check2-circle" aria-hidden="true" /> Same salt ·
            strength · form
          </div>
        )}

        <div className="bf-ccard-foot">
          <div>
            {unit !== null ? (
              <div className="bf-unit">
                ₹{money(item.unit_price)}
                <small>/ {unitWord(item.unit_label)}</small>
              </div>
            ) : (
              <div className="bf-ccard-line">
                {item.in_stock ? "Price unavailable" : "Out of stock"}
              </div>
            )}
            {item.price && (
              <div className="bf-ccard-line">
                ₹{money(item.price)} for {item.units_per_pack}{" "}
                {unitWord(item.unit_label)}s
              </div>
            )}
            <div className="bf-ccard-line">
              {kind === "selected" ? (
                off > 0 && item.mrp ? (
                  <>
                    <del>MRP ₹{money(item.mrp)}</del>
                    <span className="bf-ok">{money(item.discount)}% off</span>
                  </>
                ) : null
              ) : item.saving_percent ? (
                <>
                  <span className="bf-ok">Save {item.saving_percent}%</span> vs
                  your pick
                </>
              ) : moreBy !== null ? (
                <>₹{moreBy.toFixed(2)} more per {unitWord(item.unit_label)}</>
              ) : null}
            </div>
          </div>

          {kind === "selected" ? (
            isInBag ? (
              <button type="button" className="bf-btn bf-btn--sm" onClick={onGoToBag}>
                GO TO BAG
              </button>
            ) : item.in_stock && item.price ? (
              <button type="button" className="bf-btn bf-btn--sm" onClick={onAdd}>
                ADD
              </button>
            ) : null
          ) : (
            <button
              type="button"
              className="bf-btn bf-btn--outline bf-btn--sm"
              onClick={() => router.push(`/medicines-details/${encodeId(item.id)}`)}
            >
              SWITCH
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

function EmptyTrusted() {
  return (
    <article className="bf-ccard is-empty">
      <div className="bf-ccard-media">
        <i className="bi bi-shield-check bf-muted" style={{ fontSize: 40 }} aria-hidden="true" />
        <span className="bf-chip bf-chip--muted">
          <i className="bi bi-patch-check-fill" aria-hidden="true" /> TnC Trusted
        </span>
      </div>
      <div className="bf-ccard-body">
        <h3 className="bf-ccard-name">No TnC Trusted equivalent in stock</h3>
        <p className="bf-ccard-line mb-2">
          We suggest a switch only when salt, strength, dose form and release
          type all match. Our pharmacist can help.
        </p>
        <Link className="bf-btn bf-btn--outline bf-btn--sm mt-auto" href="/contact-us">
          ASK A PHARMACIST
        </Link>
      </div>
    </article>
  );
}

export default function CompareBlock({
  compare,
  isInBag,
  onAdd,
  onGoToBag,
}: {
  compare: MedicineCompare | null;
  isInBag: boolean;
  onAdd: () => void;
  onGoToBag: () => void;
}) {
  if (!compare) return null;
  const { selected, tnc_trusted, cheapest, reason, match_basis } = compare;
  const basis = [match_basis.generic, match_basis.dose_form]
    .filter(Boolean)
    .join(" · ");

  const head = (
    <div className="bf-compare-head">
      <div>
        <h2>Compare before you buy</h2>
        <p>
          Only medicines with the same salt, strength, dose form and release
          type are shown{basis ? ` — ${basis}` : ""}
        </p>
      </div>
      <span className="bf-chip bf-chip--brand">
        <i className="bi bi-clock" aria-hidden="true" /> Prices compared per{" "}
        {unitWord(selected.unit_label)}
      </span>
    </div>
  );

  // State C: nothing to compare against.
  if (!tnc_trusted && !cheapest && !compare.selected_is_cheapest) {
    // The opened medicine is itself the TnC Trusted one and nothing else
    // matches: nothing useful to show.
    if (reason === null) return null;
    return (
      <section className="bf-card bf-compare" aria-label="Compare before you buy">
        {head}
        <div className="bf-note" style={{ marginTop: 0 }}>
          <i className="bi bi-shield-check" aria-hidden="true" />
          <div className="flex-grow-1">
            <strong className="d-block" style={{ fontSize: 14 }}>
              No exact equivalents available right now
            </strong>
            We compare only medicines with the same salt, strength, dose form
            and release type, so you never get a wrong substitute.
          </div>
          <Link className="bf-btn bf-btn--outline bf-btn--sm" href="/contact-us">
            Ask a pharmacist
          </Link>
        </div>
      </section>
    );
  }

  const selectedPrice = selected.unit_price ? Number(selected.unit_price) : null;
  const cardProps = { selectedPrice, isInBag, onAdd, onGoToBag };

  return (
    <section className="bf-card bf-compare" aria-label="Compare before you buy">
      {head}
      {compare.selected_is_cheapest && (
        <div className="bf-banner-ok">
          <i className="bi bi-check-circle-fill" aria-hidden="true" />
          Good choice — this is the lowest price per {unitWord(selected.unit_label)}{" "}
          for {match_basis.generic || "this medicine"} in stock.
        </div>
      )}
      <div className="bf-compare-grid">
        <CompareCard item={selected} kind="selected" {...cardProps} />
        {tnc_trusted ? (
          <CompareCard item={tnc_trusted} kind="trusted" {...cardProps} />
        ) : !compare.selected_is_tnc_trusted ? (
          <EmptyTrusted />
        ) : null}
        {cheapest && <CompareCard item={cheapest} kind="cheapest" {...cardProps} />}
      </div>
      <div className="bf-note">
        <i className="bi bi-headset" aria-hidden="true" />
        <span className="flex-grow-1">
          Same salt and strength means the same medicine, made by a different
          company. If you are unsure about switching, ask your doctor or our
          pharmacist.
        </span>
      </div>
    </section>
  );
}
