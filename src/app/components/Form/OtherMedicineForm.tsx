"use client";

import { useEffect, useState } from "react";
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
import { MedicineFormData } from "@/types/medicine";
import CustomSelectInput from "@/app/components/Input/CustomSelectInput";
import RichTextEditor from "@/app/components/Input/RichTextEditor";
import MultiSelectDropdown from "@/app/components/Input/MultiSelectDropdown";
import { decodeId } from "@/lib/utils/encodeDecode";
import {
  createMedicineThunk,
  getMedicineEditByIdThunk,
  getMedicineListById,
  updateMedicineListById,
  updateMedicineThunk,
} from "@/lib/features/medicineSlice/medicineSlice";
import { fetchDoseFormThunk } from "@/lib/features/doseFormSlice/doseFormSlice";
import { DoseForm } from "@/types/doseForm";

interface Props {
  id?: number; // agar edit mode hai to id milegi
}
// interface Category {
//   id: number;
//   category_name: string;
// }

// interface SubCategory {
//   id: number;
//   sub_category_name: string;
//   category_name: string;
// }

interface Option {
  label: string;
  value: number | string;
}

export default function OtherMedicineForm({ id }: Props) {
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
  const { list: doseForm } = useAppSelector((state) => state.doseForm);

  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [selectedSubCategories, setSelectedSubCategories] = useState<number[]>(
    []
  );
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<MedicineFormData>>({
    id: 0,
    medicine_name: "",
    pack_size: "",
    product_introduction: "",
    H1_Restricted: 0,
    HSN_Code: "",
    prescription_required: 0,
    discount: 0,
    GST: 0,
    variant: "1",
    category: null,
    mrp: "",
    sub_category: null,
    description: "",
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
        console.log("API RES 👉", res);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const data = res.data as any;

        if (!data) return;

        setFormData((prev) => ({
          ...prev,
          ...data,
          H1_Restricted: Number(data.H1_Restricted ?? 0),
          prescription_required: Number(data.prescription_required ?? 0),
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
  // const categoryOptions = (categories || [])
  //   .filter((c: Category) => c.category_name !== "Medicines") // ye line Medicines hata degi
  //   .map((c: Category) => ({
  //     label: c.category_name,
  //     value: c.id, // category id
  //   }));

  // // Subcategory dropdown options (filtered dynamically)
  // const selectedCategoryName = categories.find(
  //   (c) => Number(c.id) === Number(formData.category)
  // )?.category_name;

  // const subCategoryOptions = (subcategories ?? [])
  //   .filter((sc: SubCategory) => sc.category_name === selectedCategoryName)
  //   .map((sc: SubCategory) => ({
  //     label: sc.sub_category_name,
  //     value: sc.id,
  //   }));

  // Category options excluding Medicines
  const categoryOptions: Option[] = (categories || [])
    .filter((c: Category) => c.category_name !== "Medicines")
    .map((c: Category) => ({ label: c.category_name, value: c.id }));

  // Handle category selection with max 3
  const handleCategoryChange = (selected: number[]) => {
    if (selected.length <= 3) setSelectedCategories(selected);
    else alert("You can select up to 3 categories only!");
  };

  // Get subcategories grouped by selected category
  const groupedSubCategories: { [key: number]: SubCategory[] } = {};
  selectedCategories.forEach((catId) => {
    groupedSubCategories[catId] = (subcategories || []).filter(
      (sc: SubCategory) =>
        sc.category_name ===
        categories.find((c) => c.id === catId)?.category_name
    );
  });

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

  // const handleChange = (
  //   e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  // ) => {
  //   const { name, value } = e.target;

  //   setFormData((prev) => ({
  //     ...prev,
  //     [name]: value,
  //   }));
  // };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    let updatedValue = value;

    switch (name) {
      // ✅ Product Name (alpha + digit, max 50)
      case "medicine_name":
        if (/^[a-zA-Z0-9 ]*$/.test(value)) {
          updatedValue = value.slice(0, 50);
        } else return;
        break;

      // ✅ Pack Size (alpha + digit, max 10)
      case "pack_size":
        if (/^[a-zA-Z0-9 ]*$/.test(value)) {
          updatedValue = value.slice(0, 20);
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
    formDataToSend.append(
      "product_introduction",
      formData.product_introduction || ""
    );

    // 🔹 Optional / forced blank
    formDataToSend.append("generic_id", "");
    formDataToSend.append("uses_benefits", "");
    formDataToSend.append("side_effect", "");
    formDataToSend.append("direction_for_use", "");
    formDataToSend.append("storage", "");
    formDataToSend.append("variant_id", "");

    // 🔹 Pricing & misc
    formDataToSend.append("GST", String(formData.GST || ""));
    formDataToSend.append("discount", String(formData.discount || 0));
    formDataToSend.append("H1_Restricted", String(formData.H1_Restricted ?? 0));
    formDataToSend.append("HSN_Code", formData.HSN_Code || "");
    //formDataToSend.append("mrp", formData.mrp || "");
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
    for (const [key, value] of formDataToSend.entries()) {
      console.log("📦", key, value);
    }

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
              {id ? "Update Other Product" : "Add Other Product"}
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
                  label="Product Name"
                  type="text"
                  name="medicine_name"
                  value={formData.medicine_name}
                  onChange={handleChange}
                  //required
                />
                <Input
                  label="Pack Size"
                  type="text"
                  name="pack_size"
                  value={formData.pack_size}
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
                  //required
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
                  label="Unit"
                  name="unit_id"
                  value={formData.unit_id ?? 0}
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
                  value={formData.manufacturer_id ?? 0}
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
                  value={formData.dose_form_id ?? 0}
                  options={doseFormOptions}
                  onChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      dose_form_id: Number(value),
                    }))
                  }
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
                {/* <MultiSelectDropdown
                  label="Categories"
                  options={categories.map((c) => ({
                    label: c.category_name,
                    value: Number(c.id),
                  }))}
                  selected={selectedCategories}
                  onChange={setSelectedCategories}
                  maxSelect={3}
                /> */}

                {/* 
                <div
                  style={{ display: "flex", gap: "2rem", marginTop: "1rem" }}
                >
                  {selectedCategories.map((catId, idx) => (
                    <div
                      key={catId}
                      style={{
                        flex: 1,
                        border: "1px solid #ccc",
                        background: selectedCategories ? "#f7f9faff" : "#fff", // slightly different bg for the inner box
                        padding: "0.5rem",
                        transition: "background 0.3s", // smooth transition
                      }}
                    >
                      <h4
                        style={{ textAlign: "center", marginBottom: "0.5rem" }}
                      >
                        {categories.find((c) => c.id === catId)?.category_name}
                      </h4>
                      <div
                        style={{
                          padding: "0.5rem",
                          minHeight: "100px",
                          maxHeight: "300px", // set max height
                          overflowY: "auto", // enable vertical scrolling
                          transition: "background 0.3s",
                        }}
                      >
                        {groupedSubCategories[catId].map((sc: SubCategory) => (
                          <div
                            key={sc.id}
                            style={{
                              padding: "4px 0",
                              borderBottom: "1px dashed #eee",
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={selectedSubCategories.includes(sc.id)}
                              onChange={(e) => {
                                if (e.target.checked)
                                  setSelectedSubCategories((prev) => [
                                    ...prev,
                                    sc.id,
                                  ]);
                                else
                                  setSelectedSubCategories((prev) =>
                                    prev.filter((id) => id !== sc.id)
                                  );
                              }}
                            />{" "}
                            {sc.sub_category_name}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div> */}
                <RichTextEditor
                  label="Product Introduction"
                  name="product_introduction"
                  value={formData.product_introduction || ""}
                  onChange={(val) =>
                    setFormData((prev) => ({
                      ...prev,
                      product_introduction: val,
                    }))
                  }
                  //required
                  colClass="col-md-12"
                />
                <RichTextEditor
                  label="Description"
                  name="description"
                  value={formData.description || ""}
                  onChange={(val) =>
                    setFormData((prev) => ({ ...prev, description: val }))
                  }
                  //required
                  colClass="col-md-12"
                />
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
