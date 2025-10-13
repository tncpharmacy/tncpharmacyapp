// src/app/components/BuyerOtpModal.tsx
"use client";
import { useState } from "react";
import { Modal } from "react-bootstrap";
import { useRouter } from "next/navigation";
import "../../styles/style-login.css";

interface BuyerOtpModalProps {
  show: boolean;
  handleClose: () => void;
  onVerify?: (otp: string) => Promise<boolean>; // ✅ callback verify ke liye
  emailOrMobile?: string; // show purpose
}

export default function BuyerOtpModal({
  show,
  handleClose,
  onVerify,
  emailOrMobile,
}: BuyerOtpModalProps) {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleOtpSubmit = async () => {
    if (!otp) {
      setError("Please enter OTP");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const success = await onVerify?.(otp);

      if (success) {
        handleClose();
        router.push("/"); // ✅ redirect to home after verify success
      } else {
        setError("Invalid OTP, please try again");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={handleClose} centered className="loginmodal">
      <Modal.Body className="p-4 text-center">
        <h4 className="login_title mb-3">Verify OTP</h4>
        {emailOrMobile && (
          <p className="small-text text-muted mb-3">
            OTP sent to <b>{emailOrMobile}</b>
          </p>
        )}

        <input
          type="text"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          className="txtlogin"
          maxLength={6}
          placeholder="Enter 6-digit OTP"
        />

        <button
          onClick={handleOtpSubmit}
          className="btnlogin mt-3"
          disabled={loading}
        >
          {loading ? "Verifying..." : "Verify OTP"}
        </button>

        {error && <p style={{ color: "red" }}>{error}</p>}
      </Modal.Body>
    </Modal>
  );
}
