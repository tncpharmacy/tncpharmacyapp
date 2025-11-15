// components/OrderDetailsModal.tsx
"use client";
import React from "react";
import { Modal, Button } from "react-bootstrap";

export interface ProductDetail {
  id: number;
  productName?: string;
  quantity: string;
  mrp: string;
  discount: string;
  rate: string;
  doses?: string;
  instruction?: string;
  status: string;
  manufacturer?: string;
}

export interface AddressDetail {
  name: string;
  address: string;
  location: string;
  pincode: string;
  mobile: string;
}

export interface OrderDetails {
  orderId: string | number;
  status: string;
  totalAmount: number | string;
  address: AddressDetail;
  products: ProductDetail[];
}

interface OrderDetailsModalProps {
  show: boolean;
  onClose: () => void;
  order: OrderDetails | null;
}

const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({
  show,
  onClose,
  order,
}) => {
  if (!order) return null;

  return (
    <Modal show={show} onHide={onClose} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>Order Details — #{order.orderId}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {/* Order Info */}
        <div className="mb-3">
          <h6>
            Status: <span className="text-primary">{order.status}</span>
          </h6>
          <p>
            <strong>Total:</strong> ₹{order.totalAmount}
          </p>
        </div>

        <hr />

        {/* Product Details */}
        <h6>Product Details:</h6>
        {order.products?.length > 0 ? (
          <ul className="list-group mb-3">
            {order.products.map((p, i) => (
              <li
                key={i}
                className="list-group-item d-flex justify-content-between flex-column flex-md-row"
              >
                <div>
                  <strong>{p.productName}</strong> <br />
                  Qty: {p.quantity} | MRP: ₹{p.mrp} | Rate: ₹{p.rate} <br />
                  Discount: {p.discount} | Status: {p.status} <br />
                  {p.doses && (
                    <>
                      Doses: {p.doses} <br />
                    </>
                  )}
                  {p.instruction && (
                    <>
                      Instruction: {p.instruction} <br />
                    </>
                  )}
                  {p.manufacturer && <>Manufacturer: {p.manufacturer}</>}
                </div>
                <span className="mt-2 mt-md-0">₹{p.rate}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p>No products found.</p>
        )}

        <hr />

        {/* Address Details */}
        <h6>Delivery Address:</h6>
        {order.address ? (
          <div>
            <p className="mb-0">{order.address.name}</p>
            <p className="mb-0">{order.address.address}</p>
            <p className="mb-0">
              {order.address.location} - {order.address.pincode}
            </p>
            <p className="mb-0">Mobile: {order.address.mobile}</p>
          </div>
        ) : (
          <p>No address found.</p>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default OrderDetailsModal;
