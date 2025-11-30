// AddBillingItemModal.tsx (नया कंपोनेंट)

import React, { useState, useEffect } from "react";
import { Medicine } from "@/types/medicine";
import { OptionType } from "../Input/SingleSelectDropdown";
import toast from "react-hot-toast";

interface AddBillingItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: Medicine | null; // Selected item
  onBack: () => void;
  onConfirmAdd: (
    item: Medicine,
    qty: number,
    doseForm: string,
    remarks: string,
    duration: string
  ) => void;
}
const DOSE_INSTRUCTIONS = [
  { value: "1-0-1", label: "Morning & Night" },
  { value: "1-1-1", label: "Morning, Afternoon & Night" },
  { value: "1-0-0", label: "Morning only" },
  { value: "0-1-0", label: "Afternoon only" },
  { value: "0-0-1", label: "Night only" },
  { value: "1/2-0-1/2", label: "Half tablet morning & night" },
  { value: "0-1-1", label: "Afternoon & Night" },
  { value: "1-0-1/2", label: "Morning & half at night" },
];
const AddBillingItemModal: React.FC<AddBillingItemModalProps> = ({
  isOpen,
  onClose,
  item,
  onBack,
  onConfirmAdd,
}) => {
  // States for Form Inputs
  const [qty, setQty] = useState(1);
  const [selectedDoseValue, setSelectedDoseValue] = useState("");
  const [remarks, setRemarks] = useState("");
  const [duration, setDuration] = useState("");

  // AvailableQty Validation
  const availableQty = item?.AvailableQty || 0; // 🚨 Assuming your Medicine type has 'AvailableQty'

  // Form Reset on Item Change
  useEffect(() => {
    if (item) {
      // 1. AvailableQty = 0 है तो Qty को 0 पर सेट करें
      if (availableQty === 0) {
        setQty(0);
        toast.error("Item is out of stock. Available Qty is 0.");
      } else {
        // 2. Default Qty 1 सेट करें (जब stock हो)
        setQty(1);
      }
      setSelectedDoseValue("");
      setRemarks("");
      setDuration("");
    }
  }, [item, availableQty]);

  if (!isOpen || !item) return null;

  // Validation Handler
  const handleQtyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;

    // Allow empty value "" (React number input me hota hi hai)
    if (rawValue === "") {
      setQty(0); // ⚠️ blank ko 0 treat karo taaki type mismatch na ho
      return;
    }

    const value = Number(rawValue);

    // Stock 0 → always 0
    if (availableQty === 0) {
      setQty(0);
      return;
    }

    // Invalid input OR negative → do nothing
    if (isNaN(value) || value < 0) {
      return;
    }

    // Allow 0 (remove ke liye)
    if (value === 0) {
      setQty(0);
      return;
    }

    // More than available stock → set to availableQty
    if (value > availableQty) {
      setQty(availableQty);
      return;
    }

    // Valid qty
    setQty(value);
  };

  // 🚨 FIX 3: handleSubmit में Qty = 0 पर रोक
  const handleSubmit = () => {
    if (qty <= 0) {
      toast.error("Quantity must be greater than 0.");
      return;
    }

    if (!selectedDoseValue) {
      toast.error("Please select a dose instruction.");
      return;
    }

    onConfirmAdd(item, qty, selectedDoseValue, remarks, duration);
  };

  return (
    <div
      className="modal"
      tabIndex={-1}
      style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
      onClick={onClose}
    >
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-content">
          <div className="modal-header">
            {/* ✅ Back Button Icon */}
            <button
              type="button"
              className="btn btn-light btn-sm me-2"
              onClick={onBack}
              style={{
                border: "none",
                padding: "0",
                background: "transparent",
              }}
            >
              <i
                className="bi bi-arrow-left-circle"
                style={{ fontSize: "1.5rem", color: "#007bff" }}
              ></i>
            </button>
            <h6 className="modal-title">Product Item:- {item.medicine_name}</h6>
            {/* Close Button on the right */}
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
            ></button>
          </div>
          <div className="modal-body">
            {/* Current Price Display */}
            <p>
              <strong>MRP:</strong> ₹{item.MRP || 0}
            </p>
            <p className="text-success color-green fw-bold">
              Available Stock: {availableQty}
            </p>
            <hr />

            {/* Qty Input */}
            <div className="mb-3">
              <label className="form-label">Quantity</label>
              <input
                type="number"
                className="form-control"
                value={qty === 0 ? "" : qty} // 👈 input blank handle
                onChange={handleQtyChange}
                max={availableQty}
              />

              {qty > availableQty && (
                <div className="text-danger mt-1">
                  Error: Max available quantity is {availableQty}.
                </div>
              )}
            </div>

            {/* Dose Form Input (Select/Input based on your requirement) */}
            <div className="mb-3">
              <label className="form-label">Doses Instruction</label>
              <select
                className="form-control" // Bootstrap class
                value={selectedDoseValue}
                onChange={(e) => setSelectedDoseValue(e.target.value)}
                required
              >
                {/* Default Option */}
                <option value="" disabled>
                  Select Doses
                </option>

                {/* Map the Data */}
                {DOSE_INSTRUCTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.value}
                  </option>
                ))}
              </select>
            </div>

            {/* Remarks Input */}
            <div className="mb-3">
              <label className="form-label">Instruction</label>
              <input
                type="text"
                className="form-control"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
              />
            </div>
            {/* Duration Input */}
            <div className="mb-3">
              <label className="form-label">Duration</label>
              <input
                type="text"
                className="form-control"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
              />
            </div>
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-success"
              onClick={handleSubmit}
              disabled={qty === 0}
            >
              Add to Bill
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddBillingItemModal;
