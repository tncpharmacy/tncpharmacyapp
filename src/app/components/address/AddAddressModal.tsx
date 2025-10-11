"use client";
import React from "react";
import { Modal, Button } from "react-bootstrap";
import Image from "next/image";

interface AddAddressModalProps {
  show: boolean;
  onClose: () => void;
  onSelectOption: (option: "current" | "manual") => void;
}

const AddAddressModal: React.FC<AddAddressModalProps> = ({
  show,
  onClose,
  onSelectOption,
}) => {
  return (
    <Modal show={show} onHide={onClose} centered>
      <div className="p-4 text-center">
        <Image
          src="/images/location.png"
          alt="Delivery Illustration"
          width={200}
          height={200}
          className="mb-3"
        />
        <Button
          variant="primary"
          className="w-100 mb-2 fw-semibold"
          onClick={() => onSelectOption("current")}
        >
          Use my current location
        </Button>
        <Button
          variant="outline-primary"
          className="w-100 fw-semibold"
          onClick={() => onSelectOption("manual")}
        >
          Enter location manually
        </Button>
      </div>
    </Modal>
  );
};

export default AddAddressModal;
