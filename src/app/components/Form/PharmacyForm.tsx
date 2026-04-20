"use client";

import { useEffect, useState } from "react";
import type { PharmacySuperAdminForm } from "@/types/pharmacy";
import "@/app/admin/css/admin-style.css";
import {
  createPharmacyApi,
  updatePharmacyApi,
  fetchPharmacyByIdApi,
  fetchPharmaciesApi,
} from "@/lib/api/pharmacy";
import { useRouter } from "next/navigation";
import InputFile from "@/app/components/Input/InputFile";
import Input from "@/app/components/Input/Input";
import SideNav from "@/app/admin/components/SideNav/page";
import Header from "@/app/admin/components/Header/page";
import SelectInput from "@/app/components/Input/SelectInput";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { fetchStates } from "@/lib/features/stateSlice/stateSlice";
import toast from "react-hot-toast";
import { AxiosError } from "axios";
import { fetchPharmacy } from "@/lib/features/pharmacySlice/pharmacySlice";
import LicenseInput from "../Input/LicenseInput";
import GSTInput from "../Input/GSTInput";
import MobileInput from "../Input/MobileInput";
import EmailInput from "../Input/EmailInput";
import PincodeInput from "../Input/PincodeInput";
const mediaBase = process.env.NEXT_PUBLIC_MEDIA_BASE_URL;
interface Props {
  id?: number; // agar edit mode hai to id milegi
}

interface State {
  id: number;
  state_name: string;
}

