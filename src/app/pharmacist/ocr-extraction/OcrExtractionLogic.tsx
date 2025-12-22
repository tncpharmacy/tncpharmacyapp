"use client";

import SingleSelectDropdown from "@/app/components/Input/SingleSelectDropdown";
import AddBillingItemModal from "@/app/components/RetailCounterModal/AddBillingItemModal";
import GenericOptionsModal from "@/app/components/RetailCounterModal/GenericOptionsModal";
import HealthBagModal from "@/app/components/RetailCounterModal/HealthBagModal";
import WhatsappWaitModal from "@/app/components/RetailCounterModal/WhatsappWaitModal";
import { getUser } from "@/lib/auth/auth";

import { createHealthBagItem } from "@/lib/features/healthBagPharmacistSlice/healthBagPharmacistSlice";
import {
  getProductByGenericId,
  getProductList,
} from "@/lib/features/medicineSlice/medicineSlice";
import { updatePrescriptionStatusPharmacistThunk } from "@/lib/features/pharmacistPrescriptionSlice/pharmacistPrescriptionSlice";

import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { OptionType } from "@/types/input";
import { Medicine } from "@/types/medicine";

import { useState, useEffect } from "react";
import { Row, Col, Alert, ListGroup, Image } from "react-bootstrap";
import toast from "react-hot-toast";

interface OcrLogicProps {
  imageUrl: string;
  prescriptionId: string;
  buyerEmail?: string | null;
  buyerName?: string | null;
  buyerMobile?: number | null;
  buyerId?: number | null;
}

interface MedicineWithCartFields extends Omit<Medicine, "Disc"> {
  dose_form: string;
  qty: number;
  remarks: string;
  duration: string;
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

export interface OCRMedicine {
  product_id: number;
  medicine_name: string;
  category_id: number;
  matched_with?: string;
  confidence?: number;
}
interface MatchedMedicine {
  id: number;
  name: string;
  category_id: number;
}

export default function OcrExtractionLogic({
  imageUrl,
  prescriptionId,
  buyerEmail,
  buyerName,
  buyerMobile,
  buyerId,
}: OcrLogicProps) {
  const dispatch = useAppDispatch();
  const userPharmacy = getUser();
  const pharmacist_id = Number(userPharmacy?.id) || 0;
  const pharmacy_id = Number(userPharmacy?.pharmacy_id) || 0;

  // 🧿 BACKEND PREDICTED MEDICINES
  const backendMeds = useAppSelector(
    (state) => state.pharmacistPrescription.productList
  );

  const totalBackendMeds = useAppSelector(
    (state) => state.pharmacistPrescription.totalMedicinesFound
  );

  const {
    medicines: productList,
    genericAlternatives: productListByGeneric,
    loading,
  } = useAppSelector((s) => s.medicine);

  const [selectedProduct, setSelectedProduct] = useState<Medicine | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isQtyModalOpen, setIsQtyModalOpen] = useState(false);
  const [itemToConfirm, setItemToConfirm] = useState<Medicine | null>(null);
  const [billPreviewData, setBillPreviewData] = useState<BillPreviewData>({
    cart: [],
    customerName: "",
    mobile: "",
    pharmacy_id: pharmacy_id || 1, // pharmacy_id defined earlier in your component
  });

  const [isHealthBagOpen, setIsHealthBagOpen] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [cart, setCart] = useState<any[]>([]);
  const [shouldSubmit, setShouldSubmit] = useState(false);

  const [isWhatsappWaitModalOpen, setIsWhatsappWaitModalOpen] = useState(false);

  const openWhatsappWait = () => setIsWhatsappWaitModalOpen(true);
  const closeWhatsappWait = () => setIsWhatsappWaitModalOpen(false);

  // ✔️ Fetch full medicine list for dropdown
  useEffect(() => {
    dispatch(getProductList());
  }, [dispatch]);

  // -------------------------------------------------------------------
  // ❌ OCR *REMOVED COMPLETELY*
  // -------------------------------------------------------------------

  // Handle click on detected backend medicine
  const handleMedicineClick = async (medName: string) => {
    const matched = productList.find((item) =>
      item.medicine_name?.toLowerCase().includes(medName.toLowerCase())
    );

    if (!matched) {
      alert(`No matching product found for ${medName}`);
      return;
    }

    setSelectedProduct(matched);

    if (matched.category_id === 1) {
      dispatch(getProductByGenericId(Number(matched.id)));
      setIsModalOpen(true);
    } else {
      handleSkipGenericModal(matched);
    }
  };

  const handleSkipGenericModal = (item: Medicine) => {
    const itemWithGeneric = {
      ...item,
      generic_name: item.generic_name || item.GenericName || "N/A",
    };

    setItemToConfirm(itemWithGeneric);
    setIsQtyModalOpen(true);
  };

  const handleSelectAlternative = (item: Medicine) => {
    setIsModalOpen(false);
    setItemToConfirm(item);
    setIsQtyModalOpen(true);
  };

  const closeQtyModal = () => {
    setIsQtyModalOpen(false);
    setItemToConfirm(null);
  };

