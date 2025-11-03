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
import { useParams, useRouter } from "next/navigation";
import InputFile from "@/app/components/Input/InputFile";
import Input from "@/app/components/Input/Input";
import SideNav from "@/app/admin/components/SideNav/page";
import Header from "@/app/admin/components/Header/page";
import SelectInput from "@/app/components/Input/SelectInput";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { fetchStates } from "@/lib/features/stateSlice/stateSlice";
import toast from "react-hot-toast";
import { AxiosError } from "axios";
import InputTextArea from "@/app/components/Input/InputTextArea";
import { getCategoriesList } from "@/lib/features/categorySlice/categorySlice";
import { Category } from "@/types/category";
import { getSubcategoriesList } from "@/lib/features/subCategorySlice/subCategorySlice";
import { SubCategory } from "@/types/subCategory";
import { getUnitsAllList } from "@/lib/features/unitSlice/unitSlice";
import { getGenericsAllList } from "@/lib/features/genericSlice/genericSlice";
import { getManufacturersAllList } from "@/lib/features/manufacturerSlice/manufacturerSlice";
import { Unit } from "@/types/unit";
import { Generic } from "@/types/generic";
import { Manufacturer } from "@/types/manufacturer";
import { Medicine, MedicineFormData } from "@/types/medicine";
import CustomSelectInput from "@/app/components/Input/CustomSelectInput";
import RichTextEditor from "@/app/components/Input/RichTextEditor";
import {
  clearSelectedMedicine,
  getMedicineListById,
  updateMedicineListById,
} from "@/lib/features/medicineSlice/medicineSlice";
import { decodeId } from "@/lib/utils/encodeDecode";

interface Props {
  id?: number; // agar edit mode hai to id milegi
}

interface State {
  id: number;
  state_name: string;
}