export default function PharmacyForm({ id }: Props) {
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

  const [loading, setLoading] = useState(false);

  const dispatch = useAppDispatch();
  const { states, loading: statesLoading } = useAppSelector(
    (state) => state.states
  );
  const [password, setPassword] = useState("");
  const [licenseError, setLicenseError] = useState("");

  useEffect(() => {
    dispatch(fetchStates());
  }, [dispatch]);

  const options = (states || []).map((s: State) => ({
    label: s.state_name,
    value: s.id,
  }));

  // ✅ Load data when editing
  useEffect(() => {
    if (id) {
      setLoading(true);
      fetchPharmacyByIdApi(id)
        .then((res) => {
          setFormData((prev) => ({
            ...prev,
            ...res,
            id: res.id ?? id,
            login_id: res.login_id,
            documents: res.documents || [], // 👈 backend ke docs aa gaye
            uploadedFiles: [],
          }));
        })
        .finally(() => setLoading(false));
    }
  }, [id]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "license_number") {
      const regex = /^[A-Z]{4}-[0-9]{6}$/;

      if (value.length > 11) return; // max length control

      if (value && !regex.test(value)) {
        setLicenseError("Please enter license in this format: DIOL-102882");
      } else {
        setLicenseError("");
      }
    }

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

  const validateForm = () => {
    if (!formData.pharmacy_name.trim()) {
      toast.error("Pharmacy name is required");
      return false;
    }

    if (!formData.user_name.trim()) {
      toast.error("Contact person is required");
      return false;
    }

    if (!formData.gst_number || formData.gst_number.length !== 15) {
      toast.error("GST number is required");
      return false;
    }

    if (!formData.license_number || formData.license_number.length < 10) {
      toast.error("License number is required");
      return false;
    }

    if (!formData.license_valid_upto) {
      toast.error("License validity date is required");
      return false;
    }

    if (!formData.email_id.includes("@")) {
      toast.error("Email id is required");
      return false;
    }

    if (!formData.login_id || formData.login_id.length !== 10) {
      toast.error("Mobile number is required");
      return false;
    }

    if (!formData.address.trim()) {
      toast.error("Address is required");
      return false;
    }

    if (!formData.district.trim()) {
      toast.error("District is required");
      return false;
    }

    if (formData.pincode.length !== 6) {
      toast.error("Pincode is required");
      return false;
    }

    if (!formData.state) {
      toast.error("Please select state");
      return false;
    }

    return true;
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    //console.log("🚀 handleSubmit called, current formData:", formData);
    if (!validateForm()) return;
    const formDataToSend = new FormData();

    // string / number fields
    formDataToSend.append("pharmacy_name", formData.pharmacy_name);
    formDataToSend.append("user_name", formData.user_name);
    formDataToSend.append("gst_number", formData.gst_number);
    formDataToSend.append("license_number", formData.license_number);
    formDataToSend.append("license_valid_upto", formData.license_valid_upto);
    formDataToSend.append("email_id", formData.email_id);
    formDataToSend.append("login_id", formData.login_id ?? "");
    formDataToSend.append("address", formData.address);
    formDataToSend.append("district", formData.district);
    formDataToSend.append("pincode", formData.pincode);
    formDataToSend.append("state", String(formData.state)); // backend ko id chahiye
    formDataToSend.append("status", formData.status);

    // ✅ password -> sirf create mode me bhejna
    if (!id) {
      formDataToSend.append("password", password);
    }

    // ✅ edit mode id + pharmacy_id_code
    if (id) {
      formDataToSend.append("id", String(formData.id));
      formDataToSend.append("pharmacy_id_code", formData.pharmacy_id_code);
    }

    // ✅ Existing documents ids (edit mode)
    if (formData.documents && formData.documents.length > 0) {
      formData.documents.forEach((doc) => {
        formDataToSend.append("existing_document_ids", String(doc.id)); // [] hata diya
      });
    }

    // ✅ New uploaded files
    if (formData.uploadedFiles && formData.uploadedFiles.length > 0) {
      formData.uploadedFiles.forEach((file) => {
        formDataToSend.append("documents", file); // backend field name ke sath match kare
      });
    }

    // debug: show all FormData entries
    // for (const [key, value] of formDataToSend.entries()) {
    //   console.log("📦 FormData entry:", key, value);
    // }

    try {
      if (id) {
        await updatePharmacyApi(id, formDataToSend);
        toast.success("✅ Pharmacy successfully updated");

        await dispatch(fetchPharmacy()).unwrap();
        router.push("/admin/pharmacy");
      } else {
        const res = await createPharmacyApi(formDataToSend);
        toast.success("✅ Pharmacy successfully added");

        await dispatch(fetchPharmacy()).unwrap();

        setFormData((prev) => ({
          ...prev,
          pharmacy_id_code: res.pharmacy_id_code ?? prev.pharmacy_id_code,
        }));

        router.push("/admin/pharmacy");
      }
    } catch (error: unknown) {
      const err = error as AxiosError<{ message?: string; detail?: string }>;
      const errorMsg =
        err.response?.data?.message ||
        err.response?.data?.detail ||
        err.message;

      console.error("❌ API call failed:", errorMsg);
      toast.error(errorMsg);
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
              {id ? "Update Pharmacy" : "Add New Pharmacy"}
              <button
                onClick={() => router.push("/pharmacy")}
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
                  required
                />
                <Input
                  type="text"
                  label="Contact Person"
                  name="user_name"
                  value={formData.user_name}
                  onChange={handleChange}
                  required
                />
                <GSTInput
                  label="GST Number"
                  name="gst_number"
                  value={formData.gst_number}
                  required
                  onChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      gst_number: value,
                    }))
                  }
                />
                <LicenseInput
                  label="License Number"
                  name="license_number"
                  value={formData.license_number}
                  required
                  onChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      license_number: value,
                    }))
                  }
                />
                <Input
                  label="License Valid Upto"
                  type="date"
                  name="license_valid_upto"
                  value={formData.license_valid_upto}
                  onChange={handleChange}
                  required
                />
                <EmailInput
                  label="Email"
                  name="email_id"
                  value={formData.email_id}
                  required
                  onChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      email_id: value,
                    }))
                  }
                />
                <MobileInput
                  label="Mobile"
                  name="login_id"
                  value={formData.login_id || ""}
                  required
                  onChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      login_id: value,
                    }))
                  }
                />
                <Input
                  type="text"
                  label="Address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                />
                <Input
                  type="text"
                  label="District"
                  name="district"
                  value={formData.district}
                  onChange={handleChange}
                  required
                />
                <PincodeInput
                  label="Pincode"
                  name="pincode"
                  value={formData.pincode}
                  required
                  onChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      pincode: value,
                    }))
                  }
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
                />
                {/* <Input
                  label="Status"
                  name="status"
                  type="select"
                  value={formData.status}
                  options={[
                    { label: "Active", value: "Active" },
                    { label: "Inactive", value: "Inactive" },
                  ]}
                  onChange={handleChange}
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
