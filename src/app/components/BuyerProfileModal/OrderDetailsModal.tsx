// components/OrderDetailsModal.tsx
"use client";
import React from "react";
import { Modal, Button } from "react-bootstrap";

export interface OrderDetails {
  orderId: string;
  status: string;
  totalAmount: number;
  address: string;
  products: {
    name: string;
    qty: number;
    price: number;
  }[];
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
        <div className="mb-3">
          <h6>
            Status: <span className="text-primary">{order.status}</span>
          </h6>
          <p>
            <strong>Total:</strong> ₹{order.totalAmount}
          </p>
        </div>

        <hr />
        <h6>Product Details:</h6>
        <ul className="list-group mb-3">
          {order.products.map((p, i) => (
            <li
              key={i}
              className="list-group-item d-flex justify-content-between"
            >
              <div>
                <strong>{p.name}</strong> <br />
                Qty: {p.qty}
              </div>
              <span>₹{p.price}</span>
            </li>
          ))}
        </ul>

        <hr />
        <h6>Delivery Address:</h6>
        <p className="mb-0">{order.address}</p>
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
