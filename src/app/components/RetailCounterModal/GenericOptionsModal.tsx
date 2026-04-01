import { Medicine } from "@/types/medicine";
import React, { useEffect, useMemo } from "react";
import "../../pharmacist/css/pharmacy-style.css";
import { formatAmount } from "@/lib/utils/formatAmount";
import TncLoader from "../TncLoader/TncLoader";

declare module "react" {
  interface CSSProperties {
    "--bs-table-bg"?: string;
  }
}

interface CustomCSSProperties extends React.CSSProperties {
  "--bs-table-bg"?: string;
}
interface GenericOptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  productListByGeneric: Medicine[];
  loading: boolean;
  // ✅ New Prop: Parent Component में item भेजने के लिए
  onAddToCart: (item: Medicine) => void;
  selectedOriginalItem: Medicine | null;
}

const GenericOptionsModal: React.FC<GenericOptionsModalProps> = ({
  isOpen,
  onClose,
  productListByGeneric,
  loading,
  onAddToCart, // Use the new prop
  selectedOriginalItem,
}) => {
  const [initialLoading, setInitialLoading] = React.useState(true);

  const normalize = (str: string) =>
    str?.toLowerCase().replace(/\s+/g, "").trim();
  // console.log(
  //   "FULL LIST:",
  //   productListByGeneric.map((i) => i.medicine_name)
  // );

  console.log("SELECTED:", selectedOriginalItem?.medicine_name);

  const processedList = React.useMemo(() => {
    if (!productListByGeneric || productListByGeneric.length === 0) return [];

    const sorted = [...productListByGeneric].sort(
      (a, b) => Number(a.MRP || 0) - Number(b.MRP || 0)
    );

    let finalList = sorted.slice(0, 10);

    if (selectedOriginalItem) {
      const normalize = (str: string) =>
        str?.toLowerCase().replace(/\s+/g, "").trim();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const matchFn = (item: any) =>
        normalize(item.medicine_name) ===
        normalize(selectedOriginalItem.medicine_name);

      const existsInFullList = sorted.some(matchFn);

      // ❗ CASE 1: API me hi nahi hai → FORCE ADD
      if (!existsInFullList) {
        finalList.pop();
        finalList.unshift({
          ...selectedOriginalItem,
          MRP: selectedOriginalItem.mrp || selectedOriginalItem.MRP,
        });
      } else {
        // normal logic
        const exists = finalList.some(matchFn);

        if (!exists) {
          const selectedFromFullList = sorted.find(matchFn);
          if (selectedFromFullList) {
            finalList.pop();
            finalList.unshift(selectedFromFullList);
          }
        } else {
          const selected = finalList.find(matchFn);
          finalList = selected
            ? [selected, ...finalList.filter((i) => !matchFn(i))]
            : finalList;
        }
      }
    }

    return finalList;
  }, [productListByGeneric, selectedOriginalItem]);

  useEffect(() => {
    if (!isOpen) return;

    setInitialLoading(true);

    // micro delay to avoid flash
    const t = setTimeout(() => {
      setInitialLoading(false);
    }, 500);

    return () => clearTimeout(t);
  }, [isOpen]);

  if (!isOpen) return null;
  const originalMedicineName = selectedOriginalItem?.medicine_name || "N/A";

  return (
    <div
      className="modal xl"
      tabIndex={-1}
      // Visibility fix: Display block to override default CSS
      style={{
        display: "block",
        backgroundColor: "rgba(0,0,0,0.5)",
        width: "xl",
      }}
      onClick={onClose}
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
          <div
            className="modal-dialog"
            style={{
              maxWidth: "1200px",
              width: "95%",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {originalMedicineName} - Generic Alternative/Option
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={onClose}
                ></button>
              </div>
              <div className="modal-body">
                <p className="text-muted fw-bold">
                  Generic for:- {productListByGeneric[0]?.GenericName || "..."}
                </p>
                <div className="table-responsive">
                  <table className="table table-sm">
                    <thead
                      style={
                        {
                          backgroundColor: "#dde7f1",
                          "--bs-table-bg": "#dde7f1",
                        } as CustomCSSProperties
                      }
                    >
                      <tr>
                        <th>Product</th>
                        <th>Manufacturer</th>
                        {/* <th>Stock</th> */}
                        <th>Pack Size</th>
                        <th>MRP</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr>
                          <td colSpan={5} className="text-center text-primary">
                            <div
                              className="spinner-border spinner-border-sm me-2"
                              role="status"
                            ></div>
                            Loading alternatives...
                          </td>
                        </tr>
                      ) : processedList.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="text-center text-muted">
                            No alternatives found.
                          </td>
                        </tr>
                      ) : (
                        processedList.map((item) => {
                          const isSelected =
                            normalize(item.medicine_name) ===
                            normalize(
                              selectedOriginalItem?.medicine_name || ""
                            );
                          return (
                            <tr
                              key={item.id}
                              style={
                                isSelected
                                  ? {
                                      background: "#e6f4ff",
                                      borderLeft: "4px solid #0d6efd",
                                      fontWeight: 600,
                                    }
                                  : {}
                              }
                            >
                              <td>
                                {item.medicine_name}

                                {isSelected && (
                                  <span
                                    style={{
                                      marginLeft: "8px",
                                      fontSize: "11px",
                                      color: "#0d6efd",
                                      fontWeight: 600,
                                    }}
                                  >
                                    (Selected)
                                  </span>
                                )}
                              </td>
                              <td>{item.Manufacturer || "N/A"}</td>
                              {/* <td>{item.AvailableQty || "N/A"}</td> */}
                              <td>{item.pack_size || "N/A"}</td>
                              <td>
                                ₹ {formatAmount(Number(item.MRP)) || "N/A"}
                              </td>
                              <td>
                                <button
                                  className="btn btn-success btn-sm"
                                  onClick={() => {
                                    const selectedWithGeneric = {
                                      ...item,
                                      generic_name:
                                        item.generic_name ||
                                        item.GenericName ||
                                        selectedOriginalItem?.generic_name ||
                                        selectedOriginalItem?.GenericName ||
                                        productListByGeneric[0]?.generic_name ||
                                        productListByGeneric[0]?.GenericName ||
                                        "N/A",
                                    };
                                    // ✅ Add to Cart Logic
                                    onAddToCart(item);
                                    onClose(); // Modal बंद करें
                                  }}
                                >
                                  Add to Cart
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={onClose}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default GenericOptionsModal;
