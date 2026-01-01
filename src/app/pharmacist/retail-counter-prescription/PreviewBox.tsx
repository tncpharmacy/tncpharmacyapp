"use client";
import { useEffect, useState } from "react";

interface PreviewBoxProps {
  file: File | null;
  onLoadComplete?: () => void;
}

const PreviewBox: React.FC<PreviewBoxProps> = ({ file, onLoadComplete }) => {
  const [previewSrc, setPreviewSrc] = useState<string>("");

  useEffect(() => {
    if (!file) {
      setPreviewSrc("");
      return;
    }

    let objectUrl: string | null = null;

    // 📄 PDF → Base64
    if (file.type === "application/pdf") {
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewSrc(reader.result as string);
      };
      reader.onerror = () => {
        onLoadComplete?.(); // 🔥 error case
      };
      reader.readAsDataURL(file);
    }
    // 🖼️ Image → Blob URL
    else {
      objectUrl = URL.createObjectURL(file);
      setPreviewSrc(objectUrl);
    }

    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl); // 🧹 cleanup
      }
    };
  }, [file, onLoadComplete]);

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
          onLoad={() => onLoadComplete?.()} // 🔥 PDF loaded
        />
      ) : (
        <img
          src={previewSrc}
          alt="Preview"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
          }}
          onLoad={() => onLoadComplete?.()} // 🔥 Image loaded
          onError={() => onLoadComplete?.()} // 🔥 Error case
        />
      )}
    </div>
  );
};

export default PreviewBox;