  const handleFinalAddToCart = (
    item: Medicine,
    qty: number,
    doseForm: string,
    remarks: string,
    duration: string
  ) => {
    const mrp = item.MRP || 0;

    const cartItem = {
      ...item,
      qty,
      dose_form: doseForm,
      remarks,
      duration,
      unitPrice: mrp,
      price: mrp * qty,
      generic_name: item.generic_name || item.GenericName || "N/A",
      pack_size: item.pack_size || "N/A",
      cartItemId: Date.now() + Math.random(),
    };

    setCart((prev) => [...prev, cartItem]);
    closeQtyModal();
    setSelectedProduct(null);
    toast.success("Item Added To Your HealthBag ");
  };

  const handleBackToGeneric = () => {
    setIsQtyModalOpen(false);
    setIsModalOpen(true);
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleProceedToHealthBag = async (finalCart: any[]) => {
    if (!buyerId) {
      alert("Buyer ID missing.");
      return;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const payloads = (finalCart ?? cart).map((item: any) => ({
      buyer_id: buyerId,
      product_id: Number(item.id),
      quantity: item.qty,
      doses: item.dose_form,
      flag: 1,
      instruction: item.remarks,
      duration: item.duration,
    }));

    try {
      for (const p of payloads) {
        await dispatch(createHealthBagItem(p)).unwrap();
      }

      // 🔹 Step 2: SUCCESS —> Now Update Prescription Status
      await dispatch(
        updatePrescriptionStatusPharmacistThunk({
          prescriptionId: Number(prescriptionId), // URL param
          pharmacistId: pharmacist_id, // BODY param
        })
      ).unwrap();

      toast.success(`Added ${cart.length} item(s) to Patient Bag.`);
      setCart([]);
      setIsHealthBagOpen(false);
      openWhatsappWait();
    } catch (err) {
      alert("Failed to add to Patient Bag");
      console.error(err);
    }
  };

  const handleRemoveItem = (index: number) => {
    setCart((prevCart) => {
      const updated = prevCart.filter((_, i) => i !== index);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setBillPreviewData((prev: any) => ({
        ...prev,
        cart: updated,
      }));

      return updated;
    });
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleUpdateCartFromModal = (updated: any) => {
    console.log("🟢 UPDATED CART RECEIVED:", updated);
    setCart(updated);
    setShouldSubmit(true); // <-- API call trigger
  };

  // -------------------------------------------------------------------
  // UI RENDER
  // -------------------------------------------------------------------
  return (
    <Row>
      {/* TOP: Manual Select Dropdown */}
      <div className="col-md-6">
        <SingleSelectDropdown
          medicines={productList}
          selected={
            selectedProduct
              ? {
                  label: selectedProduct.medicine_name,
                  value: selectedProduct.id,
                }
              : null
          }
          onChange={(opt: OptionType | null) => {
            if (!opt) return;

            const selected = productList.find((m) => m.id === opt.value);

            if (!selected) return;

            const categoryId = selected.category_id;

            setSelectedProduct(selected);

            if (categoryId === 1) {
              dispatch(getProductByGenericId(Number(selected.id)));
              setIsModalOpen(true);
            } else {
              handleSkipGenericModal(selected);
            }
          }}
        />
      </div>

      {/* TOP-RIGHT: HEALTH BAG BUTTON */}
      <div className="col-md-6 text-end">
        <button
          className="btn btn-primary px-4 mb-2"
          onClick={() => setIsHealthBagOpen(true)}
          disabled={cart.length === 0}
        >
          🛒 Health Bag ({cart.length})
        </button>
      </div>
      {/* LEFT SECTION: BACKEND DETECTED MEDICINES */}
      <Col md={6}>
        <br />
        <h6>Detected Medicines ({totalBackendMeds})</h6>

        {backendMeds.length === 0 ? (
          <Alert variant="warning">No medicines detected from backend.</Alert>
        ) : (
          <ListGroup>
            {backendMeds.map((item) => (
              <ListGroup.Item
                key={item.product_id}
                action
                onClick={() => handleMedicineClick(item.medicine_name)}
              >
                <strong>{item.medicine_name}</strong>
                {/* <div className="text-muted small">
                  Confidence: {item.confidence}%
                </div> */}
              </ListGroup.Item>
            ))}
          </ListGroup>
        )}
      </Col>

      {/* RIGHT SECTION: PRESCRIPTION PREVIEW */}
      <Col md={6}>
        <br />
        <h6>Prescription ID ({prescriptionId})</h6>

        {imageUrl && (
          <embed
            src={`${imageUrl}#toolbar=0&navpanes=0&scrollbar=0`}
            type="application/pdf"
            width="100%"
            height="500px"
          />
        )}
      </Col>

      {/* MODALS */}
      <GenericOptionsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        productListByGeneric={productListByGeneric}
        loading={loading}
        onAddToCart={handleSelectAlternative}
        selectedOriginalItem={selectedProduct}
      />

      <AddBillingItemModal
        isOpen={isQtyModalOpen}
        onClose={closeQtyModal}
        item={itemToConfirm}
        onConfirmAdd={handleFinalAddToCart}
        onBack={handleBackToGeneric}
      />

      <HealthBagModal
        isOpen={isHealthBagOpen}
        onClose={() => setIsHealthBagOpen(false)}
        cartItems={cart}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onProceed={(finalCart: any[]) => handleProceedToHealthBag(finalCart)}
        onRemove={handleRemoveItem}
        onUpdateCart={handleUpdateCartFromModal}
      />

      <WhatsappWaitModal
        isOpen={isWhatsappWaitModalOpen}
        onClose={closeWhatsappWait}
      />
    </Row>
  );
}
