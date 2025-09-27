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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("🚀 handleSubmit called, current formData:", formData);

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
    for (const [key, value] of formDataToSend.entries()) {
      console.log("📦 FormData entry:", key, value);
    }

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
                      pharmacy_id: selectedId, // 👈 backend ke liye
                      pharmacy_name: selectedPharmacy?.label ?? "", // 👈 UI me dikhane ke liye
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

                <Input
                  type="text"
                  label="Mobile"
                  name="login_id"
                  value={formData.login_id}
                  onChange={handleChange}
                  required
                />
                <Input
                  label="Email"
                  type="email"
                  name="email_id"
                  value={formData.email_id}
                  onChange={handleChange}
                  required
                />
                <Input
                  type="text"
                  label="Aadhar Number"
                  name="aadhar_number"
                  value={formData.aadhar_number}
                  onChange={handleChange}
                  required
                />
                <Input
                  type="text"
                  label="License Number"
                  name="license_number"
                  value={formData.license_number}
                  onChange={handleChange}
                  required
                />
                <Input
                  label="License Valid Upto"
                  type="date"
                  name="license_valid_upto"
                  value={formData.license_valid_upto}
                  onChange={handleChange}
                  required
                />
                <InputFile
                  label="Upload Documents"
                  name="documents"
                  multiple
                  accept="image/*,.pdf"
                  existing={formData.documents.map((d) => ({
                    url: d.document.startsWith("http")
                      ? d.document
                      : `http://68.183.174.17:8081${d.document}`,
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
