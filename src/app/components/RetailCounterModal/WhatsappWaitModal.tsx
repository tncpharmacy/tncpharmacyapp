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
        <Modal.Title className="text-primary">
          <FaWhatsapp size={24} className="me-2" /> Workflow Integration Status
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="text-center">
        <Alert variant="info" className="p-3">
          <h4 className="alert-heading mb-3">
            Professional Implementation Pending!
          </h4>
          <p>
            The feature to send the {"patient's"} cart details to their
            HealthBag requires **direct WhatsApp Integration** to instantly
            share the prescription summary and billing information with the
            customer.
          </p>
          <hr />
          <p className="mb-0 fw-bold">
            We are currently finalizing the robust WhatsApp API integration.
            Please wait for this integration to be completed to proceed with the
            final step of saving the cart.
          </p>
        </Alert>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          **Close and Await Integration**
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default WhatsappWaitModal;
