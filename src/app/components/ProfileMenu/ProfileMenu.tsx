"use client";

import { useAppSelector } from "@/lib/hooks";

export default function ProfileMenu() {
  const { user } = useAppSelector((state) => state.auth);

  // Helper to capitalize first letter
  const capitalize = (str: string) => {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  const role = capitalize(user?.role_name ?? "N/A");
  const mobile = user?.login_id ?? "N/A";
  const email = user?.email_id ?? "N/A";
  const pharmacyIdCode = user?.pharmacy_id_code ?? "N/A";
  const pharmacyName = user?.pharmacy_name ?? "N/A";

  return (
    <div
      style={{
        width: "250px",
        padding: "16px",
        borderRadius: "12px",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        backgroundColor: "#FFFFFF",
      }}
    >
      {/* User Details */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "6px",
          alignItems: "flex-start",
          width: "100%",
        }}
      >
        {pharmacyIdCode === "N/A" ? (
          ""
        ) : (
          <span
            style={{ fontSize: "14px", fontWeight: "600", color: "#111827" }}
          >
            Pharmacy code:{" "}
            <span style={{ fontWeight: "400" }}>{pharmacyIdCode}</span>
          </span>
        )}
        {pharmacyName === "N/A" ? (
          ""
        ) : (
          <span
            style={{ fontSize: "14px", fontWeight: "600", color: "#111827" }}
          >
            Pharmacy Name:{" "}
            <span style={{ fontWeight: "400" }}>{pharmacyName}</span>
          </span>
        )}
        {role === "N/A" ? (
          ""
        ) : (
          <span
            style={{ fontSize: "14px", fontWeight: "600", color: "#111827" }}
          >
            Role: <span style={{ fontWeight: "400" }}>{role}</span>
          </span>
        )}
        {email === "N/A" ? (
          ""
        ) : (
          <span
            style={{ fontSize: "14px", fontWeight: "600", color: "#111827" }}
          >
            Email: <span style={{ fontWeight: "400" }}>{email}</span>
          </span>
        )}
        {mobile === "N/A" ? (
          ""
        ) : (
          <span
            style={{ fontSize: "14px", fontWeight: "600", color: "#111827" }}
          >
            Mobile: <span style={{ fontWeight: "400" }}>{mobile}</span>
          </span>
        )}
      </div>
    </div>
  );
}
