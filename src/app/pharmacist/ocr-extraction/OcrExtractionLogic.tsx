"use client";

import GlobalProductSearchBox from "@/app/components/GlobalProductSearchBox/GlobalProductSearchBox";
import GlobalSearchBox from "@/app/components/GlobalSearchBox/GlobalSearchBox";
import SingleSelectDropdown from "@/app/components/Input/SingleSelectDropdown";
import AddBillingItemModal from "@/app/components/RetailCounterModal/AddBillingItemModal";
import BillPreviewModal from "@/app/components/RetailCounterModal/BillPreviewModal";
import GenericOptionsModal from "@/app/components/RetailCounterModal/GenericOptionsModal";
import HealthBagModal from "@/app/components/RetailCounterModal/HealthBagModal";
import WhatsappWaitModal from "@/app/components/RetailCounterModal/WhatsappWaitModal";
import { getUser } from "@/lib/auth/auth";
import {
  buyerLogin,
  buyerRegister,
} from "@/lib/features/buyerSlice/buyerSlice";

import { createHealthBagItem } from "@/lib/features/healthBagPharmacistSlice/healthBagPharmacistSlice";
import {
  getProductByGenericId,
  getProductList,
} from "@/lib/features/medicineSlice/medicineSlice";
import { updateBuyerForPharmacistThunk } from "@/lib/features/pharmacistBuyerListSlice/pharmacistBuyerListSlice";
import { createPharmacistOrder } from "@/lib/features/pharmacistOrderSlice/pharmacistOrderSlice";
import { updatePrescriptionStatusPharmacistThunk } from "@/lib/features/pharmacistPrescriptionSlice/pharmacistPrescriptionSlice";

import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { OptionType } from "@/types/input";
import { Medicine } from "@/types/medicine";

