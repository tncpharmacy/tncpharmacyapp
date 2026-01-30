"use client";
import { useState, useEffect, useRef } from "react";
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
import { store } from "@/lib/store";
import { linkBuyerThunk } from "@/lib/features/prescriptionSlice/prescriptionSlice";

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

  // ⭐ Type-safe refs
  const nameRef = useRef<HTMLInputElement | null>(null);
  const emailRef = useRef<HTMLInputElement | null>(null);
  const mobileRef = useRef<HTMLInputElement | null>(null);
  const otpRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!show) return;

    if (step === "signup" && nameRef.current) {
      nameRef.current.focus();
    } else if (step === "otp" && otpRef.current) {
      setTimeout(() => otpRef.current?.focus(), 100);
    }
  }, [show, step]);

  useEffect(() => {
    if (prefillEmail) setEmail(prefillEmail);
    if (prefillMobile) setMobile(prefillMobile);
  }, [prefillEmail, prefillMobile]);

  // ---------- signup handler ----------
  const handleSignup = async () => {
    // ✅ Basic empty check
    if (!name.trim() || !email.trim() || !mobile.trim()) {
      setFormError("Please fill in all fields.");
      return;
    }

    // ✅ Name minimum 3 characters
    if (name.trim().length < 3) {
      setFormError("Name must be at least 3 characters long.");
      return;
    }

    // ✅ Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setFormError("Please enter a valid email address.");
      return;
    }

    // ✅ Mobile validation
    const mobileRegex = /^\d{10}$/;
    if (!mobileRegex.test(mobile)) {
      setFormError("Please enter a valid 10-digit mobile number.");
      return;
    }

    // ✅ Clear previous errors
    setFormError("");

    try {
      const payload = await dispatch(
        buyerRegister({ name, email, number: mobile, uhid: "" })
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

  // ⭐ Custom key handler for step-by-step focus navigation
  // ⭐ Define what values "field" can be
  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    field: "name" | "email" | "mobile"
  ) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (field === "name" && emailRef.current) {
        emailRef.current.focus();
      } else if (field === "email" && mobileRef.current) {
        mobileRef.current.focus();
      } else if (field === "mobile") {
        handleSignup();
      }
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
      // ✅ ✅ AFTER LOGIN - AUTO LINK PRESCRIPTION IF SESSION EXISTS
      const sessionId = localStorage.getItem("PRESCRIPTION_SESSION");
      // ✅ Get buyer from Redux state
      const buyerState = store.getState().buyer.buyer;
      const buyerId = buyerState?.id;
      const token = localStorage.getItem("buyerAccessToken"); // LS se token

      if (sessionId && buyerId && token) {
        dispatch(
          linkBuyerThunk({
            sessionId,
            buyerId,
            token, // token mandatory
          })
        );
        // ✅ Clear LS
        localStorage.removeItem("PRESCRIPTION_SESSION");
        localStorage.removeItem("PRESCRIPTION_ID");
      }
      handleClose();
      router.push("/");
      dispatch(resetBuyerState());
    } catch (err) {
      if (typeof err === "string") setFormError(err);
      else setFormError("Invalid OTP. Please try again.");
    }
  };

  const handleKeyDownOtp = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleOtpSubmit();
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
              src="../images/login-banner.gif"
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
                      ref={nameRef}
                      type="text"
                      className="txtlogin"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      maxLength={15}
                      onKeyDown={(e) => handleKeyDown(e, "name")}
                    />
                  </div>

                  <div className="row_login">
                    <span className="lbllogin">Email ID</span>
                    <input
                      ref={emailRef}
                      type="email"
                      className="txtlogin"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      maxLength={50}
                      onKeyDown={(e) => handleKeyDown(e, "email")}
                    />
                  </div>

                  <div className="row_login">
                    <span className="lbllogin">Mobile No</span>
                    <input
                      ref={mobileRef}
                      type="text"
                      className="txtlogin"
                      value={mobile}
                      onChange={(e) => {
                        const value = e.target.value;
                        // Allow only digits and limit to 10
                        if (/^\d{0,10}$/.test(value)) {
                          setMobile(value);
                        }
                      }}
                      maxLength={10}
                      onKeyDown={(e) => handleKeyDown(e, "mobile")}
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
                      ref={otpRef}
                      type="text"
                      className="txtlogin"
                      value={otp}
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
                    {loading ? "Verifying..." : "Submit OTP"}
                  </button>
                </>
              )}

              {/* errors */}
              {formError && <p style={{ color: "red" }}>{formError}</p>}
              {error && <p style={{ color: "red" }}>{error}</p>}
              {/* {message && <p style={{ color: "green" }}>{message}</p>} */}
              {serverOtp && (
                <p className="text-muted mt-2" style={{ fontSize: "13px" }}>
                  (Debug OTP: {serverOtp})
                </p>
              )}
            </div>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
}
