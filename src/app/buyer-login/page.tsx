"use client";
import { useState } from "react";
import { Modal } from "react-bootstrap";
import { useRouter } from "next/navigation";
import BuyerSignupModal from "@/app/buyer-signup/page";
import "../styles/style-login.css";

export default function BuyerLoginModal({
  show,
  handleClose,
}: {
  show: boolean;
  handleClose: () => void;
}) {
  const [step, setStep] = useState<1 | 2>(1);
  const [loginId, setLoginId] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [showSignup, setShowSignup] = useState(false);

  const dummyEmail = "buyer@gmail.com";
  const dummyMobile = "9999999999";
  const dummyOtp = "1234";

  const handleLoginCheck = () => {
    if (loginId === dummyEmail || loginId === dummyMobile) {
      setStep(2);
      setError("");
    } else {
      // show signup modal if not found
      handleClose();
      setShowSignup(true);
    }
  };

  const handleOtpSubmit = () => {
    if (otp === dummyOtp) {
      alert("Buyer login successful!");
      handleClose();
      resetForm();
    } else {
      setError("Invalid OTP, please register.");
      handleClose();
      setShowSignup(true);
    }
  };

  const resetForm = () => {
    setStep(1);
    setLoginId("");
    setOtp("");
    setError("");
  };

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
              <img
                src="../images/login-banner-1.jpg"
                className="w-100"
                alt="Buyer Login Banner"
              />
            </div>

            <div className="col-md-7 ps-md-0 d-flex align-items-center">
              <div className="login_form">
                <span className="login_title">
                  {step === 1 ? "Buyer Login" : "Verify OTP"}
                </span>

                {step === 1 && (
                  <>
                    <div className="row_login">
                      <span className="lbllogin">Email ID / Mobile No</span>
                      <input
                        type="text"
                        className="txtlogin"
                        value={loginId}
                        onChange={(e) => setLoginId(e.target.value)}
                      />
                    </div>

                    <button
                      onClick={handleLoginCheck}
                      className="btnlogin mt-3"
                    >
                      Continue
                    </button>
                  </>
                )}

                {step === 2 && (
                  <>
                    <div className="row_login">
                      <span className="lbllogin">Enter OTP</span>
                      <input
                        type="text"
                        className="txtlogin"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                      />
                    </div>

                    <button onClick={handleOtpSubmit} className="btnlogin mt-3">
                      Verify & Login
                    </button>
                  </>
                )}

                {error && <p style={{ color: "red" }}>{error}</p>}

                <div className="dummy_info mt-3">
                  <p className="small-text">
                    Dummy for testing:
                    <br />
                    Email: <b>buyer@gmail.com</b> (OTP: 1234)
                    <br />
                    Mobile: <b>9999999999</b> (OTP: 1234)
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Modal.Body>
      </Modal>

      {/* Signup Modal */}
      <BuyerSignupModal
        show={showSignup}
        handleClose={() => setShowSignup(false)}
      />
    </>
  );
}
