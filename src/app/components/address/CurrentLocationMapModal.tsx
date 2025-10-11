"use client";
import React, { useEffect, useState } from "react";
import { Modal, Button, Spinner } from "react-bootstrap";

import { LocationDetails } from "@/types/address";

interface CurrentLocationMapModalProps {
  show: boolean;
  onClose: () => void;
  onConfirm: (location: LocationDetails) => void; // ✅ fixed type
}

const CurrentLocationMapModal: React.FC<CurrentLocationMapModalProps> = ({
  show,
  onClose,
  onConfirm,
}) => {
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    null
  );

  useEffect(() => {
    if (show) {
      navigator.geolocation.getCurrentPosition(
        (pos) =>
          setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => alert("Unable to fetch location: " + err.message)
      );
    }
  }, [show]);

  return (
    <Modal show={show} onHide={onClose} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Confirm Delivery Area</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {!coords ? (
          <div className="text-center py-4">
            <Spinner animation="border" /> <p>Detecting location...</p>
          </div>
        ) : (
          <>
            <div className="position-relative mb-3">
              <iframe
                src={`https://maps.google.com/maps?q=${coords.lat},${coords.lng}&z=15&output=embed`}
                width="100%"
                height="400"
                style={{ borderRadius: "12px" }}
              ></iframe>
              <div
                className="position-absolute top-50 start-50 translate-middle bg-danger rounded-circle"
                style={{ width: "12px", height: "12px" }}
              ></div>
            </div>
            <p className="fw-semibold text-center">
              Your order will be delivered here
            </p>
          </>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button
          variant="primary"
          className="w-100 fw-semibold"
          onClick={() =>
            onConfirm({
              lat: coords?.lat,
              lng: coords?.lng,
              city: "Faizabad",
              state: "Uttar Pradesh",
              country: "India",
              pincode: "224001",
            })
          }
        >
          Confirm location and continue
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default CurrentLocationMapModal;
