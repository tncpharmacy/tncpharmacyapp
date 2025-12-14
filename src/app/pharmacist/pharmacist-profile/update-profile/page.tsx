"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button, Modal } from "react-bootstrap";
import "../../css/pharmacy-style.css";
import SideNav from "@/app/pharmacist/components/SideNav/page";
import Header from "@/app/pharmacist/components/Header/page";
import { useRouter } from "next/navigation";
import ProfileImageUpload from "@/app/components/profile-image/ProfileImageUpload";
import { getUserId } from "@/lib/auth/auth";
import { Pharmacist } from "@/types/pharmacist";
import Input from "@/app/components/Input/Input";
import InputFile from "@/app/components/Input/InputFile";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import {
  fetchPharmacistSelf,
  patchPharmacist,
} from "@/lib/features/pharmacistSelfSlice/pharmacistSelfSlice";
import toast from "react-hot-toast";
const mediaBase = process.env.NEXT_PUBLIC_MEDIA_BASE_URL;
type DocumentItem = {
  id?: number; // optional, kyunki naye uploaded files me id nahi hota
  document: string;
};

export default function UpdateProfile() {
  const router = useRouter();
  const userId = getUserId();
  const dispatch = useAppDispatch();
  const { selfPharmacy } = useAppSelector((state) => state.selfPharmacist);
  console.log("selfPharmacyselfPharmacy", selfPharmacy);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<Pharmacist>({
    id: 0,
    pharmacy_id: 0,
    user_name: "",
    pharmacy_name: "",
    license_number: "",
    license_valid_upto: "",
    email_id: "",
    status: "Active",
    login_id: "",
    uploadedFiles: [],
    documents: [],
    gender: "",
    date_of_birth: "",
    aadhar_number: "",
    profile_pic: null, // backend field
    profile_image: null, // frontend state for file
  });

  useEffect(() => {
    if (selfPharmacy) {
      setFormData({
        id: selfPharmacy.id,
        pharmacy_id: userId ?? 0,
        user_name: selfPharmacy.user_name ?? "",
        pharmacy_name: selfPharmacy.pharmacy_name ?? "",
        license_number: selfPharmacy.license_number ?? "",
        license_valid_upto: selfPharmacy.license_valid_upto ?? "",
        email_id: selfPharmacy.email_id ?? "",
        aadhar_number: selfPharmacy.aadhar_number ?? "",
        date_of_birth: selfPharmacy.date_of_birth ?? "",
        profile_pic: selfPharmacy.profile_pic ?? null,
        profile_image: null,
        gender: selfPharmacy.gender ?? "",
        status: selfPharmacy.status ?? "Active",
        login_id: selfPharmacy.login_id ?? "",
        uploadedFiles: [],
        documents: selfPharmacy.documents ?? [],
      });
    }
  }, [selfPharmacy, userId]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formDataToSend = new FormData();

    // Normal fields
    Object.entries(formData).forEach(([key, value]) => {
      if (
        ["uploadedFiles", "documents", "profile_image", "profile_pic"].includes(
          key
        )
      )
        return;
      if (value !== undefined && value !== null && value !== "") {
        formDataToSend.append(key, String(value));
      }
    });

    // Profile pic for backend
    if (formData.profile_image instanceof File) {
      formDataToSend.append("profile_pic", formData.profile_image);
    } else if (
      typeof formData.profile_image === "string" &&
      formData.profile_image
    ) {
      formDataToSend.append("profile_pic", formData.profile_image);
    }

    // Existing documents
    type DocumentItem = { id?: number; document: string };
    (formData.documents as DocumentItem[]).forEach((doc) => {
      if (doc.document) {
        formDataToSend.append("documents_existing", doc.document);
      }
    });

    // Newly uploaded files
    if (formData.uploadedFiles && formData.uploadedFiles.length > 0) {
      formData.uploadedFiles.forEach((file: File) => {
        formDataToSend.append("documents", file);
      });
    }

    // Clear previous errors
    setFieldErrors({});

    try {
      await dispatch(patchPharmacist(formDataToSend)).unwrap();
      toast.success("Profile updated successfully!");
      router.push("/pharmacist/view-profile");
    } catch (err: unknown) {
      setFieldErrors({});

      if (err && typeof err === "object" && "errors" in err) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const backendError = err as { errors?: any; message?: string };

        if (backendError.errors) {
          if (typeof backendError.errors === "string") {
            // ✅ Python-style string parsing
            const regex = /'(\w+)': ErrorDetail\(string='(.+?)'/;
            const match = backendError.errors.match(regex);
            if (match) {
              const field = match[1]; // login_id
              const message = match[2]; // This login_id is already in use.
              setFieldErrors({ [field]: message });
              toast.error(`${field}: ${message}`);
            } else {
              toast.error(backendError.errors); // fallback
            }
          } else {
            // field-level object errors
            const newFieldErrors: Record<string, string> = {};
            Object.entries(backendError.errors).forEach(([field, messages]) => {
              if (Array.isArray(messages)) newFieldErrors[field] = messages[0];
            });
            setFieldErrors(newFieldErrors);
            toast.error("Please fix the field errors");
          }
        } else if (backendError.message) {
          toast.error(backendError.message);
        } else {
          toast.error("Failed to update pharmacist");
        }
      } else if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error("Failed to update pharmacist");
      }
    }
  };

  const today = new Date();
  const minAgeDate = new Date(
    today.getFullYear() - 18,
    today.getMonth(),
    today.getDate()
  );
  const maxDate = minAgeDate.toISOString().split("T")[0];

  return (
    <>
      <Header />
      <div className="body_wrap">
        <SideNav />
        <div className="body_right">
          <div className="body_content">
            <div className="pageTitle">
              <i className="bi bi-shop-window me-2"></i>
              Update Profile
              <button
                onClick={() => router.push("/pharmacist/view-profile")}
                className="btn-style2 float-end pe-4 ps-4"
              >
                ← Back
              </button>
            </div>
            <div className="main_content">
              <form onSubmit={handleSubmit} className="row g-3">
                {/* Profile Image Upload */}
                <ProfileImageUpload
                  initialImage={
                    formData.profile_pic
                      ? `${mediaBase}${formData.profile_pic}`
                      : ""
                  }
                  size={150}
                  name="pharmacist_profile_pic"
                  label="Upload Profile Image"
                  onChange={(file) =>
                    setFormData((prev) => ({ ...prev, profile_image: file }))
                  }
                  placeholder="/images/default-profile.jpg"
                />
                {/* <Input
                  type="text"
                  label="Pharmacist Name"
                  name="user_name"
                  value={formData.user_name}
                  onChange={handleChange}
                  error={fieldErrors.user_name}
                  required
                />
                <Input
                  label="Gender"
                  type="select"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  error={fieldErrors.gender}
                  required
                  options={[
                    { value: "Male", label: "Male" },
                    { value: "Female", label: "Female" },
                    { value: "Other", label: "Other" },
                  ]}
                />
                <Input
                  label="Date Of Birth"
                  type="date"
                  name="date_of_birth"
                  value={formData.date_of_birth}
                  onChange={handleChange}
                  error={fieldErrors.user_name}
                  required
                  max={maxDate}
                />
                <Input
                  type="text"
                  label="Mobile"
                  name="login_id"
                  value={formData.login_id}
                  onChange={handleChange}
                  error={fieldErrors.user_name}
                  required
                />
                <Input
                  label="Email"
                  type="email"
                  name="email_id"
                  value={formData.email_id}
                  onChange={handleChange}
                  error={fieldErrors.email_id}
                  required
                />
                <Input
                  type="text"
                  label="Aadhar Number"
                  name="aadhar_number"
                  value={formData.aadhar_number}
                  onChange={handleChange}
                  error={fieldErrors.aadhar_number}
                  required
                />
                <Input
                  type="text"
                  label="License Number"
                  name="license_number"
                  value={formData.license_number}
                  onChange={handleChange}
                  error={fieldErrors.license_number}
                  required
                />
                <Input
                  label="License Valid Upto"
                  type="date"
                  name="license_valid_upto"
                  value={formData.license_valid_upto}
                  onChange={handleChange}
                  error={fieldErrors.license_valid_upto}
                  required
                /> */}
                <InputFile
                  label="Upload Documents"
                  name="documents"
                  multiple
                  accept="image/*,.pdf"
                  existing={formData.documents.map((d) => ({
                    url: d.document.startsWith("http")
                      ? d.document
                      : `${mediaBase}${d.document}`,
                    name: d.document.split("/").pop() || "file",
                    id: d.id,
                  }))}
                  onRemoveExisting={(i) => {
                    setFormData((prev) => {
                      const updated = [...prev.documents];
                      updated.splice(i, 1);
                      return { ...prev, documents: updated };
                    });
                  }}
                  onChange={(files) =>
                    setFormData((prev) => ({ ...prev, uploadedFiles: files }))
                  }
                />
                <div className="col-md-12">
                  <button type="submit" className="btn btn-primary">
                    Submit
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
