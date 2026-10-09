import Image from "next/image";
import type { KeyboardEvent, MouseEvent } from "react";
// The two shared sheets were imported here before; some pages rely on that.
import "../../css/medicine.css";
import "../../css/user-style.css";
import "./product-card.css";

/**
 * Storefront product / medicine card (Figma "store/Product card v2").
 *
 * Every listing grid renders this one component, on desktop and mobile:
 * home sections, search, all-medicine, category, manufacturer, generic and
 * group-care pages. It only draws; the page owns the data and the bag
 * handlers, so the add/remove logic stays where it already was.
 *
 * Price rules (same as order/pricing.py on the backend):
 *   price = MRP − MRP × discount / 100
 * The offer % appears once, next to the struck MRP. A product without a
 * price is not for sale, so it shows "Price unavailable" and no ADD button.
 */

const PLACEHOLDER = "/images/tnc-default.png";

type Props = {
  image: string;
  name: string;
  manufacturer?: string;
  packSize?: string;
  /** kept for older callers; the card no longer prints the salt line */
  salt?: string;
  /** selling price, already formatted (e.g. "137.5") */
  price: string;
  /** MRP, already formatted */
  mrp?: string;
  /** discount % on MRP */
  discount?: number;
  showRx?: boolean;
  isInCart?: boolean;
  /** undefined = unknown (treated as available); false = out of stock */
  inStock?: boolean;
  loading?: boolean;
  onAdd?: () => void;
  onRemove?: () => void;
  onClick?: () => void;
};

const formatPercent = (value: number) =>
  Number.isInteger(value) ? String(value) : value.toFixed(1);

export default function ProductCardUI({
  image,
  name,
  manufacturer,
  packSize,
  price,
  mrp,
  discount,
  showRx,
  isInCart,
  inStock,
  loading,
  onAdd,
  onRemove,
  onClick,
}: Props) {
  const outOfStock = inStock === false;
  const priceValue = Number(price);
  const hasPrice = Number.isFinite(priceValue) && priceValue > 0;
  const offPercent = Number(discount) || 0;
  const showOffer = hasPrice && offPercent > 0 && !!mrp && Number(mrp) > 0;

  const src = image || PLACEHOLDER;
  const isPlaceholder = src === PLACEHOLDER;

  // A product that cannot be bought shows no ADD (the "Out of stock" badge
  // or "Price unavailable" says why), but an item that is already in the
  // bag always gets its remove control.
  const canAdd = hasPrice && !outOfStock;

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onClick?.();
    }
  };

  // The whole card opens the detail page; the bag controls must not.
  const stop = (e: MouseEvent<HTMLElement>) => e.stopPropagation();

  const handleAdd = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (canAdd) onAdd?.();
  };

  const handleRemove = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    onRemove?.();
  };

  const spinner = (
    <span
      className="spinner-border spinner-border-sm"
      role="status"
      aria-label="Updating bag"
    />
  );

  return (
    <div
      className="pc-card"
      role="link"
      tabIndex={0}
      aria-label={name}
      onClick={onClick}
      onKeyDown={handleKeyDown}
    >
      <div className="pc-media">
        <Image
          src={src}
          alt={name}
          width={160}
          height={126}
          sizes="200px"
          loading="lazy"
          className={isPlaceholder ? "is-placeholder" : undefined}
        />
        {outOfStock && <span className="pc-oos">Out of stock</span>}
      </div>

      {showRx && (
        <div className="pc-rx">
          <b>Rx</b>
          <span>Prescription required</span>
        </div>
      )}

      <div className="pc-body">
        <h3 className="pc-name" title={name}>
          {name}
        </h3>
        {(packSize || manufacturer) && (
          <p className="pc-sub">{packSize || manufacturer}</p>
        )}

        <div className="pc-foot">
          <div className="pc-price">
            {hasPrice ? (
              <>
                <span className="pc-now">₹{price}</span>
                {showOffer && (
                  <span className="pc-was">
                    <del>MRP ₹{mrp}</del>
                    <span className="pc-off">
                      {formatPercent(offPercent)}% off
                    </span>
                  </span>
                )}
              </>
            ) : (
              <span className="pc-na">Price unavailable</span>
            )}
          </div>

          {isInCart ? (
            <div
              className="pc-inbag"
              role="group"
              aria-label="In your bag"
              onClick={stop}
            >
              <span className="pc-inbag-label">
                <i className="bi bi-check2-circle" aria-hidden="true" />
                Added to bag
              </span>
              <button
                type="button"
                className="pc-inbag-remove"
                onClick={handleRemove}
                disabled={loading}
                aria-busy={loading || undefined}
                aria-label={`Remove ${name} from bag`}
                title="Remove from bag"
              >
                {loading ? (
                  spinner
                ) : (
                  <i className="bi bi-trash3" aria-hidden="true" />
                )}
              </button>
            </div>
          ) : (
            canAdd && (
              <button
                type="button"
                className="pc-btn"
                onClick={handleAdd}
                disabled={loading}
                aria-busy={loading || undefined}
              >
                {loading ? spinner : "ADD"}
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
}

/** Placeholder with the same footprint, shown while a grid is loading. */
export function ProductCardSkeleton() {
  return (
    <div className="pc-card pc-skeleton" aria-hidden="true">
      <div className="pc-media" />
      <div className="pc-body">
        <div className="pc-line" style={{ width: "85%" }} />
        <div className="pc-line" style={{ width: "55%" }} />
        <div className="pc-foot">
          <div className="pc-line" style={{ width: 70, height: 20 }} />
          <div className="pc-line" style={{ width: 58, height: 32 }} />
        </div>
      </div>
    </div>
  );
}
