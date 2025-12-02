import { formatAmount } from "@/lib/utils/formatAmount";
import { useState } from "react";
import { Modal, Table, Button } from "react-bootstrap";
import { FaTrash } from "react-icons/fa";

interface CartItem {
  medicine_name: string;
  qty: number;
  pack_size?: string | number; // ← FIX
  dose_form?: string;
  remarks?: string;
  duration?: string;
  price: number;
  Disc?: number;
}

interface CartPreviewModalProps {
  show: boolean;
  onClose: () => void;
  cart: CartItem[];
  onGenerate: () => void;
  onRemove: (index: number) => void;
  additionalDiscount: string;
  onDiscountChange: (v: string) => void;
}

const CartPreviewModal = ({
  show,
  onClose,
  cart,
  onGenerate,
  onRemove,
  onDiscountChange,
  additionalDiscount,
}: CartPreviewModalProps) => {
  //const [additionalDiscount, setAdditionalDiscount] = useState<string>("0");
  if (!show) return null;

  const total = cart.reduce((acc, item) => {
    const subtotal =
      item.qty * item.price - (item.price * (item.Disc ?? 0)) / 100;
    return acc + subtotal;
  }, 0);
  // Final after Additional Discount
  const finalAmount = total - (total * Number(additionalDiscount)) / 100;
  return (
    <Modal show={show} onHide={onClose} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>🛍️ Health Bag</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Table bordered hover>
          <thead className="table-light">
            <tr>
              <th>Medicine</th>
              <th>Qty</th>
              <th>Doses</th>
              <th>Instruction</th>
              <th>Duration</th>
              <th>MRP</th>
              <th>Discount (%)</th>
              <th>Subtotal</th>
              <th>Remove</th>
            </tr>
          </thead>

          <tbody>
            {cart.map((item, idx) => {
              const subtotal =
                item.qty * item.price - (item.price * (item.Disc ?? 0)) / 100;

              return (
                <tr key={idx}>
                  <td>{item.medicine_name}</td>
                  <td>
                    {item.pack_size
                      ? `${item.pack_size} × ${item.qty}`
                      : item.qty}
                  </td>
                  <td>{item.dose_form}</td>
                  <td>{item.remarks}</td>
                  <td>{item.duration}</td>
                  <td>{item.price}</td>
                  <td>{item.Disc ?? 0}</td>
                  <td>{subtotal}</td>
                  <td>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => onRemove(idx)}
                    >
                      <FaTrash size={14} />
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
        <div className="d-flex justify-content-end">
          <div
            className="p-3 border rounded shadow-sm"
            style={{
              width: "300px",
              background: "#F8FBFF",
              marginTop: "-10px",
              textAlign: "left", // ⬅⬅ Box ke andar ka text LEFT align
            }}
          >
            <h6
              className="fw-bold mb-2"
              style={{ color: "red", whiteSpace: "nowrap" }}
            >
              Total: ₹{formatAmount(total)}
            </h6>

            <div className="mb-2">
              <div
                className="d-flex align-items-center mb-2"
                style={{ gap: "8px" }}
              >
                <span
                  className="fw-semibold"
                  style={{ color: "green", whiteSpace: "nowrap" }}
                >
                  Additional Discount:
                </span>

                <input
                  type="text"
                  className="form-control"
                  style={{ width: "60px" }}
                  maxLength={2}
                  value={String(additionalDiscount)}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (/^\d{0,2}$/.test(val)) {
                      // local update — yeh tumhara rakhna zaroori hai
                      onDiscountChange(val); // parent ko bhej diya
                    }
                  }}
                />

                <span className="fw-bold">(%)</span>
              </div>
            </div>

            <h5 className="fw-bold text-primary mb-3">
              Grand Total: ₹{formatAmount(finalAmount)}
            </h5>
          </div>
        </div>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>

        <Button variant="primary" onClick={onGenerate}>
          Generate Bill
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default CartPreviewModal;
