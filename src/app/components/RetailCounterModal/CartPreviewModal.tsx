import { formatAmount } from "@/lib/utils/formatAmount";
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

// -------------------- Types --------------------
interface CartItem {
  medicine_name: string;
  qty: number;
  pack_size?: string | number;
  dose_form?: string;
  remarks?: string;
  duration?: string;
  price: number;
  Disc?: number;
}

interface CartPreviewModalProps {
  show: boolean;
  onClose: () => void;
  cart: CartItem[];
  onGenerate: () => void;
  onRemove: (index: number) => void;
  additionalDiscount: string;
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
  additionalDiscount,
  onUpdateCart,
}: CartPreviewModalProps) => {
  const dispatch = useAppDispatch();
  const { list: durationList } = useAppSelector(
    (state) => state.productDuration
  );

  const { list: instructionList } = useAppSelector(
    (state) => state.productInstruction
  );
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
    const qty = Number(item.qty);
    const price = Number(item.price);
    const disc = Number(item.Disc ?? 0);

    const total = qty * price;
    const discountAmt = (total * disc) / 100;

    return total - discountAmt;
  };

  const total = cart.reduce((acc, item) => acc + calculateSubtotal(item), 0);

  const finalAmount = total - (total * Number(additionalDiscount)) / 100;

  return (
    <Modal show={show} onHide={onClose} size="xl" centered>
      <Modal.Header closeButton>
        <Modal.Title>🛍️ Health Bag</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Table bordered hover>
          <thead className="table-light">
            <tr>
              <th>Medicine</th>
              <th>Qty</th>
              <th>Doses</th>
              <th>Instruction</th>
              <th>Duration</th>
              <th>MRP</th>
              <th>Discount (%)</th>
              <th>Subtotal</th>
              <th>Remove</th>
            </tr>
          </thead>

          <tbody>
            {cart.map((item, idx) => {
              const subtotal = calculateSubtotal(item);

              return (
                <tr key={idx}>
                  <td>{item.medicine_name}</td>

                  {/* Editable Qty */}
                  <td onDoubleClick={() => {}} style={{ cursor: "pointer" }}>
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
                  <td
                    style={{
                      maxWidth: "160px",
                      position: "relative",
                    }}
                  >
                    <SmartCreateInput
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
                  <td
                    style={{
                      maxWidth: "120px",
                      position: "relative", // 🔥 MUST
                    }}
                  >
                    <SmartCreateInput
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

                  <td>₹{formatAmount(item.price)}</td>

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

                  <td>₹{formatAmount(subtotal)}</td>

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
              Total: ₹{formatAmount(total)}
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
              Grand Total: ₹{formatAmount(finalAmount)}
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
    </Modal>
  );
};

export default CartPreviewModal;
