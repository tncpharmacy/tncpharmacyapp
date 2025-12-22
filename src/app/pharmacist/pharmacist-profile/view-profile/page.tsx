"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import "../../css/pharmacy-style.css";
import SideNav from "@/app/pharmacist/components/SideNav/page";
import Header from "@/app/pharmacist/components/Header/page";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import {
  fetchPharmacistSelf,
  patchPharmacist,
} from "@/lib/features/pharmacistSelfSlice/pharmacistSelfSlice";
import { Image } from "react-bootstrap";
import toast from "react-hot-toast";
import Spinner from "@/app/components/Sppiner/Sppiner";
import CenterSpinner from "@/app/components/CenterSppiner/CenterSppiner";
const mediaBase = process.env.NEXT_PUBLIC_MEDIA_BASE_URL;
const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function ViewProfile() {
  const dispatch = useAppDispatch();
  const { selfPharmacy, loading, error } = useAppSelector(
    (state) => state.selfPharmacist
  );
  const [isHoveringAddBox, setIsHoveringAddBox] = useState(false);
  const [selectedDocId, setSelectedDocId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const updateDocumentInputRef = useRef<HTMLInputElement | null>(null);
  const documentInputRef = useRef<HTMLInputElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  function base64ToFile(base64: string, filename: string): File {
    const arr = base64.split(",");
    const mime = arr[0].match(/:(.*?);/)![1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) u8arr[n] = bstr.charCodeAt(n);
    return new File([u8arr], filename, { type: mime });
  }

  const handleProfilePicClick = () => {
    fileInputRef.current?.click();
  };

  const handleProfilePicChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    let file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.includes("jpeg") && !file.type.includes("png")) {
      toast.error("Please upload JPG or PNG image only");
      return;
    }

    if (file.type === "" || file.size === 0) {
      const base64 = await file.text();
      file = base64ToFile(base64, "profile.jpg");
    }

    const formDataToSend = new FormData();
    formDataToSend.append("profile_pic", file);

    try {
      setIsLoading(true); // START LOADER

      await dispatch(patchPharmacist(formDataToSend)).unwrap();
      toast.success("Profile picture updated!");
      await dispatch(fetchPharmacistSelf());
    } catch (error) {
      toast.error("Failed to upload picture");
    } finally {
      setIsLoading(false); // STOP LOADER
    }
  };

  const handleDocumentUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const token = localStorage.getItem("accessToken");

    try {
      setIsLoading(true); // START LOADER

      for (let i = 0; i < files.length; i++) {
        const formData = new FormData();
        formData.append("document", files[i]);

        const res = await fetch(`${apiBase}/pharmacist/document/`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });

        if (!res.ok) throw new Error("Failed");
      }

      toast.success("Documents uploaded!");
      await dispatch(fetchPharmacistSelf());
    } catch (err) {
      toast.error("Document upload failed");
    } finally {
      setIsLoading(false); // STOP LOADER
    }
  };

  const handleDocumentReplace = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file || !selectedDocId) return;

    const token = localStorage.getItem("accessToken");
    const fd = new FormData();
    fd.append("document", file);

    try {
      setIsLoading(true); // START

      const res = await fetch(
        `${apiBase}/pharmacist/document/${selectedDocId}/`,
        {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}` },
          body: fd,
        }
      );

      if (!res.ok) throw new Error("Failed");

      toast.success("Document replaced!");
      await dispatch(fetchPharmacistSelf());
    } catch (err) {
      toast.error("Failed to update document");
    } finally {
      setIsLoading(false); // STOP
    }
  };

  useEffect(() => {
    dispatch(fetchPharmacistSelf()); // ✅ no argument, slice handles ID
  }, [dispatch]);

  const pharmacy = selfPharmacy;
  return (
    <>
      <Header />
      <div className="body_wrap">
        <SideNav />
        <div className="body_right">
          {isLoading && <CenterSpinner />}
          <div className="body_content">
            <div className="pageTitle">
              <i className="bi bi-person-add"></i> Profile
            </div>
            <div className="main_content">
              <div className="row align-items-center mb-4">
                <div className="col-md-8 d-flex align-items-center gap-3">
                  <div
                    className="position-relative d-inline-block"
                    onClick={handleProfilePicClick}
                    style={{ cursor: "pointer" }}
                  >
                    <Image
                      src={
                        pharmacy?.profile_pic
                          ? `${mediaBase}${pharmacy.profile_pic}`
                          : "/images/default-profile.jpg"
                      }
                      alt="Profile"
                      width={150}
                      height={150}
                      className="rounded-circle object-cover shadow-sm"
                      style={{ border: "3px solid #E5E7EB" }}
                    />

                    <input
                      type="file"
                      accept="image/*"
                      ref={fileInputRef}
                      onChange={handleProfilePicChange}
                      style={{ display: "none" }}
                    />

                    <div
                      style={{
                        position: "absolute",
                        bottom: "8px", // move slightly above bottom
                        right: "8px", // move slightly left from extreme edge
                        background: "#fff",
                        borderRadius: "50%",
                        padding: "5px 6px",
                        boxShadow: "0 0 6px rgba(0,0,0,0.2)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <i
                        className="bi bi-camera-fill"
                        style={{ fontSize: "15px" }}
                      ></i>
                    </div>
                  </div>

                  <div>
                    <h4 className="mb-1 text-primary">
                      {pharmacy?.pharmacy_name}
                    </h4>
                    <p className="text-success">Owner: {pharmacy?.user_name}</p>
                  </div>
                </div>
                {/* <div className="col-md-4 text-end">
                  <Link
                    href="/pharmacist/update-profile"
                    className="btn btn-primary"
                  >
                    <i className="bi bi-pencil me-1"></i> Update Profile
                  </Link>
                </div> */}
              </div>
              <div className="col-sm-12">
                <div className="container my-4">
                  <div className="row g-4 align-items-stretch ">
                    {/* Basic Info */}
                    <div className="col-md-6">
                      <div className="card card-box p-4 h-100">
                        <h5 className="section-title text-primary">
                          Basic Info
                        </h5>
                        <hr />

                        <p>
                          <strong>Pharmacy Name:</strong>{" "}
                          {pharmacy?.pharmacy_name}
                        </p>
                        <p>
                          <strong>License Number:</strong>{" "}
                          {pharmacy?.license_number}
                        </p>
                        <p>
                          <strong>License Valid Upto:</strong>{" "}
                          {pharmacy?.license_valid_upto}
                        </p>
                        <p>
                          <strong>Status:</strong>{" "}
                          <span
                            className={
                              pharmacy?.status === "Active"
                                ? "text-success"
                                : "text-danger"
                            }
                          >
                            {pharmacy?.status}
                          </span>
                        </p>
                      </div>
                    </div>

                    {/* Personal Info */}
                    <div className="col-md-6">
                      <div className="card card-box p-4 h-100">
                        <h5 className="section-title text-primary">
                          Personal Info
                        </h5>
                        <hr />

                        <p>
                          <strong>Owner Name:</strong> {pharmacy?.user_name}
                        </p>
                        <p>
                          <strong>Email:</strong> {pharmacy?.email_id}
                        </p>
                        <p>
                          <strong>Phone / Login ID:</strong>{" "}
                          {pharmacy?.login_id}
                        </p>
                        <p>
                          <strong>Gender:</strong> {pharmacy?.gender}
                        </p>
                        <p>
                          <strong>Date Of Birth:</strong>{" "}
                          {pharmacy?.date_of_birth}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Document Upload Section */}
                  <div className="card card-box p-4 mt-4">
                    <h5 className="section-title mb-3 text-primary">
                      Documents
                    </h5>

                    <div className="d-flex flex-wrap gap-3">
                      {/* Already uploaded docs */}
                      {pharmacy?.documents?.map((doc) => (
                        <div key={doc.id}>
                          <Image
                            src={`${mediaBase}${doc.document}`}
                            alt="Document"
                            width={120}
                            height={120}
                            style={{ objectFit: "cover", cursor: "pointer" }}
                            className="border rounded"
                            onClick={() => {
                              setSelectedDocId(doc.id);
                              updateDocumentInputRef.current?.click(); // open file picker
                            }}
                          />
                        </div>
                      ))}

                      {/* Add new document button */}
                      <div
                        onClick={() => documentInputRef.current?.click()}
                        onMouseEnter={() => setIsHoveringAddBox(true)}
                        onMouseLeave={() => setIsHoveringAddBox(false)}
                        style={{
                          width: 120,
                          height: 120,
                          border: `2px dashed ${
                            isHoveringAddBox ? "#007bff" : "#bbb"
                          }`,
                          borderRadius: 10,
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          cursor: "pointer",
                          fontSize: "40px",
                          color: isHoveringAddBox ? "#007bff" : "#777",
                          transition: "0.2s",
                        }}
                      >
                        +
                      </div>

                      {/* NEW DOCUMENT UPLOAD INPUT (CORRECT POSITION) */}
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        multiple
                        ref={documentInputRef}
                        onChange={handleDocumentUpload}
                        style={{ display: "none" }}
                      />

                      {/* UPDATE EXISTING DOCUMENT INPUT */}
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        ref={updateDocumentInputRef}
                        onChange={handleDocumentReplace}
                        style={{ display: "none" }}
                      />
                    </div>
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
