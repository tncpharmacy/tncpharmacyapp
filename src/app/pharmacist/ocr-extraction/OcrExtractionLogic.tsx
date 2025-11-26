"use client";

import SingleSelectDropdown from "@/app/components/Input/SingleSelectDropdown";
import AddBillingItemModal from "@/app/components/RetailCounterModal/AddBillingItemModal";
import GenericOptionsModal from "@/app/components/RetailCounterModal/GenericOptionsModal";
import HealthBagModal from "@/app/components/RetailCounterModal/HealthBagModal";
import WhatsappWaitModal from "@/app/components/RetailCounterModal/WhatsappWaitModal";

import { createHealthBagItem } from "@/lib/features/healthBagPharmacistSlice/healthBagPharmacistSlice";
import {
  getProductByGenericId,
  getProductList,
} from "@/lib/features/medicineSlice/medicineSlice";

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

export default function OcrExtractionLogic({
  imageUrl,
  prescriptionId,
  buyerEmail,
  buyerName,
  buyerMobile,
  buyerId,
}: OcrLogicProps) {
  const dispatch = useAppDispatch();

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

  const [isHealthBagOpen, setIsHealthBagOpen] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [cart, setCart] = useState<any[]>([]);

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
    remarks: string
  ) => {
    const mrp = item.MRP || 0;

    const cartItem = {
      ...item,
      qty,
      dose_form: doseForm,
      remarks,
      unitPrice: mrp,
      price: mrp * qty,
      generic_name: item.generic_name || item.GenericName || "N/A",
      pack_size: item.pack_size || "N/A",
      cartItemId: Date.now() + Math.random(),
    };

    setCart((prev) => [...prev, cartItem]);
    closeQtyModal();
    setSelectedProduct(null);
    setIsHealthBagOpen(true);
  };

  const handleBackToGeneric = () => {
    setIsQtyModalOpen(false);
    setIsModalOpen(true);
  };

  const handleProceedToHealthBag = async () => {
    if (!buyerId) {
      alert("Buyer ID missing.");
      return;
    }

    const payloads = cart.map((item) => ({
      buyer_id: buyerId,
      product_id: Number(item.id),
      quantity: item.qty,
      doses: item.dose_form,
      flag: 1,
      instruction: item.remarks,
    }));

    try {
      for (const p of payloads) {
        await dispatch(createHealthBagItem(p)).unwrap();
      }

      toast.success(`Added ${cart.length} item(s) to Patient Bag.`);
      setCart([]);
      setIsHealthBagOpen(false);
      openWhatsappWait();
    } catch (err) {
      alert("Failed to add to Patient Bag");
      console.error(err);
    }
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
        onProceed={handleProceedToHealthBag}
      />

      <WhatsappWaitModal
        isOpen={isWhatsappWaitModalOpen}
        onClose={closeWhatsappWait}
      />
    </Row>
  );
}
