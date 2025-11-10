"use client";
import React from "react";
import { Modal } from "react-bootstrap";

export default function PrescriptionStatusModal({
  show,
  onClose,
  mode,
}: {
  show: boolean;
  onClose: () => void;
  mode: "guest-upload" | "loggedin-upload" | "post-login-link";
}) {
  const content = {
    "guest-upload": {
      title: "✅ Prescription Uploaded",
      message:
        "Your prescription has been uploaded successfully. Please login to continue so we can process your request further.",
      button: "Continue to Login",
    },
    "loggedin-upload": {
      title: "✅ Prescription Uploaded",
      message:
        "Your prescription has been uploaded successfully and is now being processed.",
      button: "Continue",
    },
    "post-login-link": {
      title: "✅ Prescription Linked",
      message:
        "Your previously uploaded prescription is now linked to your account successfully.",
      button: "Continue",
    },
  };

  const { title, message, button } = content[mode];

  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Body className="text-center p-4">
        {/* ✅ Green Tick */}
        <div
          style={{
            width: "80px",
            height: "80px",
            borderRadius: "50%",
            backgroundColor: "#28a74522",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 15px",
          }}
        >
          <span style={{ fontSize: "45px", color: "#28a745" }}>✔</span>
        </div>

        <h4 className="fw-bold">{title}</h4>

        <p className="text-muted mt-2" style={{ fontSize: "15px" }}>
          {message}
        </p>

        <button onClick={onClose} className="btn btn-primary px-4 py-2 mt-3">
          {button}
        </button>
      </Modal.Body>
    </Modal>
  );
}
