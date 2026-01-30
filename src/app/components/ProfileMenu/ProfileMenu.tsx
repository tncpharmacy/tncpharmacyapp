"use client";

import { useAppSelector } from "@/lib/hooks";
import { useEffect, useState } from "react";

export default function ProfileMenu() {
  const { user } = useAppSelector((state) => state.auth);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // 🔒 server + first client render SAME
  if (!mounted) {
    return (
      <div
        style={{
          width: "250px",
          padding: "16px",
          borderRadius: "12px",
          backgroundColor: "#FFFFFF",
        }}
      >
        {/* static placeholder */}
        <div
          style={{
            height: "14px",
            width: "180px",
            backgroundColor: "#E5E7EB",
            borderRadius: "4px",
          }}
        />
      </div>
    );
  }

  // Helper
  const capitalize = (str: string) =>
    str ? str.charAt(0).toUpperCase() + str.slice(1) : "";

  const role = capitalize(user?.role_name ?? "");
  const mobile = user?.login_id ?? "";
  const email = user?.email_id ?? "";
  const pharmacyIdCode = user?.pharmacy_id_code ?? "";
  const pharmacyName = user?.pharmacy_name ?? "";

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
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "6px",
          alignItems: "flex-start",
          width: "100%",
        }}
      >
        {pharmacyIdCode && (
          <span style={{ fontSize: "14px", fontWeight: "600" }}>
            Pharmacy code:{" "}
            <span style={{ fontWeight: "400" }}>{pharmacyIdCode}</span>
          </span>
        )}

        {pharmacyName && (
          <span style={{ fontSize: "14px", fontWeight: "600" }}>
            Pharmacy Name:{" "}
            <span style={{ fontWeight: "400" }}>{pharmacyName}</span>
          </span>
        )}

        {role && (
          <span style={{ fontSize: "14px", fontWeight: "600" }}>
            Role: <span style={{ fontWeight: "400" }}>{role}</span>
          </span>
        )}

        {email && (
          <span style={{ fontSize: "14px", fontWeight: "600" }}>
            Email: <span style={{ fontWeight: 400 }}>{email}</span>
          </span>
        )}

        {mobile && (
          <span style={{ fontSize: "14px", fontWeight: "600" }}>
            Mobile: <span style={{ fontWeight: "400" }}>{mobile}</span>
          </span>
        )}
      </div>
    </div>
  );
}
