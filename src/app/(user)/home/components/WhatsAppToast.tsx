"use client";

import React, { useEffect, useState } from "react";
import { ToastContainer, Toast, Collapse } from "react-bootstrap";

function WhatsAppToast() {
  const [show, setShow] = useState(false);
  const [open, setOpen] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  const WHATSAPP_NUMBER = "918062521280";

  useEffect(() => {
    const checkTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;

    setIsTouchDevice(checkTouch);

    const timeout = setTimeout(() => setShow(true), 2000);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <ToastContainer
      className="position-fixed bottom-0 end-0"
      style={{ zIndex: 1060 }}
    >
      <Toast
        className={`toast-app ${open ? "no-animation" : ""}`}
        onClose={() => {
          setShow(false);
          setOpen(false);
        }}
        show={show}
        autohide={false}
      >
        {/* 🔽 QR SECTION */}
        <Collapse in={open}>
          <div id="qr-collapse" style={{ marginBottom: "-30px" }}>
            <div className="mob">
              <button
                type="button"
                className="btn-close position-absolute top-0 end-0 m-1"
                style={{ fontSize: "12px" }}
                onClick={() => setOpen(false)}
              />

              <img src="/images/logo.png" className="clogo" alt="logo" />

              {isTouchDevice ? (
                // 📱 MOBILE → QR CLICK → WHATSAPP
                <a
                  href={`https://api.whatsapp.com/send?phone=${WHATSAPP_NUMBER}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: "block" }}
                >
                  <img
                    src="/images/qr-code-whatsapp.svg"
                    className="w-100"
                    alt="QR"
                    style={{ cursor: "pointer" }}
                  />
                </a>
              ) : (
                // 💻 DESKTOP → only QR
                <img
                  src="/images/qr-code-whatsapp.svg"
                  className="w-100"
                  alt="QR"
                />
              )}

              <span className="hint">
                {isTouchDevice ? "Tap to Upload" : "Scan to Upload"}
              </span>
            </div>
          </div>
        </Collapse>

        {/* 🔘 MAIN BUTTON */}
        <img
          src="/images/upload-on-whatsapp.svg"
          className="toastimg"
          alt="WhatsApp"
          onClick={() => setOpen(!open)}
        />
      </Toast>
    </ToastContainer>
  );
}

export default React.memo(WhatsAppToast);
