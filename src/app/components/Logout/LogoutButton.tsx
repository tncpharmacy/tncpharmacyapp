"use client";

import { useAppDispatch } from "@/lib/hooks";
import { logout } from "@/lib/features/authSlice/authSlice";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const handleLogout = () => {
    dispatch(logout());
    localStorage.clear();
    sessionStorage.clear();

    window.location.replace("/"); // 🔥 Full reload without history back
  };

  return (
    <button
      onClick={handleLogout}
      style={{
        width: "100%", // full width
        padding: "10px 16px", // thoda padding
        backgroundColor: "#274346ff", // red background (custom)
        color: "#FFFFFF", // white text
        border: "none",
        fontWeight: "500",
        fontSize: "14px",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "6px",
      }}
    >
      <i className="bi bi-box-arrow-left"></i>
      Logout
    </button>
  );
}
