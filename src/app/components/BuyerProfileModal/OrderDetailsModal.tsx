import { formatAmount } from "@/lib/utils/formatAmount";
import { formatDateOnly } from "@/utils/dateFormatter";
import React from "react";
import { Modal, Button, Image } from "react-bootstrap";
import type { OrderDetail } from "@/types/buyer";
import TncLoader from "../TncLoader/TncLoader";

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

          <Modal.Body style={{ maxHeight: "70vh", overflowY: "auto" }}>
            {/* Patient Details */}
            <div className="mb-3 p-3 border rounded bg-light">
              <h5 className="fw-semibold mb-3 text-primary">Patient Details</h5>

              <div className="row">
                {/* Left Column */}
                <div className="col-6">
                  <p className="mb-2">
                    <strong>Name:</strong> {order.buyerName}
                  </p>
                  <p className="mb-2">
                    <strong>Mobile:</strong> {order.buyerNumber}
                  </p>
                </div>

                {/* Right Column */}
                <div className="col-6">
                  <p className="mb-2">
                    <strong>Email:</strong> {order.buyerEmail}
                  </p>

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
                  <div className="col-6">
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
                  <div className="col-6">
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
                <div className="col-6">
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
                    <strong>Amount:</strong> ₹
                    {formatAmount(Number(order.amount))}
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

            {/* Product List */}
            <h5 className="fw-semibold mb-3 text-primary">Products</h5>

            {order?.products?.length > 0 ? (
              order.products.map((p, index) => (
                <div
                  key={index}
                  className="d-flex border rounded p-3 mb-3 bg-white shadow-sm"
                >
                  <Image
                    src={
                      p.image
                        ? (() => {
                            // remove any domain
                            const cleaned = p.image.replace(
                              /^https?:\/\/[^/]+/i,
                              ""
                            );
                            // prevent double slash
                            const finalPath = cleaned.startsWith("/")
                              ? cleaned
                              : "/" + cleaned;
                            return mediaBase + finalPath;
                          })()
                        : "/images/tnc-default.png"
                    }
                    rounded
                    width={100}
                    height={100}
                    style={{ objectFit: "cover" }}
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
                        MRP: ₹{formatAmount(Number(p.mrp))}{" "}
                      </strong>
                      |{" "}
                      <strong className="text-success">
                        Discount: {p.discount}%
                      </strong>
                    </p>
                    <p className="mb-1 text-primary">
                      <strong>
                        Final Amount: ₹{formatAmount(Number(p.rate))}
                      </strong>
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
              ))
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
