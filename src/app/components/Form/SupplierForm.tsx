"use client";

import { useEffect, useState } from "react";
import type { Supplier } from "@/types/supplier";
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
import SideNav from "@/app/pharmacist/components/SideNav/page";
import Header from "@/app/pharmacist/components/Header/page";
import SelectInput from "@/app/components/Input/SelectInput";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { fetchStates } from "@/lib/features/stateSlice/stateSlice";
import toast from "react-hot-toast";
import { AxiosError } from "axios";
import { fetchPharmacy } from "@/lib/features/pharmacySlice/pharmacySlice";
import {
  addSupplier,
  editSupplier,
  fetchSupplier,
  fetchSupplierById,
} from "@/lib/features/supplierSlice/supplierSlice";
import { updateSupplierApi } from "@/lib/api/supplier";
import { getUser } from "@/lib/auth/auth";
import TncLoader from "../TncLoader/TncLoader";

interface Props {
  id?: number; // agar edit mode hai to id milegi
}

interface State {
  id: number;
  state_name: string;
}

const mediaBase = process.env.NEXT_PUBLIC_MEDIA_BASE_URL;

export default function SupplierForm({ id }: Props) {
  const router = useRouter();
  const user = getUser();
  const pharmacy_id = Number(user?.pharmacy_id ?? 0);
  const pharmacist_id = Number(user?.user_id ?? 0);
  const [formData, setFormData] = useState<Partial<Supplier>>({
    id: 0,
    supplier_id_code: "",
    user_name: "",
    supplier_name: "",
    license_number: "",
    license_valid_upto: "",
    gst_number: "",
    email_id: "",
    pincode: "",
    district: "",
    state: 0,
    address: "",
    status: "Active",
    mobile_number: "",
    uploadedFiles: [],
    documents: [],
  });

  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  const dispatch = useAppDispatch();
  const { states, loading: statesLoading } = useAppSelector(
    (state) => state.states
  );
  const [password, setPassword] = useState("");

  useEffect(() => {
    dispatch(fetchStates());
  }, [dispatch]);

  const options = (states || []).map((s: State) => ({
    label: s.state_name,
    value: s.id,
  }));

  useEffect(() => {
    if (id) {
      setLoading(true);

      dispatch(fetchSupplierById(id))
        .unwrap()
        .then((res) => {
          setFormData((prev) => ({
            ...prev,
            ...res,
            id: res.id ?? id,
            mobile_number: res.login_id,
            documents: res.documents || [],
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
    if (name === "user_name" || name === "login_id") {
      const first4 = (
        name === "user_name" ? value : formData.user_name || ""
      ).slice(0, 4);
      const last5 = (
        name === "login_id" ? value : formData.login_id ?? ""
      ).slice(-5);

      setPassword(first4 + last5);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitLoading) return;
    const formDataToSend = new FormData();
    // 🟩 Common fields
    formDataToSend.append("supplier_name", formData.supplier_name || "");
    formDataToSend.append("user_name", formData.user_name || "");
    formDataToSend.append(
      "gst_number",
      (formData.gst_number || "").toUpperCase().trim()
    );
    formDataToSend.append("license_number", formData.license_number || "");
    formDataToSend.append(
      "license_valid_upto",
      formData.license_valid_upto || ""
    );
    formDataToSend.append("email_id", formData.email_id || "");
    formDataToSend.append("mobile_number", formData.mobile_number || "");
    formDataToSend.append("address", formData.address || "");
    formDataToSend.append("district", formData.district || "");
    formDataToSend.append("pincode", formData.pincode || "");
    formDataToSend.append("state", String(formData.state));
    formDataToSend.append("status", formData.status || "Active");
    formDataToSend.append("pharmacy_id", String(pharmacy_id));

    // CREATE vs UPDATE MODE
    if (!id) {
      formDataToSend.append("password", password);
    } else {
      formDataToSend.append("id", String(formData.id));
      formDataToSend.append(
        "supplier_id_code",
        formData.supplier_id_code || ""
      );
    }

    // Send IDs of old documents that should be kept
    if (formData.documents?.length) {
      formData.documents.forEach((doc) => {
        formDataToSend.append("existing_document_ids", String(doc.id));
      });
    }

    // Add NEW uploaded files only
    if (formData.uploadedFiles?.length) {
      formData.uploadedFiles.forEach((file) => {
        formDataToSend.append("documents", file);
      });
    }

    // Debug
    console.log("====== FINAL FORMDATA ======");
    for (const [k, v] of formDataToSend.entries()) {
      console.log(k, v);
    }

    try {
      setSubmitLoading(true);
      if (id) {
        await dispatch(editSupplier({ id, data: formDataToSend })).unwrap();
        toast.success("Supplier successfully updated");
        await dispatch(fetchSupplier()).unwrap();
        router.push("/pharmacist/supplier");
      } else {
        const res = await dispatch(addSupplier(formDataToSend)).unwrap();
        toast.success("Supplier successfully added");
        await dispatch(fetchSupplier()).unwrap();
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.log("🔥 FULL ERROR OBJECT:", error?.response?.data || error);

      const errorMsg =
        error?.response?.data?.message ||
        error?.response?.data?.detail ||
        error?.response?.data?.error ||
        JSON.stringify(error?.response?.data) ||
        error?.message ||
        "Unknown error occurred";

      console.error("❌ API call failed:", errorMsg);
      toast.error(errorMsg);
    } finally {
      setSubmitLoading(false); // 🔥 STOP LOADER
    }
  };

  return (
    <>
      <Header />
      <div className="body_wrap">
        <SideNav />
        <div className="body_right">
          <div className="body_content">
            {submitLoading && (
              <div
                className="position-absolute top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
                style={{
                  background: "rgba(255,255,255,0.65)",
                  backdropFilter: "blur(2px)",
                  zIndex: 20,
                }}
              >
                <div className="text-center">
                  <TncLoader />
                  <div className="fw-semibold text-muted">
                    {id ? "Updating supplier…" : "Saving supplier…"}
                  </div>
                </div>
              </div>
            )}

            <div className="pageTitle">
              <i className="bi bi-shop-window me-2"></i>
              {id ? "Update Supplier" : "Add New Supplier"}
              <button
                onClick={() => router.push("/pharmacist/supplier")}
                className="btn-style2 float-end pe-4 ps-4"
              >
                ← Back
              </button>
            </div>
            <div className="main_content">
              {/* <p>Generated Password: {password}</p> */}
              <form onSubmit={handleSubmit} className="row g-3">
                <Input
                  label="Supplier Name"
                  type="text"
                  name="supplier_name"
                  value={formData.supplier_name}
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
                  name="mobile_number"
                  value={formData.mobile_number}
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
                  label="District"
                  name="district"
                  value={formData.district}
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
                  value={formData.state || ""}
                  options={options}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      state: parseInt(e.target.value, 10), // 👈 number me convert
                    }))
                  }
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
                />
                <InputFile
                  label="Upload Documents"
                  name="documents"
                  multiple
                  accept="image/*,.pdf"
                  existing={(formData.documents ?? []).map((d) => ({
                    url: d.document.startsWith("http")
                      ? d.document
                      : `${mediaBase}${d.document}`,
                    name: d.document.split("/").pop() || "file",
                    id: d.id,
                  }))}
                  onRemoveExisting={(i) => {
                    setFormData((prev) => {
                      const updated = [...(prev.documents ?? [])]; // fallback: []
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
