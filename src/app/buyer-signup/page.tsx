"use client";
import { useState, useEffect } from "react";
import { Modal } from "react-bootstrap";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import {
  buyerRegister,
  verifyBuyerOtp,
  resetBuyerState,
} from "@/lib/features/buyerSlice/buyerSlice";
import "../styles/style-login.css";
import toast from "react-hot-toast";

interface BuyerSignupModalProps {
  show: boolean;
  handleClose: () => void;
  prefillEmail?: string;
  prefillMobile?: string;
}

export default function BuyerSignupModal({
  show,
  handleClose,
  prefillEmail,
  prefillMobile,
}: BuyerSignupModalProps) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { loading, message, error } = useAppSelector((state) => state.buyer);

  // ---------- form states ----------
  const [step, setStep] = useState<"signup" | "otp">("signup");
  const [name, setName] = useState("");
  const [email, setEmail] = useState(prefillEmail || "");
  const [mobile, setMobile] = useState(prefillMobile || "");

  const [otp, setOtp] = useState("");
  const [formError, setFormError] = useState("");
  const [serverOtp, setServerOtp] = useState<string | null>(null);

  useEffect(() => {
    if (prefillEmail) setEmail(prefillEmail);
    if (prefillMobile) setMobile(prefillMobile);
  }, [prefillEmail, prefillMobile]);

  // ---------- signup handler ----------
  const handleSignup = async () => {
    if (!name || !email || !mobile) {
      setFormError("All fields are required.");
      return;
    }
    setFormError("");

    try {
      const payload = await dispatch(
        buyerRegister({ name, email, number: mobile })
      ).unwrap();

      // ✅ OTP aayi to OTP screen dikha do
      if (payload?.data?.otp) {
        setServerOtp(payload.data.otp);
        toast.success(`OTP sent successfully: ${payload.data.otp}`);
        setStep("otp");
      } else {
        toast.success(
          "Signup successful, please verify OTP sent to your number!"
        );
        setStep("otp");
      }
    } catch (err: unknown) {
      if (err instanceof Error) setFormError(err.message);
      else setFormError("Something went wrong during signup.");
    }
  };

  // ---------- OTP verify handler ----------
  const handleOtpSubmit = async () => {
    if (!otp) {
      setFormError("Please enter OTP.");
      return;
    }

    try {
      const result = await dispatch(verifyBuyerOtp({ otp })).unwrap();

      toast.success(result.message || "Signup successful!");
      handleClose();
      router.push("/");
      dispatch(resetBuyerState());
    } catch (err) {
      if (typeof err === "string") setFormError(err);
      else setFormError("Invalid OTP. Please try again.");
    }
  };

  // const handleOtpSubmit = async () => {
  //   if (!otp) {
  //     setFormError("Please enter OTP.");
  //     return;
  //   }

  //   try {
  //     const payload = await dispatch(
  //       verifyBuyerOtp({ otp, serverOtp: serverOtp! })
  //     ).unwrap();

  //     toast.success(payload.message || "OTP verified!");
  //     handleClose();
  //     router.push("/");
  //     dispatch(resetBuyerState());
  //   } catch (err) {
  //     if (typeof err === "string") setFormError(err);
  //     else setFormError("Invalid OTP. Please try again.");
  //   }
  // };

  // ---------- reset when modal closed ----------

  useEffect(() => {
    if (!show) {
      setStep("signup");
      setName("");
      setEmail("");
      setMobile("");
      setOtp("");
      setFormError("");
      setServerOtp(null);
    }
  }, [show]);

  // ---------- render ----------
  return (
    <Modal
      size="lg"
      show={show}
      onHide={handleClose}
      centered
      className="loginmodal"
    >
      <Modal.Body className="p-0">
        <div className="row">
          {/* Left banner */}
          <div className="col-md-5 pe-0 d-none d-md-block">
            <img
              src="../images/login-banner-1.jpg"
              className="w-100"
              alt="Signup Banner"
            />
          </div>

          {/* Right content */}
          <div className="col-md-7 ps-md-0 d-flex align-items-center">
            <div className="login_form">
              {step === "signup" ? (
                <>
                  <span className="login_title">Buyer Sign Up</span>
                  <div className="row_login">
                    <span className="lbllogin">Full Name</span>
                    <input
                      type="text"
                      className="txtlogin"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      maxLength={15}
                    />
                  </div>

                  <div className="row_login">
                    <span className="lbllogin">Email ID</span>
                    <input
                      type="email"
                      className="txtlogin"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      maxLength={25}
                    />
                  </div>

                  <div className="row_login">
                    <span className="lbllogin">Mobile No</span>
                    <input
                      type="text"
                      className="txtlogin"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      maxLength={10}
                    />
                  </div>

                  <button
                    onClick={handleSignup}
                    className="btnlogin mt-3"
                    disabled={loading}
                  >
                    {loading ? "Registering..." : "Sign Up"}
                  </button>
                </>
              ) : (
                <>
                  <span className="login_title">Verify OTP</span>
                  <p className="text-muted">
                    OTP sent to <b>{email || mobile}</b>{" "}
                    <button
                      className="btn btn-link p-0 ms-1"
                      onClick={() => setStep("signup")}
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
                      onChange={(e) => setOtp(e.target.value)}
                      maxLength={4}
                    />
                  </div>

                  <button
                    onClick={handleOtpSubmit}
                    className="btnlogin mt-3"
                    disabled={loading}
                  >
                    {loading ? "Verifying..." : "Submit OTP"}
                  </button>
                </>
              )}

              {/* errors */}
              {formError && <p style={{ color: "red" }}>{formError}</p>}
              {error && <p style={{ color: "red" }}>{error}</p>}
              {message && <p style={{ color: "green" }}>{message}</p>}
            </div>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
}
