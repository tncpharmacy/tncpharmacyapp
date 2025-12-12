"use client";

import { useState, useEffect, useRef } from "react";
import { Image, Modal } from "react-bootstrap";
import { useRouter, usePathname } from "next/navigation";
import BuyerSignupModal from "@/app/buyer-signup/page";
import {
  buyerLogin,
  verifyBuyerOtp,
  resetBuyerState,
} from "@/lib/features/buyerSlice/buyerSlice";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import "../styles/style-login.css";
import toast from "react-hot-toast";
import { linkBuyerThunk } from "@/lib/features/prescriptionSlice/prescriptionSlice";
import { store } from "@/lib/store";
import PrescriptionStatusModal from "@/app/components/PrescriptionStatusModal/PrescriptionStatusModal";

export default function BuyerLoginModal({
  show,
  handleClose,
}: {
  show: boolean;
  handleClose: () => void;
}) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const [step, setStep] = useState<1 | 2>(1);
  const [loginId, setLoginId] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [showSignup, setShowSignup] = useState(false);

  // Prescription modal state
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [modalMode, setModalMode] = useState<
    "guest-upload" | "loggedin-upload" | "post-login-link"
  >("guest-upload");

  const [prefillEmail, setPrefillEmail] = useState("");
  const [prefillMobile, setPrefillMobile] = useState("");

  const { loading, otpCode } = useAppSelector((state) => state.buyer);

  const loginInputRef = useRef<HTMLInputElement>(null);
  const otpInputRef = useRef<HTMLInputElement>(null);

  // Focus input on modal open
  useEffect(() => {
    if (!show) return;
    if (step === 1 && loginInputRef.current) loginInputRef.current.focus();
    else if (step === 2 && otpInputRef.current)
      setTimeout(() => otpInputRef.current?.focus(), 100);
  }, [show, step]);

  // Step 1: Login
  const handleLoginCheck = async () => {
    if (!loginId.trim()) {
      setError("Please enter email or mobile number");
      return;
    }
    const mobileRegex = /^\d{10}$/;
    if (!mobileRegex.test(loginId)) {
      toast.error("Please enter a valid 10-digit Mobile Number.");
      return;
    }
    setError("");

    try {
      const result = await dispatch(buyerLogin({ login_id: loginId })).unwrap();
      if (result.data?.existing) {
        toast.success("OTP sent successfully!");
        setStep(2);
      } else {
        handleClose();
        if (/^\d{10}$/.test(loginId)) {
          setPrefillMobile(loginId);
          setPrefillEmail("");
        } else {
          setPrefillEmail(loginId);
          setPrefillMobile("");
        }
        setShowSignup(true);
      }
    } catch (err: unknown) {
      if (typeof err === "string") setError(err);
      else if (err instanceof Error) setError(err.message);
      else setError("Something went wrong during login check");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleLoginCheck();
  };

  // Step 2: OTP verification + post-login prescription linking
  const handleOtpSubmit = async () => {
    if (!otp.trim()) {
      setError("Please enter OTP");
      return;
    }
    setError("");

    try {
      const res = await dispatch(verifyBuyerOtp({ otp })).unwrap();
      //toast.success(res.message || "Login successful!");

      // ✅ Auto link prescription if guest session exists
      const sessionId = localStorage.getItem("PRESCRIPTION_SESSION");
      const buyerState = store.getState().buyer.buyer;
      const buyerId = buyerState?.id;
      const token = localStorage.getItem("buyerAccessToken");

      if (sessionId && buyerId && token) {
        await dispatch(linkBuyerThunk({ sessionId, buyerId, token })).unwrap();

        setModalMode("post-login-link");
        // ✅ Open Prescription modal AFTER login
        setShowStatusModal(true);

        // Clear LS
        localStorage.removeItem("PRESCRIPTION_SESSION");
        localStorage.removeItem("PRESCRIPTION_ID");
      }

      handleClose();
      resetForm();

      // Redirect after login
      const redirectPath = localStorage.getItem("redirectAfterLogin") || "/";
      localStorage.removeItem("redirectAfterLogin");
      router.push(redirectPath);
    } catch (err: unknown) {
      if (typeof err === "string") setError(err);
      else if (err instanceof Error) setError(err.message);
      else setError("Invalid OTP. Please try again.");
    }
  };

  const handleKeyDownOtp = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleOtpSubmit();
  };

  const resetForm = () => {
    setStep(1);
    setLoginId("");
    setOtp("");
    setError("");
    dispatch(resetBuyerState());
  };

  useEffect(() => {
    if (show) localStorage.setItem("redirectAfterLogin", pathname);
  }, [show, pathname]);

  return (
    <>
      <Modal
        size="lg"
        show={show}
        onHide={handleClose}
        centered
        className="loginmodal"
      >
        <Modal.Body className="p-0">
          <div className="row">
            <div className="col-md-5 pe-0 d-none d-md-block">
              <Image
                src="../images/login-banner.gif"
                className="w-100"
                alt="Patient Login Banner"
              />
            </div>
            <div className="col-md-7 ps-md-0 d-flex align-items-center">
              <div className="login_form">
                <span className="login_title">
                  {step === 1 ? "Patient Login" : "Verify OTP"}
                </span>

                {step === 1 && (
                  <>
                    <div className="row_login">
                      <span className="lbllogin">Mobile No</span>
                      <input
                        ref={loginInputRef}
                        type="text"
                        className="txtlogin"
                        value={loginId}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (/^\d{0,10}$/.test(value)) setLoginId(value);
                        }}
                        maxLength={10}
                        onKeyDown={handleKeyDown}
                      />
                    </div>
                    <button
                      onClick={handleLoginCheck}
                      className="btnlogin mt-3"
                      disabled={loading}
                    >
                      {loading ? "Checking..." : "Continue"}
                    </button>
                  </>
                )}

                {step === 2 && (
                  <>
                    <p className="mb-2">
                      OTP sent to <b>{loginId}</b>{" "}
                      <button
                        onClick={() => setStep(1)}
                        style={{
                          border: "none",
                          background: "none",
                          color: "#007bff",
                          fontWeight: 500,
                          cursor: "pointer",
                          paddingLeft: "8px",
                        }}
                      >
                        Change
                      </button>
                    </p>
                    <div className="row_login">
                      <span className="lbllogin">Enter OTP</span>
                      <input
                        ref={otpInputRef}
                        type="text"
                        className="txtlogin"
                        value={otp}
                        placeholder="Enter 4-digit OTP"
                        onChange={(e) => setOtp(e.target.value)}
                        maxLength={4}
                        onKeyDown={handleKeyDownOtp}
                      />
                    </div>
                    <button
                      onClick={handleOtpSubmit}
                      className="btnlogin mt-3"
                      disabled={loading}
                    >
                      {loading ? "Verifying..." : "Verify & Login"}
                    </button>
                  </>
                )}

                {error && (
                  <p className="mt-2" style={{ color: "red" }}>
                    {error}
                  </p>
                )}

                {otpCode && step === 2 && (
                  <p className="text-muted mt-2" style={{ fontSize: "13px" }}>
                    (Debug OTP: {otpCode})
                  </p>
                )}
              </div>
            </div>
          </div>
        </Modal.Body>
      </Modal>

      {/* Signup Modal */}
      <BuyerSignupModal
        show={showSignup}
        handleClose={() => setShowSignup(false)}
        prefillEmail={prefillEmail}
        prefillMobile={prefillMobile}
      />

      {/* Prescription Status Modal */}
      <PrescriptionStatusModal
        show={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        mode={modalMode}
      />
    </>
  );
}
