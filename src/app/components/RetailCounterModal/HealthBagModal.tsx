import { useClickOutside } from "@/lib/utils/useClickOutside";
import React from "react";
import { Modal, Button, Table } from "react-bootstrap";
import { FaTrash } from "react-icons/fa";
import DoseInstructionSelect from "../Input/DoseInstructionSelect";
import { formatPrice } from "@/lib/utils/formatPrice";
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

interface HealthBagModalProps {
  isOpen: boolean;
  onClose: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  cartItems: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onProceed?: (updatedCart: any[]) => void;
  onRemove: (index: number) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onUpdateCart?: (updatedCart: any[]) => void;
}

const HealthBagModal: React.FC<HealthBagModalProps> = ({
  isOpen,
  onClose,
  cartItems,
  onProceed,
  onRemove,
  onUpdateCart,
}) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [localCart, setLocalCart] = React.useState<any[]>(cartItems);
  const dispatch = useAppDispatch();
  const { list: durationList } = useAppSelector(
    (state) => state.productDuration
  );

  const { list: instructionList } = useAppSelector(
    (state) => state.productInstruction
  );
  // 🔥 MODAL LOADER
  const [modalLoading, setModalLoading] = React.useState(false);

  // 🔥 Fetch dropdown data on modal open
  React.useEffect(() => {
    if (!isOpen) return;

    const loadData = async () => {
      setModalLoading(true);
      try {
        await Promise.all([
          dispatch(getProductDurations()).unwrap(),
          dispatch(getProductInstructions()).unwrap(),
        ]);
      } catch (e) {
        console.error("HealthBag Modal Load Error", e);
      } finally {
        setModalLoading(false);
      }
    };

    loadData();
  }, [isOpen, dispatch]);

  // React.useEffect(() => {
  //   dispatch(getProductDurations());
  //   dispatch(getProductInstructions());
  // }, [dispatch]);

  React.useEffect(() => {
    setLocalCart(cartItems);
  }, [cartItems]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleUpdate = (index: number, field: string, value: any) => {
    const updated = [...localCart];

    updated[index] = {
      ...updated[index],
      [field]: field === "qty" ? Number(value) : value,
    };

    // Qty → price auto recalculation
    if (field === "qty") {
      const unit = Number(updated[index].unitPrice) || 0;
      updated[index].price = unit * Number(value);
    }

    setLocalCart(updated);
  };

  return (
    <Modal show={isOpen} onHide={onClose} size="xl">
      {modalLoading && (
        <div
          className="position-absolute top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
          style={{
            background: "rgba(255,255,255,0.7)",
            backdropFilter: "blur(3px)",
            zIndex: 10,
          }}
        >
          <div className="text-center">
            <TncLoader />
          </div>
        </div>
      )}
      <Modal.Header closeButton>
        <Modal.Title>
          🛒 Health Bag / Billing Cart ({localCart.length} items)
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {localCart.length === 0 ? (
          <p className="text-center">Your Health Bag is empty.</p>
        ) : (
          <Table bordered hover responsive>
            <thead>
              <tr>
                <th style={{ width: "260px" }}>Medicine</th>
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
              {localCart.map((item, index) => {
                const { unitPrice = 0, price = 0 } = item;
                const mrp = Number(item.unitPrice) || 0;
                const disc = Number(item.Disc) || 0;
                const qty = Number(item.qty) || 0;

                const rate = mrp - (mrp * disc) / 100;
                const subtotal = rate * qty;
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
                          {item.manufacturer_name || item.manufacturer || "N/A"}
                        </span>
                      </div>
                    </td>

                    {/* Qty - DIRECT INPUT */}
                    <td>
                      <input
                        type="number"
                        className="form-control"
                        value={String(item.qty)}
                        maxLength={2}
                        onChange={(e) => {
                          const v = e.target.value;
                          if (/^\d*$/.test(v)) {
                            handleUpdate(index, "qty", v === "" ? "" : v);
                          }
                        }}
                        onBlur={() => {
                          let qty = Number(item.qty);

                          if (!qty || qty <= 0) qty = 1; // prevent zero qty
                          handleUpdate(index, "qty", qty);
                        }}
                        style={{ width: "70px" }}
                      />
                    </td>

                    {/* Doses - DIRECT DROPDOWN */}
                    <td style={{ minWidth: "130px" }}>
                      <DoseInstructionSelect
                        type="select"
                        label=""
                        name="dose_form"
                        value={item.dose_form || ""}
                        colSm={12}
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        onChange={(e: any) =>
                          handleUpdate(index, "dose_form", e.target.value)
                        }
                        isTableEditMode={true}
                      />
                    </td>

                    {/* Instruction - DIRECT INPUT */}
                    <td>
                      <SmartCreateInputWithoutLabel
                        label=""
                        value={item.remarks || ""}
                        placeholder=""
                        list={instructionList}
                        createAction={createProductInstruction}
                        refreshAction={getProductInstructions}
                        onChange={(val) => {
                          handleUpdate(index, "remarks", val);
                        }}
                      />
                    </td>

                    {/* Duration - DIRECT INPUT */}
                    <td>
                      <SmartCreateInputWithoutLabel
                        label=""
                        value={item.duration || ""}
                        placeholder=""
                        list={durationList}
                        createAction={createProductDuration}
                        refreshAction={getProductDurations}
                        onChange={(val) => {
                          handleUpdate(index, "duration", val);
                        }}
                      />
                    </td>
                    {/* Price Mrp */}
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
                    <td style={{ textAlign: "center", width: "70px" }}>
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
                            handleUpdate(index, "Disc", val);
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
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => onRemove(index)}
                      >
                        <FaTrash size={14} />
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        )}
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>

        <Button
          variant="primary"
          onClick={() => {
            onUpdateCart?.(localCart);
            onProceed?.(localCart);
          }}
        >
          Add To Patient HealthBag
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default HealthBagModal;
