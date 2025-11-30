// app/components/RetailCounterModal/HealthBagModal.tsx

import React from "react";
import { Modal, Button, Table } from "react-bootstrap";
import { FaTrash } from "react-icons/fa";

interface HealthBagModalProps {
  isOpen: boolean;
  onClose: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  cartItems: any[];
  onProceed: () => void;
  onRemove: (index: number) => void;
}

const HealthBagModal: React.FC<HealthBagModalProps> = ({
  isOpen,
  onClose,
  cartItems,
  onProceed,
  onRemove,
}) => {
  return (
    <Modal show={isOpen} onHide={onClose} size="xl">
      {" "}
      {/* Size ko bada (xl) kar diya hai taaki extra columns fit ho sakein */}
      <Modal.Header closeButton>
        <Modal.Title>
          🛒 Health Bag / Billing Cart ({cartItems.length} items)
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {cartItems.length === 0 ? (
          <p className="text-center">
            Your Health Bag is empty. Add medicines to proceed.
          </p>
        ) : (
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>Medicine Name</th>
                <th>Qty</th>
                {/* ✅ Naye Columns Add kiye */}
                <th>Doses</th>
                <th>Instruction</th>
                <th>Duration</th>
                {/* -------------------- */}
                <th>MRP/Unit</th>
                <th>Total Price</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {cartItems.map((item, index) => {
                // Safety check (jo humne pichhle step mein lagaya tha)
                const unitPrice = parseFloat(item.unitPrice) || 0;
                const totalPrice = parseFloat(item.price) || 0;

                return (
                  <tr key={item.cartItemId || index}>
                    <td>{item.medicine_name}</td>
                    <td>{item.qty}</td>

                    {/* ✅ Data Display kiye */}
                    <td>{item.dose_form || "N/A"}</td>
                    <td style={{ maxWidth: "200px", whiteSpace: "normal" }}>
                      {item.remarks || "N/A"}
                    </td>
                    <td style={{ maxWidth: "200px", whiteSpace: "normal" }}>
                      {item.duration || "N/A"}
                    </td>
                    {/* ----------------- */}

                    <td>₹{unitPrice.toFixed(2)}</td>
                    <td>₹{totalPrice.toFixed(2)}</td>
                    <td>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => onRemove(index)}
                      >
                        <FaTrash size={14} />
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
        <Button
          variant="primary"
          onClick={onProceed}
          disabled={cartItems.length === 0}
        >
          Add To Patient HealthBag
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default HealthBagModal;
