"use client";
import { useState } from "react";
import { Modal } from "react-bootstrap";
import "../styles/style-login.css";

interface BuyerSignupModalProps {
  show: boolean;
  handleClose: () => void;
}

export default function BuyerSignupModal({
  show,
  handleClose,
}: BuyerSignupModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSignup = () => {
    if (!name || !email || !mobile) {
      setError("All fields are required.");
      return;
    }

    // dummy signup
    setSuccess(true);
    setTimeout(() => {
      alert("Signup successful! Please login now.");
      handleClose();
      setSuccess(false);
      setName("");
      setEmail("");
      setMobile("");
      setError("");
    }, 1000);
  };

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

          {/* Right form */}
          <div className="col-md-7 ps-md-0 d-flex align-items-center">
            <div className="login_form">
              <span className="login_title">Buyer Sign Up</span>

              <div className="row_login">
                <span className="lbllogin">Full Name</span>
                <input
                  type="text"
                  className="txtlogin"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="row_login">
                <span className="lbllogin">Email ID</span>
                <input
                  type="email"
                  className="txtlogin"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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

              <button onClick={handleSignup} className="btnlogin mt-3">
                {success ? "Registering..." : "Sign Up"}
              </button>

              {error && <p style={{ color: "red" }}>{error}</p>}
            </div>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
}