import { useState, useEffect, useRef } from "react";
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
  // ref for focus
  const healthBagRef = useRef<HTMLButtonElement | null>(null);
  const [isUploadFocused, setIsUploadFocused] = useState(false);

  const [selectedProduct, setSelectedProduct] = useState<Medicine | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isQtyModalOpen, setIsQtyModalOpen] = useState(false);
  const [itemToConfirm, setItemToConfirm] = useState<Medicine | null>(null);
  const [billPreviewData, setBillPreviewData] = useState<BillPreviewData>({
    cart: [],
    customerName: "",
    mobile: "",
    pharmacy_id: pharmacy_id || 1,
  });
  const [isBillModalOpen, setIsBillModalOpen] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [billData, setBillData] = useState<any[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [mobile, setMobile] = useState("");
  const [uhId, setUhId] = useState("");
  const [referredByHospital, setReferredByHospital] = useState("");
  const [referredByDoctor, setReferredByDoctor] = useState("");
  const [additionalDiscount, setAdditionalDiscount] = useState<string>("0");
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(
    null
  );
  const [isHealthBagOpen, setIsHealthBagOpen] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [cart, setCart] = useState<any[]>([]);
  const [shouldSubmit, setShouldSubmit] = useState(false);

  const [isFromGenericFlow, setIsFromGenericFlow] = useState(false);
  const [isWhatsappWaitModalOpen, setIsWhatsappWaitModalOpen] = useState(false);

  const openWhatsappWait = () => setIsWhatsappWaitModalOpen(true);
  const closeWhatsappWait = () => setIsWhatsappWaitModalOpen(false);

  // ✔️ Fetch full medicine list for dropdown
  useEffect(() => {
    dispatch(getProductList(null));
  }, [dispatch]);

  useEffect(() => {
    setCart([]);
    setSelectedAddressId(null);
  }, [prescriptionId]);

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
    const mrp = item.MRP || item.mrp || 0;
    const parsedDiscount =
      item.Disc !== undefined
        ? Number(item.Disc)
        : item.discount !== undefined
        ? Number(item.discount)
        : item.Discount !== undefined
        ? Number(item.Discount)
        : 0;
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
      manufacturer_name: item.manufacturer_name || item.Manufacturer || "N/A",
      cartItemId: Date.now() + Math.random(),
      Disc: parsedDiscount,
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
    // console.log("🟢 UPDATED CART RECEIVED:", updated);
    setCart(updated);
    setShouldSubmit(true); // <-- API call trigger
  };

  const handleGenerateOrderFromModal = async (data: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    cart: any[];
    additionalDiscount: string;
  }) => {
    const success = await handleCreateOrder(data.cart, data.additionalDiscount);

    if (success) {
      toast.success("Order Created Successfully!");

      // 🔥 BILL DATA SET KAR
      const formattedCart = data.cart.map((item) => {
        const mrp = Number(item.unitPrice || item.MRP || 0);
        const qty = Number(item.qty || 0);
        const disc = Number(item.Disc || 0);

        const rate = mrp - (mrp * disc) / 100;
        const subtotal = rate * qty;

        return {
          ...item,
          mrp,
          MRP: mrp,
          rate,
          subtotal,
        };
      });

      setBillData(formattedCart);
      setAdditionalDiscount(data.additionalDiscount);

      setCustomerName(buyerName || "");
      setMobile(String(buyerMobile || ""));
      setUhId("");
      setReferredByDoctor(referredByDoctor || "Self");
      setReferredByHospital(referredByHospital || "Self");
      // 🔥 MODAL OPEN
      setIsBillModalOpen(true);
      setIsHealthBagOpen(false);
      setCart([]);
    }
  };

  const handleCreateOrder = async (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    finalCart: any[],
    discountValue: string
  ) => {
    if (!selectedAddressId) {
      toast.error("Please select address");
      return false;
    }
    try {
      // 🔹 1) Products mapping (same rehne de)
      const products = finalCart.map((item) => {
        const mrp = Number(item.unitPrice || item.MRP || 0);
        const qty = Number(item.qty);
        const discount = Number(item.Disc || 0);

        const total = mrp * qty;
        const discountAmt = (total * discount) / 100;
        const finalAmount = total - discountAmt;

        return {
          product_id: item.id,
          quantity: String(qty),
          mrp: String(mrp),
          discount: String(discount),
          rate: String(finalAmount),
          doses: item.dose_form || "",
          remark: item.remarks || "",
          duration: item.duration || "",
          status: "1",
        };
      });

      // 🔹 2) Grand total
      const grandTotal = finalCart.reduce((acc, item) => {
        const mrp = Number(item.unitPrice || item.MRP || 0);
        const qty = Number(item.qty);
        const discount = Number(item.Disc || 0);

        const total = mrp * qty;
        const discountAmt = (total * discount) / 100;

        return acc + (total - discountAmt);
      }, 0);
      const discount = Number(discountValue || 0);
      // 🔹 3) Final amount
      const finalAmount = grandTotal - (grandTotal * discount) / 100;
      // 🔹 4) Payload
      const orderPayload = {
        payment_mode: 1,
        payment_status: "1",
        amount: String(finalAmount.toFixed(2)),
        order_type: 2,
        pharmacy_id: pharmacy_id,
        address_id: selectedAddressId,
        prescription_id: prescriptionId,
        referred_by_doctor: referredByDoctor || "Self",
        referred_by_hospital: referredByHospital || "Self",
        additional_discount: String(discount),

        products,
      };

      await dispatch(
        createPharmacistOrder({
          buyerId: Number(buyerId),
          payload: orderPayload,
        })
      ).unwrap();

      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  // -------------------------------------------------------------------
  // UI RENDER
  // -------------------------------------------------------------------
  return (
    <Row>
      {/* TOP: Manual Select Dropdown */}
      <div className="col-md-6">
        <GlobalProductSearchBox
          placeholder="Search product..."
          onSelect={(item) => {
            const med = item.data;
            setSelectedProduct(med);
            if (med.category_id === 1) {
              setIsFromGenericFlow(true);
              dispatch(getProductByGenericId(Number(med.id)));
              setIsModalOpen(true);
            } else {
              setIsFromGenericFlow(false);
              handleSkipGenericModal(med);
            }
          }}
          onKeyDown={(e) => {
            if (e.key === "Tab") {
              e.preventDefault();
              healthBagRef.current?.focus();
            }
          }}
        />
      </div>

      {/* TOP-RIGHT: HEALTH BAG BUTTON */}
      <div className="col-md-6 text-end">
        <button
          ref={healthBagRef}
          className="btn btn-primary px-4 mb-2"
          onClick={() => setIsHealthBagOpen(true)}
          onFocus={() => setIsUploadFocused(true)}
          onBlur={() => setIsUploadFocused(false)}
          style={{
            outline: isUploadFocused ? "2px solid #007bff" : "none",
            boxShadow: isUploadFocused
              ? "0 0 6px rgba(0, 123, 255, 0.5)"
              : "none",
            transition: "0.2s",
          }}
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
                key={item.id}
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
        onBack={isFromGenericFlow ? handleBackToGeneric : undefined}
      />

      <HealthBagModal
        isOpen={isHealthBagOpen}
        onClose={() => setIsHealthBagOpen(false)}
        cartItems={cart}
        onProceed={(finalCart) => handleProceedToHealthBag(finalCart)} // WhatsApp flow
        onGenerateOrder={(finalCart) => handleGenerateOrderFromModal(finalCart)} // Order flow
        onRemove={handleRemoveItem}
        onUpdateCart={handleUpdateCartFromModal}
        onSelectAddress={(id) => setSelectedAddressId(id)}
        buyerId={buyerId}
      />

      <WhatsappWaitModal
        isOpen={isWhatsappWaitModalOpen}
        onClose={closeWhatsappWait}
      />

      <BillPreviewModal
        show={isBillModalOpen}
        onClose={() => {
          setIsBillModalOpen(false);
        }}
        cart={billData}
        customerName={customerName}
        mobile={mobile}
        uhid={uhId}
        referredByDoctor={referredByDoctor}
        referredByHospital={referredByHospital}
        pharmacy_id={pharmacy_id}
        additionalDiscount={additionalDiscount}
      />
    </Row>
  );
}
