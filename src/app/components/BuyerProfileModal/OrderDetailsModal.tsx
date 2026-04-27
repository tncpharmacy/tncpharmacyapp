import { formatDateOnly } from "@/utils/dateFormatter";
import React from "react";
import { Modal, Button, Image } from "react-bootstrap";
import type { OrderDetail } from "@/types/buyer";
import TncLoader from "../TncLoader/TncLoader";
import { formatPrice } from "@/lib/utils/formatPrice";
import { useRouter } from "next/navigation";
import { encodeId } from "@/lib/utils/encodeDecode";

const mediaBase = process.env.NEXT_PUBLIC_MEDIA_BASE_URL;

export default function OrderDetailsModal({
  show,
  onClose,
  order,
}: {
  show: boolean;
  onClose: () => void;
  order: OrderDetail | null;
}) {
  const router = useRouter();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleClick = (p: any) => {
    const actualId = p.product_id;

    const path =
      p.category_id === 1
        ? `/medicines-details/${encodeId(actualId)}`
        : `/product-details/${encodeId(actualId)}`;

    router.push(path);
  };

  // 🧮 total items price (without delivery)
  const itemsTotal =
    order?.products?.reduce(
      (acc, p) => acc + Number(p.rate || 0) * Number(p.quantity || 1),
      0
    ) || 0;

  // 🚚 check delivery applied or not
  const DELIVERY_FEE = 40;

  const orderAmount = Number(order?.amount || 0);

  const isDeliveryApplied =
    Math.abs(orderAmount - itemsTotal - DELIVERY_FEE) < 1;

  const prescriptionUrl = order?.prescription_url;
  const getFileType = (url?: string) => {
    if (!url) return "";
    return url.split(".").pop()?.toLowerCase() || "";
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case "pdf":
        return "/images/pdf-icon.png";

      case "jpg":
      case "jpeg":
        return "/images/jpg-icon.png";

      case "png":
        return "/images/png-icon.png";

      default:
        return "";
    }
  };
  return (
    <Modal show={show} onHide={onClose} size="lg" centered>
      {/* 🔥 LOADER */}
      {!order ? (
        <div
          className="position-absolute top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
          style={{
            background: "rgba(255, 255, 255, 0.65)",
            backdropFilter: "blur(2px)",
            zIndex: 20,
          }}
        >
          <div className="text-center">
            <TncLoader />
          </div>
        </div>
      ) : (
        <>
          <Modal.Header closeButton>
            <Modal.Title className="fw-bold text-primary">
              Order Details (#{order.orderId})
            </Modal.Title>
          </Modal.Header>

          <Modal.Body style={{ maxHeight: "100%", overflowY: "auto" }}>
            {/* Patient Details */}
            <div className="mb-3 p-3 border rounded bg-light">
              <h5 className="fw-semibold mb-3 text-primary">Patient Details</h5>

              <div className="row">
                {/* Left Column */}
                <div className="col-12 col-md-6">
                  {order.buyerNumber && (
                    <p className="mb-2">
                      <strong>Name:</strong> {order.buyerName}
                    </p>
                  )}
                  {order.buyerNumber && (
                    <p className="mb-2">
                      <strong>Mobile:</strong> {order.buyerNumber}
                    </p>
                  )}
                </div>

                {/* Right Column */}
                <div className="col-12 col-md-6">
                  {order.buyerEmail && (
                    <p className="mb-2">
                      <strong>Email:</strong> {order.buyerEmail}
                    </p>
                  )}

                  {order.buyer_uhid && (
                    <p className="mb-2">
                      <strong>UHID:</strong> {order.buyer_uhid}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Address Details */}
            {order.recipient_name && (
              <div className="mb-3 p-3 border rounded bg-white">
                <h5 className="fw-semibold mb-3 text-primary">
                  Address Details
                </h5>

                <div className="row">
                  {/* Left Column */}
                  <div className="col-12 col-md-6">
                    {order.recipient_name && (
                      <p className="mb-2">
                        <strong>Recipient Name:</strong> {order.recipient_name}
                      </p>
                    )}
                    {order.recipient_mobile && (
                      <p className="mb-2">
                        <strong>Recipient Mobile:</strong>{" "}
                        {order.recipient_mobile}
                      </p>
                    )}
                  </div>

                  {/* Right Column */}
                  <div className="col-12 col-md-6">
                    {order.address && (
                      <p className="mb-2">
                        <strong>Address:</strong> {order.address}
                      </p>
                    )}
                    {order.location && (
                      <p className="mb-2">
                        <strong>Location:</strong> {order.location}
                      </p>
                    )}
                    {order.pincode && (
                      <p className="mb-2">
                        <strong>Pincode:</strong> {order.pincode}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Order Summary */}
            <div className="mb-3 p-3 border rounded bg-white">
              <h5 className="fw-semibold mb-3 text-primary">Order Summary</h5>

              <div className="row">
                {/* Left */}
                <div className="col-12 col-md-6">
                  <p className="mb-2">
                    <strong>Order Number:</strong> #{order.orderId}
                  </p>

                  <p className="mb-2">
                    <strong>Order Date:</strong>{" "}
                    {formatDateOnly(order.orderDate)}
                  </p>

                  {order.additional_discount && (
                    <p className="mb-2 text-success">
                      <strong>Additional Discount:</strong>{" "}
                      {order.additional_discount}%
                    </p>
                  )}
                  <p className="mb-2 text-danger">
                    <strong>Total Price:</strong> ₹{formatPrice(itemsTotal)}
                  </p>
                  <p className="mb-2 fw-semibold text-success">
                    <strong>Delivery Fee:</strong>{" "}
                    {isDeliveryApplied ? (
                      <span className="text-success">₹40</span>
                    ) : (
                      <>
                        <span className="text-success fw-bold">🎉 FREE</span>{" "}
                        <span className="text-muted text-decoration-line-through ms-1">
                          ₹40
                        </span>
                      </>
                    )}
                  </p>
                  <p className="mb-2 text-danger">
                    <strong>Final Amount:</strong> ₹{formatPrice(order.amount)}
                  </p>
                </div>

                {/* Right */}
                <div className="col-6">
                  <p className="mb-2 text-success">
                    <strong>Payment Status:</strong>{" "}
                    <span
                      className={
                        order.paymentStatus === "Buy"
                          ? "text-success"
                          : "text-warning"
                      }
                    >
                      {order.paymentStatus}
                    </span>
                  </p>

                  <p className="mb-2 text-success">
                    <strong>Payment Mode:</strong> {order.paymentMode}
                  </p>

                  <p className="mb-2 text-success">
                    <strong>Order Type:</strong> {order.orderType}
                  </p>
                </div>
              </div>
            </div>

            {/* Prescription Section */}
            {order?.prescription_url &&
              (() => {
                const url = order.prescription_url;
                const type = getFileType(url);

                return (
                  <div className="mb-3 p-3 border rounded bg-white">
                    <h5 className="fw-semibold mb-3 text-primary">
                      Prescription
                    </h5>

                    <div
                      className="d-flex align-items-center gap-3"
                      style={{ cursor: "pointer" }}
                      onClick={() => window.open(url, "_blank")}
                    >
                      {/* ICON */}
                      <img
                        src={getFileIcon(type)}
                        alt={type}
                        width={40}
                        height={40}
                      />

                      {/* TEXT */}
                      <span className="fw-semibold text-primary">
                        {type ? type.toUpperCase() : "FILE"} - View Prescription
                      </span>
                    </div>
                  </div>
                );
              })()}

            {/* Product List */}
            <h5 className="fw-semibold mb-3 text-primary">Items</h5>

            {order?.products?.length > 0 ? (
              order.products.map((p, index) => {
                const imageUrl = p.image
                  ? (() => {
                      let cleaned = p.image.replace(/^https?:\/\/[^/]+/i, "");
                      cleaned = cleaned.replace(/^\/+/, "");

                      const base = (mediaBase || "").replace(/\/+$/, "");

                      return `${base}/${cleaned}`;
                    })()
                  : "/images/tnc-default.png";

                const isDefaultImage = !p.image;

                return (
                  <div
                    key={index}
                    className="d-flex border rounded p-3 mb-3 bg-white shadow-sm"
                    onClick={() => handleClick(p)}
                    style={{ cursor: "pointer" }}
                  >
                    <Image
                      src={imageUrl}
                      rounded
                      width={100}
                      height={100}
                      style={{
                        objectFit: "cover",
                        opacity: isDefaultImage ? 0.3 : 1, // ✅ working
                      }}
                      className="me-3 border"
                      alt={p.medicine_name}
                    />

                    <div style={{ flex: 1 }}>
                      <h6 className="fw-bold mb-1">
                        {p.medicine_name} || {p.pack_size}
                      </h6>
                      <p className="text-success small fw-semibold mb-1">
                        {p.manufacturer}
                      </p>

                      <p className="mb-1">
                        <strong>Qty:</strong> {p.quantity}
                      </p>
                      <p className="mb-1">
                        <strong className="text-danger">
                          MRP: ₹{formatPrice(Number(p.mrp))}{" "}
                        </strong>
                        |{" "}
                        <strong className="text-success">
                          Discount: {p.discount}%
                        </strong>
                      </p>
                      <p className="mb-1 text-primary">
                        <strong>Price: ₹{formatPrice(Number(p.rate))}</strong>
                      </p>
                      {p.doses && (
                        <p className="mb-1">
                          <strong>Doses:</strong> {p.doses}
                        </p>
                      )}
                      {p.remark && (
                        <p className="mb-1">
                          <strong>Instruction:</strong>
                          {p.remark && <span className="ms-2">{p.remark}</span>}
                        </p>
                      )}
                      {p.duration && (
                        <p className="mb-1">
                          <strong>Duration:</strong> {p.duration}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <p>No products found.</p>
            )}
          </Modal.Body>

          <Modal.Footer>
            <Button variant="secondary" onClick={onClose}>
              Close
            </Button>
          </Modal.Footer>
        </>
      )}
    </Modal>
  );
}
