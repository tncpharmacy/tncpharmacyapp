import { Modal, Button } from "react-bootstrap";

type Props = {
  show: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  loading?: boolean;
};

export default function StatusConfirmModal({
  show,
  onClose,
  onConfirm,
  title = "Confirm",
  message = "Are you sure?",
  loading = false,
}: Props) {
  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <p className="mb-0">{message}</p>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>

        <Button variant="primary" onClick={onConfirm} disabled={loading}>
          {loading ? "Please wait..." : "Yes, Confirm"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
