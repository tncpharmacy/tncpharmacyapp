import { formatPrice } from "@/lib/utils/formatPrice";
import { Modal, Table, Button } from "react-bootstrap";
import { FaTrash } from "react-icons/fa";
import React, { useState } from "react";
import DoseInstructionSelect from "../Input/DoseInstructionSelect";
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
import SmartCreateInputWithoutLabel from "./SmartCreateInputWithoutLabel";

// -------------------- Types --------------------
interface CartItem {
  medicine_name: string;
  pack_size?: string;
  manufacturer_name?: string;
  qty: number;
  dose_form?: string;
  remarks?: string;
  duration?: string;
  price: number;
  rate: number;
  unitPrice: number;
  Disc?: number;
}

interface CartPreviewModalProps {
  show: boolean;
  onClose: () => void;
  cart: CartItem[];
  onGenerate: () => void;
  onRemove: (index: number) => void;
  referredByDoctor: string;
  referredByHospital: string;
  additionalDiscount: string;
  onDoctorChange: (v: string) => void;
  onHospitalChange: (v: string) => void;
  onDiscountChange: (v: string) => void;
  onUpdateCart?: (updated: CartItem[]) => void;
}

// -------------------------------------------------

const CartPreviewModal = ({
  show,
  onClose,
  cart,
  onGenerate,
  onRemove,
  onDiscountChange,
  referredByDoctor,
  referredByHospital,
  additionalDiscount,
  onUpdateCart,
  onDoctorChange,
  onHospitalChange,
}: CartPreviewModalProps) => {
  const dispatch = useAppDispatch();
  const { list: durationList } = useAppSelector(
    (state) => state.productDuration
  );

  const { list: instructionList } = useAppSelector(
    (state) => state.productInstruction
  );
  const [initialLoading, setInitialLoading] = React.useState(true);

  React.useEffect(() => {
    if (!show) return;

    setInitialLoading(true);

    const t = setTimeout(() => {
      setInitialLoading(false);
    }, 500); // 👌 smooth UX

    return () => clearTimeout(t);
  }, [show]);

  React.useEffect(() => {
    dispatch(getProductDurations());
    dispatch(getProductInstructions());
  }, [dispatch]);
  if (!show) return null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleEditChange = (index: number, field: string, value: any) => {
    const updated = [...cart];

    updated[index] = {
      ...updated[index],
      [field]: field === "qty" || field === "Disc" ? Number(value) : value,
    };

    // Send updated cart to parent
    onUpdateCart && onUpdateCart(updated);
  };

  const calculateSubtotal = (item: CartItem) => {
    const mrp = Number(item.unitPrice);
    const qty = Number(item.qty);
    const disc = Number(item.Disc ?? 0);

    const total = mrp * qty;
    const discountAmt = (total * disc) / 100;

    return Number((total - discountAmt).toFixed(2));
  };

  const total = cart.reduce((acc, item) => acc + calculateSubtotal(item), 0);

  const finalAmount = total - (total * Number(additionalDiscount)) / 100;

  return (
    <Modal show={show} onHide={onClose} size="xl" centered>
      {initialLoading ? (
        <TncLoader />
      ) : (
        <>
          <Modal.Header closeButton>
            <Modal.Title>🛍️ Health Bag</Modal.Title>
          </Modal.Header>

          <Modal.Body>
            <div className="row mb-3">
              <div className="col-md-6">
                <label className="fw-semibold">Referred By Doctor</label>
                <input
                  type="text"
                  className="form-control"
                  value={referredByDoctor}
                  maxLength={50}
                  onChange={(e) => onDoctorChange(e.target.value)}
                />
              </div>

              <div className="col-md-6">
                <label className="fw-semibold">Referred By Hospital</label>
                <input
                  type="text"
                  className="form-control"
                  value={referredByHospital}
                  maxLength={50}
                  onChange={(e) => onHospitalChange(e.target.value)}
                />
              </div>
            </div>
            <Table bordered hover>
              <thead className="table-light">
                <tr>
                  <th style={{ width: "350px" }}>Medicine</th>
                  <th style={{ width: "80px", textAlign: "center" }}>Qty</th>
                  <th style={{ width: "110px", textAlign: "center" }}>Doses</th>
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
                {cart.map((item, idx) => {
                  // const subtotal = calculateSubtotal(item);
                  const mrp = Number(item.unitPrice);
                  const qty = Number(item.qty);
                  const disc = Number(item.Disc ?? 0);
                  const rate = mrp - (mrp * disc) / 100;
                  const total = mrp * qty;
                  const discountAmt = (total * disc) / 100;
                  const subtotal = total - discountAmt;
                  return (
                    <tr key={idx}>
                      <td>
                        <div
                          style={{ display: "flex", flexDirection: "column" }}
                        >
                          <span
                            style={{ fontWeight: 600 }}
                            className="pd-title"
                          >
                            {item.medicine_name}
                          </span>

                          <span
                            style={{ fontSize: "12px", color: "#666" }}
                            className="pd-title"
                          >
                            {item.pack_size || "N/A"}
                          </span>

                          <span
                            style={{ fontSize: "12px", color: "#28a745" }}
                            className="pd-title"
                          >
                            {item.manufacturer_name || "N/A"}
                          </span>
                        </div>
                      </td>

                      {/* Editable Qty */}
                      <td
                        onDoubleClick={() => {}}
                        style={{ cursor: "pointer" }}
                      >
                        <input
                          type="number"
                          className="form-control"
                          value={item.qty}
                          min={1}
                          onChange={(e) => {
                            const val = e.target.value;
                            // ❗ Allow only digits and maxLength = 2
                            if (val.length <= 2) {
                              handleEditChange(idx, "qty", val);
                            }
                          }}
                          style={{ width: "70px" }}
                        />
                      </td>

                      {/* Editable Dose Form */}
                      <td>
                        <DoseInstructionSelect
                          type="select"
                          name=""
                          label=""
                          isTableEditMode={true}
                          value={item.dose_form}
                          onChange={(e) =>
                            handleEditChange(idx, "dose_form", e.target.value)
                          }
                        />
                      </td>

                      {/* Editable Instruction */}
                      <td>
                        <SmartCreateInputWithoutLabel
                          label=""
                          value={item.remarks ?? ""}
                          list={instructionList}
                          createAction={createProductInstruction}
                          refreshAction={getProductInstructions}
                          placeholder=""
                          onChange={(val) => {
                            if (val.length <= 50) {
                              handleEditChange(idx, "remarks", val);
                            }
                          }}
                        />
                      </td>

                      {/* Editable Duration */}
                      <td>
                        <SmartCreateInputWithoutLabel
                          label=""
                          value={item.duration ?? ""}
                          list={durationList}
                          createAction={createProductDuration}
                          refreshAction={getProductDurations}
                          placeholder=""
                          onChange={(val) => {
                            if (val.length <= 10) {
                              handleEditChange(idx, "duration", val);
                            }
                          }}
                        />
                      </td>

                      <td>
                        <input
                          type="text"
                          className="form-control"
                          value={`₹${formatPrice(mrp)}`}
                          tabIndex={-1}
                          readOnly
                          style={{ width: "90px", backgroundColor: "#f5f5f5" }}
                        />
                      </td>

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
                              handleEditChange(idx, "Disc", val);
                            }
                          }}
                        />
                      </td>

                      <td>
                        <input
                          type="text"
                          className="form-control"
                          value={`₹${formatPrice(rate)}`}
                          tabIndex={-1}
                          readOnly
                          style={{ width: "100px", backgroundColor: "#f5f5f5" }}
                        />
                      </td>

                      <td>
                        <input
                          type="text"
                          className="form-control"
                          value={`₹${formatPrice(subtotal)}`}
                          tabIndex={-1}
                          readOnly
                          style={{ width: "100px", backgroundColor: "#f5f5f5" }}
                        />
                      </td>

                      <td>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => onRemove(idx)}
                        >
                          <FaTrash size={14} />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>

            {/* Total / Discount Box */}
            <div className="d-flex justify-content-end">
              <div
                className="p-3 border rounded shadow-sm"
                style={{
                  width: "300px",
                  background: "#F8FBFF",
                  marginTop: "-10px",
                  textAlign: "left",
                }}
              >
                <h6 className="fw-bold mb-2" style={{ color: "red" }}>
                  Total: ₹{formatPrice(total)}
                </h6>

                <div
                  className="mb-2 d-flex align-items-center"
                  style={{ gap: "8px" }}
                >
                  <span className="fw-semibold" style={{ color: "green" }}>
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
                      if (/^\d{0,2}$/.test(val)) {
                        onDiscountChange(val);
                      }
                    }}
                  />

                  <span className="fw-bold">(%)</span>
                </div>

                <h5 className="fw-bold text-primary mb-1">
                  Grand Total: ₹{formatPrice(finalAmount)}
                </h5>
              </div>
            </div>
          </Modal.Body>

          <Modal.Footer>
            <Button variant="secondary" onClick={onClose}>
              Close
            </Button>

            <Button variant="primary" onClick={onGenerate}>
              Generate Bill
            </Button>
          </Modal.Footer>
        </>
      )}
    </Modal>
  );
};

export default CartPreviewModal;
