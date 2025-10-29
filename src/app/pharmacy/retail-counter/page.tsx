"use client";

import "../css/style.css";
import SideNav from "@/app/pharmacy/components/SideNav/page";
import Header from "@/app/pharmacy/components/Header/page";
import { useCallback, useEffect, useState } from "react";
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

export default function RetailCounter() {
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

  const handleGenerateBill = () => {
    if (!customerName.trim() || !mobile.trim()) {
      toast.error(
        "Please fill Customer Name and Mobile No. before generating bill."
      );
      return;
    }
    const mobileRegex = /^\d{10}$/;

    if (!customerName.trim()) {
      toast.error("Please enter Customer Name.");
      return;
    }

    if (!mobileRegex.test(mobile)) {
      toast.error("Please enter a valid 10-digit Mobile Number.");
      return;
    }
    setIsBillModalOpen(true);
  };
  // Initial product list fetch
  useEffect(() => {
    dispatch(getProductList());
  }, [dispatch]);

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

  // Final Add to Cart handler (From Qty Modal)
  const handleFinalAddToCart = (
    item: Medicine,
    qty: number,
    doseForm: string,
    remarks: string
  ) => {
    const itemToAdd = {
      ...item,
      dose_form: doseForm,
      qty: qty,
      remarks: remarks,
      // keep original MRP in item.mrp, but store unitPrice separately to avoid confusion:
      unitPrice: item.MRP || 0, // per unit price
      price: (item.MRP || 0) * qty, // total price for this line
      generic_name: item.generic_name || item.GenericName || "N/A",
      pack_size: item.pack_size || "N/A",
    };
    console.log("🧾 handleFinalAddToCart itemToAdd:", itemToAdd);
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
                        // onClick={handleExportToExcel}
                        // disabled={selectedMedicines.length === 0}
                      >
                        <i className="bi bi-upload"></i> Upload Prescription
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bill Table */}
            <div className="card shadow-sm mb-4">
              <div className="card-body">
                <h6 className="mb-3">
                  <i className="bi bi-cart-check me-2"></i>Billing Items
                </h6>
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
                              // Allow only digits and limit to 10
                              if (/^\d{0,10}$/.test(value)) {
                                setMobile(value);
                              }
                            }}
                            maxLength={10}
                            required
                          />
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="txt_col">
                          <label className="lbl1">Customer Name</label>
                          <input
                            type="text"
                            className="form-control"
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
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
                        <th>Doses Instruction</th>
                        <th>Qty</th>
                        <th>MRP (₹)</th>
                        <th>Discount (%)</th>
                        <th>Subtotal (₹)</th>
                        <th>Remarks</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {cart.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="text-center text-muted">
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
                              <td>{item.dose_form}</td>
                              <td>
                                {item.pack_size
                                  ? `${item.pack_size} × ${item.qty}`
                                  : item.qty}
                              </td>
                              <td>{item.price}</td>
                              <td>{item.Disc}</td>
                              <td>{subtotal}</td>
                              <td>{item.remarks}</td>
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
                {/* Total and Actions */}
                <div className="d-flex justify-content-between align-items-center mt-3">
                  <h5 className="fw-bold mb-0">
                    Total: ₹
                    {cart.reduce((acc, item) => {
                      const total = item.qty * item.price;
                      const discountAmount = (total * item.Disc) / 100;
                      const subTotal = total - discountAmount;
                      return acc + subTotal;
                    }, 0)}
                  </h5>
                  <button
                    className="btn btn-primary px-4"
                    onClick={handleGenerateBill}
                  >
                    <i className="bi bi-file-earmark-text me-1"></i>
                    Generate Bill
                  </button>
                </div>
              </div>
            </div>
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
      />
    </>
  );
}
