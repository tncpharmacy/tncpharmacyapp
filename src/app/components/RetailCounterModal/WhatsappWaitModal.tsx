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
    <Modal show={isOpen} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title className="text-success d-flex align-items-center">
          <FaWhatsapp size={24} className="me-2" />
          WhatsApp Integration – Coming Soon
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="text-center">
        <Alert variant="info" className="p-3">
          <h5 className="fw-semibold mb-3">Item Added to HealthBag!</h5>
          <p className="mb-3">
            The selected items have been successfully added to the patient’s
            HealthBag.
          </p>
          <p className="text-muted mb-0">
            We’re currently integrating <strong>WhatsApp communication</strong>{" "}
            to automatically share prescription and billing details directly
            with customers. Once this integration goes live, you’ll be able to
            continue the workflow seamlessly from here.
          </p>
        </Alert>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="success" onClick={onClose}>
          Got it, I’ll wait for integration
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default WhatsappWaitModal;
