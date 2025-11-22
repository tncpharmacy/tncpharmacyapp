"use client";

import "../css/pharmacy-style.css";
import SideNav from "@/app/pharmacist/components/SideNav/page";
import Header from "@/app/pharmacist/components/Header/page";
import { useCallback, useEffect, useState, useRef } from "react";
import * as pdfjsLib from "pdfjs-dist";

import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import toast from "react-hot-toast";
import { getUser } from "@/lib/auth/auth";
import { getPharmacy } from "@/lib/api/pharmacySelf";
import Input from "@/app/components/Input/InputColSm";
import { Image, ListGroup } from "react-bootstrap";
import dynamic from "next/dynamic";
import { uploadPrescriptionPharmacistThunk } from "@/lib/features/pharmacistPrescriptionSlice/pharmacistPrescriptionSlice";
import { useRouter } from "next/navigation";
import {
  buyerLogin,
  buyerRegister,
} from "@/lib/features/buyerSlice/buyerSlice";
import { BuyerApiResponse } from "@/types/buyer";
import { PayloadAction } from "@reduxjs/toolkit";
import { cleanOCRText, extractMedicines } from "@/lib/ocr/extractMedicines";
import {
  extractTableMedicines,
  extractMedicineSection,
} from "@/lib/ocr/extractTableMedicines";
import {
  getProductByGenericId,
  getProductList,
} from "@/lib/features/medicineSlice/medicineSlice";
import TableLoader from "@/app/components/TableLoader/TableLoader";
import Spinner from "@/app/components/Sppiner/Sppiner";
import SingleSelectDropdown from "@/app/components/Input/SingleSelectDropdown";
import { Medicine } from "@/types/medicine";
import { OptionType } from "@/types/input";
import GenericOptionsModal from "@/app/components/RetailCounterModal/GenericOptionsModal";
import AddBillingItemModal from "@/app/components/RetailCounterModal/AddBillingItemModal";
import HealthBagPrescriptionModal from "@/app/components/RetailCounterModal/HealthBaPrescriptionModal";
import BillPreviewModal from "@/app/components/RetailCounterModal/BillPreviewModal";
const PreviewBox = dynamic(() => import("./PreviewBox"), {
  ssr: false,
});

const mediaBase = process.env.NEXT_PUBLIC_MEDIA_BASE_URL;

interface MedicineWithCartFields extends Omit<Medicine, "Disc"> {
  dose_form: string;
  qty: number;
  remarks: string;
  unitPrice: number;
  price: number;
  cartItemId: number;
  pack_size?: string;
  generic_name?: string;
  Disc: number; // 👈 ALWAYS NUMBER (NO undefined)
}

// bill preview payload type
interface BillPreviewData {
  cart: MedicineWithCartFields[];
  customerName: string;
  mobile: string;
  pharmacy_id: number;
}

