"use client";

type Props = {
  image: string;
  name: string;
  packSize: string;
  manufacturer: string;
  price: number; // ✅ FIX
  mrp: number; // ✅ FIX
  discount: number;
  qty: number;

  onIncrease: () => void;
  onDecrease: () => void;
  onRemove: () => void;
};

export default function HealthBagProductCard({
  image,
  name,
  packSize,
  manufacturer,
  price,
  mrp,
  discount,
  qty,
  onIncrease,
  onDecrease,
  onRemove,
}: Props) {
  return (
    <div className="border rounded p-3 mb-3 bg-white">
      <div className="d-flex gap-3 align-items-start">
        {/* IMAGE */}
        <img
          src={image}
          style={{
            width: 60,
            height: 60,
            objectFit: "contain",
          }}
        />

        {/* CONTENT */}
        <div className="flex-grow-1">
          {/* NAME */}
          <div
            className="fw-semibold"
            style={{ fontSize: 14, lineHeight: "18px" }}
          >
            {name}
          </div>

          {/* PACK SIZE */}
          <div className="text-success small">{packSize}</div>

          {/* COMPANY */}
          <div className="text-success small">{manufacturer}</div>

          {/* 🔥 MOBILE PRICE + QTY */}
          <div className="d-md-none mt-2 d-flex justify-content-between align-items-center">
            {/* PRICE */}
            <div>
              <div className="fw-bold" style={{ fontSize: 15 }}>
                ₹{price}
              </div>

              <div className="text-muted small text-decoration-line-through">
                ₹{mrp}
              </div>

              <div className="text-danger small fw-semibold">
                {discount}% OFF
              </div>
            </div>

            {/* QTY */}
            <div
              className="d-flex align-items-center border rounded-pill px-2 py-1"
              style={{ gap: 6 }}
            >
              <button
                onClick={onDecrease}
                className="border-0 bg-transparent fw-bold"
              >
                -
              </button>

              <span style={{ minWidth: 20, textAlign: "center" }}>{qty}</span>

              <button
                onClick={onIncrease}
                className="border-0 bg-transparent fw-bold"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* 🔥 DESKTOP */}
        <div className="d-none d-md-block text-end">
          <div className="fw-bold fs-6">₹{price}</div>

          <div className="text-muted small text-decoration-line-through">
            ₹{mrp}
          </div>

          <div className="text-danger small mb-2 fw-semibold">
            {discount}% OFF
          </div>

          <div className="d-flex align-items-center justify-content-end border rounded px-2 py-1">
            <button onClick={onDecrease} className="border-0 bg-transparent">
              -
            </button>

            <span className="mx-2">{qty}</span>

            <button onClick={onIncrease} className="border-0 bg-transparent">
              +
            </button>
          </div>

          <div
            className="text-danger mt-2"
            style={{ cursor: "pointer", fontSize: 12 }}
            onClick={onRemove}
          >
            Remove
          </div>
        </div>
      </div>
    </div>
  );
}
