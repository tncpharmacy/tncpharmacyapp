"use client";

import { useAppSelector } from "@/lib/hooks";
import { Image } from "react-bootstrap";

const mediaBase = process.env.NEXT_PUBLIC_MEDIA_BASE_URL;

export default function HeaderProfilePic() {
  const { user } = useAppSelector((state) => state.auth);
  //console.log("userrr0", user);
  // Capitalize helper
  const capitalize = (str: string) => {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  const userName = capitalize(user?.user_name ?? "User");
  const firstLetter = userName.charAt(0);

  const rawPic = user && "profile_pic" in user ? user.profile_pic : null;

  const profilePicUrl =
    rawPic &&
    rawPic !== "null" &&
    rawPic !== "undefined" &&
    rawPic !== "" &&
    rawPic !== null &&
    rawPic !== undefined
      ? `${mediaBase}${rawPic}`
      : null;

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
      {profilePicUrl ? (
        <Image
          src={profilePicUrl}
          alt="Profile"
          style={{
            height: "32px",
            width: "32px",
            borderRadius: "50%",
            objectFit: "cover",
            border: "3px solid #E5E7EB", // 👈 White-ish border
            background: "#fff",
          }}
        />
      ) : (
        <div
          style={{
            backgroundColor: "#000000",
            color: "#FFFFFF",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            borderRadius: "50%",
            height: "32px",
            width: "32px",
            fontWeight: "bold",
            fontSize: "18px",
            border: "2px solid #E5E7EB",
          }}
        >
          {firstLetter}
        </div>
      )}

      {/* Greeting */}
      <span style={{ fontSize: "16px", fontWeight: "500", color: "#111827" }}>
        Hi: {userName}
      </span>
    </div>
  );
}
