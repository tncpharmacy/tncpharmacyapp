"use client";

import React, { useState, useEffect, useRef } from "react";
import { Medicine } from "@/types/medicine";
import toast from "react-hot-toast";
import DoseInstructionSelect from "@/app/components/Input/DoseInstructionSelect";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import {
  createProductDuration,
  getProductDurations,
} from "@/lib/features/productDurationSlice/productDurationSlice";
import {
  createProductInstruction,
  getProductInstructions,
} from "@/lib/features/productInstructionSlice/productInstructionSlice";
import SmartCreateInput from "./SmartCreateInput";
import TncLoader from "../TncLoader/TncLoader";
import { formatAmount } from "@/lib/utils/formatAmount";

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

const AddBillingItemModal: React.FC<AddBillingItemModalProps> = ({
  isOpen,
  onClose,
  item,
  onBack,
  onConfirmAdd,
}) => {
  const dispatch = useAppDispatch();

  // States for Form Inputs
  const [qty, setQty] = useState(1);
  const [selectedDoseValue, setSelectedDoseValue] = useState("");
  const [remarks, setRemarks] = useState("");
  const [duration, setDuration] = useState("");

  const qtyRef = useRef<HTMLInputElement | null>(null);
  const doseRef = useRef<HTMLSelectElement | null>(null);
  const instructionRef = useRef<HTMLInputElement | null>(null);
  const durationRef = useRef<HTMLInputElement | null>(null);
  const submitRef = useRef<HTMLButtonElement | null>(null);

  // AvailableQty Validation
  // const availableQty = item?.AvailableQty || 0; // 🚨 Assuming your Medicine type has 'AvailableQty'
  const { list: durationList } = useAppSelector(
    (state) => state.productDuration
  );

  const { list: instructionList } = useAppSelector(
    (state) => state.productInstruction
  );
  const [initialLoading, setInitialLoading] = React.useState(true);

  useEffect(() => {
    if (!isOpen) return;

    setInitialLoading(true);

    // micro delay to avoid flash
    const t = setTimeout(() => {
      setInitialLoading(false);
    }, 500);

    return () => clearTimeout(t);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      dispatch(getProductDurations());
      dispatch(getProductInstructions());
    }
  }, [isOpen, dispatch]);

  // Form Reset on Item Change
  useEffect(() => {
    if (item) {
      // if (availableQty === 0) {
      //   setQty(0);
      //   toast.error("Item is out of stock. Available Qty is 0.");
      // } else {
      //   setQty(1);
      // }
      setQty(1);
      setSelectedDoseValue("");
      setRemarks("");
      setDuration("");
    }
  }, [item]);

  if (!isOpen || !item) return null;

  // Validation Handler
  // const handleQtyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const rawValue = e.target.value;

  //   // Allow empty value "" (React number input me hota hi hai)
  //   if (rawValue === "") {
  //     setQty(0); // ⚠️ blank ko 0 treat karo taaki type mismatch na ho
  //     return;
  //   }

  //   const value = Number(rawValue);

  //   // Stock 0 → always 0
  //   if (availableQty === 0) {
  //     setQty(0);
  //     return;
  //   }

  //   // Invalid input OR negative → do nothing
  //   if (isNaN(value) || value < 0) {
  //     return;
  //   }

  //   // Allow 0 (remove ke liye)
  //   if (value === 0) {
  //     setQty(0);
  //     return;
  //   }

  //   // More than available stock → set to availableQty
  //   if (value > availableQty) {
  //     setQty(availableQty);
  //     return;
  //   }

  //   // Valid qty
  //   setQty(value);
  // };
  const handleQtyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;

    if (rawValue === "") {
      setQty(0);
      return;
    }

    const value = Number(rawValue);

    if (isNaN(value) || value < 0) return;

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
      onKeyDownCapture={(e) => {
        const target = e.target as HTMLElement;

        if (
          e.key === "Enter" &&
          target.tagName !== "INPUT" &&
          target.tagName !== "TEXTAREA" &&
          target.tagName !== "BUTTON" // 👈 YE ADD KAR
        ) {
          e.preventDefault();
          e.stopPropagation();
        }
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {initialLoading ? (
        <div
          className="d-flex justify-content-center align-items-center"
          style={{ minHeight: 500 }}
        >
          <TncLoader />
        </div>
      ) : (
        <>
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
                <h6 className="modal-title">
                  Product Item:- {item.medicine_name}
                </h6>
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
                  <strong>MRP:</strong> ₹{formatAmount(item.MRP || 0)}
                </p>
                {/* <p className="text-success color-green fw-bold">
                  Available Stock: {availableQty}
                </p> */}
                <hr />

                {/* Qty Input */}
                <div className="txt_col">
                  <label className="lbl1 fw-bold">Quantity</label>
                  <input
                    ref={qtyRef}
                    type="number"
                    className="form-control"
                    value={qty === 0 ? "" : qty}
                    onChange={handleQtyChange}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        doseRef.current?.focus();
                      }
                    }}
                  />
                  {/* 
                  {qty > availableQty && (
                    <div className="text-danger mt-1">
                      Error: Max available quantity is {availableQty}.
                    </div>
                  )} */}
                </div>

                {/* Dose Form Input (Select/Input based on your requirement) */}
                <div
                  className="txt_col"
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  ref={doseRef as any}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      instructionRef.current?.focus();
                    }
                  }}
                >
                  <label className="lbl1 fw-bold">Doses Instruction</label>
                  <DoseInstructionSelect
                    type="select"
                    name=""
                    label=""
                    isTableEditMode={true}
                    value={selectedDoseValue}
                    onChange={(e) => setSelectedDoseValue(e.target.value)}
                    required
                  />
                </div>
                {/* Remarks Input */}
                <div style={{ marginTop: "16px" }}>
                  <SmartCreateInput
                    label="Instruction"
                    value={remarks}
                    onChange={setRemarks}
                    list={instructionList}
                    createAction={createProductInstruction}
                    refreshAction={getProductInstructions}
                    placeholder=""
                    inputRef={instructionRef}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        submitRef.current?.focus();
                      }
                    }}
                  />
                </div>

                {/* Duration Input */}
                <div style={{ marginTop: "16px" }}>
                  <SmartCreateInput
                    label="Duration"
                    value={duration}
                    onChange={setDuration}
                    list={durationList}
                    createAction={createProductDuration}
                    refreshAction={getProductDurations}
                    placeholder=""
                    inputRef={durationRef}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        submitRef.current?.focus();
                      }
                    }}
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
                  ref={submitRef}
                  type="button"
                  className="btn btn-success"
                  onClick={handleSubmit}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleSubmit();
                    }
                  }}
                  disabled={qty === 0}
                >
                  Add to Bill
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AddBillingItemModal;
