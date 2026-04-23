"use client";

import { useEffect, useState } from "react";
import type { Pharmacist } from "@/types/pharmacist";
import "@/app/admin/css/admin-style.css";
import {
  createPharmacistApi,
  updatePharmacistApi,
  fetchPharmacistByIdApi,
  fetchPharmacistApi,
} from "@/lib/api/pharmacist";
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
import { fetchPharmacist } from "@/lib/features/pharmacistSlice/pharmacistSlice";
import PharmacyDropdown from "@/app/components/Input/PharmacyDropdown";
import { fetchPharmacyList } from "@/lib/features/pharmacyListSlice/pharmacyListSlice";
import { AppDispatch, RootState } from "@/lib/store";
import LicenseInput from "../Input/LicenseInput";
import EmailInput from "../Input/EmailInput";
import MobileInput from "../Input/MobileInput";
import AadharInput from "../Input/AadharInput";
const mediaBase = process.env.NEXT_PUBLIC_MEDIA_BASE_URL;
interface Props {
  id?: number; // agar edit mode hai to id milegi
}

interface State {
  id: number;
  state_name: string;
}

export default function PharmacistForm({ id }: Props) {
  const router = useRouter();
  const [formData, setFormData] = useState<Pharmacist>({
    id: 0,
    pharmacy_id: 0,
    user_name: "",
    pharmacy_name: "",
    license_number: "",
    license_valid_upto: "",
    gender: "",
    email_id: "",
    date_of_birth: "",
    aadhar_number: "",
    status: "Active",
    login_id: "",
    uploadedFiles: [],
    documents: [],
    profile_pic: null,
  });

  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [removedDocumentIds, setRemovedDocumentIds] = useState<number[]>([]);

  const dispatch = useAppDispatch();
  const { list, loading: pharmacyListLoading } = useAppSelector(
    (state: RootState) => state.pharmacyList
  );

  useEffect(() => {
    dispatch(fetchPharmacyList());
  }, [dispatch]);

  // ✅ list ka type pharmacyData h (id + pharmacy_name)
  const options = list.map((p) => ({
    label: p.pharmacy_name ?? "-",
    value: p.id,
  }));

  // ✅ Load data when editing
  useEffect(() => {
    if (id) {
      setLoading(true);
      fetchPharmacistByIdApi(id)
        .then((res) => {
          setFormData((prev) => ({
            ...prev,
            ...res,
            id: res.id ?? id,
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

    // 👇 Password banane ka logic
    if (name === "user_name" || name === "mobile_number") {
      const first4 = (name === "user_name" ? value : formData.user_name).slice(
        0,
        4
      );
      const last5 = (
        name === "mobile_number" ? value : formData.login_id
      ).slice(-5);
      setPassword(first4 + last5);
    }
  };

  const validateForm = () => {
    if (!formData.pharmacy_id) {
      toast.error("Please select pharmacy");
      return false;
    }

    if (!formData.user_name.trim()) {
      toast.error("Pharmacist name is required");
      return false;
    }

    if (!formData.gender) {
      toast.error("Please select gender");
      return false;
    }

    if (!formData.date_of_birth) {
      toast.error("Date of birth is required");
      return false;
    }

    if (formData.login_id.length !== 10) {
      toast.error("Mobile number is required");
      return false;
    }

    if (!formData.email_id.includes("@")) {
      toast.error("Email Id is required");
      return false;
    }

    // ✅ Aadhar validation (optional but must be 12 digits if filled)
    if (formData.aadhar_number) {
      const cleanAadhar = formData.aadhar_number.replace(/\D/g, ""); // only digits

      if (cleanAadhar.length !== 12) {
        toast.error("Aadhar must be 12 digits");
        return false;
      }
    }

    // if (formData.license_number.length < 12) {
    //   toast.error("License number is required");
    //   return false;
    // }

    // if (!formData.license_valid_upto) {
    //   toast.error("License validity date is required");
    //   return false;
    // }

    return true;
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    //console.log("🚀 handleSubmit called, current formData:", formData);
    if (!validateForm()) return;
    const formDataToSend = new FormData();

    // string / number fields
    formDataToSend.append("pharmacy_id", String(formData.pharmacy_id));
    formDataToSend.append("user_name", formData.user_name);
    formDataToSend.append("gender", formData.gender);
    formDataToSend.append("license_number", formData.license_number);
    formDataToSend.append("license_valid_upto", formData.license_valid_upto);
    formDataToSend.append("email_id", formData.email_id);
    formDataToSend.append("login_id", formData.login_id);
    formDataToSend.append("aadhar_number", formData.aadhar_number);
    formDataToSend.append("date_of_birth", formData.date_of_birth);
    formDataToSend.append("status", formData.status);

    // 🔑 Password -> sirf create mode me bhejna
    if (!id) {
      formDataToSend.append("password", password);
    }

    // ✅ Existing documents -> sirf jo abhi state me hain
    if (formData.documents && formData.documents.length > 0) {
      formData.documents.forEach((doc) => {
        formDataToSend.append("existing_document_ids", String(doc.id));
      });
    }

    // ✅ New uploaded files
    if (formData.uploadedFiles && formData.uploadedFiles.length > 0) {
      formData.uploadedFiles.forEach((file) => {
        formDataToSend.append("documents", file);
      });
    }

    // debug: show all FormData entries
    // for (const [key, value] of formDataToSend.entries()) {
    //   console.log("📦 FormData entry:", key, value);
    // }

    try {
      if (id) {
        await updatePharmacistApi(id, formDataToSend); // 🔑 id from props
        toast.success("Pharmacist successfully updated");

        await dispatch(fetchPharmacist()).unwrap();
        router.push("/admin/pharmacist");
      } else {
        await createPharmacistApi(formDataToSend);
        toast.success("Pharmacist successfully added");

        await dispatch(fetchPharmacist()).unwrap();
        router.push("/admin/pharmacist");
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
              {id ? "Update Pharmacist" : "Add New Pharmacist"}
              <button
                onClick={() => router.push("/pharmacist")}
                className="btn-style2 float-end pe-4 ps-4"
              >
                ← Back
              </button>
            </div>
            <div className="main_content">
              {/* <p>Generated Password: {password}</p> */}
              <form onSubmit={handleSubmit} className="row g-3">
                <SelectInput
                  label="Pharmacy Name"
                  name="pharmacy_name"
                  value={formData.pharmacy_id} // 👈 value id hogi
                  options={options}
                  onChange={(e) => {
                    const selectedId = parseInt(e.target.value, 10);
                    const selectedPharmacy = options.find(
                      (opt) => opt.value === selectedId
                    );

                    setFormData((prev) => ({
                      ...prev,
                      pharmacy_id: selectedId,
                      pharmacy_name: selectedPharmacy?.label ?? "",
                    }));
                  }}
                />

                <Input
                  type="text"
                  label="Pharmacist Name"
                  name="user_name"
                  value={formData.user_name}
                  onChange={handleChange}
                  required
                />
                <Input
                  label="Gender"
                  type="select"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
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
                  required
                  max={maxDate} // 👈 ab sirf 18 saal pehle tak select ho paayega
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
                <AadharInput
                  label="Aadhar Number"
                  name="aadhar_number"
                  value={formData.aadhar_number}
                  // required
                  onChange={(value) => {
                    const clean = value.replace(/\D/g, "");
                    if (clean.length > 12) return;

                    setFormData((prev) => ({
                      ...prev,
                      aadhar_number: value,
                    }));
                  }}
                />
                <LicenseInput
                  label="License Number"
                  name="license_number"
                  value={formData.license_number}
                  // required
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
                  // required
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
                      updated.splice(i, 1); // 👈 sirf local state se remove
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
