"use client";
import { useEffect, useState } from "react";

export default function PreviewBox({ file }: { file: File | null }) {
  const [previewSrc, setPreviewSrc] = useState<string>("");

  useEffect(() => {
    if (!file) return;

    // PDF → Base64
    if (file.type === "application/pdf") {
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewSrc(reader.result as string); // base64
      };
      reader.readAsDataURL(file);
    }
    // Image → blob URL OK
    else {
      setPreviewSrc(URL.createObjectURL(file));
    }
  }, [file]);

  if (!file) {
    return (
      <div
        style={{
          width: "100%",
          height: "350px",
          border: "1px solid #ddd",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span className="text-muted">No Preview</span>
      </div>
    );
  }

  const isPDF = file.type === "application/pdf";

  return (
    <div
      style={{
        width: "100%",
        height: "350px",
        border: "1px solid #ddd",
        borderRadius: "6px",
        overflow: "hidden",
      }}
    >
      {isPDF ? (
        <iframe
          src={`${previewSrc}#toolbar=0`}
          style={{ width: "100%", height: "100%", border: "none" }}
        ></iframe>
      ) : (
        <img
          src={previewSrc}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
          }}
        />
      )}
    </div>
  );
}
