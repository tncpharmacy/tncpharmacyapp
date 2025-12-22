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
import { formatAmount } from "@/lib/utils/formatAmount";
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
  const userPharmacy = getUser();
  const pharmacy_id = Number(userPharmacy?.pharmacy_id) || 0;
  const dispatch = useAppDispatch();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [cart, setCart] = useState<any[]>([]);

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

  const [mobileError, setMobileError] = useState("");
  const [isUploadEnabled, setIsUploadEnabled] = useState(false);
  const [isMobileChecking, setIsMobileChecking] = useState(false);
  const [additionalDiscount, setAdditionalDiscount] = useState<string>("0");

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
    dispatch(getProductList());
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
    };
    console.log("📦 handleSkipGenericModal itemWithGeneric:", itemWithGeneric);
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
    console.log("📦 handleSelectAlternative (from GenericOptionsModal):", item);
    setIsModalOpen(false);
    setItemToConfirm(item); // item should already include generic_name after fix #1
    setIsQtyModalOpen(true);
  };

  // Modal Close Handler: Reset all related states
  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedGenericId(null);
    setSelectedMedicine(null); // Dropdown clear करने के लिए
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

      // ⭐ Only recalc subtotal when qty or discount updated
      const qty = Number(updated[index].qty);
      const price = Number(updated[index].price);
      const disc = Number(updated[index].Disc || 0);

      const total = qty * price;
      const discountAmount = (total * disc) / 100;

      updated[index].subtotal = total - discountAmount;

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
    const itemToAdd = {
      ...item,
      dose_form: doseForm,
      qty: qty,
      remarks: remarks,
      duration,
      // keep original MRP in item.mrp, but store unitPrice separately to avoid confusion:
      unitPrice: item.MRP || 0, // per unit price
      price: (item.MRP || 0) * qty, // total price for this line
      generic_name: item.generic_name || item.GenericName || "N/A",
      pack_size: item.pack_size || "N/A",
    };
    setCart((prevCart) => {
      return [...prevCart, itemToAdd];
    });
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

      // 1) Buyer Login
      const loginRes = await dispatch(
        buyerLogin({ login_id: mobile })
      ).unwrap();

      if (loginRes?.data?.existing === true) {
        buyerId = loginRes.data.id;
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
        const regRes = await dispatch(
          buyerRegister({
            name: customerName,
            email: "",
            number: mobile,
            uhid: uhId,
          })
        ).unwrap();

        buyerId = regRes.data.id;
      }

      if (!buyerId) {
        toast.error("Unable to fetch Buyer ID");
        return false;
      }

      // 2) Product Array
      const products = cart.map((item) => {
        const discountAmt = (item.price * (item.Disc ?? 0)) / 100;
        const finalRate = (item.price - discountAmt) * item.qty;

        return {
          product_id: item.id,
          quantity: String(item.qty),
          mrp: String(item.price),
          discount: String(item.Disc ?? 0),
          rate: String(finalRate),
          doses: item.dose_form,
          instruction: item.remarks,
          duration: item.duration,
          status: "1",
        };
      });

      // 3) Calculate Total
      const grandTotal = cart.reduce((acc, item) => {
        const total = item.qty * item.price;
        const discountAmount = (total * item.Disc) / 100;
        return acc + (total - discountAmount);
      }, 0);

      // 4) Final Order Payload
      const orderPayload = {
        payment_mode: 1,
        payment_status: "1",
        amount: String(grandTotal),
        order_type: 2,
        pharmacy_id: pharmacy_id,
        address_id: null,
        additional_discount: additionalDiscount,
        status: "1",
        products,
      };

      // 5) POST ORDER
      await dispatch(
        createPharmacistOrder({
          buyerId,
          payload: orderPayload,
        })
      ).unwrap();
      return true;
    } catch (err) {
      toast.error("Order Creation Failed!");
      return false;
    }
  };

  const handleGenerateBill = async () => {
    // 1) Basic Name & Mobile Validation
    if (!customerName.trim() || !mobile.trim()) {
      toast.error("Please fill Customer Name and Mobile No.");
      return;
    }

    const mobileRegex = /^\d{10}$/;
    if (!mobileRegex.test(mobile)) {
      toast.error("Please enter valid 10-digit Mobile Number.");
      return;
    }

    // 2) UHID check
    if (!uhId.trim()) {
      toast.error("Please enter UHID.");
      return;
    }

    // 3) Table/cart check
    if (cart.length === 0) {
      toast.error("No items in table!");
      return;
    }

    // 4) Create order
    const orderSuccess = await handleCreateOrder();

    if (orderSuccess) {
      setIsBillModalOpen(true);
    }
  };

  // Clear all records
  const handleReset = () => {
    setCustomerName("");
    setMobile("");
    setUhId("");
    setCart([]);
    setAdditionalDiscount("0");
    setSelectedMedicine(null);
    toast.success("Form & Items Reset Successfully!");
  };

  // Total calculation
  const totalAmount = cart.reduce((acc, item) => {
    const total = item.qty * item.price;
    const discountAmount = (total * item.Disc) / 100;
    const subTotal = total - discountAmount;
    return acc + subTotal;
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
                      <SingleSelectDropdown
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
                      />
                    </div>
                  </div>
                  <div className="col-md-4 text-end">
                    <div className="txt_col">
                      <button
                        className="btn-style1"
                        onClick={goToRetailCounterPrescription}
                        // disabled={selectedMedicines.length === 0}
                      >
                        Upload Prescription
                        {/* <i className="bi bi-upload"></i>  */}
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
                              required
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
                          <th>Medicine</th>
                          <th>Qty</th>
                          <th>Doses</th>
                          <th>Instruction</th>
                          <th>Duration</th>
                          <th>MRP (₹)</th>
                          <th>Discount (%)</th>
                          <th>Subtotal (₹)</th>
                          <th></th>
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
                            const total = item.qty * item.price;
                            const discountAmount = item.Disc
                              ? (total * item.Disc) / 100
                              : 0;
                            const subtotal = total - discountAmount;
                            return (
                              <tr key={index}>
                                <td>{item.medicine_name}</td>
                                <td
                                  style={{
                                    cursor: "pointer",
                                    maxWidth: "160px",
                                  }}
                                >
                                  <input
                                    type="text"
                                    className="form-control"
                                    value={`${item.pack_size || ""} × ${
                                      item.qty
                                    }`}
                                    onChange={(e) => {
                                      const raw = e.target.value;

                                      // =============================
                                      // Extract only digits from the right side after "×"
                                      // =============================
                                      const parts = raw.split("×");

                                      let qty = parts[1] ? parts[1].trim() : "";

                                      // Allow only digits
                                      qty = qty.replace(/\D/g, "").slice(0, 2);

                                      // Remove leading zeros
                                      qty = qty.replace(/^0+/, "");

                                      handleEditChange(index, "qty", qty || 0);
                                    }}
                                    style={{
                                      width: "140px",
                                      fontSize: "14px",
                                      height: "38px",
                                    }}
                                  />
                                </td>
                                <td>
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
                                </td>

                                <td
                                  style={{
                                    maxWidth: "160px",
                                    position: "relative",
                                    overflow: "visible",
                                    verticalAlign: "top",
                                    zIndex: 2,
                                  }}
                                >
                                  <SmartCreateInput
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
                                <td
                                  style={{
                                    maxWidth: "120px",
                                    position: "relative",
                                    overflow: "visible",
                                  }}
                                >
                                  <SmartCreateInput
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

                                <td>{item.price}</td>
                                {/* Editable Discount */}
                                <td>
                                  <input
                                    type="number"
                                    className="form-control"
                                    value={item.Disc ?? 0}
                                    max={99}
                                    min={0}
                                    // onChange={(e) =>
                                    //   handleEditChange(idx, "Disc", e.target.value)
                                    // }
                                    style={{ width: "70px" }}
                                    onChange={(e) => {
                                      const val = e.target.value;

                                      // ❗ Allow only digits and maxLength = 2
                                      if (val.length <= 2) {
                                        handleEditChange(index, "Disc", val);
                                      }
                                    }}
                                  />
                                </td>

                                <td>
                                  {formatAmount(
                                    item.subtotal ?? item.qty * item.price
                                  )}
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
                        Total: ₹{formatAmount(totalAmount)}
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
                        Grand Total: ₹{formatAmount(finalAmount)}
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
        onBack={handleBackToGeneric}
      />
      <BillPreviewModal
        show={isBillModalOpen}
        onClose={() => setIsBillModalOpen(false)}
        cart={cart}
        customerName={customerName}
        mobile={mobile}
        uhid={uhId}
        pharmacy_id={pharmacy_id}
        additionalDiscount={additionalDiscount}
      />
    </>
  );
}
