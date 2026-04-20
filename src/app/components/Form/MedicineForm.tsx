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
  createMedicineThunk,
  getMedicineEditByIdThunk,
  getMedicineListById,
  updateMedicineListById,
  updateMedicineThunk,
} from "@/lib/features/medicineSlice/medicineSlice";
import { decodeId } from "@/lib/utils/encodeDecode";
import { fetchDoseFormThunk } from "@/lib/features/doseFormSlice/doseFormSlice";
import { DoseForm } from "@/types/doseForm";

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
  //console.log("id", id);
  const { list: units } = useAppSelector((state) => state.unit);
  const { list: generics } = useAppSelector((state) => state.generic);
  const { list: manufacturers } = useAppSelector((state) => state.manufacturer);
  const { list: categories } = useAppSelector((state) => state.category);
  const { list: subcategories } = useAppSelector((state) => state.subcategory);
  const { list: doseForm } = useAppSelector((state) => state.doseForm);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<MedicineFormData>>({
    id: 0,
    medicine_name: "",
    pack_size: "",
    prescription_required: 1,
    H1_Restricted: 0,
    HSN_Code: "",
    brand_category: "",
    // unit: "",
    // generic: "",
    // manufacturer: "",
    category: 1,
    sub_category: null,
    discount: 0,
    GST: 0,
    variant: "1",
    description: "",
    direction_for_use: "",
    side_effect: "",
    storage: "",
    uses_benefits: "",
    mrp: "",
    // dose_form: "",
    status: "Active",
    generic_id: null,
    unit_id: null,
    manufacturer_id: null,
    dose_form_id: null,
  });

  // ✅ Load data when editing
  useEffect(() => {
    if (!decodedId) return;

    setLoading(true);
    dispatch(getMedicineEditByIdThunk(decodedId))
      .unwrap()
      .then((res) => {
        // console.log("API RES 👉", res);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const data = res.data as any;

        if (!data) return;

        setFormData((prev) => ({
          ...prev,
          ...data,
          H1_Restricted: Number(data.H1_Restricted ?? 0),
          prescription_required: Number(data.prescription_required ?? 0),
          generic_id: Number(data.generic_id) || null,
          unit_id: Number(data.unit_id) || null,
          manufacturer_id: Number(data.manufacture_id) || null,
          dose_form_id: Number(data.dose_form_id) || null,
        }));
      })
      .catch((err) => console.error("Error fetching medicine:", err))
      .finally(() => setLoading(false));
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
    dispatch(fetchDoseFormThunk());
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

  // DoseForm dropdown options
  const doseFormOptions = (doseForm || []).map((m: DoseForm) => ({
    label: m.doses_form,
    value: m.id,
  }));

  // const handleChange = (
  //   e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  // ) => {
  //   const { name, value } = e.target;

  //   setFormData((prev) => ({
  //     ...prev,
  //     [name]:
  //       name === "H1_Restricted" || name === "prescription_required"
  //         ? Number(value)
  //         : value,
  //   }));
  // };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    let updatedValue: string | number = value;

    switch (name) {
      // ✅ Medicine Name (alpha + digit, max 50)
      case "medicine_name":
        if (/^[a-zA-Z0-9 ]*$/.test(value)) {
          updatedValue = value.slice(0, 50);
        } else return;
        break;

      // ✅ Pack Size (alpha + digit, max 10)
      case "pack_size":
        if (/^[a-zA-Z0-9 ]*$/.test(value)) {
          updatedValue = value.slice(0, 10);
        } else return;
        break;

      // ✅ HSN Code (alpha + digit, max 10)
      case "HSN_Code":
        if (/^[a-zA-Z0-9]*$/.test(value)) {
          updatedValue = value.slice(0, 10);
        } else return;
        break;

      // ✅ GST (only number, max 2 digit)
      case "GST":
        if (/^\d*$/.test(value)) {
          updatedValue = value.slice(0, 2);
        } else return;
        break;

      // ✅ Discount (only number, max 2 digit)
      case "discount":
        if (/^\d*$/.test(value)) {
          updatedValue = value.slice(0, 2);
        } else return;
        break;

      // ✅ MRP (only number, max 6 digit)
      case "mrp":
        if (/^\d*$/.test(value)) {
          updatedValue = value.slice(0, 6);
        } else return;
        break;

      // ✅ Select fields (number conversion FIX)
      case "H1_Restricted":
      case "prescription_required":
      case "brand_category":
        updatedValue = Number(value);
        break;

      default:
        updatedValue = value;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: updatedValue,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.medicine_name) {
      return toast.error("Product Name is required");
    }

    if (formData.medicine_name.length > 50) {
      return toast.error("Product Name max 50 characters");
    }

    if (formData.pack_size && formData.pack_size.length > 20) {
      return toast.error("Pack Size max 20 characters");
    }

    if (formData.HSN_Code && formData.HSN_Code.length > 10) {
      return toast.error("HSN Code max 10 characters");
    }

    if (formData.GST && Number(formData.GST) > 99) {
      return toast.error("GST max 2 digit only");
    }

    if (formData.discount && Number(formData.discount) > 99) {
      return toast.error("Discount max 2 digit only");
    }

    if (formData.mrp && formData.mrp.length > 6) {
      return toast.error("MRP max 6 digit only");
    }

    const formDataToSend = new FormData();

    // 🔹 Basic fields
    formDataToSend.append("medicine_name", formData.medicine_name || "");
    formDataToSend.append("pack_size", formData.pack_size || "");
    formDataToSend.append(
      "prescription_required",
      String(formData.prescription_required ?? 1)
    );

    // 🔹 Relations (IDs)
    if (formData.generic_id)
      formDataToSend.append("generic_id", String(formData.generic_id));

    if (formData.manufacturer_id)
      formDataToSend.append(
        "manufacture_id",
        String(formData.manufacturer_id) // ⚠ backend key
      );

    if (formData.unit_id)
      formDataToSend.append("unit_id", String(formData.unit_id));

    if (formData.category)
      formDataToSend.append("category_id", String(formData.category));

    if (formData.dose_form_id)
      formDataToSend.append("dose_form_id", String(formData.dose_form_id));

    // 🔹 Text fields
    formDataToSend.append("description", formData.description || "");
    formDataToSend.append("uses_benefits", formData.uses_benefits || "");
    formDataToSend.append("side_effect", formData.side_effect || "");
    formDataToSend.append(
      "direction_for_use",
      formData.direction_for_use || ""
    );
    formDataToSend.append("storage", formData.storage || "");

    // 🔹 Optional / forced blank
    formDataToSend.append("product_introduction", "");
    formDataToSend.append("variant_id", "");

    // 🔹 Pricing & misc
    formDataToSend.append("GST", String(formData.GST || ""));
    formDataToSend.append("discount", String(formData.discount || 0));
    formDataToSend.append("H1_Restricted", String(formData.H1_Restricted ?? 0));
    formDataToSend.append("HSN_Code", formData.HSN_Code || "");
    // formDataToSend.append("brand_category", formData.brand_category || "");
    // formDataToSend.append("mrp", formData.mrp || "");
    formDataToSend.append("status", formData.status || "Active");

    // // 🔹 Images (multiple)
    // if (formData.uploadedFiles?.length) {
    //   formData.uploadedFiles.forEach((file) => {
    //     formDataToSend.append("images", file);
    //   });
    // }

    // 🔹 Update mode
    if (decodedId) {
      formDataToSend.append("id", String(decodedId));
    }

    // 🧪 Debug
    // for (const [key, value] of formDataToSend.entries()) {
    //   console.log("📦", key, value);
    // }

    try {
      setLoading(true);

      if (decodedId) {
        await dispatch(
          updateMedicineThunk({
            id: decodedId,
            data: formDataToSend,
          })
        ).unwrap();
        toast.success("Medicine updated successfully");
      } else {
        await dispatch(createMedicineThunk(formDataToSend)).unwrap();
        toast.success("Medicine added successfully");
      }

      router.push("/medicine");
    } catch (error) {
      const err = error as AxiosError<{ message?: string; detail?: string }>;
      toast.error(
        err.response?.data?.message || err.response?.data?.detail || err.message
      );
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
                  label="HSN Code"
                  type="text"
                  name="HSN_Code"
                  value={formData.HSN_Code || ""}
                  onChange={handleChange}
                  //required
                />
                <Input
                  label="GST"
                  type="text"
                  name="GST"
                  value={formData.GST || ""}
                  onChange={handleChange}
                  //required
                />
                <Input
                  label="Prescription Required"
                  type="select"
                  name="prescription_required"
                  value={formData.prescription_required}
                  onChange={handleChange}
                  // required
                  options={[
                    { value: 1, label: "Yes" },
                    { value: 0, label: "No" },
                  ]}
                />
                <Input
                  label="H1 Restricted"
                  type="select"
                  name="H1_Restricted"
                  value={formData.H1_Restricted}
                  onChange={handleChange}
                  options={[
                    { value: 0, label: "No" },
                    { value: 1, label: "Yes" },
                  ]}
                />

                <CustomSelectInput
                  label="Salt Composition (Generic)"
                  name="generic_id"
                  value={formData.generic_id ?? ""}
                  options={genericOptions}
                  onChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      generic_id: Number(value),
                    }))
                  }
                />

                <CustomSelectInput
                  label="Unit"
                  name="unit_id"
                  value={formData.unit_id ?? ""}
                  options={unitOptions}
                  onChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      unit_id: Number(value),
                    }))
                  }
                />

                <CustomSelectInput
                  label="Manufacturer"
                  name="manufacturer_id"
                  value={formData.manufacturer_id ?? ""}
                  options={manufactureOptions}
                  onChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      manufacturer_id: Number(value),
                    }))
                  }
                />
                <CustomSelectInput
                  label="Doses Form"
                  name="dose_form_id"
                  value={formData.dose_form_id ?? ""}
                  options={doseFormOptions}
                  onChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      dose_form_id: Number(value),
                    }))
                  }
                />

                <Input
                  label="Brand Category"
                  type="select"
                  name="brand_category"
                  value={formData.brand_category}
                  onChange={handleChange}
                  options={[
                    { value: 1, label: "Top Brand" },
                    { value: 2, label: "Medium Brand" },
                    { value: 3, label: "Low Brand" },
                  ]}
                />

                <Input
                  label="Discount"
                  type="text"
                  name="discount"
                  value={formData.discount || ""}
                  onChange={handleChange}
                  //required
                />

                <Input
                  label="MRP"
                  type="text"
                  name="mrp"
                  value={formData.mrp || ""}
                  onChange={handleChange}
                  //required
                />
                {/* <CustomSelectInput
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
                /> */}

                {/* <CustomSelectInput
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
                /> */}

                {/* <CustomSelectInput
                  label="Variant"
                  name="variant"
                  value={formData.variant || ""}
                  options={doseFormOptions}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      sub_category: e.toString(),
                    }))
                  }
                /> */}

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
                {/* <InputFile
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
                /> */}

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
