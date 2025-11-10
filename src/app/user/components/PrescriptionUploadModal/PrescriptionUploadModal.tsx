"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";

import {
  uploadPrescriptionThunk,
  linkBuyerThunk,
} from "@/lib/features/prescriptionSlice/prescriptionSlice";
import toast from "react-hot-toast";
import PrescriptionStatusModal from "@/app/components/PrescriptionStatusModal/PrescriptionStatusModal";
import { store } from "@/lib/store";

interface Props {
  show: boolean;
  handleClose: () => void;
}

export default function PrescriptionUploadModal({ show, handleClose }: Props) {
  const [preview, setPreview] = useState<string | null>(null);
  const [fileType, setFileType] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);

  const [showPdfPreview, setShowPdfPreview] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<
    "guest-upload" | "loggedin-upload"
  >("guest-upload");

  const dispatch = useAppDispatch();
  const { loading } = useAppSelector((state) => state.prescription);
  const buyer = useAppSelector((state) => state.buyer.buyer);

  // // ✅ Logged-in user details (jaha se buyerId milega)
  const buyerId =
    typeof window !== "undefined"
      ? Number(localStorage.getItem("LOGGED_IN_BUYER_ID"))
      : null;

  // const { loading } = useAppSelector((state) => state.prescription);

  // ✅ File Change Handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // allowed types
    const allowed = ["image/jpeg", "image/jpg", "image/png", "application/pdf"];
    if (!allowed.includes(selectedFile.type)) {
      alert("Only JPG, JPEG, PNG, PDF allowed");
      return;
    }

    setFile(selectedFile);
    setFileType(selectedFile.type);
    setFileName(selectedFile.name);

    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result as string);
    reader.readAsDataURL(selectedFile);
  };

  // ✅ Upload Now Button
  const handleUpload = async () => {
    if (!file) return alert("Please select a file");

    const formData = new FormData();
    formData.append("prescription_pic", file);

    const token = localStorage.getItem("buyerAccessToken");

    try {
      if (!token) {
        // Guest upload
        const result = await dispatch(
          uploadPrescriptionThunk({ formData })
        ).unwrap();
        localStorage.setItem("PRESCRIPTION_SESSION", result.session_id);
        localStorage.setItem("PRESCRIPTION_ID", String(result.data?.id || ""));
        setModalMode("guest-upload");
        setShowModal(true);
        // ✅ Close upload modal
        handleClose();
      } else {
        // Logged-in user upload
        const result = await dispatch(
          uploadPrescriptionThunk({ formData })
        ).unwrap();
        const sessionId = result.session_id;
        const buyerId = buyer?.id;

        if (!buyerId) return alert("Buyer info missing. Please login again.");

        await dispatch(
          linkBuyerThunk({
            sessionId,
            buyerId,
            token,
          })
        ).unwrap();

        setModalMode("loggedin-upload");
        setShowModal(true);

        localStorage.removeItem("PRESCRIPTION_SESSION");
        localStorage.removeItem("PRESCRIPTION_ID");
        // ✅ Close upload modal
        handleClose();
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error("Upload failed:", err);
      alert(err?.message || "Prescription upload failed");
    }
  };

  // ✅ Reset modal on close
  useEffect(() => {
    if (!show) {
      setPreview(null);
      setFile(null);
      setFileName(null);
      setFileType(null);
      setShowPdfPreview(false);

      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }, [show]);

  return (
    <div
      className={`modal fade ${show ? "show d-block" : "d-none"}`}
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content rounded-4 shadow-lg">
          <div className="modal-header">
            <h5 className="modal-title fw-semibold">Upload Prescription</h5>
            <button type="button" className="btn-close" onClick={handleClose} />
          </div>

          <div className="modal-body text-center">
            <label
              className="border border-2 border-secondary-subtle p-5 rounded-3 w-100 d-block mb-3"
              style={{ cursor: "pointer" }}
            >
              <input
                type="file"
                ref={fileInputRef}
                className="d-none"
                accept=".jpg,.jpeg,.png,.pdf"
                onChange={handleFileChange}
              />
              <div className="text-muted">
                <i className="bi bi-cloud-arrow-up fs-2 d-block mb-2" />
                <span>Click to Browse or Drop Image/PDF Here</span>
              </div>
            </label>

            {/* Preview */}
            {preview && (
              <>
                <p className="small text-muted">Preview:</p>

                {fileType === "application/pdf" ? (
                  <>
                    <div className="d-flex align-items-center border rounded p-2 bg-light">
                      <i className="bi bi-file-earmark-pdf-fill text-danger fs-2" />

                      <div className="ms-2">
                        <p className="m-0 small fw-semibold">{fileName}</p>
                        <button
                          className="btn btn-link p-0 small"
                          onClick={() => setShowPdfPreview(!showPdfPreview)}
                        >
                          {showPdfPreview ? "Hide Preview" : "Show Preview"}
                        </button>
                      </div>
                    </div>

                    {showPdfPreview && (
                      <iframe
                        src={preview}
                        width="100%"
                        height="400"
                        className="mt-3"
                      />
                    )}
                  </>
                ) : (
                  <Image
                    src={preview}
                    alt=""
                    width={300}
                    height={250}
                    className="rounded-3 img-fluid"
                  />
                )}
              </>
            )}
          </div>

          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={handleClose}>
              Close
            </button>
            <button
              className="btn btn-primary"
              disabled={loading}
              onClick={handleUpload}
            >
              {loading ? "Uploading..." : "Upload Now"}
            </button>
          </div>
        </div>
      </div>
      <PrescriptionStatusModal
        show={showModal}
        onClose={() => setShowModal(false)}
        mode={modalMode}
      />
    </div>
  );
}
