import { Image } from "react-bootstrap";
import "../../css/medicine.css";
import "../../css/user-style.css";

type Props = {
  image: string;
  name: string;
  manufacturer?: string;
  packSize?: string;
  salt?: string;
  price: string;
  mrp?: string;
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

export default function ProductCardUI({
  image,
  name,
  manufacturer,
  packSize,
  salt,
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
  return (
    <div className="medicine-card mb-3">
      <div className="medicine-content">
        {/* TOP */}
        <div className="medicine-top" onClick={onClick}>
          <div className="medicine-imgs">
            <Image
              src={image}
              width={70}
              height={60}
              alt={name}
              style={{
                opacity: image === "/images/tnc-default.png" ? 0.3 : 1,
              }}
            />
          </div>

          <div className="medicine-details">
            <div className="medicine-header">
              <h3 className="medicine-name pd-title  hover-link fw-bold">
                {name}
              </h3>

              {showRx && (
                <Image
                  src="/images/RX-small.png"
                  height={25}
                  width={30}
                  alt="Rx"
                />
              )}
            </div>

            {packSize && <p className="medicine-text pd-title">{packSize}</p>}
            {manufacturer && (
              <p className="medicine-text pd-title">{manufacturer}</p>
            )}
            {salt && <p className="medicine-salt pd-title">{salt}</p>}
          </div>
        </div>

        {/* BOTTOM */}
        <div className="medicine-bottom">
          <div onClick={onClick}>
            {discount ? (
              <>
                <p className="text-success fw-bold mb-1">₹{price}</p>
                <p className="text-muted">
                  <span
                    className="medicine-mrp text-muted mb-0 fw-bold"
                    style={{
                      textDecoration: "line-through",
                      fontSize: "13px",
                    }}
                  >
                    MRP ₹{mrp}
                  </span>{" "}
                  <span className="text-danger fw-bold">({discount}% OFF)</span>
                </p>
              </>
            ) : (
              <p className="text-success fw-bold">₹{price}</p>
            )}
          </div>

          <div>
            <button
              className="btn-1 btn-HO"
              style={{
                backgroundColor: isInCart
                  ? "#0b5ed7"
                  : outOfStock
                  ? "#adb5bd"
                  : "#ff7b00",
                color: "#fff",
                cursor: outOfStock && !isInCart ? "not-allowed" : "pointer",
              }}
              onClick={isInCart ? onRemove : onAdd}
              disabled={loading || (outOfStock && !isInCart)}
              aria-disabled={outOfStock && !isInCart}
              title={outOfStock && !isInCart ? "Currently out of stock" : undefined}
            >
              {loading
                ? "Processing..."
                : isInCart
                ? "REMOVE"
                : outOfStock
                ? "OUT OF STOCK"
                : "ADD"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
