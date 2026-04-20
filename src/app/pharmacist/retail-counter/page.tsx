"use client";

import "../css/pharmacy-style.css";
import SideNav from "@/app/pharmacist/components/SideNav/page";
import Header from "@/app/pharmacist/components/Header/page";
import { useCallback, useEffect, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import {
  getProductByGenericId,
  getProductList,
} from "@/lib/features/medicineSlice/medicineSlice";
import { Medicine } from "@/types/medicine";
import SingleSelectDropdown, {
  OptionType,
} from "@/app/components/Input/SingleSelectDropdown";
import GenericOptionsModal from "@/app/components/RetailCounterModal/GenericOptionsModal";
import AddBillingItemModal from "@/app/components/RetailCounterModal/AddBillingItemModal";
import BillPreviewModal from "@/app/components/RetailCounterModal/BillPreviewModal";
import toast from "react-hot-toast";
import { getUser } from "@/lib/auth/auth";
import { getPharmacy } from "@/lib/api/pharmacySelf";
import { useRouter } from "next/navigation";
import {
  buyerLogin,
  buyerRegister,
} from "@/lib/features/buyerSlice/buyerSlice";
import { createPharmacistOrder } from "@/lib/features/pharmacistOrderSlice/pharmacistOrderSlice";
import { updateBuyerForPharmacistThunk } from "@/lib/features/pharmacistBuyerListSlice/pharmacistBuyerListSlice";
import { formatPrice } from "@/lib/utils/formatPrice";
import DoseInstructionSelect from "@/app/components/Input/DoseInstructionSelect";
import { useClickOutside } from "@/lib/utils/useClickOutside";
import {
  createProductDuration,
  getProductDurations,
} from "@/lib/features/productDurationSlice/productDurationSlice";
import {
  createProductInstruction,
  getProductInstructions,
} from "@/lib/features/productInstructionSlice/productInstructionSlice";
import SmartCreateInput from "@/app/components/RetailCounterModal/SmartCreateInput";
import GlobalSearchBox from "@/app/components/GlobalSearchBox/GlobalSearchBox";
import GlobalProductSearchBox from "@/app/components/GlobalProductSearchBox/GlobalProductSearchBox";
import SmartCreateInputWithoutLabel from "@/app/components/RetailCounterModal/SmartCreateInputWithoutLabel";
type EditingCell = {
  rowIndex: number | null;
  field: "qty" | "dose_form" | "remarks" | "duration" | "Disc" | null;
};

export interface InputPropsColSm {
  label?: string; // <-- optional
  name?: string; // <-- optional
  type?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value?: any;
  placeholder?: string;
  required?: boolean;
  readOnly?: boolean;
  error?: string;
  colSm?: number;
  colMd?: number;
  colLg?: number;
  colClass?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onChange?: any;
  max?: number;
  min?: number;
  maxLength?: number;
}

export default function RetailCounter() {
  const router = useRouter();
  // SINGLE SHARED REF FOR ANY CELL
  const doseRef = useRef<HTMLDivElement | null>(null);
  const qtyRef = useRef<HTMLInputElement | null>(null);
  const instructionRef = useRef<HTMLInputElement | null>(null);
  const durationRef = useRef<HTMLInputElement | null>(null);
  const submitRef = useRef<HTMLInputElement | null>(null);
  const uploadRef = useRef<HTMLButtonElement | null>(null);
  const userPharmacy = getUser();
  const pharmacy_id = Number(userPharmacy?.pharmacy_id) || 0;
  const dispatch = useAppDispatch();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [cart, setCart] = useState<any[]>([]);
  const [isUploadFocused, setIsUploadFocused] = useState(false);
  // ✅ Redux State Selector: genericAlternatives और loading स्टेट यहाँ से आ रहे हैं।
  const {
    medicines: productList,
    genericAlternatives: productListByGeneric,
    loading,
  } = useAppSelector((state) => state.medicine);

  // Component States
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  // ✅ Modal को खोलने के लिए आवश्यक State
  const [selectedGenericId, setSelectedGenericId] = useState<number | null>(
    null
  );
  const [isQtyModalOpen, setIsQtyModalOpen] = useState(false); // ✅ New Modal State
  const [itemToConfirm, setItemToConfirm] = useState<Medicine | null>(null); // ✅ New State for selected item
  const [isBillModalOpen, setIsBillModalOpen] = useState(false);

  const [customerName, setCustomerName] = useState("");
  const [mobile, setMobile] = useState("");
  const [uhId, setUhId] = useState("");
  const [referredByHospital, setReferredByHospital] = useState("");
  const [referredByDoctor, setReferredByDoctor] = useState("");

  const [mobileError, setMobileError] = useState("");
  const [isUploadEnabled, setIsUploadEnabled] = useState(false);
  const [isMobileChecking, setIsMobileChecking] = useState(false);
  const [additionalDiscount, setAdditionalDiscount] = useState<string>("0");
  const [isFromGenericFlow, setIsFromGenericFlow] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [billData, setBillData] = useState<any[]>([]);

  // editable state
  const [editingCell, setEditingCell] = useState<EditingCell>({
    rowIndex: null,
    field: null,
  });

  const { list: durationList } = useAppSelector(
    (state) => state.productDuration
  );

  const { list: instructionList } = useAppSelector(
    (state) => state.productInstruction
  );
  useEffect(() => {
    dispatch(getProductDurations());
    dispatch(getProductInstructions());
  }, [dispatch]);

  // CLICK OUTSIDE CLOSE HANDLER
  useClickOutside(doseRef, () => {
    if (editingCell.field === "dose_form") {
      setEditingCell({ rowIndex: null, field: null });
    }
  });
  // Initial product list fetch
  useEffect(() => {
    dispatch(getProductList(null));
    //dispatch(getPharmacy());
  }, [dispatch]);

  const checkMobileInDB = async (value: string) => {
    if (value.length !== 10) return;

    setIsMobileChecking(true);
    setMobileError("");

    try {
      const res = await dispatch(buyerLogin({ login_id: value })).unwrap();

      if (res?.data?.id) {
        // Buyer mil gaya
        setCustomerName(res.data.name || "");
        setUhId(res.data.uhid || "");
        setIsUploadEnabled(true);
        setMobileError("");
      } else {
        // Buyer nahi mila
        setMobileError("Mobile number does not exist.");
        setIsUploadEnabled(true);
      }
    } catch (e) {
      // Buyer not found
      setMobileError("Mobile number does not exist.");
      setIsUploadEnabled(true);
    }

    setIsMobileChecking(false);
  };

  const handleSkipGenericModal = (item: Medicine) => {
    const itemWithGeneric = {
      ...item,
      generic_name: item.generic_name || item.GenericName || "N/A",
      MRP: item.mrp,
      Disc: Number(item.discount || 0),
    };
    // console.log("📦 handleSkipGenericModal itemWithGeneric:", itemWithGeneric);
    setItemToConfirm(itemWithGeneric);
    setIsQtyModalOpen(true);
  };

  // Dropdown Change Handler: Dispatch API call and set the active ID
  const handleSelectMedicine = (selectedOption: OptionType | null) => {
    if (selectedOption) {
      const selectedMedicine = productList.find(
        (m) => m.id === selectedOption.value
      );
      if (
        !selectedMedicine ||
        typeof selectedMedicine.category_id === "undefined"
      ) {
        console.error("Selected medicine or category_id is missing.");
        return;
      }

      const genericId = selectedMedicine.id;
      const categoryId = selectedMedicine.category_id;
      setSelectedGenericId(null);
      setSelectedMedicine(selectedMedicine);
      if (categoryId === 1) {
        dispatch(getProductByGenericId(genericId));
        setSelectedGenericId(genericId);
      } else {
        handleSkipGenericModal(selectedMedicine);
      }
    } else {
      setSelectedGenericId(null);
      setSelectedMedicine(null);
      setIsModalOpen(false);
      setIsQtyModalOpen(false);
      setItemToConfirm(null);
    }
  };

  const handleBackToGeneric = () => {
    setIsQtyModalOpen(false);
    setIsModalOpen(true);
  };

  // Update handleCloseQtyModal: Only closes this modal
  const handleCloseQtyModal = () => {
    setIsQtyModalOpen(false);
    setItemToConfirm(null);
  };

  // Update handleSelectAlternative (Must call handleCloseQtyModal to close first modal)
  const handleSelectAlternative = (item: Medicine) => {
    // console.log("📦 handleSelectAlternative (from GenericOptionsModal):", item);
    setIsModalOpen(false);
    setItemToConfirm(item); // item should already include generic_name after fix #1
    setIsQtyModalOpen(true);
  };

  // Modal Close Handler: Reset all related states
  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedGenericId(null);
    // setSelectedMedicine(null); // Dropdown clear करने के लिए
  }, []);

  const handleRemoveItem = (itemId: number) => {
    setCart((prevCart) => {
      return prevCart.filter((item) => item.id !== itemId);
    });
  };

  const handleEditChange = (
    index: number,
    field: string,
    value: string | number
  ) => {
    setCart((prev) => {
      const updated = [...prev];

      updated[index] = {
        ...updated[index],
        [field]: value,
      };

      const qty = Number(updated[index].qty || 0);
      const mrp = Number(updated[index].unitPrice || 0); // ✅ original MRP
      const disc = Number(updated[index].Disc || 0);

      // ✅ rate = per unit after discount
      const rate = mrp - (mrp * disc) / 100;

      // ✅ subtotal = rate * qty
      const subtotal = rate * qty;

      // ✅ store values
      updated[index].rate = rate;
      updated[index].subtotal = subtotal;

      return updated;
    });
  };

  // Final Add to Cart handler (From Qty Modal)
  const handleFinalAddToCart = (
    item: Medicine,
    qty: number,
    doseForm: string,
    remarks: string,
    duration: string
  ) => {
    const mrp = Number(item.MRP || 0); // original price
    const disc = Number(item.discount ?? item.Disc ?? 0); // discount %

    const rate = mrp - (mrp * disc) / 100; // per unit after discount
    const subtotal = rate * qty; // final subtotal

    const itemToAdd = {
      ...item,
      manufacturer_name: item.manufacturer_name || item.Manufacturer,
      dose_form: doseForm,
      qty: qty,
      remarks: remarks,
      duration: duration,

      unitPrice: mrp,
      Disc: disc,

      rate: rate,
      subtotal: subtotal,
    };

    setCart((prev) => [...prev, itemToAdd]);

    handleCloseQtyModal();
    setSelectedMedicine(null);
  };

  useEffect(() => {
    if (
      selectedGenericId !== null &&
      !loading &&
      productListByGeneric.length > 0
    ) {
      setIsModalOpen(true);
    }
  }, [selectedGenericId, loading, productListByGeneric.length]);
  const goToRetailCounterPrescription = async () => {
    router.push("/pharmacist/retail-counter-prescription");
  };

  const handleCreateOrder = async () => {
    try {
      let buyerId = null;

      // ✅ LOCAL VARIABLES (IMPORTANT)
      let finalCustomerName = customerName;
      let finalMobile = mobile;
      let finalUhid = uhId;

      // 1) Buyer Login
      const loginRes = await dispatch(
        buyerLogin({ login_id: mobile })
      ).unwrap();

      if (loginRes?.data?.existing === true) {
        buyerId = loginRes.data.id;

        finalCustomerName = loginRes.data.name || customerName;
        finalMobile = loginRes.data.number || mobile;
        finalUhid = loginRes.data.uhid || uhId;

        if (
          (!loginRes.data.uhid || loginRes.data.uhid === "") &&
          uhId.trim() !== ""
        ) {
          await dispatch(
            updateBuyerForPharmacistThunk({
              buyerId: buyerId,
              payload: { uhid: uhId },
            })
          ).unwrap();
        }
      } else {
        // 🔥 REGISTER FLOW
        const regRes = await dispatch(
          buyerRegister({
            name: customerName,
            email: "",
            number: mobile,
            uhid: uhId,
          })
        ).unwrap();

        buyerId = regRes.data.id;

        // ✅ IMPORTANT FIX
        finalCustomerName = regRes.data.name || customerName;
        finalMobile = regRes.data.number || mobile;
        finalUhid = regRes.data.uhid || uhId;
      }

      if (!buyerId) {
        toast.error("Unable to fetch Buyer ID");
        return { success: false };
      }

      // 2) Product Array
      const products = cart.map((item) => {
        const unitPrice = item.unitPrice || item.MRP || 0;
        const qty = Number(item.qty);
        const discountPercent = Number(item.Disc || 0);

        const total = unitPrice * qty;
        const discountAmt = (total * discountPercent) / 100;
        const finalRate = total - discountAmt;

        return {
          product_id: item.id,
          quantity: qty,
          mrp: unitPrice,
          discount: discountPercent,
          rate: finalRate,
          doses: item.dose_form,
          remark: item.remarks,
          duration: item.duration,
          status: 1,
        };
      });

      // 3) Order Payload
      const orderPayload = {
        payment_mode: 1,
        payment_status: "1",
        amount: Number(finalAmount.toFixed(2)),
        order_type: 2,
        pharmacy_id: pharmacy_id,
        address_id: null,
        referred_by_doctor: referredByDoctor || null,
        referred_by_hospital: referredByHospital || null,
        additional_discount: Number(additionalDiscount),
        prescription_id: null,
        status: "1",
        products,
      };

      await dispatch(
        createPharmacistOrder({
          buyerId,
          payload: orderPayload,
        })
      ).unwrap();

      // ✅ RETURN DATA (MOST IMPORTANT)
      return {
        success: true,
        customerName: finalCustomerName,
        mobile: finalMobile,
        uhid: finalUhid,
      };
    } catch (err) {
      toast.error("Order Creation Failed!");
      return { success: false };
    }
  };

  const handleGenerateBill = async () => {
    if (!customerName.trim() || !mobile.trim()) {
      toast.error("Please fill Customer Name and Mobile No.");
      return;
    }

    const mobileRegex = /^\d{10}$/;
    if (!mobileRegex.test(mobile)) {
      toast.error("Please enter valid 10-digit Mobile Number.");
      return;
    }

    if (cart.length === 0) {
      toast.error("No items in table!");
      return;
    }

    // ✅ IMPORTANT: capture response
    const res = await handleCreateOrder();

    if (res?.success) {
      setBillData([...cart]);

      // ✅ DIRECT DATA USE (NO ASYNC ISSUE)
      setCustomerName(res.customerName || "");
      setMobile(res.mobile || "");
      setUhId(res.uhid || "");

      setIsBillModalOpen(true);

      // ❌ REMOVE THIS (BUG CREATE KAR RAHA HAI)
      // setTimeout(() => handleReset(), 500);
    }
  };

  // Clear all records
  const handleReset = () => {
    setCustomerName("");
    setMobile("");
    setUhId("");
    setCart([]);
    setReferredByDoctor("");
    setReferredByHospital("");
    setAdditionalDiscount("0");
    setSelectedMedicine(null);
    toast.success("Form & Items Reset Successfully!");
  };

  // Total calculation
  const totalAmount = cart.reduce((acc, item) => {
    const rate = item.unitPrice - (item.unitPrice * item.Disc) / 100;
    const subtotal = rate * item.qty;
    return acc + subtotal;
  }, 0);

  // Final after Additional Discount
  const finalAmount =
    totalAmount - (totalAmount * Number(additionalDiscount)) / 100;

  return (
    <>
      <Header />
      <div className="body_wrap">
        <SideNav />
        <div className="body_right p-4">
          <div className="container-fluid retail-counter">
            <h4 className="mb-4">
              <i className="bi bi-receipt-cutoff me-2"></i>
              Retail Counter
            </h4>

            {/* Medicine Search Section */}
            <div className="card shadow-sm mb-4">
              <div className="card-body">
                <div className="row g-3 align-items-end">
                  <div className="col-md-8">
                    <div className="txt_col">
                      {/* <SingleSelectDropdown
                        medicines={productList}
                        selected={
                          selectedMedicine
                            ? {
                                label: selectedMedicine.medicine_name,
                                value: selectedMedicine.id,
                              }
                            : null
                        }
                        onChange={handleSelectMedicine}
                      /> */}
                      <GlobalProductSearchBox
                        placeholder="Search product..."
                        onSelect={(item) => {
                          const med = item.data;
                          setSelectedMedicine(med);
                          if (med.category_id === 1) {
                            setIsFromGenericFlow(true);
                            dispatch(getProductByGenericId(med.id));
                            setSelectedGenericId(med.id);
                          } else {
                            setIsFromGenericFlow(false);
                            handleSkipGenericModal(med);
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Tab") {
                            e.preventDefault();
                            uploadRef.current?.focus(); // 🔥 direct jump
                          }
                        }}
                      />
                    </div>
                  </div>
                  <div
                    className="col-md-4 text-end"
                    style={{ marginBottom: "25px" }}
                  >
                    <div className="txt_col">
                      <button
                        ref={uploadRef}
                        className="btn-style1"
                        onClick={goToRetailCounterPrescription}
                        onFocus={() => setIsUploadFocused(true)}
                        onBlur={() => setIsUploadFocused(false)}
                        style={{
                          outline: isUploadFocused
                            ? "2px solid #007bff"
                            : "none",
                          boxShadow: isUploadFocused
                            ? "0 0 6px rgba(0, 123, 255, 0.5)"
                            : "none",
                          transition: "0.2s",
                        }}
                      >
                        Upload Prescription
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bill Table */}
            {cart.length !== 0 && (
              <div className="card shadow-sm mb-4">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h6 className="m-0">
                      <i className="bi bi-cart-check me-2"></i>Billing Items
                    </h6>

                    <button
                      className="btn btn-sm btn-warning"
                      onClick={handleReset}
                    >
                      <i className="bi bi-arrow-counterclockwise me-1"></i> New
                      Billing
                    </button>
                  </div>

                  {/* Customer Details Section */}
                  <div className="card shadow-sm mb-4">
                    <div className="card-body">
                      <div className="row g-3">
                        <div className="col-md-4">
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
                                  if (value.length === 10) {
                                    checkMobileInDB(value);
                                  } else {
                                    setIsUploadEnabled(false);
                                    setMobileError("");
                                  }
                                }
                              }}
                              maxLength={10}
                              required
                            />
                            {mobileError && (
                              <small className="text-danger">
                                {mobileError}
                              </small>
                            )}
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="txt_col">
                            <label className="lbl1">Patient Name</label>
                            <input
                              type="text"
                              className="form-control"
                              value={customerName}
                              onChange={(e) => {
                                setCustomerName(e.target.value);
                                setMobileError("");
                              }}
                              maxLength={25}
                              required
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="txt_col">
                            <label className="lbl1">UHID</label>
                            <input
                              type="text"
                              className="form-control"
                              value={uhId}
                              onChange={(e) => setUhId(e.target.value)}
                              maxLength={10}
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="txt_col">
                            <label className="lbl1">Referred By Doctor</label>
                            <input
                              type="text"
                              className="form-control"
                              value={referredByDoctor}
                              onChange={(e) =>
                                setReferredByDoctor(e.target.value)
                              }
                              maxLength={50}
                            />
                          </div>
                        </div>

                        <div className="col-md-4">
                          <div className="txt_col">
                            <label className="lbl1">Referred By Hospital</label>
                            <input
                              type="text"
                              className="form-control"
                              value={referredByHospital}
                              onChange={(e) =>
                                setReferredByHospital(e.target.value)
                              }
                              maxLength={50}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="table-responsive">
                    <table className="table table-bordered align-middle">
                      <thead className="table-light">
                        <tr>
                          <th style={{ width: "260px" }}>Medicine</th>
                          <th style={{ width: "80px", textAlign: "center" }}>
                            Qty
                          </th>
                          <th style={{ width: "110px", textAlign: "center" }}>
                            Doses
                          </th>
                          <th style={{ width: "180px" }}>Instruction</th>
                          <th style={{ width: "120px" }}>Duration</th>
                          <th style={{ width: "90px" }}>MRP (₹)</th>
                          <th style={{ width: "90px" }}>Disc (%)</th>
                          <th style={{ width: "90px" }}>Rate</th>
                          <th style={{ width: "110px" }}>Subtotal (₹)</th>
                          <th style={{ width: "60px" }}></th>
                        </tr>
                      </thead>
                      <tbody>
                        {cart.length === 0 ? (
                          <tr>
                            <td colSpan={9} className="text-center text-muted">
                              No items added yet
                            </td>
                          </tr>
                        ) : (
                          cart.map((item, index) => {
                            const mrp = item.unitPrice;
                            const total = item.qty * mrp;
                            const discountAmount = (total * item.Disc) / 100;
                            const subtotal = total - discountAmount;
                            const rate =
                              item.unitPrice -
                              (item.unitPrice * item.Disc) / 100;

                            const inputStyle = {
                              height: "38px",
                              fontSize: "14px",
                            };
                            return (
                              <tr key={index}>
                                <td style={{ width: "250px" }}>
                                  {/* Medicine */}
                                  <div
                                    style={{
                                      display: "flex",
                                      flexDirection: "column",
                                      overflow: "hidden",
                                    }}
                                  >
                                    <span
                                      style={{
                                        fontWeight: 600,
                                        fontSize: "14px",
                                        lineHeight: "18px",
                                        display: "-webkit-box",
                                        WebkitLineClamp: 2, // 👈 max 2 line
                                        WebkitBoxOrient: "vertical",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                      }}
                                      className="pd-title"
                                    >
                                      {item.medicine_name}
                                    </span>

                                    <span
                                      style={{
                                        fontSize: "12px",
                                        color: "#666",
                                        marginTop: "2px",
                                        whiteSpace: "nowrap",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                      }}
                                      className="pd-title"
                                    >
                                      {item.pack_size || "N/A"}
                                    </span>

                                    <span
                                      style={{
                                        fontSize: "12px",
                                        color: "#28a745",
                                        marginTop: "2px",
                                      }}
                                      className="pd-title"
                                    >
                                      {item.manufacturer_name ||
                                        item.manufacturer ||
                                        "N/A"}
                                    </span>
                                  </div>
                                </td>
                                {/* Editable QTY */}
                                <td
                                  style={{
                                    textAlign: "center",
                                    width: "70px",
                                    height: "38px",
                                  }}
                                >
                                  <input
                                    type="number"
                                    className="form-control"
                                    value={item.qty}
                                    min={1}
                                    max={99}
                                    onChange={(e) => {
                                      const val = e.target.value;

                                      // only 2 digit
                                      if (/^\d{0,2}$/.test(val)) {
                                        handleEditChange(
                                          index,
                                          "qty",
                                          val || 0
                                        );
                                      }
                                    }}
                                    style={{ ...inputStyle, width: "70px" }}
                                  />
                                </td>
                                {/* Editable Doses */}
                                <td style={{ verticalAlign: "middle" }}>
                                  <div
                                    style={{
                                      height: "38px",
                                      display: "flex",
                                      alignItems: "center",
                                    }}
                                  >
                                    <DoseInstructionSelect
                                      type="select"
                                      name=""
                                      label=""
                                      isTableEditMode={true}
                                      value={item.dose_form}
                                      onChange={(e) =>
                                        handleEditChange(
                                          index,
                                          "dose_form",
                                          e.target.value
                                        )
                                      }
                                    />
                                  </div>
                                </td>
                                {/* Editable Instruction */}
                                <td>
                                  <SmartCreateInputWithoutLabel
                                    label=""
                                    value={item.remarks ?? ""}
                                    onChange={(val) => {
                                      if (val.length <= 50) {
                                        handleEditChange(index, "remarks", val);
                                      }
                                    }}
                                    list={instructionList}
                                    createAction={createProductInstruction}
                                    refreshAction={getProductInstructions}
                                    placeholder=""
                                  />
                                </td>
                                {/* Editable Duration */}
                                <td>
                                  <SmartCreateInputWithoutLabel
                                    label=""
                                    value={item.duration ?? ""}
                                    onChange={(val) => {
                                      if (val.length <= 10) {
                                        handleEditChange(
                                          index,
                                          "duration",
                                          val
                                        );
                                      }
                                    }}
                                    list={durationList}
                                    createAction={createProductDuration}
                                    refreshAction={getProductDurations}
                                    placeholder=""
                                  />
                                </td>
                                {/* Price Mrp */}
                                {/* <td>{formatPrice(item.price)}</td> */}
                                <td
                                  style={{
                                    textAlign: "center",
                                    width: "80px",
                                    // backgroundColor: "#f5f5f5",
                                  }}
                                >
                                  <input
                                    type="text"
                                    className="form-control"
                                    value={formatPrice(item.unitPrice)}
                                    readOnly
                                    tabIndex={-1}
                                    style={{
                                      ...inputStyle,
                                      width: "80px",
                                      backgroundColor: "#f5f5f5",
                                    }}
                                  />
                                </td>
                                {/* Editable Discount */}
                                <td
                                  style={{ textAlign: "center", width: "70px" }}
                                >
                                  <input
                                    type="number"
                                    className="form-control"
                                    value={item.Disc ?? 0}
                                    max={99}
                                    min={0}
                                    // onChange={(e) =>
                                    //   handleEditChange(idx, "Disc", e.target.value)
                                    // }
                                    style={{ ...inputStyle, width: "80px" }}
                                    onChange={(e) => {
                                      const val = e.target.value;

                                      // ❗ Allow only digits and maxLength = 2
                                      if (val.length <= 2) {
                                        handleEditChange(index, "Disc", val);
                                      }
                                    }}
                                  />
                                </td>

                                {/* Rate */}
                                <td
                                  style={{
                                    textAlign: "center",
                                    width: "90px",
                                  }}
                                >
                                  <input
                                    type="text"
                                    className="form-control"
                                    value={formatPrice(rate)}
                                    readOnly
                                    tabIndex={-1}
                                    style={{
                                      ...inputStyle,
                                      width: "80px",
                                      backgroundColor: "#f5f5f5",
                                    }}
                                  />
                                </td>

                                {/* SubTotal */}
                                <td
                                  style={{
                                    textAlign: "center",
                                    width: "90px",
                                  }}
                                >
                                  <input
                                    type="text"
                                    className="form-control"
                                    value={formatPrice(subtotal)}
                                    readOnly
                                    tabIndex={-1}
                                    style={{
                                      ...inputStyle,
                                      width: "80px",
                                      backgroundColor: "#f5f5f5",
                                    }}
                                  />
                                </td>

                                <td>
                                  <button
                                    className="btn btn-sm btn-danger"
                                    onClick={() => handleRemoveItem(item.id)}
                                  >
                                    <i className="bi bi-trash"></i>
                                  </button>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                  {/* RIGHT SIDE BOX */}
                  <div className="d-flex justify-content-end">
                    <div
                      className="p-3 border rounded shadow-sm"
                      style={{
                        width: "300px",
                        background: "#F8FBFF",
                        marginTop: "-10px",
                        textAlign: "left", // ⬅⬅ Box ke andar ka text LEFT align
                      }}
                    >
                      <h6
                        className="fw-bold mb-2"
                        style={{ color: "red", whiteSpace: "nowrap" }}
                      >
                        Total: ₹{formatPrice(totalAmount)}
                      </h6>

                      <div className="mb-2">
                        <div
                          className="d-flex align-items-center mb-2"
                          style={{ gap: "8px" }}
                        >
                          <span
                            className="fw-semibold"
                            style={{ color: "green", whiteSpace: "nowrap" }}
                          >
                            Additional Discount:
                          </span>

                          <input
                            type="text"
                            className="form-control"
                            style={{ width: "60px" }}
                            maxLength={2}
                            value={additionalDiscount}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (/^\d{0,2}$/.test(val))
                                setAdditionalDiscount(val);
                            }}
                          />

                          <span className="fw-bold">(%)</span>
                        </div>
                      </div>

                      <h5 className="fw-bold text-primary mb-3">
                        Grand Total: ₹{formatPrice(finalAmount)}
                      </h5>

                      <button
                        className="btn btn-primary w-100"
                        onClick={handleGenerateBill}
                      >
                        <i className="bi bi-file-earmark-text me-1"></i>
                        Generate Bill
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* ✅ Generic Selection Modal */}
      <GenericOptionsModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        productListByGeneric={productListByGeneric}
        loading={loading}
        onAddToCart={handleSelectAlternative} // 🚨 Prop name changed
        selectedOriginalItem={selectedMedicine}
      />

      {/* 2. ✅ New Qty/Dose Form Modal */}
      <AddBillingItemModal
        isOpen={isQtyModalOpen}
        onClose={handleCloseQtyModal}
        item={itemToConfirm}
        onConfirmAdd={handleFinalAddToCart}
        onBack={isFromGenericFlow ? handleBackToGeneric : undefined}
      />
      <BillPreviewModal
        show={isBillModalOpen}
        onClose={() => {
          setIsBillModalOpen(false);
          handleReset();
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
    </>
  );
}
