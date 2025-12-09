"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button, Modal } from "react-bootstrap";
import "../../css/style.css";
import SideNav from "@/app/pharmacy/components/SideNav/page";
import Header from "@/app/pharmacy/components/Header/page";
import { useRouter } from "next/navigation";
import ProfileImageUpload from "@/app/components/profile-image/ProfileImageUpload";
import { getUserId } from "@/lib/auth/auth";
import { PharmacySuperAdminForm } from "@/types/pharmacy";
import Input from "@/app/components/Input/Input";
import SelectInput from "@/app/components/Input/SelectInput";
import InputFile from "@/app/components/Input/InputFile";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { fetchStates } from "@/lib/features/stateSlice/stateSlice";
import {
  fetchPharmacySelf,
  patchPharmacy,
} from "@/lib/features/pharmacySelfSlice/pharmacySelfSlice";
import toast from "react-hot-toast";
const mediaBase = process.env.NEXT_PUBLIC_MEDIA_BASE_URL;

interface Props {
  id?: number; // agar edit mode hai to id milegi
}

interface State {
  id: number;
  state_name: string;
}

export default function UpdateProfile() {
  const router = useRouter();
  const [formData, setFormData] = useState<PharmacySuperAdminForm>({
    id: 0,
    pharmacy_id_code: "",
    user_name: "",
    pharmacy_name: "",
    license_number: "",
    license_valid_upto: "",
    gst_number: "",
    email_id: "",
    pincode: "",
    district: "",
    state: 0,
    address: "",
    status: "Active",
    login_id: "",
    uploadedFiles: [],
    documents: [],
  });
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const dispatch = useAppDispatch();
  const { states, loading: statesLoading } = useAppSelector(
    (state) => state.states
  );
  const { selfPharmacy, error } = useAppSelector((state) => state.selfPharmacy);

  useEffect(() => {
    dispatch(fetchPharmacySelf());
    dispatch(fetchStates());
  }, [dispatch]);

  useEffect(() => {
    if (selfPharmacy) {
      setFormData({
        id: selfPharmacy.id,
        pharmacy_id_code: selfPharmacy.pharmacy_id_code ?? "",
        user_name: selfPharmacy.user_name ?? "",
        pharmacy_name: selfPharmacy.pharmacy_name ?? "",
        license_number: selfPharmacy.license_number ?? "",
        license_valid_upto: selfPharmacy.license_valid_upto ?? "",
        gst_number: selfPharmacy.gst_number ?? "",
        email_id: selfPharmacy.email_id ?? "",
        pincode: selfPharmacy.pincode ?? "",
        district: selfPharmacy.district ?? "",
        state: selfPharmacy.state ?? 0,
        address: selfPharmacy.address ?? "",
        status: selfPharmacy.status ?? "Active",
        login_id: selfPharmacy.login_id ?? "",
        uploadedFiles: [], // naya upload ke liye blank
        documents: selfPharmacy.documents ?? [], // jo backend se aaye wo set kar do
      });
    }
  }, [selfPharmacy]);

  const options = (states || []).map((s: State) => ({
    label: s.state_name,
    value: s.id,
  }));

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // 👇 Password banane ka logic
    if (name === "user_name" || name === "login_id") {
      const first4 = (name === "user_name" ? value : formData.user_name).slice(
        0,
        4
      );
      const last5 = (
        name === "login_id" ? value : formData.login_id ?? ""
      ).slice(-5);
      setPassword(first4 + last5);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formDataToSend = new FormData();

    // ✅ All fields append type-safe
    Object.entries(formData).forEach(([key, value]) => {
      if (key === "uploadedFiles") return;
      if (value !== undefined && value !== null) {
        if (value instanceof File || value instanceof Blob) {
          formDataToSend.append(key, value);
        } else {
          formDataToSend.append(key, String(value));
        }
      }
    });

    // ✅ Files
    if (formData.uploadedFiles && formData.uploadedFiles.length > 0) {
      formData.uploadedFiles.forEach((file: File) => {
        formDataToSend.append("documents", file);
      });
    }

    // Clear previous errors
    setFieldErrors({});

    try {
      await dispatch(patchPharmacy(formDataToSend)).unwrap();
      toast.success("Profile updated successfully!");
      router.push("/view-profile");
    } catch (err: unknown) {
      if (err && typeof err === "object" && "errors" in err) {
        const backendError = err as {
          errors?: Record<string, string[]>;
          message?: string;
        };
        if (backendError.errors) {
          // ✅ Field-level errors only
          const newFieldErrors: Record<string, string> = {};
          Object.entries(backendError.errors).forEach(([field, messages]) => {
            newFieldErrors[field] = messages[0];
          });
          setFieldErrors(newFieldErrors);
          // ❌ No toast for field-level errors
        } else if (backendError.message) {
          // Only show toast for generic backend message
          console.error(backendError.message);
        }
      } else if (err instanceof Error) {
        console.error(err.message);
      } else {
        toast.error("Failed to update pharmacy");
      }
    }
  };

  return (
    <>
      <Header />
      <div className="body_wrap">
        <SideNav />
        <div className="body_right">
          <div className="body_content">
            <div className="pageTitle">
              <i className="bi bi-shop-window me-2"></i>
              {"Update Profile"}
              <button
                onClick={() => router.push("/view-profile")}
                className="btn-style2 float-end pe-4 ps-4"
              >
                ← Back
              </button>
            </div>
            <div className="main_content">
              {/* <p>Generated Password: {password}</p> */}
              <form onSubmit={handleSubmit} className="row g-3">
                <Input
                  label="Pharmacy Name"
                  type="text"
                  name="pharmacy_name"
                  value={formData.pharmacy_name}
                  onChange={handleChange}
                  error={fieldErrors.pharmacy_name}
                  required
                />
                <Input
                  type="text"
                  label="Contact Person"
                  name="user_name"
                  value={formData.user_name}
                  onChange={handleChange}
                  error={fieldErrors.user_name}
                  required
                />
                <Input
                  type="text"
                  label="GST Number"
                  name="gst_number"
                  value={formData.gst_number}
                  onChange={handleChange}
                  error={fieldErrors.gst_number}
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
                  label="Mobile"
                  name="login_id"
                  value={formData.login_id}
                  onChange={handleChange}
                  error={fieldErrors.login_id}
                  required
                />
                <Input
                  type="text"
                  label="Address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  error={fieldErrors.address}
                  required
                />
                <Input
                  type="text"
                  label="District"
                  name="district"
                  value={formData.district}
                  onChange={handleChange}
                  error={fieldErrors.district}
                  required
                />
                <Input
                  type="text"
                  label="Pincode"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleChange}
                  error={fieldErrors.pincode}
                  required
                />
                <SelectInput
                  label="State"
                  name="state"
                  value={formData.state}
                  options={options}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      state: parseInt(e.target.value, 10), // 👈 number me convert
                    }))
                  }
                  error={fieldErrors.state}
                />
                <Input
                  label="Status"
                  name="status"
                  type="select"
                  value={formData.status}
                  options={[
                    { label: "Active", value: "Active" },
                    { label: "Inactive", value: "Inactive" },
                  ]}
                  onChange={handleChange}
                  error={fieldErrors.status}
                  readOnly
                />
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
                    setFormData((prev) => ({
                      ...prev,
                      uploadedFiles: files,
                    }))
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
