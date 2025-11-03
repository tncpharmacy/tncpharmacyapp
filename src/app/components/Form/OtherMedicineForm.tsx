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
  getMedicineListById,
  updateMedicineListById,
} from "@/lib/features/medicineSlice/medicineSlice";

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
    variant: "",
    prescription_required: 0,
    unit: "",
    manufacturer: "",
    category: "",
    sub_category: "",
    description: "",
    dose_form: "",
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
      "product_introduction",
      formData.product_introduction || ""
    );
    // formDataToSend.append("side_effect", formData.side_effect || "");
    // formDataToSend.append("storage", formData.storage || "");
    // formDataToSend.append("uses_benefits", formData.uses_benefits || "");
    // formDataToSend.append("status", formData.status || "Active");

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

      router.push("/other-product");
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
              {id ? "Update Other Product" : "Add Other Product"}
              <button
                onClick={() => router.push("/other-product")}
                className="btn-style2 float-end pe-4 ps-4"
              >
                ← Back
              </button>
            </div>
            <div className="main_content">
              {/* <p>Generated Password: {password}</p> */}
              <form onSubmit={handleSubmit} className="row g-3">
                <Input
                  label="Item Name"
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
                <CustomSelectInput
                  label="Variant"
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
                  // required
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
                  // required
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
                  //required
                />
                <MultiSelectDropdown
                  label="Categories"
                  options={categories.map((c) => ({
                    label: c.category_name,
                    value: Number(c.id),
                  }))}
                  selected={selectedCategories}
                  onChange={setSelectedCategories}
                  maxSelect={3}
                />
                <CustomSelectInput
                  label="Doses Form"
                  name="manufacturer"
                  value={formData.manufacturer || ""}
                  options={manufactureOptions}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      sub_category: e.toString(),
                    }))
                  }
                  //required
                />

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
                </div>
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
