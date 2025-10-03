"use client";

import { useEffect, useState } from "react";
import type { ClinicAdd } from "@/types/clinic";
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
import MultiSelect from "../MultiSelectDropdown/MultiSelectDropdown";
import { fetchClinics } from "@/lib/features/clinicSlice/clinicSlice";

interface Props {
  id?: number; // agar edit mode hai to id milegi
}

interface State {
  id: number;
  state_name: string;
}

export default function ClinicForm({ id }: Props) {
  const router = useRouter();
  const [formData, setFormData] = useState<ClinicAdd>({
    id: 0,
    clinic_id_code: "",
    user_name: "",
    clinicName: "",
    clinic_type: "",
    license_number: "",
    license_valid_upto: "",
    gst_number: "",
    email_id: "",
    pincode: "",
    district: "",
    state: 0,
    address: "",
    number_of_doctors: "",
    number_of_staff: "",
    department_specialties: "",
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
  const [selectedClinic, setSelectedClinic] = useState<string[]>([]);

  const clinicOptions = [
    { value: "General Medicine", label: "General Medicine" },
    { value: "Pediatrics", label: "Pediatrics" },
    { value: "Ortho", label: "Ortho" },
  ];

  useEffect(() => {
    dispatch(fetchStates());
  }, [dispatch]);

  const options = (states || []).map((s: State) => ({
    label: s.state_name,
    value: s.id,
  }));

  // ✅ Load data when editing
  // useEffect(() => {
  //   if (id) {
  //     setLoading(true);
  //     fetchClinics(id)
  //       .then((res) => {
  //         setFormData((prev) => ({
  //           ...prev,
  //           ...res,
  //           id: res.id ?? id,
  //           login_id: res.login_id,
  //          // documents: res.documents || [],
  //          // uploadedFiles: [],
  //         }));
  //       })
  //       .finally(() => setLoading(false));
  //   }
  // }, [id]);

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
    console.log("🚀 handleSubmit called, current formData:", formData);

    const formDataToSend = new FormData();

    // string / number fields
    formDataToSend.append("clinicName", formData.clinicName || "");
    formDataToSend.append("user_name", formData.user_name || "");
    formDataToSend.append("gst_number", formData.gst_number || "");
    formDataToSend.append("license_number", formData.license_number || "");
    formDataToSend.append(
      "license_valid_upto",
      formData.license_valid_upto || ""
    );
    formDataToSend.append("email_id", formData.email_id || "");
    formDataToSend.append("login_id", formData.login_id ?? "");
    formDataToSend.append("address", formData.address || "");
    formDataToSend.append("district", formData.district || "");
    formDataToSend.append(
      "department_specialties",
      formData.department_specialties
    );
    formDataToSend.append("number_of_staff", formData.number_of_staff);
    formDataToSend.append("number_of_doctors", formData.number_of_doctors);
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
      formDataToSend.append("clinic_id_code", formData.clinic_id_code);
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
    for (const [key, value] of formDataToSend.entries()) {
      console.log("📦 FormData entry:", key, value);
    }

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
          //pharmacy_id_code: res.pharmacy_id_code ?? prev.pharmacy_id_code,
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
              {id ? "Update Hospital/Clinic" : "Add New Hospital/Clinic"}
              <button
                onClick={() => router.push("/clinic")}
                className="btn-style2 float-end pe-4 ps-4"
              >
                ← Back
              </button>
            </div>
            <div className="main_content">
              {/* <p>Generated Password: {password}</p> */}
              <form onSubmit={handleSubmit} className="row g-3">
                <Input
                  label="Hospital/Clinic Name"
                  type="text"
                  name="clinicName"
                  value={formData.clinicName}
                  onChange={handleChange}
                  required
                />
                <Input
                  label="Hospital/Clinic Type"
                  type="select"
                  name="clinic_type"
                  value={formData.clinic_type}
                  onChange={handleChange}
                  required
                  options={[
                    { value: "Single Doctor", label: "Single Doctor" },
                    { value: "Multi-specialty", label: "Multi-specialty" },
                    { value: "Diagnostic center", label: "Diagnostic center" },
                  ]}
                />
                <Input
                  type="text"
                  label="Number Of Doctors"
                  name="number_of_doctors"
                  value={formData.number_of_doctors}
                  onChange={handleChange}
                  required
                />
                <Input
                  type="text"
                  label="Owner Name"
                  name="user_name"
                  value={formData.user_name}
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
                  label="Mobile"
                  name="login_id"
                  value={formData.login_id}
                  onChange={handleChange}
                  required
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
                  label="Pincode"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleChange}
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
                />
                {/* <Input
                  label="Departments / Specialties"
                  type="select"
                  name="department_specialties"
                  value={formData.department_specialties}
                  onChange={handleChange}
                  required
                  options={[
                    { value: "General Medicine", label: "General Medicine" },
                    { value: "Pediatrics", label: "Pediatrics" },
                    { value: "Ortho", label: "Ortho" },
                  ]}
                /> */}
                {/* <div className="col-md-4">
                  <div className="txt_col">
                    <span className="lbl1">Departments / Specialties</span>
                    <MultiSelect
                      options={clinicOptions}
                      selected={selectedClinic}
                      onChange={setSelectedClinic}
                      placeholder="--Select--"
                      itemName="Departments / Specialties"
                    />
                  </div>
                </div>
                <Input
                  type="text"
                  label="Number of Staff"
                  name="number_of_staff"
                  value={formData.number_of_staff}
                  onChange={handleChange}
                  required
                /> */}
                <Input
                  type="text"
                  label="GST Number"
                  name="gst_number"
                  value={formData.gst_number}
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
                  label="Upload Documents (License PDF/Image, Certificate, etc.)"
                  name="documents"
                  multiple
                  accept="image/*,.pdf"
                  // existing={formData.documents.map((d) => ({
                  //   url: d.document.startsWith("http")
                  //     ? d.document
                  //     : `http://68.183.174.17:8081${d.document}`,
                  //   name: d.document.split("/").pop() || "file",
                  //   id: d.id,
                  // }))}
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