export default function RetailCounter() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const userPharmacy = getUser();
  const pharmacist_id = Number(userPharmacy?.id) || 0;
  const pharmacy_id = Number(userPharmacy?.pharmacy_id) || 0;

  const [customerName, setCustomerName] = useState("");
  const [mobile, setMobile] = useState("");
  const [prescriptionFile, setPrescriptionFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");

  const [uploadedUrl, setUploadedUrl] = useState("");
  const [ocrText, setOcrText] = useState("");
  const [loadingOCR, setLoadingOCR] = useState(false);
  const [showForm, setShowForm] = useState(true);
  const [ocrMedicine, setOcrMedicine] = useState<string[]>([]);
  const [loadingMedicines, setLoadingMedicines] = useState(false);
  const [matchedMedicines, setMatchedMedicines] = useState<
    { id: number; name: string }[] | null
  >(null);

  const {
    medicines: productList,
    genericAlternatives: productListByGeneric,
    loading,
  } = useAppSelector((state) => state.medicine);

  // Component States
  // selectedMedicine can be either a full DB Medicine (when chosen from dropdown)
  // or a small OCR match object {id, name} (when clicked from OCR list)
  const [selectedMedicine, setSelectedMedicine] = useState<
    Medicine | { id: number; name: string } | null
  >(null);

  // ✅ State for Modal open
  const [selectedGenericId, setSelectedGenericId] = useState<number | null>(
    null
  );
  const [isQtyModalOpen, setIsQtyModalOpen] = useState(false); // ✅ New Modal State
  const [itemToConfirm, setItemToConfirm] = useState<Medicine | null>(null); // ✅ New State for selected item (DB object)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Medicine | null>(null);
  const [isHealthBagModalOpen, setIsHealthBagModalOpen] = useState(false);
  const [isBillPreviewOpen, setIsBillPreviewOpen] = useState(false);
  const [billPreviewData, setBillPreviewData] = useState<BillPreviewData>({
    cart: [],
    customerName: "",
    mobile: "",
    pharmacy_id: pharmacy_id || 1, // pharmacy_id defined earlier in your component
  });
  const [cart, setCart] = useState<MedicineWithCartFields[]>([]);

  /* ---------------------------------------------------
     OCR MAIN FUNCTIONS
  --------------------------------------------------- */

  // 🔹 COMMON OCR CALLER
  const callOCR = async (formData: FormData) => {
    try {
      setLoadingOCR(true);

      const res = await fetch("/api/google-vision", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "OCR API failed");
      setOcrText(data.text || "");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      console.error("Client OCR Error:", e.message);
      toast.error("OCR failed: " + e.message);
    } finally {
      setLoadingOCR(false);
    }
  };

  // 🔹 OCR for File
  const runOCR_File = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    await callOCR(formData);
  };

  // 🔹 OCR for URL
  const runOCR_URL = async (fileURL: string) => {
    try {
      const res = await fetch("/api/google-vision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: fileURL }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "URL OCR failed");

      setOcrText(data.text);
    } catch (err) {
      console.error("URL OCR Error:", err);
      toast.error("OCR failed for URL: " + err);
    }
  };

  /* ---------------------------------------------------
     ON FILE UPLOAD
  --------------------------------------------------- */
  const handlePrescriptionUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPrescriptionFile(file);
    await runOCR_File(file); // start OCR immediately
  };

  useEffect(() => {
    dispatch(getProductList());
  }, [dispatch]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function matchOCRWithDB(ocrText: string, dbList: any[]) {
    if (!ocrText || dbList.length === 0) return [];

    const text = ocrText.toString().toLowerCase();

    const results: { id: number; name: string }[] = [];

    for (const item of dbList) {
      const medName = item.medicine_name?.toString().toLowerCase();

      if (!medName) continue;

      // full + partial match
      if (
        text.includes(medName) ||
        text.replace(/\s+/g, "").includes(medName.replace(/\s+/g, "")) ||
        (medName.split(" ")[0].length > 3 &&
          text.includes(medName.split(" ")[0]))
      ) {
        results.push({
          id: item.id,
          name: item.medicine_name?.toString() || `${item.id}`,
        });
      }
    }

    return results;
  }

  useEffect(() => {
    if (!ocrText || productList.length === 0) return;

    setLoadingMedicines(true); // spinner start
    setMatchedMedicines(null); // indicate loading state

    const matches = matchOCRWithDB(ocrText, productList);

    setMatchedMedicines(matches); // set results
    setLoadingMedicines(false); // spinner stop
  }, [ocrText, productList]);

  /* ---------------------------------------------------
     PAGE RELOAD → LOAD SAVED URL → RUN OCR
  --------------------------------------------------- */
  useEffect(() => {
    const savedUrl = localStorage.getItem("presc_url");
    const savedName = localStorage.getItem("customerName");
    const savedMobile = localStorage.getItem("mobile");

    if (savedUrl) {
      setUploadedUrl(savedUrl);
      setShowForm(false);
      runOCR_URL(savedUrl);
    }

    if (savedName) setCustomerName(savedName);
    if (savedMobile) setMobile(savedMobile);
  }, []);
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    try {
      if (!mobile || !customerName || !prescriptionFile) {
        toast.error("Please fill all fields");
        return;
      }

      let buyer_id: number | null = null;

      const loginRes = await dispatch(
        buyerLogin({ login_id: mobile })
      ).unwrap();

      if (loginRes?.data?.id) {
        buyer_id = loginRes.data.id;
      }
      if (!buyer_id) {
        const registerPayload = {
          name: customerName,
          email: "",
          number: mobile,
        };
        const regRes = await dispatch(buyerRegister(registerPayload)).unwrap();
        buyer_id = regRes?.data?.id;
      }

      if (!buyer_id) {
        toast.error("Buyer ID missing");
        return;
      }

      // The REAL CORRECT form-data
      const formData = new FormData();
      formData.append("buyer_id", String(buyer_id));
      formData.append(
        "prescription_pic",
        prescriptionFile,
        prescriptionFile.name
      );

      const uploadRes = await dispatch(
        uploadPrescriptionPharmacistThunk({
          pharmacistId: pharmacist_id,
          payload: formData,
        })
      ).unwrap();

      toast.success("Prescription uploaded!");

      const fullUrl = mediaBase + uploadRes?.prescription_pic;
      localStorage.setItem("presc_url", fullUrl);
      localStorage.setItem("customerName", customerName);
      localStorage.setItem("mobile", mobile);
      localStorage.setItem("buyer_id", String(buyer_id));

      setShowForm(false);
      setUploadedUrl(fullUrl);
      runOCR_URL(fullUrl);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error("Upload Rejection Details:", err); // Log the full error object
      // 💡 Thunk rejection payload is often nested in err.payload
      const rejectMessage =
        err.payload || err.message || "Failed to upload prescription";
      toast.error("Error: " + rejectMessage);
    }
  };

  // Dropdown Change Handler: Dispatch API call and set the active ID
  const handleSelectMedicine = (selectedOption: OptionType | null) => {
    if (selectedOption) {
      const selectedMedicineDB = productList.find(
        (m) => m.id === selectedOption.value
      );
      if (
        !selectedMedicineDB ||
        typeof selectedMedicineDB.category_id === "undefined"
      ) {
        console.error("Selected medicine or category_id is missing.");
        return;
      }

      const genericId = selectedMedicineDB.id;
      const categoryId = selectedMedicineDB.category_id;
      setSelectedGenericId(null);
      // store the full DB product in selectedMedicine
      setSelectedMedicine(selectedMedicineDB as Medicine);
      if (categoryId === 1) {
        dispatch(getProductByGenericId(genericId));
        setSelectedGenericId(genericId);
        setIsModalOpen(true);
      } else {
        handleSkipGenericModal(selectedMedicineDB);
      }
    } else {
      setSelectedGenericId(null);
      setSelectedMedicine(null);
      setIsModalOpen(false);
      setIsQtyModalOpen(false);
      setItemToConfirm(null);
    }
  };
  const handleSkipGenericModal = (item: Medicine) => {
    const itemWithGeneric = {
      ...item,
      generic_name: item.generic_name || item.GenericName || "N/A",
    };
    console.log("📦 handleSkipGenericModal itemWithGeneric:", itemWithGeneric);
    setItemToConfirm(itemWithGeneric);
    setIsQtyModalOpen(true);
  };

  const handleMedicineClick = async (med: { id: number; name: string }) => {
    // med is from matchedMedicines (OCR). store small object
    setSelectedMedicine(med); // store selected object (OCR)

    const medNameLower = med.name.toString().toLowerCase();

    // Find product from DB
    const matched = productList.find((item) =>
      (item.medicine_name?.toString().toLowerCase() ?? "").includes(
        medNameLower
      )
    );

    console.log("matched (from OCR click)", matched);

    if (!matched) {
      alert(`No matching product found for ${med.name}`);
      return;
    }

    // store actual DB product
    setSelectedProduct(matched);

    const categoryId = matched.category_id;
    const productId = matched.id;

    if (categoryId === 1) {
      // Category 1 → Generic modal
      if (productId) {
        dispatch(getProductByGenericId(Number(productId)));
        setIsModalOpen(true);
      } else {
        console.error("Product ID missing:", matched);
        alert("Error: Product ID missing for fetching alternatives.");
      }
    } else {
      // Other categories → billing / qty modal
      handleSkipGenericModal(matched);
    }
  };

  // Update handleSelectAlternative (Must call handleCloseQtyModal to close first modal)
  const handleSelectAlternative = (item: Medicine) => {
    console.log("📦 handleSelectAlternative (from GenericOptionsModal):", item);
    // close generic modal
    setIsModalOpen(false);

    // Ensure generic_name present
    const itemWithGeneric = {
      ...item,
      generic_name: item.generic_name || item.GenericName || "N/A",
    };

    setItemToConfirm(itemWithGeneric); // item should already include generic_name after fix #1
    setIsQtyModalOpen(true);
  };

  const handleCloseQtyModal = () => {
    setIsQtyModalOpen(false);
    setItemToConfirm(null);
  };

  // Final Add to Cart handler (From Qty Modal)
  const handleFinalAddToCart = (
    item: Medicine,
    qty: number,
    doseForm: string,
    remarks: string
  ) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mrp = (item as any).MRP || 0;
    console.log("ITEM FROM API:", item);
    const parsedDiscount =
      item.Disc !== undefined
        ? Number(item.Disc)
        : item.discount !== undefined
        ? Number(item.discount)
        : item.Discount !== undefined
        ? Number(item.Discount)
        : 0;

    const itemToAdd: MedicineWithCartFields = {
      ...item,
      dose_form: doseForm,
      qty,
      remarks,
      unitPrice: mrp,
      price: mrp * qty,
      generic_name: item.generic_name || item.GenericName || "N/A",
      pack_size: item.pack_size || "N/A",
      cartItemId: Date.now() + Math.random(),
      Disc: parsedDiscount, // ALWAYS CORRECT NUMBER
    };

    console.log("🧾 handleFinalAddToCart itemToAdd:", itemToAdd);
    setCart((prevCart) => {
      return [...prevCart, itemToAdd];
    });
    handleCloseQtyModal();
    setSelectedMedicine(null);
    setBillPreviewData((prev) => ({
      ...prev,
      cart: [...prev.cart, itemToAdd],
      customerName,
      mobile,
      pharmacy_id: pharmacy_id || 1,
    }));

    setIsBillPreviewOpen(true);
  };

  const handleBackToGeneric = () => {
    setIsQtyModalOpen(false);
    setIsModalOpen(true);
  };

  // Placeholder for opening the health-bag / cart UI
  const handleOpenHealthBag = () => {
    console.log("Opening Health Bag Modal...");
    setIsBillPreviewOpen(true);
  };

  return (
    <>
      <Header />
      <div className="body_wrap">
        <SideNav />
        <div className="body_right p-4">
          <div className="container-fluid retail-counter">
            <h4 className="mb-4">
              <i className="bi bi-file-earmark-medical me-2"></i>
              Prescription Details
            </h4>

            <div className="card shadow-sm mb-4">
              <div className="card-body">
                <div className="row g-3 align-items-end">
                  <div className="col-md-8">
                    <div className="txt_col">
                      <SingleSelectDropdown
                        medicines={productList}
                        selected={
                          selectedMedicine &&
                          "medicine_name" in selectedMedicine
                            ? {
                                label: (selectedMedicine as Medicine)
                                  .medicine_name,
                                value: (selectedMedicine as Medicine).id,
                              }
                            : null
                        }
                        onChange={handleSelectMedicine}
                      />
                    </div>
                  </div>
                  <div className="col-md-4 text-end">
                    <div className="txt_col">
                      {/* 🎯 Health Bag Button */}
                      <button
                        className="btn btn-primary px-4 mb-2"
                        onClick={handleOpenHealthBag}
                        disabled={cart.length === 0}
                      >
                        🛒 Health Bag ({cart.length})
                      </button>
                    </div>
                  </div>
                </div>
                {/* ===========================
                SHOW FORM OR OCR RESULT
            ============================ */}
                {showForm ? (
                  /* ---------------- FORM UI ---------------- */
                  <div className="card shadow-sm mb-4">
                    <div className="card-body">
                      <form onSubmit={handleSubmit} className="row g-3">
                        <div className="row g-3">
                          <div className="col-md-6">
                            <div className="col-md-12">
                              <div className="txt_col">
                                <label className="lbl1">
                                  Upload Prescription
                                </label>
                                <input
                                  type="file"
                                  accept="image/*,.pdf"
                                  className="form-control"
                                  onChange={handlePrescriptionUpload}
                                />
                              </div>
                            </div>

                            <div className="col-md-12">
                              <div className="txt_col">
                                <label className="lbl1">Mobile No.</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  value={mobile}
                                  onChange={(e) => {
                                    const value = e.target.value;
                                    if (/^\d{0,10}$/.test(value)) {
                                      setMobile(value);
                                    }
                                  }}
                                  maxLength={10}
                                  required
                                />
                              </div>
                            </div>

                            <div className="col-md-12">
                              <div className="txt_col">
                                <label className="lbl1">Customer Name</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  value={customerName}
                                  onChange={(e) =>
                                    setCustomerName(e.target.value)
                                  }
                                  required
                                />
                              </div>
                            </div>

                            <div className="col-md-12">
                              <div className="txt_col">
                                <button
                                  type="submit"
                                  className="btn btn-primary col-sm-12"
                                >
                                  Submit
                                </button>
                              </div>
                            </div>
                          </div>

                          <div className="col-md-6 text-center">
                            <PreviewBox file={prescriptionFile} />
                          </div>
                        </div>
                      </form>
                    </div>
                  </div>
                ) : (
                  /* ---------------- OCR RESULT UI ---------------- */
                  <div className="row">
                    {/* LEFT SIDE: PRESCRIPTION PREVIEW */}
                    <div className="col-md-6">
                      <h5 className="mb-3">Extracted Text (OCR)</h5>

                      {/* 1️⃣ Spinner always first priority */}
                      {matchedMedicines === null || loadingMedicines ? (
                        <div style={{ textAlign: "center", padding: "40px 0" }}>
                          <Spinner />
                          <div className="mt-3">Matching medicines...</div>
                        </div>
                      ) : matchedMedicines.length > 0 ? (
                        /* 2️⃣ If medicines matched */
                        <ListGroup>
                          {matchedMedicines.map((med) => (
                            <ListGroup.Item
                              action
                              key={med.id}
                              onClick={() => handleMedicineClick(med)}
                            >
                              {med.name}
                            </ListGroup.Item>
                          ))}
                        </ListGroup>
                      ) : (
                        /* 3️⃣ If no medicines AFTER loading */
                        <p>No medicines found</p>
                      )}
                    </div>
                    {/* RIGHT SIDE: OCR OUTPUT */}
                    <div className="col-md-6">
                      <h5 className="mb-3">Prescription Preview</h5>
                      {uploadedUrl?.toLowerCase().endsWith(".pdf") ? (
                        <embed
                          src={uploadedUrl}
                          type="application/pdf"
                          width="100%"
                          height="600px"
                        />
                      ) : (
                        <Image
                          src={uploadedUrl}
                          style={{ width: "100%", borderRadius: 8 }}
                          alt=""
                        />
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <GenericOptionsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        productListByGeneric={productListByGeneric}
        loading={loading}
        onAddToCart={handleSelectAlternative}
        selectedOriginalItem={selectedProduct}
      />
      {/* 2. ✅ New Qty/Dose Form Modal */}
      <AddBillingItemModal
        isOpen={isQtyModalOpen}
        onClose={handleCloseQtyModal}
        item={itemToConfirm}
        onConfirmAdd={handleFinalAddToCart}
        onBack={handleBackToGeneric}
      />
      <HealthBagPrescriptionModal
        isOpen={isHealthBagModalOpen}
        onClose={() => setIsHealthBagModalOpen(false)}
        cartItems={cart}
        onProceed={() => {
          toast.success("Items added to patient Health Bag!");
          setIsHealthBagModalOpen(false);
        }}
      />
      <BillPreviewModal
        show={isBillPreviewOpen}
        onClose={() => setIsBillPreviewOpen(false)}
        cart={billPreviewData.cart}
        customerName={billPreviewData.customerName}
        mobile={billPreviewData.mobile}
        pharmacy_id={billPreviewData.pharmacy_id}
      />
    </>
  );
}
