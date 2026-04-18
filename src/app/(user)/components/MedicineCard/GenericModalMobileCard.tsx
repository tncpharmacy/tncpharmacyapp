"use client";

import { formatPrice } from "@/lib/utils/formatPrice";

type Props = {
  image: string;
  name: string;
  manufacturer: string | null;
  price: number;
  mrp: number;
  discount: number;
  perUnit?: string | null;
  unit?: string | null;
  saving?: number;
  isCurrent?: boolean;

  onClick: () => void;
};

export default function GenericModalMobileCard({
  image,
  name,
  manufacturer,
  price,
  mrp,
  discount,
  perUnit,
  unit,
  saving,
  isCurrent,
  onClick,
}: Props) {
  return (
    <div
      className="border rounded p-2 mb-2 bg-white"
      onClick={onClick}
      style={{ cursor: "pointer" }}
    >
      <div className="d-flex gap-2 align-items-start">
        {/* IMAGE */}
        <img
          src={image}
          style={{
            width: 55,
            height: 55,
            objectFit: "contain",
          }}
        />

        {/* CONTENT */}
        <div className="flex-grow-1">
          {/* NAME */}
          <div
            className="fw-semibold text-start pd-title"
            style={{ fontSize: 13 }}
          >
            {name}
          </div>

          {/* COMPANY */}
          <div className="text-muted small text-start pd-title">
            {manufacturer}
          </div>

          {/* PRICE */}
          <div className="mt-1 text-start">
            <span className="fw-bold">₹{formatPrice(price)}</span>{" "}
            <span className="text-muted small text-decoration-line-through">
              ₹{formatPrice(mrp)}
            </span>{" "}
            <span className="text-danger small fw-semibold">
              {discount}% OFF
            </span>
          </div>

          {/* PER UNIT */}
          {perUnit && unit && (
            <div
              style={{ fontSize: 12, color: "#1976d2" }}
              className="text-start"
            >
              ₹{perUnit} per {unit}
            </div>
          )}

          {/* FOOTER */}
          <div className="mt-1">
            {/* SAVE BADGE */}
            {!isCurrent && saving && saving > 0 && (
              <div
                style={{
                  background: "#2e7d32",
                  color: " #fff",
                  fontSize: "12px",
                  padding: "6px",
                  borderRadius: "6px",
                  marginTop: "10px",
                }}
              >
                {saving}% lower than current
              </div>
            )}

            {/* ADD BUTTON */}
            {/* {!isCurrent && (
              <button
                style={{
                  background: "#ff7a00",
                  color: "#fff",
                  border: "none",
                  borderRadius: 20,
                  padding: "4px 10px",
                  fontSize: 12,
                }}
              >
                ADD
              </button>
            )} */}
          </div>

          {/* CURRENT BADGE */}
          {isCurrent && (
            <div
              style={{
                fontSize: 11,
                color: "#1976d2",
                marginTop: 4,
              }}
              className="text-start fw-semibold"
            >
              Currently viewing
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
