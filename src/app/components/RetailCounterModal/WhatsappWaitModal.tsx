// app/components/RetailCounterModal/WhatsappWaitModal.tsx

import React from "react";
import { Modal, Button, Alert } from "react-bootstrap";
import { FaWhatsapp } from "react-icons/fa";

interface WhatsappWaitModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const WhatsappWaitModal: React.FC<WhatsappWaitModalProps> = ({
  isOpen,
  onClose,
}) => {
  return (
    <Modal show={isOpen} onHide={onClose} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title className="text-success d-flex align-items-center">
          <FaWhatsapp size={24} className="me-2" />
          WhatsApp Notification Sent
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="text-center">
        <Alert variant="success" className="p-3">
          <h5 className="fw-semibold mb-3">
            HealthBag Link Shared Successfully!
          </h5>

          <p className="mb-3">
            A secure HealthBag link has been sent to the patient’s WhatsApp
            number.
          </p>

          <p className="text-muted mb-0">
            The patient can open the link directly from WhatsApp to view their
            prescription details, added items, and complete their order from the
            HealthBag page.
          </p>
        </Alert>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="success" onClick={onClose}>
          Okay, Got It
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default WhatsappWaitModal;
