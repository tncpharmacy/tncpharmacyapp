"use client";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import "../../css/header-style.css";

interface Props {
  show: boolean;
  handleClose: () => void;
}

export default function PrescriptionUploadModal({ show, handleClose }: Props) {
  const [preview, setPreview] = useState<string | null>(null);
  const [fileType, setFileType] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [showPdfPreview, setShowPdfPreview] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // ✅ Allowed file types
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "application/pdf",
    ];
    if (!allowedTypes.includes(file.type)) {
      alert("Only JPG, JPEG, PNG, and PDF files are allowed.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      setPreview(null);
      setFileType(null);
      setFileName(null);
      return;
    }

    setFileType(file.type);
    setFileName(file.name);

    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  // ✅ Jab modal band ho, sab clear kar do
  useEffect(() => {
    if (!show) {
      setPreview(null);
      setFileType(null);
      setFileName(null);
      setShowPdfPreview(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }, [show]);

  // Scroll disable jab modal open
  useEffect(() => {
    document.body.style.overflow = show ? "hidden" : "auto";
  }, [show]);

  return (
    <div
      className={`modal fade ${show ? "show d-block" : "d-none"}`}
      style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
      tabIndex={-1}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content rounded-4 shadow-lg border-0 modal-bg-image">
          <div className="modal-header">
            <h5 className="modal-title fw-semibold">Upload Prescription</h5>
            <button
              type="button"
              className="btn-close"
              onClick={handleClose}
            ></button>
          </div>

          <div className="modal-body text-center">
            <label
              className="border border-2 border-secondary-subtle p-5 rounded-3 w-100 d-block mb-3"
              style={{ cursor: "pointer" }}
            >
              <input
                type="file"
                accept=".jpg,.jpeg,.png,.pdf"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="d-none"
              />
              <div className="text-muted">
                <i className="bi bi-cloud-arrow-up fs-2 d-block mb-2"></i>
                <span className="fw-medium">
                  Click to Browse or Drop Image/PDF Here
                </span>
              </div>
            </label>

            {/* ✅ Preview Section */}
            {preview && (
              <div className="mt-3 text-start">
                <p className="text-muted small mb-2">Preview:</p>

                {fileType === "application/pdf" ? (
                  <>
                    {/* Thumbnail Preview for PDF */}
                    <div
                      className="d-flex align-items-center border rounded p-2 bg-light"
                      style={{ gap: "10px" }}
                    >
                      <i
                        className="bi bi-file-earmark-pdf-fill text-danger fs-2"
                        style={{ flexShrink: 0 }}
                      ></i>
                      <div>
                        <p className="m-0 small fw-semibold">{fileName}</p>
                        <button
                          className="btn btn-link p-0 small text-decoration-none"
                          onClick={() => setShowPdfPreview(!showPdfPreview)}
                        >
                          {showPdfPreview
                            ? "Hide PDF Preview"
                            : "View Full PDF"}
                        </button>
                      </div>
                    </div>

                    {/* Full PDF Preview */}
                    {showPdfPreview && (
                      <iframe
                        src={preview}
                        width="100%"
                        height="400px"
                        className="mt-3"
                        style={{
                          border: "1px solid #ccc",
                          borderRadius: "8px",
                        }}
                      ></iframe>
                    )}
                  </>
                ) : (
                  <Image
                    src={preview}
                    alt="Prescription Preview"
                    width={300}
                    height={250}
                    className="img-fluid rounded-3"
                    style={{ objectFit: "contain" }}
                  />
                )}
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleClose}
            >
              Close
            </button>
            <button type="button" className="btn btn-primary">
              Upload Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
