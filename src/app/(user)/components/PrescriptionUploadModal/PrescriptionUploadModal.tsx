"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";

import {
  uploadPrescriptionThunk,
  linkBuyerThunk,
  extractPrescriptionMedicinesThunk,
  clearExtractedMedicines,
} from "@/lib/features/prescriptionSlice/prescriptionSlice";
import { createHealthBagItem } from "@/lib/features/healthBagSlice/healthBagSlice";
import toast from "react-hot-toast";
import PrescriptionStatusModal from "@/app/components/PrescriptionStatusModal/PrescriptionStatusModal";
import { store } from "@/lib/store";
import BuyerLoginModal from "@/app/buyer-login/page";
import { useRouter } from "next/navigation";
import PrescriptionMedicinesStep, {
  SelectedMedicine,
} from "./PrescriptionMedicinesStep";

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
  const [showBuyerLogin, setShowBuyerLogin] = useState(false);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const {
    loading,
    extractLoading,
    extractError,
    extractedMedicines,
  } = useAppSelector((state) => state.prescription);
  const buyer = useAppSelector((state) => state.buyer.buyer);

  // 🔍 OCR results step
  const [step, setStep] = useState<"upload" | "results">("upload");
  const [addingToBag, setAddingToBag] = useState(false);
  // Items a guest picked before logging in — added once login completes
  const [pendingItems, setPendingItems] = useState<SelectedMedicine[] | null>(
    null
  );

  // // ✅ Logged-in user details (jaha se buyerId milega)
  // const buyerId =
  //   typeof window !== "undefined"
  //     ? Number(localStorage.getItem("LOGGED_IN_BUYER_ID"))
  //     : null;

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

    // 🔍 Start reading the prescription right away, in parallel with the
    // upload, so results are ready as soon as the buyer reaches that step.
    dispatch(extractPrescriptionMedicinesThunk({ file }));

    try {
      if (!token) {
        // Guest upload
        const result = await dispatch(
          uploadPrescriptionThunk({ formData })
        ).unwrap();
        localStorage.setItem("PRESCRIPTION_SESSION", result.session_id);
        localStorage.setItem("PRESCRIPTION_ID", String(result.data?.id || ""));
        setModalMode("guest-upload");
        // ➡️ Show detected medicines instead of closing right away
        setStep("results");
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

        localStorage.removeItem("PRESCRIPTION_SESSION");
        localStorage.removeItem("PRESCRIPTION_ID");
        // ➡️ Show detected medicines instead of closing right away
        setStep("results");
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error("Upload failed:", err);
      alert(err?.message || "Prescription upload failed");
    }
  };

  // 🛒 Add the medicines the buyer picked to their Health Bag
  const addItemsToBag = async (items: SelectedMedicine[], buyerId: number) => {
    setAddingToBag(true);
    let added = 0;

    try {
      for (const item of items) {
        try {
          await dispatch(
            createHealthBagItem({
              buyer_id: buyerId,
              product_id: item.medicine_id,
              quantity: item.quantity,
            })
          ).unwrap();
          added += 1;
        } catch {
          toast.error(`Could not add ${item.medicine_name}`);
        }
      }

      if (added > 0) {
        toast.success(
          `${added} medicine${added > 1 ? "s" : ""} added to your Health Bag`
        );
        finishFlow();
        router.push("/health-bag");
      }
    } finally {
      setAddingToBag(false);
    }
  };

  const handleAddSelected = async (items: SelectedMedicine[]) => {
    const token = localStorage.getItem("buyerAccessToken");
    const buyerId = buyer?.id;

    // Guest → ask them to log in first, then add what they picked
    if (!token || !buyerId) {
      setPendingItems(items);
      setShowBuyerLogin(true);
      return;
    }

    await addItemsToBag(items, buyerId);
  };

  // After a guest logs in: link their prescription and add pending items
  useEffect(() => {
    const run = async () => {
      if (!pendingItems || !buyer?.id) return;

      const token = localStorage.getItem("buyerAccessToken");
      if (!token) return;

      const items = pendingItems;
      setPendingItems(null);
      setShowBuyerLogin(false);

      // Attach the prescription they uploaded as a guest to their account
      const sessionId = localStorage.getItem("PRESCRIPTION_SESSION");
      if (sessionId) {
        try {
          await dispatch(
            linkBuyerThunk({ sessionId, buyerId: buyer.id, token })
          ).unwrap();
        } catch {
          // Non-fatal: the pharmacist can still see the prescription
        }
      }

      await addItemsToBag(items, buyer.id);
    };

    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [buyer?.id, pendingItems]);

  // Close everything and reset back to the upload step
  const finishFlow = () => {
    setStep("upload");
    setPendingItems(null);
    dispatch(clearExtractedMedicines());
    handleClose();
  };

  // "Skip for now" / "Done" — keep the old confirmation modal behaviour
  const handleSkipMedicines = () => {
    finishFlow();
    setShowModal(true);
  };

  // ✅ Reset modal on close
  useEffect(() => {
    if (!show) {
      setPreview(null);
      setFile(null);
      setFileName(null);
      setFileType(null);
      setShowPdfPreview(false);
      setStep("upload");

      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }, [show]);

  const handleContinueToLogin = () => {
    setShowModal(false);
    setShowBuyerLogin(true);
  };

  return (
    <div
      className={`modal fade ${show ? "show d-block" : "d-none"}`}
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content rounded-4 shadow-lg">
          <div className="modal-header">
            <h5 className="modal-title fw-semibold">
              {step === "results"
                ? "Medicines in your prescription"
                : "Upload Prescription"}
            </h5>
            <button
              type="button"
              className="btn-close"
              onClick={step === "results" ? finishFlow : handleClose}
            />
          </div>

          {/* ---------------- STEP 2: OCR RESULTS ---------------- */}
          {step === "results" ? (
            <div className="modal-body">
              <PrescriptionMedicinesStep
                medicines={extractedMedicines}
                loading={extractLoading}
                error={extractError}
                adding={addingToBag}
                onAddSelected={handleAddSelected}
                onSkip={handleSkipMedicines}
              />
            </div>
          ) : (
            <>
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
                    alt="Prescription Upload"
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
            </>
          )}
        </div>
      </div>
      <PrescriptionStatusModal
        show={showModal}
        onClose={() => setShowModal(false)}
        mode={modalMode}
        onContinueToLogin={handleContinueToLogin}
      />
      <BuyerLoginModal
        show={showBuyerLogin}
        handleClose={() => setShowBuyerLogin(false)}
      />
    </div>
  );
}
