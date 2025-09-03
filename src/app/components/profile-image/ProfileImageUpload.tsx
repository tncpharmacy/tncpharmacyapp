import React, { useState } from "react";

export default function ProfileImageUpload() {
  const [preview, setPreview] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="text-center">
      <div
        style={{
          position: "relative",
          width: "120px",
          height: "120px",
          margin: "0 auto",
        }}
      >
        <label htmlFor="profile-pic" style={{ cursor: "pointer" }}>
          <img
            src={
              preview || "https://cdn-icons-png.flaticon.com/512/847/847969.png"
            }
            alt="Profile Preview"
            style={{
              width: "120px",
              height: "120px",
              borderRadius: "50%",
              objectFit: "cover",
              border: "2px solid #ddd",
            }}
          />
          <input
            id="profile-pic"
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handleImageChange}
          />
        </label>
      </div>
      <p className="mt-2 text-muted" style={{ fontSize: "0.9rem" }}>
        Select Profile Image
      </p>
    </div>
  );
}
