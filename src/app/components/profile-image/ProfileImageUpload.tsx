"use client";

import React, { useState, useEffect } from "react";
const mediaBase = process.env.NEXT_PUBLIC_MEDIA_BASE_URL;
interface ProfileImageUploadProps {
  initialImage?: string; // backend path ya full URL
  size?: number;
  onChange?: (file: File | null) => void;
  placeholder?: string;
  className?: string;
  name?: string;
  label?: string;
}

export default function ProfileImageUpload({
  initialImage,
  size = 120,
  onChange,
  placeholder = "https://cdn-icons-png.flaticon.com/512/847/847969.png",
  className = "",
  name = "profile_pic",
  label = "Select Profile Image",
}: ProfileImageUploadProps) {
  const [preview, setPreview] = useState<string>(placeholder);

  useEffect(() => {
    if (initialImage) {
      setPreview(
        initialImage.startsWith("http")
          ? initialImage
          : `${mediaBase}${initialImage}`
      );
    }
  }, [initialImage]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
    if (onChange) onChange(file);
  };

  return (
    <div className={`text-center ${className}`}>
      <div
        style={{
          position: "relative",
          width: size,
          height: size,
          margin: "0 auto",
        }}
      >
        <label htmlFor={name} style={{ cursor: "pointer" }}>
          <img
            src={preview}
            alt={label}
            style={{
              width: size,
              height: size,
              borderRadius: "50%",
              objectFit: "cover",
              border: "2px solid #ddd",
            }}
          />
          <input
            id={name}
            name={name}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handleImageChange}
          />
        </label>
      </div>
      <p className="mt-2 text-muted text-sm">{label}</p>
    </div>
  );
}
