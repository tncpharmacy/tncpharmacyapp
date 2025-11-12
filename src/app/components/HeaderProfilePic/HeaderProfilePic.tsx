"use client";

import { useAppSelector } from "@/lib/hooks";

export default function HeaderProfilePic() {
  const { user } = useAppSelector((state) => state.auth);

  // Helper to capitalize first letter
  const capitalize = (str: string) => {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  const userName = capitalize(user?.user_name ?? "User");

  const firstLetter = userName.charAt(0);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        padding: "12px 16px",
        borderRadius: "12px",
        backgroundColor: "#FFFFFF",
      }}
    >
      {/* Avatar Circle */}
      <div
        style={{
          backgroundColor: "#6B7280", // gray
          color: "#FFFFFF", // white text
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          borderRadius: "50%",
          height: "30px",
          width: "30px",
          fontWeight: "bold",
          fontSize: "19px",
          flexShrink: 0,
        }}
      >
        {firstLetter}
      </div>

      {/* Greeting */}
      <span style={{ fontSize: "16px", fontWeight: "500", color: "#111827" }}>
        Hi: {userName}
      </span>
    </div>
  );
}
