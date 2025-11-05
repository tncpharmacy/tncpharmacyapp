"use client";

import React, { useState } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import {
  uploadPrescriptionPublicThunk,
  uploadPrescriptionLoginThunk,
} from "@/lib/features/prescriptionSlice/prescriptionSlice";

const PrescriptionUpload = ({ isLoggedIn }: { isLoggedIn: boolean }) => {
  const dispatch = useAppDispatch();
  const { loading, data, error, sessionId } = useAppSelector(
    (state) => state.prescription
  );
  const [file, setFile] = useState<File | null>(null);

  const handleUpload = () => {
    if (!file) return alert("Please select a file first!");
    const formData = new FormData();
    formData.append("prescription_pic", file);

    if (isLoggedIn) {
      dispatch(uploadPrescriptionLoginThunk(formData));
    } else {
      dispatch(uploadPrescriptionPublicThunk(formData));
    }
  };

  return (
    <div>
      <input
        type="file"
        accept="image/*,application/pdf"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />
      <button onClick={handleUpload} disabled={loading}>
        {loading ? "Uploading..." : "Upload Prescription"}
      </button>

      {data && (
        <div>
          <p>✅ Uploaded successfully</p>
          <p>Session ID: {sessionId}</p>
          <p>File Path: {data.prescription_pic}</p>
        </div>
      )}

      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
};

export default PrescriptionUpload;
