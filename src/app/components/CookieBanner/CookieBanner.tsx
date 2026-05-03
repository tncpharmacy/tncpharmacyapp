"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function CookieBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie_consent");
    if (!consent) setShow(true);
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookie_consent", "accepted");
    document.cookie = "cookie_consent=accepted; path=/; max-age=31536000";
    setShow(false);
  };

  const handleReject = () => {
    localStorage.setItem("cookie_consent", "rejected");
    document.cookie = "cookie_consent=rejected; path=/; max-age=31536000";
    setShow(false);
  };

  if (!show) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: "20px",
        left: "50%",
        transform: "translateX(-50%)",
        width: "92%",
        maxWidth: "950px",
        background: "linear-gradient(135deg, #1e293b, #0f172a)",
        color: "#fff",
        padding: "18px 22px",
        borderRadius: "12px",
        zIndex: 9999,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        boxShadow: "0 15px 35px rgba(0,0,0,0.4)",
        flexWrap: "wrap",
        gap: "12px",
        animation: "slideUp 0.4s ease",
      }}
    >
      {/* TEXT */}
      <div style={{ fontSize: "14px", lineHeight: "1.6", maxWidth: "650px" }}>
        🍪 We use cookies to enhance your experience, analyze traffic, and serve
        better content.{" "}
        <Link
          href="/privacy-policy"
          style={{
            color: "#38bdf8",
            textDecoration: "underline",
            fontWeight: 500,
          }}
        >
          Learn more
        </Link>
      </div>

      {/* BUTTONS */}
      <div style={{ display: "flex", gap: "10px" }}>
        <button
          onClick={handleReject}
          style={{
            padding: "8px 14px",
            borderRadius: "6px",
            border: "1px solid #64748b",
            background: "transparent",
            color: "#fff",
            cursor: "pointer",
            transition: "0.2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#334155")}
          onMouseLeave={(e) =>
            (e.currentTarget.style.background = "transparent")
          }
        >
          Reject
        </button>

        <button
          onClick={handleAccept}
          style={{
            padding: "8px 18px",
            borderRadius: "6px",
            border: "none",
            background: "linear-gradient(90deg, #2563eb, #3b82f6)",
            color: "#fff",
            fontWeight: "500",
            cursor: "pointer",
            transition: "0.2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
        >
          Accept
        </button>
      </div>

      {/* ANIMATION */}
      <style>
        {`
          @keyframes slideUp {
            from {
              opacity: 0;
              transform: translate(-50%, 40px);
            }
            to {
              opacity: 1;
              transform: translate(-50%, 0);
            }
          }
        `}
      </style>
    </div>
  );
}
