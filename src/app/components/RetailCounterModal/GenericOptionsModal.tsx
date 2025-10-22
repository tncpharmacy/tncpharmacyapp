import { Medicine } from "@/types/medicine";
import React from "react";
import "../../pharmacist/css/pharmacy-style.css";

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
  if (!isOpen) return null;
  const originalMedicineName = selectedOriginalItem?.medicine_name || "N/A";
  return (
    <div
      className="modal"
      tabIndex={-1}
      // Visibility fix: Display block to override default CSS
      style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
      onClick={onClose}
    >
      <div
        className="modal-dialog modal-lg"
        // StopPropagation fix: Stop clicks inside modal from closing it
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
                    <th>Stock</th>
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
                  ) : productListByGeneric.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center text-muted">
                        No alternatives found.
                      </td>
                    </tr>
                  ) : (
                    productListByGeneric.map((item) => (
                      <tr
                        key={item.id}
                        className={
                          item.id === selectedOriginalItem?.id
                            ? "table-info fw-bold"
                            : ""
                        }
                      >
                        <td>{item.medicine_name}</td>
                        <td>{item.Manufacturer || "N/A"}</td>
                        <td>{item.AvailableQty || "N/A"}</td>
                        <td>{item.pack_size || "N/A"}</td>
                        <td>₹ {item.MRP || "N/A"}</td>
                        <td>
                          <button
                            className="btn btn-success btn-sm"
                            onClick={() => {
                              // ✅ Add to Cart Logic
                              onAddToCart(item);
                              onClose(); // Modal बंद करें
                            }}
                          >
                            Add to Cart
                          </button>
                        </td>
                      </tr>
                    ))
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
    </div>
  );
};

export default GenericOptionsModal;
