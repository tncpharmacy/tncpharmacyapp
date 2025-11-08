"use client";

import React from "react";
import Link from "next/link";

type Address = {
  id: number;
  name: string;
  pincode: string;
  address_line: string;
  city?: string;
  state?: string;
  address_type_id: string;
};

interface AddressBarProps {
  address?: Address | null;
}

const AddressBar: React.FC<AddressBarProps> = ({ address }) => {
  // ✅ Avoid hydration mismatch
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    // SSR render: return same lightweight placeholder every time
    return (
      <div
        className="bg-white border rounded p-3 mb-3"
        style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}
      >
        <div className="text-muted small">Loading address...</div>
      </div>
    );
  }

  return (
    <div
      className="bg-white border rounded d-flex justify-content-between align-items-center p-3 mb-3"
      style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}
    >
      <div>
        <div className="fw-semibold d-flex align-items-center gap-1 flex-wrap">
          Deliver to:{" "}
          <span className="text-primary">
            {address?.name || ""}, {address?.pincode || ""}
          </span>
          {address && (
            <span
              className="text-success d-inline-flex align-items-center rounded-pill"
              style={{
                background: "#e6f7e6",
                fontSize: "12px",
                padding: "2px 8px",
                fontWeight: 500,
              }}
            >
              <i
                className="bi bi-check-circle-fill me-1"
                style={{ fontSize: "13px", color: "#28a745" }}
              ></i>
              {address.address_type_id === "1"
                ? "HOME"
                : address.address_type_id === "2"
                ? "OFFICE"
                : "OTHER"}
            </span>
          )}
        </div>

        <div className="text-muted small mt-1">
          {address?.address_line
            ? address.address_line
            : "Please add your delivery address"}
        </div>
      </div>

      <Link href="/address" className="btn btn-outline-primary btn-sm">
        Change
      </Link>
    </div>
  );
};

export default AddressBar;
