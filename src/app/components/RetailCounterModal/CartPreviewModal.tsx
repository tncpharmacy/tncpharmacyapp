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
}

const CartPreviewModal = ({
  show,
  onClose,
  cart,
  onGenerate,
  onRemove,
}: CartPreviewModalProps) => {
  if (!show) return null;

  const total = cart.reduce((acc, item) => {
    const subtotal =
      item.qty * item.price - (item.price * (item.Disc ?? 0)) / 100;
    return acc + subtotal;
  }, 0);

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

        <h4 className="mt-3">
          Total: <strong>₹{total}</strong>
        </h4>
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
