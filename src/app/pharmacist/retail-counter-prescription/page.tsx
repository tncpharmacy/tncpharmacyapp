"use client";

import "../css/pharmacy-style.css";
import SideNav from "@/app/pharmacist/components/SideNav/page";
import Header from "@/app/pharmacist/components/Header/page";
import { useCallback, useEffect, useState, useRef } from "react";
import * as pdfjsLib from "pdfjs-dist";

import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import toast from "react-hot-toast";
import { getUser } from "@/lib/auth/auth";
import { getPharmacy } from "@/lib/api/pharmacySelf";
import Input from "@/app/components/Input/InputColSm";
import { Image } from "react-bootstrap";
import dynamic from "next/dynamic";
import { uploadPrescriptionPharmacistThunk } from "@/lib/features/pharmacistPrescriptionSlice/pharmacistPrescriptionSlice";
import { useRouter } from "next/navigation";
import {
  buyerLogin,
  buyerRegister,
} from "@/lib/features/buyerSlice/buyerSlice";
import { BuyerApiResponse } from "@/types/buyer";
import { PayloadAction } from "@reduxjs/toolkit";
const PreviewBox = dynamic(() => import("./PreviewBox"), {
  ssr: false,
});

export default function RetailCounter() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const userPharmacy = getUser();
  const pharmacist_id = Number(userPharmacy?.id) || 0;
  const pharmacy_id = Number(userPharmacy?.pharmacy_id) || 0;

  const [customerName, setCustomerName] = useState("");
  const [mobile, setMobile] = useState("");
  const [prescriptionFile, setPrescriptionFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");

  const handlePrescriptionUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    console.log("FILE PREVIEW URL: ", url); // 👈 CHECK

    setPrescriptionFile(file);
    setPreviewUrl(url);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    try {
      if (!mobile || !customerName || !prescriptionFile) {
        toast.error("Please fill all fields");
        return;
      }

      let buyer_id: number | null = null;

      const loginRes = await dispatch(
        buyerLogin({ login_id: mobile })
      ).unwrap();

      if (loginRes?.data?.id) {
        buyer_id = loginRes.data.id;
      }
      if (!buyer_id) {
        const registerPayload = {
          name: customerName,
          email: "",
          number: mobile,
        };
        const regRes = await dispatch(buyerRegister(registerPayload)).unwrap();
        buyer_id = regRes?.data?.id;
      }

      if (!buyer_id) {
        toast.error("Buyer ID missing");
        return;
      }

      // The REAL CORRECT form-data
      const formData = new FormData();
      formData.append("buyer_id", String(buyer_id));
      formData.append(
        "prescription_pic",
        prescriptionFile,
        prescriptionFile.name
      );

      const uploadRes = await dispatch(
        uploadPrescriptionPharmacistThunk({
          pharmacistId: pharmacist_id,
          payload: formData,
        })
      ).unwrap();
      toast.success("Prescription uploaded!");

      window.location.href = `/pharmacist/ocr/${uploadRes?.id}`;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error("Upload Rejection Details:", err); // Log the full error object
      // 💡 Thunk rejection payload is often nested in err.payload
      const rejectMessage =
        err.payload || err.message || "Failed to upload prescription";
      toast.error("Error: " + rejectMessage);
    }
  };

  return (
    <>
      <Header />
      <div className="body_wrap">
        <SideNav />
        <div className="body_right p-4">
          <div className="container-fluid retail-counter">
            <h4 className="mb-4">
              <i className="bi bi-file-earmark-medical me-2"></i>
              Prescription Details
            </h4>

            {/* Bill Table */}
            <div className="card shadow-sm mb-4">
              <div className="card-body">
                {/* Customer Details Section */}
                <div className="card shadow-sm mb-4">
                  <div className="card-body">
                    <form onSubmit={handleSubmit} className="row g-3">
                      <div className="row g-3">
                        <div className="col-md-6">
                          <div className="col-md-12">
                            <div className="txt_col">
                              <label className="lbl1">
                                Upload Prescription
                              </label>
                              <input
                                type="file"
                                accept="image/*,.pdf"
                                className="form-control"
                                onChange={handlePrescriptionUpload}
                              />
                            </div>
                          </div>
                          <div className="col-md-12">
                            <div className="txt_col">
                              <label className="lbl1">Mobile No.</label>
                              <input
                                type="text"
                                className="form-control"
                                value={mobile}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  // Allow only digits and limit to 10
                                  if (/^\d{0,10}$/.test(value)) {
                                    setMobile(value);
                                  }
                                }}
                                maxLength={10}
                                required
                              />
                            </div>
                          </div>
                          <div className="col-md-12">
                            <div className="txt_col">
                              <label className="lbl1">Customer Name</label>
                              <input
                                type="text"
                                className="form-control"
                                value={customerName}
                                onChange={(e) =>
                                  setCustomerName(e.target.value)
                                }
                                required
                              />
                            </div>
                          </div>
                          <div className="col-md-12">
                            <div className="txt_col">
                              <button
                                type="submit"
                                className="btn btn-primary col-sm-12"
                              >
                                Submit
                              </button>
                            </div>
                          </div>
                        </div>
                        <div className="col-md-6 text-center">
                          <PreviewBox file={prescriptionFile} />
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
