"use client";

import { useState, useEffect } from "react";
import { Image, Modal } from "react-bootstrap";
import { useRouter } from "next/navigation";
import BuyerSignupModal from "@/app/buyer-signup/page";
import {
  buyerLogin,
  verifyBuyerOtp,
  resetBuyerState,
} from "@/lib/features/buyerSlice/buyerSlice";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import "../styles/style-login.css";
import toast from "react-hot-toast";

export default function BuyerLoginModal({
  show,
  handleClose,
}: {
  show: boolean;
  handleClose: () => void;
}) {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const [step, setStep] = useState<1 | 2>(1);
  const [loginId, setLoginId] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [showSignup, setShowSignup] = useState(false);

  // 🔹 this is state for autofill login_id on signup page
  const [prefillEmail, setPrefillEmail] = useState("");
  const [prefillMobile, setPrefillMobile] = useState("");

  const { loading, otpCode } = useAppSelector((state) => state.buyer);

  //
  // 🔹 Step 1: Handle login check
  //
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
        // 👇 Detect if email or mobile
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

  //
  // 🔹 Step 2: OTP verification
  //
  const handleOtpSubmit = async () => {
    if (!otp.trim()) {
      setError("Please enter OTP");
      return;
    }

    setError("");

    try {
      const res = await dispatch(verifyBuyerOtp({ otp })).unwrap();

      toast.success(res.message || "Login successful!");
      handleClose();
      resetForm();
      router.push("/"); // refresh page state (if needed)
    } catch (err: unknown) {
      if (typeof err === "string") setError(err);
      else if (err instanceof Error) setError(err.message);
      else setError("Invalid OTP. Please try again.");
    }
  };

  //
  // 🔹 Reset form helper
  //
  const resetForm = () => {
    setStep(1);
    setLoginId("");
    setOtp("");
    setError("");
    dispatch(resetBuyerState());
  };

  // Reset when modal closes
  useEffect(() => {
    if (!show) resetForm();
  }, [show]);

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
            {/* Left Banner */}
            <div className="col-md-5 pe-0 d-none d-md-block">
              <Image
                src="../images/login-banner-1.jpg"
                className="w-100"
                alt="Patient Login Banner"
              />
            </div>

            {/* Right Form */}
            <div className="col-md-7 ps-md-0 d-flex align-items-center">
              <div className="login_form">
                <span className="login_title">
                  {step === 1 ? "Patient Login" : "Verify OTP"}
                </span>

                {/* STEP 1: Enter Email / Number */}
                {step === 1 && (
                  <>
                    <div className="row_login">
                      <span className="lbllogin">Mobile No</span>
                      <input
                        type="text"
                        className="txtlogin"
                        value={loginId}
                        onChange={(e) => {
                          const value = e.target.value;
                          // Allow only digits and limit to 10
                          if (/^\d{0,10}$/.test(value)) {
                            setLoginId(value);
                          }
                        }}
                        maxLength={10}
                        // onChange={(e) => {
                        //   const value = e.target.value;

                        //   // 🔹 Allow only numbers up to 10 digits
                        //   if (/^\d*$/.test(value)) {
                        //     if (value.length <= 10) setLoginId(value);
                        //     return;
                        //   }

                        //   // 🔹 Otherwise (email/text), allow up to 25 chars
                        //   if (value.length <= 25) {
                        //     setLoginId(value);
                        //   }
                        // }}
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

                {/* STEP 2: Verify OTP */}
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
                        type="text"
                        className="txtlogin"
                        value={otp}
                        placeholder="Enter 4-digit OTP"
                        onChange={(e) => setOtp(e.target.value)}
                        maxLength={4}
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

                {/* Optional: Debug OTP (for dev) */}
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

      {/* 🔹 Signup Modal */}
      <BuyerSignupModal
        show={showSignup}
        handleClose={() => setShowSignup(false)}
        prefillEmail={prefillEmail}
        prefillMobile={prefillMobile}
      />
    </>
  );
}
