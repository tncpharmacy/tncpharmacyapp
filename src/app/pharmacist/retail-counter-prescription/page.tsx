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
const PreviewBox = dynamic(() => import("./PreviewBox"), {
  ssr: false,
});

export default function RetailCounter() {
  const userPharmacy = getUser();
  const pharmacy_id = Number(userPharmacy?.pharmacy_id) || 0;
  const dispatch = useAppDispatch();
  const [customerName, setCustomerName] = useState("");
  const [mobile, setMobile] = useState("");
  const [prescriptionFile, setPrescriptionFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");

  const [prescriptionPreview, setPrescriptionPreview] = useState("");
  const [doctorName, setDoctorName] = useState("");
  const [prescriptionNote, setPrescriptionNote] = useState("");

  const handlePrescriptionUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    console.log("FILE PREVIEW URL: ", url); // 👈 CHECK

    setPrescriptionFile(file);
    setPreviewUrl(url);
  };

  const handleSubmit = async () => {
    toast.error("We’re working on this feature. It will be available soon.");
    // if (!customerName || !mobile) {
    //   toast.error("Customer name & mobile required!");
    //   return;
    // }

    // try {
    //   // 1️⃣ First API → Create Buyer
    //   const buyerRes: any = await dispatch(
    //     buyerRegister({
    //       name: customerName,
    //       mobile: mobile,
    //       email: "", // blank as required
    //     })
    //   );

    //   if (!buyerRes?.payload?.buyerId) {
    //     toast.error("Buyer registration failed!");
    //     return;
    //   }

    //   const buyerId = buyerRes.payload.buyerId;

    //   // 2️⃣ Get Required Vars
    //   const user = getUser();
    //   const sessionId = user?.sessionId;
    //   const token = user?.token;

    //   if (!sessionId || !token) {
    //     toast.error("Session expired!");
    //     return;
    //   }

    //   // 3️⃣ Second API → Link Buyer
    //   const linkRes: any = await dispatch(
    //     linkBuyerThunk({
    //       sessionId,
    //       buyerId,
    //       token,
    //     })
    //   );

    //   if (linkRes?.payload?.success) {
    //     toast.success("Buyer linked successfully!");
    //   } else {
    //     toast.error("Buyer linking failed!");
    //   }
    // } catch (err) {
    //   console.error(err);
    //   toast.error("Something went wrong!");
    // }
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