export default function MedicineForm({ id }: Props) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  // const { id: params } = useParams();
  // const decodedId = decodeId(params);
  const decodedId = id;
  const { medicinesList: medicinesDetails } = useAppSelector(
    (state) => state.medicine
  );
  const { list: units } = useAppSelector((state) => state.unit);
  const { list: generics } = useAppSelector((state) => state.generic);
  const { list: manufacturers } = useAppSelector((state) => state.manufacturer);
  const { list: categories } = useAppSelector((state) => state.category);
  const { list: subcategories } = useAppSelector((state) => state.subcategory);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<MedicineFormData>>({
    id: 0,
    medicine_name: "",
    pack_size: "",
    prescription_required: 1,
    unit: "",
    generic: "",
    manufacturer: "",
    category: "",
    sub_category: "",
    description: "",
    direction_for_use: "",
    side_effect: "",
    storage: "",
    uses_benefits: "",
    dose_form: "",
    status: "Active",
    uploadedFiles: [],
    documents: [],
  });

  // ✅ Load data when editing
  useEffect(() => {
    if (decodedId) {
      setLoading(true);
      dispatch(getMedicineListById(decodedId))
        .unwrap()
        .then((res) => {
          const data = Array.isArray(res) ? res[0] : res;
          if (data) {
            setFormData((prev) => ({ ...prev, ...data }));
          }
        })
        .catch((err) => console.error("Error fetching medicine:", err))
        .finally(() => setLoading(false));
    }
  }, [decodedId, dispatch]);

  // ✅ agar Redux state me update ho to bhi reflect kar
  useEffect(() => {
    if (medicinesDetails && Object.keys(medicinesDetails).length > 0) {
      setFormData((prev) => ({
        ...prev,
        ...medicinesDetails,
      }));
    }
  }, [medicinesDetails]);

  useEffect(() => {
    dispatch(getCategoriesList());
    dispatch(getSubcategoriesList());
    dispatch(getUnitsAllList());
    dispatch(getGenericsAllList());
    dispatch(getManufacturersAllList());
  }, [dispatch]);

  // // Category dropdown options
  // const categoryOptions = (categories || []).map((c: Category) => ({
  //   label: c.category_name,
  //   value: c.id, // category id
  // }));

  // Category dropdown (only Medicines)
  const categoryOptions = (categories || [])
    .filter((c: Category) => c.category_name === "Medicines")
    .map((c: Category) => ({
      label: c.category_name,
      value: c.id, // category id
    }));

  // Subcategory dropdown (filtered dynamically)
  const selectedCategoryName = categories.find(
    (c) => Number(c.id) === Number(formData.category)
  )?.category_name;

  const subCategoryOptions = (subcategories ?? [])
    .filter((sc: SubCategory) => sc.category_name === selectedCategoryName)
    .map((sc: SubCategory) => ({
      label: sc.sub_category_name,
      value: sc.id,
    }));

  // Unit dropdown options
  const unitOptions = (units || []).map((u: Unit) => ({
    label: u.unit,
    value: u.id_unit,
  }));

  // Generic dropdown options
  const genericOptions = (generics || []).map((g: Generic) => ({
    label: g.generic_name,
    value: g.id_generic,
  }));

  // Manufacture dropdown options
  const manufactureOptions = (manufacturers || []).map((m: Manufacturer) => ({
    label: m.manufacturer_name,
    value: m.id_manufacturer,
  }));

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("🚀 Submitting formData:", formData);

    const formDataToSend = new FormData();

    // formDataToSend.append("medicine_name", formData.medicine_name || "");
    // formDataToSend.append("pack_size", formData.pack_size || "");
    // formDataToSend.append(
    //   "prescription_required",
    //   String(formData.prescription_required ?? 1)
    // );
    // formDataToSend.append("unit", String(formData.unit || ""));
    // formDataToSend.append("generic", String(formData.generic || ""));
    // formDataToSend.append("manufacturer", String(formData.manufacturer || ""));
    // formDataToSend.append("category", String(formData.category || ""));
    // formDataToSend.append("sub_category", String(formData.sub_category || ""));
    formDataToSend.append("description", formData.description || "");
    formDataToSend.append(
      "direction_for_use",
      formData.direction_for_use || ""
    );
    formDataToSend.append("side_effect", formData.side_effect || "");
    formDataToSend.append("storage", formData.storage || "");
    formDataToSend.append("uses_benefits", formData.uses_benefits || "");
    formDataToSend.append("status", formData.status || "Active");

    // ✅ id bhejna zaruri hai update mode me
    if (decodedId) {
      formDataToSend.append("id", String(decodedId));
    }

    // ✅ Old documents
    if (formData.documents && formData.documents.length > 0) {
      formData.documents.forEach((doc) => {
        if (doc.id)
          formDataToSend.append("existing_document_ids", String(doc.id));
      });
    }

    // ✅ New uploaded files
    if (formData.uploadedFiles && formData.uploadedFiles.length > 0) {
      formData.uploadedFiles.forEach((file) => {
        formDataToSend.append("documents", file);
      });
    }

    for (const [key, value] of formDataToSend.entries()) {
      console.log("📦", key, value);
    }

    try {
      setLoading(true);
      if (decodedId) {
        await dispatch(
          updateMedicineListById({
            id: decodedId,
            data: formDataToSend,
          })
        ).unwrap();
        toast.success("Medicine updated successfully");
      } else {
        //await createMedicineApi(formDataToSend);
        toast.success("Medicine added successfully");
      }

      router.push("/medicine");
    } catch (error) {
      const err = error as AxiosError<{ message?: string; detail?: string }>;
      const errorMsg =
        err.response?.data?.message ||
        err.response?.data?.detail ||
        err.message ||
        "Unknown error";
      console.error("❌ API Error:", errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
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
              {decodedId ? "Update Medicine" : "Add Medicine"}
              <button
                onClick={() => router.push("/medicine")}
                className="btn-style2 float-end pe-4 ps-4"
              >
                ← Back
              </button>
            </div>
            <div className="main_content">
              {/* <p>Generated Password: {password}</p> */}
              <form onSubmit={handleSubmit} className="row g-3">
                <Input
                  label="Madicine Name"
                  type="text"
                  name="medicine_name"
                  value={formData.medicine_name || ""}
                  onChange={handleChange}
                  //required
                />
                <Input
                  label="Pack Size"
                  type="text"
                  name="pack_size"
                  value={formData.pack_size || ""}
                  onChange={handleChange}
                  //required
                />
                <Input
                  label="Prescription Required"
                  type="select"
                  name="prescription_required"
                  value={formData.prescription_required || ""}
                  onChange={handleChange}
                  // required
                  options={[
                    { value: 1, label: "Yes" },
                    { value: 0, label: "No" },
                  ]}
                />
                <CustomSelectInput
                  label="Salt Composition (Generic)"
                  name="generic"
                  value={formData.generic || ""}
                  options={genericOptions}
                  onChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      generic: value.toString(),
                    }))
                  }
                  // onAddOption={(label) => {
                  //   dispatch(addGeneric({ label, value: label })); // ✅ action dispatch
                  // }}
                  //required
                />

                <CustomSelectInput
                  label="Unit"
                  name="unit"
                  value={formData.unit || ""}
                  options={unitOptions}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      unit: e.toString(),
                    }))
                  }
                />
                <CustomSelectInput
                  label="Manufacturer"
                  name="manufacturer"
                  value={formData.manufacturer || ""}
                  options={manufactureOptions}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      manufacturer: e.toString(),
                    }))
                  }
                />
                <CustomSelectInput
                  label="Category"
                  name="category"
                  value={formData.category || ""}
                  options={categoryOptions}
                  onChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      category: String(value),
                      sub_category: "",
                    }))
                  }
                />

                <CustomSelectInput
                  label="Sub Category"
                  name="sub_category"
                  value={formData.sub_category || ""}
                  options={subCategoryOptions}
                  onChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      sub_category: String(value),
                    }))
                  }
                />

                <CustomSelectInput
                  label="Doses Form"
                  name="sub_category"
                  value={formData.sub_category || ""}
                  options={subCategoryOptions}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      sub_category: e.toString(),
                    }))
                  }
                />
                <RichTextEditor
                  label="Description"
                  name="description"
                  value={formData.description || ""}
                  onChange={(val) =>
                    setFormData((prev) => ({ ...prev, description: val }))
                  }
                  // required
                  colClass="col-md-12"
                />
                <RichTextEditor
                  label="Uses Benefits"
                  name="uses_benefits"
                  value={formData.uses_benefits || ""}
                  onChange={(val) =>
                    setFormData((prev) => ({ ...prev, uses_benefits: val }))
                  }
                  // required
                  colClass="col-md-12"
                />
                <RichTextEditor
                  label="Side Effect"
                  name="side_effect"
                  value={formData.side_effect || ""}
                  onChange={(val) =>
                    setFormData((prev) => ({ ...prev, side_effect: val }))
                  }
                  required
                />
                <RichTextEditor
                  label="Direction For Use"
                  name="direction_for_use"
                  value={formData.direction_for_use || ""}
                  onChange={(val) =>
                    setFormData((prev) => ({ ...prev, direction_for_use: val }))
                  }
                  // required
                  colClass="col-md-12"
                />
                <div className="col-md-12">
                  <div className="txt_col">
                    <span className="lbl1">Storage</span>
                    <input
                      type="text"
                      className="txt1"
                      name="storage"
                      value={formData.storage || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, storage: e.target.value })
                      }
                      // required
                    />
                  </div>
                </div>
                <InputFile
                  label="Upload Product Picture"
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
                      const updated = [...(prev.documents || [])];
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
